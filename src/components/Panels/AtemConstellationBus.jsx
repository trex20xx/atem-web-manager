import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v3.72)
// =========================================================================
// Hardware-Locked IP: 192.168.10.240
// Switcher Button Geometry: 74px x 36px | 4px Padding Symmetry
// Lifecycle States:
//   - Disconnected: Muted Standby Mode (uniform 0.35 opacity across all rows,
//                   pointer-events: none, no buttons lit, no rate values)
//   - Connected: Active Mode (opacity: 1, pointer-events: auto, live tallies & rates)
// Keyboard Shortcuts (Active state only):
//   - Keys 1-9, 0       -> Selects Inputs 1-10 on PREVIEW (Green Tally)
//   - Shift + 1-9, 0    -> Selects Inputs 1-10 on PROGRAM (Red Tally)
//   - Space             -> CUT Transition
//   - Enter             -> AUTO Transition

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const formatFrames = (frames) => {
    if (frames === null || frames === undefined) return '';
    const validFrames = parseInt(frames, 10) || 0;
    const s = Math.floor(validFrames / 25);
    const f = validFrames % 25;
    return `${s}:${f.toString().padStart(2, '0')}`;
};

const parseFrames = (str) => {
    const s = str.toString().trim();
    if (s.includes(':') || s.includes('.')) {
        const parts = s.split(/[:.]/);
        const sec = parseInt(parts[0], 10) || 0;
        const frm = parseInt(parts[1], 10) || 0;
        return (sec * 25) + frm;
    }
    return parseInt(s, 10) || 0;
};

