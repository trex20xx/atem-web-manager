import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v2.67)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

// Rate Button with drag up/down, typing, Enter-key submission, and panel-drag suppression
const DragRateInput = ({ value, onChange, onBlur, title }) => {
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const startValRef = useRef(30);

    const lockPanelDrag = (e) => {
        const panel = e.currentTarget.closest('.panel');
        if (panel) panel.draggable = false;
    };

    const unlockPanelDrag = (e) => {
        const panel = e.currentTarget.closest('.panel');
        if (panel) panel.draggable = true;
    };

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        
        const panel = e.currentTarget.closest('.panel');
        if (panel) panel.draggable = false;

        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startValRef.current = parseInt(value, 10) || 30;

        const handleMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const deltaY = startYRef.current - moveEvent.clientY;
            const newVal = Math.max(1, Math.min(250, startValRef.current + Math.floor(deltaY / 2)));
            onChange(newVal);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (panel) panel.draggable = true;
            if (onBlur) onBlur();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            if (onBlur) onBlur();
        }
    };

    return (
        <div 
            className="rate-box-button"
            title={title}
            onMouseDown={handleMouseDown}
            onMouseEnter={lockPanelDrag}
            onMouseLeave={unlockPanelDrag}
        >
            <input 
                type="number" 
                className="rate-input-field"
                value={value} 
                onChange={e => onChange(e.target.value)} 
                onBlur={onBlur}
                onKeyDown={handleKeyDown}
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
    const [transitionRate, setTransitionRate] = useState(30);
    const [localTransRate, setLocalTransRate] = useState(30);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');
    
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
                    if (data.hardwareConnected !== undefined) {
                        setBridgeStatus(data.hardwareConnected ? 'linked' : 'standby');
                    }
                    if (data.pgm !== undefined) {
                        setPgmInput(Number(data.pgm));
                    }
                    if (data.pvw !== undefined) {
                        setPvwInput(Number(data.pvw));
                    }
                    if (data.inTransition !== undefined) {
                        setInTransition(Boolean(data.inTransition));
                    }
                    if (data.transitionRate !== undefined) {
                        setTransitionRate(Number(data.transitionRate));
                    }
                    if (data.auxSources && Array.isArray(data.auxSources)) {
                        setAuxSources(data.auxSources.map(Number));
                    }
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

    useEffect(() => {
        setLocalTransRate(transitionRate);
    }, [transitionRate]);

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
            {/* Header with green online dot */}
            <div className="atem-bus-header">
                <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                <div className="atem-bus-status">
                    <span className={`atem-bus-online-dot ${bridgeStatus === 'linked' ? 'online' : 'offline'}`} />
                    <span className="atem-bus-ip">{LOCKED_ATEM_IP}</span>
                </div>
            </div>

            <div className="atem-bus-content-layout">
                {/* Unified Centered Bordered Box: PROGRAM & PREVIEW */}
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

                {/* BOTTOM ROW: Centered 10-column grid matching buses exactly */}
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
                            onBlur={() => sendAtemCommand('SET_TRANSITION_RATE', { rate: parseInt(localTransRate, 10) || 30 })} 
                            title="Auto Transition Rate (Frames) - Drag up/down or type and press Enter" 
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