import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v2.71)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

// Reusable Scrub-Drag & Click-to-Type Rate Component
const DragRateInput = ({ value, onChange, onCommit, title }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [typedVal, setTypedVal] = useState(value);
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startValRef = useRef(30);
    const currentValRef = useRef(value);

    useEffect(() => {
        setTypedVal(value);
        currentValRef.current = value;
    }, [value]);

    const handleMouseDown = (e) => {
        if (isEditing) return;
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const panel = e.currentTarget.closest('.panel');
        if (panel) panel.draggable = false;

        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startValRef.current = parseInt(value, 10) || 30;
        currentValRef.current = startValRef.current;
        let hasMoved = false;

        const onMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const deltaY = startYRef.current - moveEvent.clientY;
            if (Math.abs(deltaY) > 2) {
                hasMoved = true;
                const newVal = Math.max(1, Math.min(250, startValRef.current + Math.floor(deltaY / 2)));
                if (newVal !== currentValRef.current) {
                    currentValRef.current = newVal;
                    onChange(newVal);
                    if (onCommit) onCommit(newVal);
                }
            }
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            isDraggingRef.current = false;
            if (panel) panel.draggable = true;

            if (hasMoved) {
                if (onCommit) onCommit(currentValRef.current);
            } else {
                setIsEditing(true);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            const parsed = Math.max(1, Math.min(250, parseInt(typedVal, 10) || 30));
            onChange(parsed);
            if (onCommit) onCommit(parsed);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setTypedVal(value);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        const parsed = Math.max(1, Math.min(250, parseInt(typedVal, 10) || 30));
        onChange(parsed);
        if (onCommit) onCommit(parsed);
    };

    if (isEditing) {
        return (
            <div className="rate-box-button editing" title={title}>
                <input
                    type="number"
                    className="rate-input-field"
                    autoFocus
                    min="1"
                    max="250"
                    value={typedVal}
                    onChange={(e) => setTypedVal(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            </div>
        );
    }

    return (
        <div 
            className="rate-box-button"
            title={title}
            onMouseDown={handleMouseDown}
        >
            <span className="rate-display-value">{value}</span>
        </div>
    );
};

const AtemConstellationBus = ({ connectedDevice }) => {
    if (!connectedDevice || connectedDevice.ip !== LOCKED_ATEM_IP) {
        return (
            <div className="atem-bus-locked-container">
                <div className="atem-bus-lock-badge">HARDWARE LOCK ENFORCED</div>
                <div className="atem-bus-lock-desc">
                    ATEM 1 M/E Constellation HD bus is restricted exclusively to <strong>{LOCKED_ATEM_IP}</strong>.
                </div>
            </div>
        );
    }

    const [pgmInput, setPgmInput] = useState(1);
    const [pvwInput, setPvwInput] = useState(2);
    const [inTransition, setInTransition] = useState(false);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');

    // Hardware Transition, Keyer & DSK State
    const [transitionRate, setTransitionRate] = useState(30);
    const [transitionSelection, setTransitionSelection] = useState(1); // Bit 1: BKGD, Bit 2: KEY1, Bit 4: KEY2, Bit 8: KEY3, Bit 16: KEY4
    const [uskOnAir, setUskOnAir] = useState([false, false, false, false]);

    const [dsk, setDsk] = useState({ onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: 30 });
    const [ftb, setFtb] = useState({ inTransition: false, isFullyBlack: false, rate: 30 });

    // Local Rate Buffers for immediate responsive UI feedback
    const [localTransRate, setLocalTransRate] = useState(30);
    const [localDskRate, setLocalDskRate] = useState(30);
    const [localFtbRate, setLocalFtbRate] = useState(30);

    // Router Mode: Selected Aux Output (null = Bus mode; 0..5 = Aux 1..6)
    const [selectedOut, setSelectedOut] = useState(null);
    const [auxSources, setAuxSources] = useState([1, 2, 3, 4, 5, 6]);

    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    const initWebSocket = () => {
        const wsUrl = `ws://localhost:${BRIDGE_PORT}`;
        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setBridgeStatus('standby');
                wsRef.current.send(JSON.stringify({ action: 'CONNECT', ip: LOCKED_ATEM_IP }));
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.hardwareConnected !== undefined) setBridgeStatus(data.hardwareConnected ? 'linked' : 'standby');
                    if (data.pgm !== undefined) setPgmInput(Number(data.pgm));
                    if (data.pvw !== undefined) setPvwInput(Number(data.pvw));
                    if (data.inTransition !== undefined) setInTransition(Boolean(data.inTransition));
                    if (data.transitionRate !== undefined) setTransitionRate(Number(data.transitionRate));
                    if (data.transitionSelection !== undefined) setTransitionSelection(Number(data.transitionSelection));
                    if (data.uskOnAir && Array.isArray(data.uskOnAir)) setUskOnAir(data.uskOnAir);
                    if (data.dsk) setDsk(data.dsk);
                    if (data.ftb) setFtb(data.ftb);
                    if (data.auxSources && Array.isArray(data.auxSources)) setAuxSources(data.auxSources.map(Number));
                } catch (err) {
                    console.error("[AtemBus UI] Data Parse Error:", err);
                }
            };

            wsRef.current.onerror = () => setBridgeStatus('offline');
            wsRef.current.onclose = () => {
                setBridgeStatus('offline');
                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        reconnectTimerRef.current = null;
                        initWebSocket();
                    }, 2500);
                }
            };
        } catch (e) {
            setBridgeStatus('offline');
            if (!reconnectTimerRef.current) {
                reconnectTimerRef.current = setTimeout(() => {
                    reconnectTimerRef.current = null;
                    initWebSocket();
                }, 2500);
            }
        }
    };

    useEffect(() => {
        initWebSocket();
        return () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                try { wsRef.current.close(); } catch(err) {}
            }
        };
    }, []);

    useEffect(() => { setLocalTransRate(transitionRate); }, [transitionRate]);
    useEffect(() => { setLocalDskRate(dsk.rate); }, [dsk.rate]);
    useEffect(() => { setLocalFtbRate(ftb.rate); }, [ftb.rate]);

    const sendAtemCommand = (commandType, payload = {}) => {
        if (commandType === 'SET_PGM') {
            if (selectedOut !== null) {
                const updated = [...auxSources];
                updated[selectedOut] = payload.input;
                setAuxSources(updated);
                sendCommand('SET_AUX', { aux: selectedOut, source: payload.input });
                return;
            }
            setPgmInput(payload.input);
            sendCommand('SET_PGM', payload);
            return;
        }

        if (commandType === 'SET_PVW') {
            setPvwInput(payload.input);
            sendCommand('SET_PVW', payload);
            return;
        }

        if (commandType === 'CUT') {
            if (bridgeStatus !== 'linked') {
                const temp = pgmInput;
                setPgmInput(pvwInput);
                setPvwInput(temp);
            }
            sendCommand('CUT');
            return;
        }

        if (commandType === 'AUTO') {
            if (bridgeStatus !== 'linked') {
                setInTransition(true);
                setTimeout(() => {
                    const temp = pgmInput;
                    setPgmInput(pvwInput);
                    setPvwInput(temp);
                    setInTransition(false);
                }, 600);
            }
            sendCommand('AUTO');
            return;
        }

        sendCommand(commandType, payload);
    };

    const sendCommand = (action, payload = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ 
                    action, 
                    ip: LOCKED_ATEM_IP, 
                    ...payload 
                }));
            } catch (err) {
                console.warn("[AtemBus UI] Dispatch failed.");
            }
        }
    };

    // Bus Sources: Inputs 1-10 on Row 1; BLK, BARS, COL1, COL2, MP1, MP2 on Row 2
    const inputSources = [
        { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }, 
        { id: 6, label: '6' }, { id: 7, label: '7' }, { id: 8, label: '8' }, { id: 9, label: '9' }, { id: 10, label: '10' }
    ];

    const baseInternalSources = [
        { id: 0, label: 'BLK' },
        { id: 1000, label: 'BARS' },
        { id: 2001, label: 'COL 1' },
        { id: 2002, label: 'COL 2' },
        { id: 3010, label: 'MP1' },
        { id: 3020, label: 'MP2' }
    ];

    // Dynamic routing sources: append PVW & PGM under Inputs 9 & 10 during OUT routing
    const internalSources = selectedOut !== null 
        ? [
            ...baseInternalSources,
            { id: 10011, label: 'PVW' },
            { id: 10010, label: 'PGM' }
          ]
        : baseInternalSources;

    const auxOutputsList = [1, 2, 3, 4, 5, 6];

    const getIsActivePgm = (sourceId) => selectedOut !== null ? (auxSources[selectedOut] === sourceId) : (pgmInput === sourceId);
    const getIsActivePvw = (sourceId) => selectedOut !== null ? false : (pvwInput === sourceId);

    return (
        <div className="atem-constellation-panel">
            {/* Header Bar */}
            <div className="atem-bus-header">
                <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                <div className="atem-bus-status">
                    <span className={`atem-bus-online-dot ${bridgeStatus === 'linked' ? 'online' : 'offline'}`} />
                    <span className="atem-bus-ip">{LOCKED_ATEM_IP}</span>
                </div>
            </div>

            <div className="atem-bus-content-layout">
                {/* 1. PROGRAM & PREVIEW BUSES (Enclosed in Unified Bounding Box) */}
                <div className="atem-section-box pgm-pvw-box">
                    {/* PROGRAM BUS */}
                    <div className="bus-block">
                        <div className={`bus-title-label ${selectedOut !== null ? 'router-label' : 'pgm-label'}`}>
                            {selectedOut !== null ? `OUTPUT ${selectedOut + 1}` : 'PROGRAM'}
                        </div>
                        <div className="atem-bus-grid">
                            {inputSources.map((s) => (
                                <button
                                    key={`pgm-${s.id}`}
                                    className={`atem-btn-standard ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`}
                                    onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}
                                    data-description={`Input ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                            {internalSources.map((s) => (
                                <button
                                    key={`pgm-int-${s.id}`}
                                    className={`atem-btn-standard aux-source-btn ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`}
                                    onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}
                                    data-description={`Source ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PREVIEW BUS */}
                    <div className="bus-block" style={{ opacity: selectedOut !== null ? 0.35 : 1, pointerEvents: selectedOut !== null ? 'none' : 'auto' }}>
                        <div className="bus-title-label pvw-label">PREVIEW</div>
                        <div className="atem-bus-grid">
                            {inputSources.map((s) => (
                                <button
                                    key={`pvw-${s.id}`}
                                    className={`atem-btn-standard ${getIsActivePvw(s.id) ? 'tally-green' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}
                                    data-description={`Preview Input ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                            {internalSources.map((s) => (
                                <button
                                    key={`pvw-int-${s.id}`}
                                    className={`atem-btn-standard aux-source-btn ${getIsActivePvw(s.id) ? 'tally-green' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}
                                    data-description={`Preview Source ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. LOWER CONTROL MODULES (NEXT TRANSITION Cols 1–5, DSK 1 Cols 7–8, FTB Col 10) */}
                <div className="atem-lower-sections-grid">
                    {/* NEXT TRANSITION (Aligned directly under Inputs 1–5) */}
                    <div className="atem-section-box next-trans-box">
                        <div className="atem-section-title">NEXT TRANSITION</div>
                        <div className="two-row-grid five-cols">
                            {/* Row 1: Spacer, On Air 1, On Air 2, On Air 3, On Air 4 */}
                            <div className="atem-btn-spacer" />
                            <button 
                                className={`atem-btn-standard ${uskOnAir[0] ? 'tally-red' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 0 })}
                                data-description="Key 1 On Air"
                            >
                                <span className="btn-number">ON AIR</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${uskOnAir[1] ? 'tally-red' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 1 })}
                                data-description="Key 2 On Air"
                            >
                                <span className="btn-number">ON AIR</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${uskOnAir[2] ? 'tally-red' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 2 })}
                                data-description="Key 3 On Air"
                            >
                                <span className="btn-number">ON AIR</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${uskOnAir[3] ? 'tally-red' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 3 })}
                                data-description="Key 4 On Air"
                            >
                                <span className="btn-number">ON AIR</span>
                            </button>

                            {/* Row 2: BKGD, Key 1, Key 2, Key 3, Key 4 */}
                            <button 
                                className={`atem-btn-standard ${(transitionSelection & 1) ? 'tally-yellow' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 1 })}
                                data-description="Next Transition Background"
                            >
                                <span className="btn-number">BKGD</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${(transitionSelection & 2) ? 'tally-yellow' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 2 })}
                                data-description="Next Transition Key 1"
                            >
                                <span className="btn-number">KEY 1</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${(transitionSelection & 4) ? 'tally-yellow' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 4 })}
                                data-description="Next Transition Key 2"
                            >
                                <span className="btn-number">KEY 2</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${(transitionSelection & 8) ? 'tally-yellow' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 8 })}
                                data-description="Next Transition Key 3"
                            >
                                <span className="btn-number">KEY 3</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${(transitionSelection & 16) ? 'tally-yellow' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 16 })}
                                data-description="Next Transition Key 4"
                            >
                                <span className="btn-number">KEY 4</span>
                            </button>
                        </div>
                    </div>

                    {/* DSK 1 (Aligned directly under Inputs 7–8) */}
                    <div className="atem-section-box dsk-section-box">
                        <div className="atem-section-title">DSK 1</div>
                        <div className="two-row-grid two-cols">
                            {/* Row 1: TIE 1, Rate */}
                            <button 
                                className={`atem-btn-standard ${dsk.tie ? 'tally-yellow' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_DSK_TIE', { tie: !dsk.tie })}
                                data-description="Tie Downstream Key 1"
                            >
                                <span className="btn-number">TIE 1</span>
                            </button>
                            <DragRateInput 
                                value={localDskRate} 
                                onChange={setLocalDskRate} 
                                onCommit={(val) => {
                                    const r = val !== undefined ? val : (parseInt(localDskRate, 10) || 30);
                                    sendAtemCommand('SET_DSK_RATE', { rate: r });
                                }}
                                title="DSK 1 Rate (Frames) - Drag up/down, type + enter, or click away"
                            />

                            {/* Row 2: ON AIR, AUTO */}
                            <button 
                                className={`atem-btn-standard ${dsk.onAir ? 'tally-red' : ''}`}
                                onClick={() => sendAtemCommand('TOGGLE_DSK_ONAIR', { onAir: !dsk.onAir })}
                                data-description="Downstream Key 1 On Air"
                            >
                                <span className="btn-number">ON AIR</span>
                            </button>
                            <button 
                                className={`atem-btn-standard ${dsk.inTransition ? 'tally-orange' : ''}`}
                                onClick={() => sendAtemCommand('EXECUTE_DSK_AUTO')}
                                data-description="Auto Downstream Key 1"
                            >
                                <span className="btn-number">AUTO</span>
                            </button>
                        </div>
                    </div>

                    {/* FADE TO BLACK (Aligned directly under Input 10) */}
                    <div className="atem-section-box ftb-section-box">
                        <div className="atem-section-title">FTB</div>
                        <div className="two-row-grid one-col">
                            {/* Row 1: Rate */}
                            <DragRateInput 
                                value={localFtbRate} 
                                onChange={setLocalFtbRate} 
                                onCommit={(val) => {
                                    const r = val !== undefined ? val : (parseInt(localFtbRate, 10) || 30);
                                    sendAtemCommand('SET_FTB_RATE', { rate: r });
                                }}
                                title="Fade to Black Rate (Frames) - Drag up/down, type + enter, or click away"
                            />
                            {/* Row 2: FTB */}
                            <button 
                                className={`atem-btn-standard ${ftb.isFullyBlack ? 'tally-red' : (ftb.inTransition ? 'tally-orange' : '')}`}
                                onClick={() => sendAtemCommand('EXECUTE_FTB')}
                                data-description="Execute Fade to Black"
                            >
                                <span className="btn-number">FTB</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. BOTTOM ROW: OUT 1–6 (Left), Rate, CUT, AUTO (Right) */}
                <div className="atem-outs-wrapper">
                    <div className="atem-bottom-grid">
                        {/* Cols 1 to 6: OUT 1 to OUT 6 */}
                        {auxOutputsList.map((num, idx) => (
                            <button
                                key={`out-${num}`}
                                className={`atem-btn-standard ${selectedOut === idx ? 'out-active' : ''}`}
                                onClick={() => setSelectedOut(prev => prev === idx ? null : idx)}
                                data-description={`Route Output ${num}`}
                            >
                                <span className="btn-number">OUT {num}</span>
                            </button>
                        ))}

                        {/* Col 7: Spacer */}
                        <div className="atem-btn-spacer" />

                        {/* Col 8: RATE (Left of CUT) */}
                        <DragRateInput 
                            value={localTransRate} 
                            onChange={setLocalTransRate} 
                            onCommit={(val) => {
                                const r = val !== undefined ? val : (parseInt(localTransRate, 10) || 30);
                                sendAtemCommand('SET_TRANSITION_RATE', { rate: r });
                            }} 
                            title="Auto Transition Rate (Frames) - Drag up/down, type + enter, or click away" 
                        />

                        {/* Col 9: CUT (Under Input 9) */}
                        <button 
                            className="atem-btn-standard cut-btn"
                            onClick={() => sendAtemCommand('CUT')}
                            data-description="Cut Transition"
                        >
                            <span className="btn-number">CUT</span>
                        </button>

                        {/* Col 10: AUTO (Under Input 10) */}
                        <button 
                            className={`atem-btn-standard auto-btn ${inTransition ? 'trans-active' : ''}`}
                            onClick={() => sendAtemCommand('AUTO')}
                            data-description="Auto Transition"
                        >
                            <span className="btn-number">AUTO</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;