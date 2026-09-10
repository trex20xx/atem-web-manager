import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v2.62)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

// Reusable Drag-to-Adjust Rate Component mimicking button geometry
const DragRateInput = ({ value, onChange, onBlur, title }) => {
    const handleMouseDown = (e) => {
        e.preventDefault();
        let startY = e.clientY;
        let startVal = parseInt(value, 10) || 30;

        const handleMouseMove = (moveEvent) => {
            const deltaY = startY - moveEvent.clientY;
            let newVal = Math.max(1, startVal + Math.floor(deltaY / 2));
            onChange(newVal);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            onBlur();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="rate-box" title={title} onMouseDown={handleMouseDown}>
            <span>Rate</span>
            <input 
                type="number" 
                className="drag-rate-input"
                value={value} 
                onChange={e => onChange(e.target.value)} 
                onBlur={onBlur}
                onMouseDown={e => e.stopPropagation()} 
            />
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
    
    // Hardware State Features
    const [transitionRate, setTransitionRate] = useState(30);
    const [transitionStyle, setTransitionStyle] = useState(0); // 0=MIX, 1=DIP, 2=WIPE, 3=DVE, 4=STING
    const [transitionSelection, setTransitionSelection] = useState(1); // Bitmask (1=BKGD, 2=KEY1, etc.)
    const [previewTransition, setPreviewTransition] = useState(false);
    const [uskOnAir, setUskOnAir] = useState([false, false, false, false]);

    const [ftb, setFtb] = useState({ inTransition: false, isFullyBlack: false, rate: 30 });
    const [dsk, setDsk] = useState({ onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: 30 });
    
    // Local Inputs for blur-syncing rates without cursor jumps
    const [localTransRate, setLocalTransRate] = useState(30);
    const [localFtbRate, setLocalFtbRate] = useState(30);
    const [localDskRate, setLocalDskRate] = useState(30);

    // Router Mode
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
                    if (data.auxSources && Array.isArray(data.auxSources)) setAuxSources(data.auxSources.map(Number));
                    
                    if (data.transitionRate !== undefined) setTransitionRate(data.transitionRate);
                    if (data.transitionStyle !== undefined) setTransitionStyle(data.transitionStyle);
                    if (data.transitionSelection !== undefined) setTransitionSelection(data.transitionSelection);
                    if (data.previewTransition !== undefined) setPreviewTransition(data.previewTransition);
                    if (data.uskOnAir !== undefined) setUskOnAir(data.uskOnAir);

                    if (data.ftb) setFtb(data.ftb);
                    if (data.dsk) setDsk(data.dsk);
                } catch (err) {
                    console.error("[AtemBus UI] Data Parse Error:", err);
                }
            };

            wsRef.current.onerror = () => setBridgeStatus('offline');
            wsRef.current.onclose = () => {
                setBridgeStatus('offline');
                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => { reconnectTimerRef.current = null; initWebSocket(); }, 2500);
                }
            };
        } catch (e) {
            setBridgeStatus('offline');
            if (!reconnectTimerRef.current) {
                reconnectTimerRef.current = setTimeout(() => { reconnectTimerRef.current = null; initWebSocket(); }, 2500);
            }
        }
    };

    useEffect(() => {
        initWebSocket();
        return () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) { try { wsRef.current.close(); } catch(err) {} }
        };
    }, []);

    useEffect(() => { setLocalTransRate(transitionRate); }, [transitionRate]);
    useEffect(() => { setLocalFtbRate(ftb.rate); }, [ftb.rate]);
    useEffect(() => { setLocalDskRate(dsk.rate); }, [dsk.rate]);

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
        } else if (commandType === 'SET_PVW') {
            setPvwInput(payload.input);
        }

        if (commandType === 'CUT' && bridgeStatus !== 'linked') {
            const temp = pgmInput;
            setPgmInput(pvwInput);
            setPvwInput(temp);
        }

        if (commandType === 'AUTO' && bridgeStatus !== 'linked') {
            setInTransition(true);
            setTimeout(() => {
                const temp = pgmInput;
                setPgmInput(pvwInput);
                setPvwInput(temp);
                setInTransition(false);
            }, 600);
        }

        sendCommand(commandType, payload);
    };

    const sendCommand = (action, payload = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try { wsRef.current.send(JSON.stringify({ action, ip: LOCKED_ATEM_IP, ...payload })); } 
            catch (err) { console.warn("[AtemBus UI] Dispatch failed."); }
        }
    };

    const inputSources = [
        { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }, 
        { id: 6, label: '6' }, { id: 7, label: '7' }, { id: 8, label: '8' }, { id: 9, label: '9' }, { id: 10, label: '10' }
    ];

    const internalSources = [
        { id: 0, label: 'BLK' }, { id: 1000, label: 'BARS' }, { id: 2001, label: 'COL 1' }, 
        { id: 2002, label: 'COL 2' }, { id: 3010, label: 'MP 1' }, { id: 3020, label: 'MP 2' }
    ];

    const auxOutputsList = [1, 2, 3, 4, 5, 6];

    const getIsActivePgm = (sourceId) => selectedOut !== null ? (auxSources[selectedOut] === sourceId) : (pgmInput === sourceId);
    const getIsActivePvw = (sourceId) => selectedOut !== null ? false : (pvwInput === sourceId);

    return (
        <div className="atem-constellation-panel">
            <div className="atem-bus-header">
                <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                <div className="atem-bus-status">
                    <span className={`atem-bus-online-dot ${bridgeStatus === 'linked' ? '' : 'offline'}`} />
                    <span className="atem-bus-ip">{LOCKED_ATEM_IP}</span>
                </div>
            </div>

            <div className="atem-bus-content-layout">
                {/* TOP SECTION: PGM & PVW BUSES COMBINED */}
                <div className="atem-section-box pgm-pvw-box">
                    <div className={`bus-title-label ${selectedOut !== null ? 'router-label' : 'pgm-label'}`}>
                        {selectedOut !== null ? `OUTPUT ${selectedOut + 1}` : 'PROGRAM'}
                    </div>
                    <div className="atem-bus-grid">
                        {inputSources.map((s) => (
                            <button key={`pgm-${s.id}`} className={`atem-btn-standard ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`} onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}>
                                <span className="btn-number">{s.label}</span>
                            </button>
                        ))}
                        {internalSources.map((s) => (
                            <button key={`pgm-int-${s.id}`} className={`atem-btn-standard aux-source-btn ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`} onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}>
                                <span className="btn-number">{s.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bus-title-label pvw-label" style={{ marginTop: '6px', opacity: selectedOut !== null ? 0.35 : 1 }}>PREVIEW</div>
                    <div className="atem-bus-grid" style={{ opacity: selectedOut !== null ? 0.35 : 1, pointerEvents: selectedOut !== null ? 'none' : 'auto' }}>
                        {inputSources.map((s) => (
                            <button key={`pvw-${s.id}`} className={`atem-btn-standard ${getIsActivePvw(s.id) ? 'tally-green' : ''}`} onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}>
                                <span className="btn-number">{s.label}</span>
                            </button>
                        ))}
                        {internalSources.map((s) => (
                            <button key={`pvw-int-${s.id}`} className={`atem-btn-standard aux-source-btn ${getIsActivePvw(s.id) ? 'tally-green' : ''}`} onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}>
                                <span className="btn-number">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* BOTTOM SECTION: CONTROLS (Exactly 2 buttons tall) */}
                <div className="atem-lower-controls-row">
                    {/* Next Transition */}
                    <div className="atem-section-box">
                        <div className="atem-section-title">NEXT TRANSITION</div>
                        <div className="trans-nxt-grid">
                            <div className="atem-btn-standard transparent-btn" />
                            <button className={`atem-btn-standard ${uskOnAir[0] ? 'tally-red' : ''}`} onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 0 })}><span className="btn-number">ON AIR</span></button>
                            <button className={`atem-btn-standard ${uskOnAir[1] ? 'tally-red' : ''}`} onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 1 })}><span className="btn-number">ON AIR</span></button>
                            <button className={`atem-btn-standard ${uskOnAir[2] ? 'tally-red' : ''}`} onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 2 })}><span className="btn-number">ON AIR</span></button>
                            <button className={`atem-btn-standard ${uskOnAir[3] ? 'tally-red' : ''}`} onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk: 3 })}><span className="btn-number">ON AIR</span></button>
                        </div>
                        <div className="trans-nxt-grid">
                            <button className={`atem-btn-standard ${(transitionSelection & 1) ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 1 })}><span className="btn-number">BKGD</span></button>
                            <button className={`atem-btn-standard ${(transitionSelection & 2) ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 2 })}><span className="btn-number">KEY 1</span></button>
                            <button className={`atem-btn-standard ${(transitionSelection & 4) ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 4 })}><span className="btn-number">KEY 2</span></button>
                            <button className={`atem-btn-standard ${(transitionSelection & 8) ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 8 })}><span className="btn-number">KEY 3</span></button>
                            <button className={`atem-btn-standard ${(transitionSelection & 16) ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit: 16 })}><span className="btn-number">KEY 4</span></button>
                        </div>
                    </div>

                    {/* Transition Style */}
                    <div className="atem-section-box">
                        <div className="atem-section-title">TRANSITION STYLE</div>
                        <div className="trans-style-grid">
                            <button className={`atem-btn-standard ${transitionStyle === 0 ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('SET_TRANS_STYLE', { style: 0 })}><span className="btn-number">MIX</span></button>
                            <button className={`atem-btn-standard ${transitionStyle === 1 ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('SET_TRANS_STYLE', { style: 1 })}><span className="btn-number">DIP</span></button>
                            <button className={`atem-btn-standard ${transitionStyle === 2 ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('SET_TRANS_STYLE', { style: 2 })}><span className="btn-number">WIPE</span></button>
                            <button className={`atem-btn-standard ${transitionStyle === 4 ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('SET_TRANS_STYLE', { style: 4 })}><span className="btn-number">STING</span></button>
                            <button className={`atem-btn-standard ${transitionStyle === 3 ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('SET_TRANS_STYLE', { style: 3 })}><span className="btn-number">DVE</span></button>
                        </div>
                        <div className="trans-action-grid">
                            <button className={`atem-btn-standard wide-btn ${previewTransition ? 'tally-green' : ''}`} onClick={() => sendAtemCommand('TOGGLE_PREV_TRANS')}><span className="btn-number">PREV TRANS</span></button>
                            <button className="atem-btn-standard cut-btn" onClick={() => sendAtemCommand('CUT')}><span className="btn-number">CUT</span></button>
                            <button className={`atem-btn-standard auto-btn ${inTransition ? 'trans-active' : ''}`} onClick={() => sendAtemCommand('AUTO')}><span className="btn-number">AUTO</span></button>
                            <DragRateInput value={localTransRate} onChange={setLocalTransRate} onBlur={() => sendAtemCommand('SET_TRANSITION_RATE', { rate: parseInt(localTransRate, 10) || 30 })} title="Transition Rate" />
                        </div>
                    </div>

                    {/* DSK 1 */}
                    <div className="atem-section-box">
                        <div className="atem-section-title">DSK 1</div>
                        <div className="dsk-grid">
                            <button className={`atem-btn-standard ${dsk.tie ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_DSK_TIE', { tie: !dsk.tie })}><span className="btn-number">TIE</span></button>
                            <button className={`atem-btn-standard ${dsk.onAir ? 'tally-red' : ''}`} onClick={() => sendAtemCommand('TOGGLE_DSK_ONAIR', { onAir: !dsk.onAir })}><span className="btn-number">ON AIR</span></button>
                            <DragRateInput value={localDskRate} onChange={setLocalDskRate} onBlur={() => sendAtemCommand('SET_DSK_RATE', { rate: parseInt(localDskRate, 10) || 30 })} title="DSK Rate" />
                            <button className={`atem-btn-standard ${dsk.inTransition ? 'tally-orange' : ''}`} onClick={() => sendAtemCommand('EXECUTE_DSK_AUTO')}><span className="btn-number">AUTO</span></button>
                        </div>
                    </div>

                    {/* Fade to Black */}
                    <div className="atem-section-box">
                        <div className="atem-section-title">FADE TO BLACK</div>
                        <div className="ftb-grid">
                            <DragRateInput value={localFtbRate} onChange={setLocalFtbRate} onBlur={() => sendAtemCommand('SET_FTB_RATE', { rate: parseInt(localFtbRate, 10) || 30 })} title="FTB Rate" />
                            <button className={`atem-btn-standard ftb-btn ${ftb.isFullyBlack ? 'tally-red' : (ftb.inTransition ? 'tally-orange' : '')}`} onClick={() => sendAtemCommand('EXECUTE_FTB')}><span className="btn-number">FTB</span></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM: ROUTER OUTS */}
            <div className="atem-outs-bar">
                {auxOutputsList.map((num, idx) => (
                    <button
                        key={`out-${num}`}
                        className={`atem-btn-standard ${selectedOut === idx ? 'out-active' : ''}`}
                        onClick={() => setSelectedOut(prev => prev === idx ? null : idx)}
                    >
                        <span className="btn-number">OUT {num}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AtemConstellationBus;