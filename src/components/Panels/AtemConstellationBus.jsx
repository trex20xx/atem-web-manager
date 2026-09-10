import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v2.58)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

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
    const [bridgeStatus, setBridgeStatus] = useState('connecting'); // 'linked' | 'standby' | 'offline' | 'connecting'
    
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
                    if (data.auxSources && Array.isArray(data.auxSources)) {
                        setAuxSources(data.auxSources.map(Number));
                    }
                } catch (err) {
                    console.error("[AtemBus UI] Data Parse Error:", err);
                }
            };

            wsRef.current.onerror = () => {
                setBridgeStatus('offline');
            };

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

    const sendAtemCommand = (commandType, payload = {}) => {
        if (commandType === 'SET_PGM') {
            if (selectedOut !== null) {
                // Route Aux Output
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
            // Hardware controls state transitions; only run simulation if offline
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

    // Sources specification
    const inputSources = [
        { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' },
        { id: 5, label: '5' }, { id: 6, label: '6' }, { id: 7, label: '7' }, { id: 8, label: '8' },
        { id: 9, label: '9' }, { id: 10, label: '10' }
    ];

    const internalSources = [
        { id: 0, label: 'BLK' },
        { id: 1000, label: 'BARS' },
        { id: 2001, label: 'COL 1' },
        { id: 2002, label: 'COL 2' },
        { id: 3010, label: 'MP 1' },
        { id: 3020, label: 'MP 2' }
    ];

    const auxOutputsList = [1, 2, 3, 4, 5, 6];

    const handleOutClick = (outIdx) => {
        // Toggle selection: pressing an active out deselects it, reverting to bus mode
        setSelectedOut(prev => prev === outIdx ? null : outIdx);
    };

    // Active source determination
    const getIsActivePgm = (sourceId) => {
        if (selectedOut !== null) {
            return auxSources[selectedOut] === sourceId;
        }
        return pgmInput === sourceId;
    };

    const getIsActivePvw = (sourceId) => {
        if (selectedOut !== null) return false;
        return pvwInput === sourceId;
    };

    return (
        <div className="atem-constellation-panel">
            {/* Header matching exact Macros vertical alignment */}
            <div className="atem-bus-header">
                <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                <div className="atem-bus-status">
                    <span className={`atem-bus-online-dot ${bridgeStatus === 'linked' ? '' : 'offline'}`} />
                    <span className="atem-bus-ip">{LOCKED_ATEM_IP}</span>
                </div>
            </div>

            {/* Matrix Section */}
            <div className="atem-bus-matrix">
                {/* 1. PROGRAM / ROUTER BUS */}
                <div className="atem-bus-row-group">
                    <div className={`atem-bus-row-label ${selectedOut !== null ? 'router-label' : 'pgm-label'}`}>
                        {selectedOut !== null ? `OUT ${selectedOut + 1}` : 'PGM'}
                    </div>
                    <div className="atem-bus-full-grid">
                        <div className="inputs-subgrid">
                            {inputSources.map((s) => (
                                <button
                                    key={`pgm-${s.id}`}
                                    className={`atem-switcher-btn ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`}
                                    onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}
                                    data-description={`Input ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="bus-gap-divider" />
                        <div className="internals-subgrid">
                            {internalSources.map((s) => (
                                <button
                                    key={`pgm-${s.id}`}
                                    className={`atem-switcher-btn aux-source-btn ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`}
                                    onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}
                                    data-description={`Source ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. PREVIEW BUS */}
                <div className="atem-bus-row-group">
                    <div className="atem-bus-row-label pvw-label">PVW</div>
                    <div className="atem-bus-full-grid">
                        <div className="inputs-subgrid">
                            {inputSources.map((s) => (
                                <button
                                    key={`pvw-${s.id}`}
                                    className={`atem-switcher-btn ${getIsActivePvw(s.id) ? 'tally-green' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}
                                    data-description={`Preview Input ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="bus-gap-divider" />
                        <div className="internals-subgrid">
                            {internalSources.map((s) => (
                                <button
                                    key={`pvw-${s.id}`}
                                    className={`atem-switcher-btn aux-source-btn ${getIsActivePvw(s.id) ? 'tally-green' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}
                                    data-description={`Preview Source ${s.label}`}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. TRANSITION ACTIONS (Placed under inputs 9 & 10) */}
                <div className="atem-bus-row-group atem-transition-row">
                    <div className="atem-bus-row-label spacer-label" />
                    <div className="atem-bus-full-grid">
                        <div className="inputs-subgrid">
                            <div style={{ gridColumn: 'span 8' }} />
                            <button 
                                className="atem-switcher-btn cut-btn" 
                                onClick={() => sendAtemCommand('CUT')}
                                data-description="CUT Transition"
                            >
                                <span className="btn-number">CUT</span>
                            </button>
                            <button 
                                className={`atem-switcher-btn auto-btn ${inTransition ? 'trans-active' : ''}`} 
                                onClick={() => sendAtemCommand('AUTO')}
                                data-description="AUTO Transition"
                            >
                                <span className="btn-number">AUTO</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. 6 ROUTER OUTPUTS */}
                <div className="atem-bus-row-group atem-outs-row">
                    <div className="atem-bus-row-label outs-label">OUTS</div>
                    <div className="atem-outs-grid">
                        {auxOutputsList.map((num, idx) => {
                            const isSelected = selectedOut === idx;
                            return (
                                <button
                                    key={`out-${num}`}
                                    className={`atem-switcher-btn out-btn ${isSelected ? 'out-active' : ''}`}
                                    onClick={() => handleOutClick(idx)}
                                    data-description={`Aux Output ${num} (Click to route)`}
                                >
                                    <span className="btn-number">OUT {num}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;