const DragRateInput = ({ value, onChange, onCommit, title, disabled, onDoubleClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [typedVal, setTypedVal] = useState(value != null ? formatFrames(value) : '');
    
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const currentValRef = useRef(value);

    useEffect(() => {
        if (!isEditing) {
            setTypedVal(value != null ? formatFrames(value) : '');
        }
        currentValRef.current = value;
    }, [value, isEditing]);

    const handleMouseDown = (e) => {
        if (disabled || isEditing || value == null) return;
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const panel = e.currentTarget.closest('.panel');
        if (panel) panel.draggable = false;

        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        let hasMoved = false;

        const onMouseMove = (moveEvent) => {
            if (!isDraggingRef.current) return;
            const deltaY = startYRef.current - moveEvent.clientY;
            
            if (Math.abs(deltaY) >= 2) {
                hasMoved = true;
                const step = deltaY > 0 ? Math.floor(deltaY / 2) : Math.ceil(deltaY / 2);
                
                if (step !== 0) {
                    const base = currentValRef.current || 25;
                    const newVal = Math.max(1, Math.min(250, base + step));
                    if (newVal !== currentValRef.current) {
                        currentValRef.current = newVal;
                        onChange(newVal);
                        if (onCommit) onCommit(newVal);
                    }
                    startYRef.current -= (step * 2);
                }
            }
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            isDraggingRef.current = false;
            if (panel) panel.draggable = true;

            if (hasMoved) {
                if (onCommit && currentValRef.current != null) onCommit(currentValRef.current);
            } else {
                setTypedVal(formatFrames(currentValRef.current || 25));
                setIsEditing(true);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            const parsed = Math.max(1, Math.min(250, parseFrames(typedVal)));
            onChange(parsed);
            if (onCommit) onCommit(parsed);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setTypedVal(value != null ? formatFrames(value) : '');
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        const parsed = Math.max(1, Math.min(250, parseFrames(typedVal)));
        onChange(parsed);
        if (onCommit) onCommit(parsed);
    };

    if (isEditing && !disabled) {
        return (
            <div className="rate-box-button editing" title={title}>
                <input
                    type="text"
                    className="rate-input-field"
                    autoFocus
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
            onMouseDown={disabled || value == null ? undefined : handleMouseDown}
            onDoubleClick={disabled ? undefined : onDoubleClick}
        >
            <span className="rate-display-value">
                {value != null && !disabled ? formatFrames(value) : ''}
            </span>
        </div>
    );
};

const AtemConstellationBus = ({ connectedDevice }) => {
    // Determine active connection state
    const isPanelActive = Boolean(connectedDevice && connectedDevice.ip === LOCKED_ATEM_IP);

    const [isUnlocked, setIsUnlocked] = useState(true);
    const [pgmInput, setPgmInput] = useState(null);
    const [pvwInput, setPvwInput] = useState(null);
    const [inTransition, setInTransition] = useState(false);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');

    const [transitionRate, setTransitionRate] = useState(null);
    const [transitionSelection, setTransitionSelection] = useState(null);
    const [uskOnAir, setUskOnAir] = useState([false, false, false, false]);

    const [dsk, setDsk] = useState({ onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: null });
    const [ftb, setFtb] = useState({ inTransition: false, isFullyBlack: false, rate: null });

    const [localTransRate, setLocalTransRate] = useState(null);
    const [localDskRate, setLocalDskRate] = useState(null);
    const [localFtbRate, setLocalFtbRate] = useState(null);

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
                } catch (err) {}
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

    const sendCommand = (action, payload = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ 
                    action, 
                    ip: LOCKED_ATEM_IP, 
                    ...payload 
                }));
            } catch (err) {}
        }
    };

    const sendAtemCommand = (commandType, payload = {}) => {
        if (!isPanelActive || !isUnlocked) return;

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

    const sendAtemCommandRef = useRef(sendAtemCommand);
    useEffect(() => {
        sendAtemCommandRef.current = sendAtemCommand;
    });

    // -------------------------------------------------------------------------
    // KEYBOARD SHORTCUTS ENGINE (Active hardware state only)
    // -------------------------------------------------------------------------
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPanelActive || !isUnlocked) return;

            // Guard: Prevent auto-repeat bouncing from held down keys
            if (e.repeat) return;

            // Guard: Do not intercept if typing in an input, textarea, or editable element
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            // Guard: Protect browser shortcuts (Ctrl+1..9, Cmd+1..9, Alt+...)
            if (e.ctrlKey || e.altKey || e.metaKey) {
                return;
            }

            // CUT shortcut: Space
            if (e.code === 'Space') {
                e.preventDefault();
                sendAtemCommandRef.current('CUT');
                return;
            }

            // AUTO shortcut: Enter
            if (e.code === 'Enter' || e.code === 'NumpadEnter') {
                e.preventDefault();
                sendAtemCommandRef.current('AUTO');
                return;
            }

            const keyMap = {
                Digit1: 1, Numpad1: 1,
                Digit2: 2, Numpad2: 2,
                Digit3: 3, Numpad3: 3,
                Digit4: 4, Numpad4: 4,
                Digit5: 5, Numpad5: 5,
                Digit6: 6, Numpad6: 6,
                Digit7: 7, Numpad7: 7,
                Digit8: 8, Numpad8: 8,
                Digit9: 9, Numpad9: 9,
                Digit0: 10, Numpad0: 10
            };

            const inputNum = keyMap[e.code];
            if (inputNum !== undefined) {
                e.preventDefault();
                if (e.shiftKey) {
                    sendAtemCommandRef.current('SET_PGM', { input: inputNum });
                } else {
                    sendAtemCommandRef.current('SET_PVW', { input: inputNum });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPanelActive, isUnlocked]);

    const inputSources = [
        { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }, 
        { id: 6, label: '6' }, { id: 7, label: '7' }, { id: 8, label: '8' }, { id: 9, label: '9' }, { id: 10, label: '10' }
    ];

    const internalSources = [
        { id: 0, label: 'BLK' },
        { id: 1000, label: 'BARS' },
        { id: 2001, label: 'COL 1' },
        { id: 2002, label: 'COL 2' },
        { id: 3010, label: 'MP1' },
        { id: 3020, label: 'MP2' },
        { id: 'spacer-1', spacer: true },
        { id: 'spacer-2', spacer: true },
        { id: 10011, label: 'PVW', isAuxOnly: true },
        { id: 10010, label: 'PGM', isAuxOnly: true }
    ];

    const auxOutputsList = [1, 2, 3, 4, 5, 6];

    // Suppress all tallies when disconnected (!isPanelActive)
    const getIsActivePgm = (sourceId) => {
        if (!isPanelActive || pgmInput === null) return false;
        return selectedOut !== null ? (auxSources[selectedOut] === sourceId) : (pgmInput === sourceId);
    };

    const getIsActivePvw = (sourceId) => {
        if (!isPanelActive || pvwInput === null) return false;
        return selectedOut !== null ? false : (pvwInput === sourceId);
    };

    // Styling configuration for locked / standby muting
    const activeLockStyle = {
        opacity: !isUnlocked ? 0.45 : 1,
        pointerEvents: !isUnlocked ? 'none' : 'auto',
        transition: 'opacity 0.25s ease'
    };

    return (
        <div className="quadrant-master-panel">
            <div 
                className="panel-layout-frame" 
                style={{ 
                    gap: '16px',
                    opacity: !isPanelActive ? 0.35 : 1,
                    pointerEvents: !isPanelActive ? 'none' : 'auto',
                    transition: 'opacity 0.25s ease'
                }}
            >
                {/* ROW 1: PROGRAM */}
                <div className="atem-section-wrapper row-one">
                    <div className="atem-section-header-row">
                        <span className={`atem-section-title ${isPanelActive && selectedOut !== null ? 'router-label' : ''}`} style={{ opacity: !isUnlocked ? 0.45 : 1, transition: 'opacity 0.25s ease' }}>
                            {isPanelActive && selectedOut !== null ? `OUTPUT ${selectedOut + 1}` : 'PROGRAM'}
                        </span>
                        <div className="atem-bus-status">
                            <span className={`atem-bus-online-dot ${isPanelActive && bridgeStatus === 'linked' ? 'online' : 'offline'}`} />
                            <span className="atem-bus-ip">{LOCKED_ATEM_IP}</span>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '12px' }} title={isUnlocked ? "Lock Panel" : "Unlock Panel"}>
                                <input type="checkbox" className="toggle-switch-small" checked={isUnlocked} onChange={() => setIsUnlocked(!isUnlocked)} />
                            </label>
                        </div>
                    </div>
                    <div className="atem-section-box" style={activeLockStyle}>
                        <div className="atem-bus-grid ten-cols">
                            {inputSources.map((s) => (
                                <button
                                    key={`pgm-${s.id}`}
                                    className={`atem-btn-standard ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`}
                                    onClick={() => sendAtemCommand('SET_PGM', { input: s.id })}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="atem-bus-grid ten-cols">
                            {internalSources.map((s) => {
                                if (s.spacer) return <div key={s.id} className="atem-btn-spacer" />;
                                const isMuted = Boolean(s.isAuxOnly && selectedOut === null);
                                return (
                                    <button
                                        key={`pgm-int-${s.id}`}
                                        className={`atem-btn-standard aux-source-btn ${isMuted ? 'btn-muted' : ''} ${getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : ''}`}
                                        onClick={() => !isMuted && sendAtemCommand('SET_PGM', { input: s.id })}
                                        disabled={isMuted}
                                    >
                                        <span className="btn-number">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ROW 2: PREVIEW */}
                <div 
                    className="atem-section-wrapper row-two" 
                    style={{ 
                        opacity: (isPanelActive && selectedOut !== null) ? 0.35 : (!isUnlocked ? 0.45 : 1), 
                        pointerEvents: (selectedOut !== null || !isUnlocked) ? 'none' : 'auto',
                        transition: 'opacity 0.25s ease'
                    }}
                >
                    <div className="atem-section-header-row">
                        <span className="atem-section-title">PREVIEW</span>
                    </div>
                    <div className="atem-section-box">
                        <div className="atem-bus-grid ten-cols">
                            {inputSources.map((s) => (
                                <button
                                    key={`pvw-${s.id}`}
                                    className={`atem-btn-standard ${getIsActivePvw(s.id) ? 'tally-green' : ''}`}
                                    onClick={() => sendAtemCommand('SET_PVW', { input: s.id })}
                                >
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="atem-bus-grid ten-cols">
                            {internalSources.map((s) => {
                                if (s.spacer) return <div key={s.id} className="atem-btn-spacer" />;
                                const isMuted = Boolean(s.isAuxOnly);
                                return (
                                    <button
                                        key={`pvw-int-${s.id}`}
                                        className={`atem-btn-standard aux-source-btn ${isMuted ? 'btn-muted' : ''} ${getIsActivePvw(s.id) ? 'tally-green' : ''}`}
                                        onClick={() => !isMuted && sendAtemCommand('SET_PVW', { input: s.id })}
                                        disabled={isMuted}
                                    >
                                        <span className="btn-number">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ROW 3: LOWER CONTROL MODULES */}
                <div className="atem-flex-row row-three" style={activeLockStyle}>
                    <div className="atem-section-wrapper next-trans-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">NEXT TRANSITION</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid five-cols">
                                <div className="atem-btn-spacer" />
                                {[0, 1, 2, 3].map(usk => (
                                    <button 
                                        key={`usk-${usk}`} 
                                        className={`atem-btn-standard ${isPanelActive && uskOnAir[usk] ? 'tally-red' : ''}`} 
                                        onClick={() => sendAtemCommand('TOGGLE_USK_ONAIR', { usk })}
                                    >
                                        <span className="btn-number">ON AIR</span>
                                    </button>
                                ))}

                                {[1, 2, 4, 8, 16].map((bit, idx) => {
                                    const labels = ['BKGD', 'KEY 1', 'KEY 2', 'KEY 3', 'KEY 4'];
                                    const isLit = isPanelActive && transitionSelection !== null && (transitionSelection & bit);
                                    return (
                                        <button 
                                            key={`trans-${bit}`} 
                                            className={`atem-btn-standard ${isLit ? 'tally-yellow' : ''}`} 
                                            onClick={() => sendAtemCommand('TOGGLE_TRANS_SELECTION', { bit })}
                                        >
                                            <span className="btn-number">{labels[idx]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="atem-section-wrapper dsk-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">DSK 1</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid two-cols">
                                <button 
                                    className={`atem-btn-standard ${isPanelActive && dsk.tie ? 'tally-yellow' : ''}`} 
                                    onClick={() => sendAtemCommand('TOGGLE_DSK_TIE', { tie: !dsk.tie })}
                                >
                                    <span className="btn-number">TIE 1</span>
                                </button>
                                <DragRateInput 
                                    value={isPanelActive ? localDskRate : null} 
                                    disabled={!isPanelActive || !isUnlocked}
                                    onChange={setLocalDskRate} 
                                    onCommit={(val) => sendAtemCommand('SET_DSK_RATE', { rate: val })} 
                                    onDoubleClick={() => {
                                        setLocalDskRate(25);
                                        sendAtemCommand('SET_DSK_RATE', { rate: 25 });
                                    }}
                                />
                                <button 
                                    className={`atem-btn-standard ${isPanelActive && dsk.onAir ? 'tally-red' : ''}`} 
                                    onClick={() => sendAtemCommand('TOGGLE_DSK_ONAIR', { onAir: !dsk.onAir })}
                                >
                                    <span className="btn-number">ON AIR</span>
                                </button>
                                <button 
                                    className={`atem-btn-standard ${isPanelActive && dsk.inTransition ? 'tally-orange' : ''}`} 
                                    onClick={() => sendAtemCommand('EXECUTE_DSK_AUTO')}>
                                    <span className="btn-number">AUTO</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="atem-section-wrapper ftb-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">FTB</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid one-col">
                                <DragRateInput 
                                    value={isPanelActive ? localFtbRate : null} 
                                    disabled={!isPanelActive || !isUnlocked}
                                    onChange={setLocalFtbRate} 
                                    onCommit={(val) => sendAtemCommand('SET_FTB_RATE', { rate: val })} 
                                    onDoubleClick={() => {
                                        setLocalFtbRate(25);
                                        sendAtemCommand('SET_FTB_RATE', { rate: 25 });
                                    }}
                                />
                                <button 
                                    className={`atem-btn-standard ${isPanelActive && ftb.isFullyBlack ? 'tally-red' : (isPanelActive && ftb.inTransition ? 'tally-orange' : '')}`} 
                                    onClick={() => sendAtemCommand('EXECUTE_FTB')}
                                >
                                    <span className="btn-number">FTB</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 4: BOTTOM ROW */}
                <div className="atem-flex-row row-four" style={activeLockStyle}>
                    <div className="atem-section-wrapper outputs-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">OUTPUTS</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="atem-bus-grid six-cols">
                                {auxOutputsList.map((num, idx) => (
                                    <button 
                                        key={`out-${num}`} 
                                        className={`atem-btn-standard ${isPanelActive && selectedOut === idx ? 'out-active' : ''}`} 
                                        onClick={() => setSelectedOut(prev => prev === idx ? null : idx)}
                                    >
                                        <span className="btn-number">OUT {num}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="atem-section-wrapper transition-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">TRANSITION</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="atem-bus-grid three-cols">
                                <DragRateInput 
                                    value={isPanelActive ? localTransRate : null} 
                                    disabled={!isPanelActive || !isUnlocked}
                                    onChange={setLocalTransRate} 
                                    onCommit={(val) => sendAtemCommand('SET_TRANSITION_RATE', { rate: val })} 
                                    onDoubleClick={() => {
                                        setLocalTransRate(25);
                                        sendAtemCommand('SET_TRANSITION_RATE', { rate: 25 });
                                    }}
                                />
                                <button className="atem-btn-standard cut-btn" onClick={() => sendAtemCommand('CUT')}><span className="btn-number">CUT</span></button>
                                <button className={`atem-btn-standard auto-btn ${isPanelActive && inTransition ? 'trans-active' : ''}`} onClick={() => sendAtemCommand('AUTO')}><span className="btn-number">AUTO</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;