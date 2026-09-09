import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v2.12.0)
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
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    const initWebSocket = () => {
        const wsUrl = `ws://localhost:${BRIDGE_PORT}`;
        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('[AtemBus UI] WebSocket link opened with bridge server.');
                setBridgeStatus('standby');
                // Request live state synchronization immediately upon handshake
                wsRef.current.send(JSON.stringify({ action: 'CONNECT', ip: LOCKED_ATEM_IP }));
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('[AtemBus UI] Inbound switcher payload:', data);
                    if (data.hardwareConnected !== undefined) {
                        setBridgeStatus(data.hardwareConnected ? 'linked' : 'standby');
                    }
                    if (typeof data.pgm === 'number') setPgmInput(data.pgm);
                    if (typeof data.pvw === 'number') setPvwInput(data.pvw);
                    if (typeof data.inTransition === 'boolean') setInTransition(data.inTransition);
                } catch (err) {
                    console.error("[AtemBus UI] Data Parse Error:", err);
                }
            };

            wsRef.current.onerror = () => {
                setBridgeStatus('offline');
            };

            wsRef.current.onclose = () => {
                console.warn('[AtemBus UI] WebSocket link closed. Scheduling reconnect...');
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
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            if (wsRef.current) {
                try { 
                    wsRef.current.close(); 
                } catch(err) {}
            }
        };
    }, []);

    const sendAtemCommand = (commandType, payload = {}) => {
        console.log(`[AtemBus UI] Outbound command dispatch: ${commandType}`, payload);

        // Optimistic local UI feedback for immediate responsiveness
        if (commandType === 'SET_PGM') setPgmInput(payload.input);
        if (commandType === 'SET_PVW') setPvwInput(payload.input);
        if (commandType === 'CUT') {
            const temp = pgmInput;
            setPgmInput(pvwInput);
            setPvwInput(temp);
        }
        if (commandType === 'AUTO') {
            setInTransition(true);
            setTimeout(() => {
                const temp = pgmInput;
                setPgmInput(pvwInput);
                setPvwInput(temp);
                setInTransition(false);
            }, 350);
        }

        // Two-way dispatch to Node.js Hardware Bridge
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ 
                    action: commandType, 
                    ip: LOCKED_ATEM_IP, 
                    ...payload 
                }));
            } catch (err) {
                console.warn("[AtemBus UI] WebSocket command dispatch failed.");
            }
        }
    };

    const inputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const getStatusLabel = () => {
        if (bridgeStatus === 'linked') return `${LOCKED_ATEM_IP} (LIVE)`;
        if (bridgeStatus === 'standby') return `${LOCKED_ATEM_IP} (STANDBY / HARDWARE OFFLINE)`;
        return `${LOCKED_ATEM_IP} (BRIDGE OFFLINE)`;
    };

    const getBadgeLabel = () => {
        if (bridgeStatus === 'linked') return 'HARDWARE LINKED';
        if (bridgeStatus === 'standby') return 'BRIDGE CONNECTED (OFFLINE ATEM)';
        return 'SIMULATION MODE';
    };

    return (
        <div className="atem-constellation-panel">
            <div className="atem-bus-header">
                <div className="atem-bus-title-group">
                    <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                    <span className="atem-bus-badge">
                        {getBadgeLabel()}
                    </span>
                </div>
                <div className="atem-bus-status">
                    <span className={`atem-bus-online-dot ${bridgeStatus === 'linked' ? '' : 'offline'}`}></span>
                    <span className="atem-bus-ip">
                        {getStatusLabel()}
                    </span>
                </div>
            </div>

            <div className="atem-bus-matrix">
                {/* 1. PROGRAM BUS */}
                <div className="atem-bus-row-group">
                    <div className="atem-bus-row-label pgm-label">PGM</div>
                    <div className="atem-bus-buttons-grid">
                        {inputs.map((num) => {
                            const isActive = pgmInput === num;
                            return (
                                <button
                                    key={`pgm-${num}`}
                                    className={`atem-switcher-btn pgm-btn ${isActive ? 'tally-red' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PGM', { input: num })}
                                    title={`Program Input ${num}`}
                                >
                                    <span className="btn-number">{num}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. PREVIEW BUS */}
                <div className="atem-bus-row-group">
                    <div className="atem-bus-row-label pvw-label">PVW</div>
                    <div className="atem-bus-buttons-grid">
                        {inputs.map((num) => {
                            const isActive = pvwInput === num;
                            return (
                                <button
                                    key={`pvw-${num}`}
                                    className={`atem-switcher-btn pvw-btn ${isActive ? 'tally-green' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PVW', { input: num })}
                                    title={`Preview Input ${num}`}
                                >
                                    <span className="btn-number">{num}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="atem-bus-footer">
                <div className="atem-bus-me-label">
                    {bridgeStatus === 'linked' ? 'M/E 1 TRANSITION (HARDWARE ACTIVE)' : 'M/E 1 TRANSITION (LOCAL UI SIMULATION)'}
                </div>
                <div className="atem-transition-actions">
                    <button className="atem-trans-btn cut-btn" onClick={() => sendAtemCommand('CUT')}>
                        CUT
                    </button>
                    <button className={`atem-trans-btn auto-btn ${inTransition ? 'trans-active' : ''}`} onClick={() => sendAtemCommand('AUTO')}>
                        AUTO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;