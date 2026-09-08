import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v1.83)
// =========================================================================
// Fixed useRef import to resolve component mounting crash.

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const AtemConstellationBus = ({ connectedDevice }) => {
    // Strict Hardware IP Lock Guard
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
    const wsRef = useRef(null);

    useEffect(() => {
        const wsUrl = `ws://localhost:${BRIDGE_PORT}`;
        try {
            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                setBridgeStatus('linked');
                wsRef.current.send(JSON.stringify({ action: 'CONNECT', ip: LOCKED_ATEM_IP }));
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.pgm !== undefined) setPgmInput(data.pgm);
                    if (data.pvw !== undefined) setPvwInput(data.pvw);
                } catch (err) {
                    console.error("Atem Bridge Data Parse Error:", err);
                }
            };

            wsRef.current.onerror = () => {
                setBridgeStatus('offline');
            };

            wsRef.current.onclose = () => {
                setBridgeStatus('offline');
            };
        } catch (e) {
            setBridgeStatus('offline');
        }

        return () => {
            if (wsRef.current) {
                try { wsRef.current.close(); } catch(err) {}
            }
        };
    }, []);

    const sendAtemCommand = (commandType, payload) => {
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

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ action: commandType, ip: LOCKED_ATEM_IP, ...payload }));
            } catch (err) {
                console.warn("WebSocket send failed, running in local simulation mode.");
            }
        }
    };

    const inputs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <div className="atem-constellation-panel">
            {/* Switcher Header */}
            <div className="atem-bus-header">
                <div className="atem-bus-title-group">
                    <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                    <span className="atem-bus-badge">
                        {bridgeStatus === 'linked' ? 'HARDWARE LINKED' : 'SIMULATION MODE'}
                    </span>
                </div>
                <div className="atem-bus-status">
                    <span className={`atem-bus-online-dot ${bridgeStatus}`}></span>
                    <span className="atem-bus-ip">
                        {LOCKED_ATEM_IP} {bridgeStatus === 'linked' ? '(LIVE)' : '(OFFLINE BRIDGE)'}
                    </span>
                </div>
            </div>

            {/* Main Switcher Matrix */}
            <div className="atem-bus-matrix">
                {/* 1. PROGRAM BUS (PGM) */}
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
                                    <span className="btn-subtext">CAM {num}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. PREVIEW BUS (PVW) */}
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
                                    <span className="btn-subtext">CAM {num}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Transition Control Block */}
            <div className="atem-bus-footer">
                <div className="atem-bus-me-label">
                    {bridgeStatus === 'linked' ? 'M/E 1 TRANSITION (HARDWARE READY)' : 'M/E 1 TRANSITION (LOCAL UI SIMULATION)'}
                </div>
                <div className="atem-transition-actions">
                    <button className="atem-trans-btn cut-btn" onClick={() => sendAtemCommand('CUT', {})}>
                        CUT
                    </button>
                    <button className={`atem-trans-btn auto-btn ${inTransition ? 'trans-active' : ''}`} onClick={() => sendAtemCommand('AUTO', {})}>
                        AUTO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;