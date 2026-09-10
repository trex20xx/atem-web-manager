import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v2.60)
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
    const [bridgeStatus, setBridgeStatus] = useState('connecting');
    
    // Hardware State Features
    const [transitionRate, setTransitionRate] = useState(30);
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

    // Sync remote hardware rates to local input components
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

        // Hardware executes transitions cleanly; remove client-side faking when linked
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
            {/* Header aligned exactly with Macros panel */}
            <div className="atem-bus-header">
                <span className="atem-bus-title">ATEM 1 M/E CONSTELLATION HD</span>
                <span className="atem-bus-ip">{LOCKED_ATEM_IP}</span>
            </div>

            {/* Main ATEM Software Layout Replica */}
            <div className="atem-bus-content-layout">
                {/* LEFT: PGM & PVW BUSES */}
                <div className="atem-buses-col">
                    <div className="atem-section-box transparent-box">
                        <div className={`atem-section-title ${selectedOut !== null ? 'router-label' : ''}`}>
                            {selectedOut !== null ? `OUTPUT ${selectedOut + 1}` : 'Program'}
                        </div>
                        <div className="atem-bus-grid">
                            {inputSources.map((s) => (
                                <button key={`pgm-${s.id}`} className={`atem-switcher-btn ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`} onClick={() => sendAtemCommand('SET_PGM', { input: s.id })} data-description={`Input ${s.label}`}>
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                            {internalSources.map((s) => (
                                <button key={`pgm-int-${s.id}`} className={`atem-switcher-btn aux-source-btn ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`} onClick={() => sendAtemCommand('SET_PGM', { input: s.id })} data-description={`Source ${s.label}`}>
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="atem-section-box transparent-box" style={{ opacity: selectedOut !== null ? 0.35 : 1, pointerEvents: selectedOut !== null ? 'none' : 'auto', marginTop: 'auto' }}>
                        <div className="atem-section-title">Preview</div>
                        <div className="atem-bus-grid">
                            {inputSources.map((s) => (
                                <button key={`pvw-${s.id}`} className={`atem-switcher-btn ${getIsActivePvw(s.id) ? 'tally-green' : ''}`} onClick={() => sendAtemCommand('SET_PVW', { input: s.id })} data-description={`Preview Input ${s.label}`}>
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                            {internalSources.map((s) => (
                                <button key={`pvw-int-${s.id}`} className={`atem-switcher-btn aux-source-btn ${getIsActivePvw(s.id) ? 'tally-green' : ''}`} onClick={() => sendAtemCommand('SET_PVW', { input: s.id })} data-description={`Preview Source ${s.label}`}>
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MIDDLE: TRANSITIONS */}
                <div className="atem-trans-col">
                    <div className="atem-section-box">
                        <div className="atem-section-title">Next Transition</div>
                        <div className="trans-nxt-grid top-row">
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 1 On Air"><span className="btn-number">ON AIR</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 2 On Air"><span className="btn-number">ON AIR</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 3 On Air"><span className="btn-number">ON AIR</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 4 On Air"><span className="btn-number">ON AIR</span></button>
                        </div>
                        <div className="trans-nxt-grid bottom-row">
                            <button className="atem-switcher-btn tally-yellow dummy-btn" data-description="Next Transition Background"><span className="btn-number">BKGD</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 1"><span className="btn-number">KEY 1</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 2"><span className="btn-number">KEY 2</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 3"><span className="btn-number">KEY 3</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Next Transition Key 4"><span className="btn-number">KEY 4</span></button>
                        </div>
                    </div>

                    <div className="atem-section-box" style={{ marginTop: 'auto' }}>
                        <div className="atem-section-title">Transition Style</div>
                        <div className="trans-style-grid">
                            <button className="atem-switcher-btn tally-yellow dummy-btn" data-description="Mix Transition"><span className="btn-number">MIX</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Dip Transition"><span className="btn-number">DIP</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Wipe Transition"><span className="btn-number">WIPE</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="Sting Transition"><span className="btn-number">STING</span></button>
                            <button className="atem-switcher-btn dummy-btn" data-description="DVE Transition"><span className="btn-number">DVE</span></button>
                        </div>
                        <div className="trans-action-grid">
                            <button className="atem-switcher-btn dummy-btn" data-description="Preview Transition"><span className="btn-number">PREV TRANS</span></button>
                            <button className="atem-switcher-btn cut-btn" onClick={() => sendAtemCommand('CUT')} data-description="Cut Transition"><span className="btn-number">CUT</span></button>
                            <button className={`atem-switcher-btn auto-btn ${inTransition ? 'trans-active' : ''}`} onClick={() => sendAtemCommand('AUTO')} data-description="Auto Transition"><span className="btn-number">AUTO</span></button>
                            <div className="rate-box" data-description="Transition Rate (Frames)">
                                <span>Rate</span>
                                <input type="number" value={localTransRate} onChange={e => setLocalTransRate(e.target.value)} onBlur={() => sendAtemCommand('SET_TRANSITION_RATE', { rate: parseInt(localTransRate, 10) || 30 })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: DSK & FTB */}
                <div className="atem-dsk-col">
                    <div className="atem-section-box">
                        <div className="atem-section-title">DSK 1</div>
                        <div className="dsk-grid">
                            <button className={`atem-switcher-btn ${dsk.tie ? 'tally-yellow' : ''}`} onClick={() => sendAtemCommand('TOGGLE_DSK_TIE', { tie: !dsk.tie })} data-description="Tie Downstream Key 1"><span className="btn-number">TIE</span></button>
                            <div className="rate-box" data-description="DSK 1 Rate (Frames)">
                                <span>Rate</span>
                                <input type="number" value={localDskRate} onChange={e => setLocalDskRate(e.target.value)} onBlur={() => sendAtemCommand('SET_DSK_RATE', { rate: parseInt(localDskRate, 10) || 30 })} />
                            </div>
                            <button className={`atem-switcher-btn ${dsk.onAir ? 'tally-red' : ''}`} onClick={() => sendAtemCommand('TOGGLE_DSK_ONAIR', { onAir: !dsk.onAir })} data-description="Downstream Key 1 On Air"><span className="btn-number">ON AIR</span></button>
                            <button className={`atem-switcher-btn ${dsk.inTransition ? 'tally-orange' : ''}`} onClick={() => sendAtemCommand('EXECUTE_DSK_AUTO')} data-description="Auto Downstream Key 1"><span className="btn-number">AUTO</span></button>
                        </div>
                    </div>

                    <div className="atem-section-box ftb-box" style={{ marginTop: 'auto' }}>
                        <div className="atem-section-title">Fade to Black</div>
                        <div className="ftb-grid">
                            <div className="rate-box" data-description="FTB Rate (Frames)">
                                <span>Rate</span>
                                <input type="number" value={localFtbRate} onChange={e => setLocalFtbRate(e.target.value)} onBlur={() => sendAtemCommand('SET_FTB_RATE', { rate: parseInt(localFtbRate, 10) || 30 })} />
                            </div>
                            <button className={`atem-switcher-btn ${ftb.isFullyBlack ? 'tally-red' : (ftb.inTransition ? 'tally-orange' : '')}`} onClick={() => sendAtemCommand('EXECUTE_FTB')} data-description="Execute Fade to Black"><span className="btn-number">FTB</span></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM: ROUTER OUTS */}
            <div className="atem-outs-bar">
                {auxOutputsList.map((num, idx) => (
                    <button
                        key={`out-${num}`}
                        className={`atem-switcher-btn ${selectedOut === idx ? 'out-active' : ''}`}
                        onClick={() => setSelectedOut(prev => prev === idx ? null : idx)}
                        data-description={`Route Aux Output ${num}`}
                    >
                        <span className="btn-number">OUT {num}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AtemConstellationBus;