import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v3.90)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const formatFrames = (frames) => {
    if (frames === null || frames === undefined) return '';
    const validFrames = parseInt(frames, 10) || 0;
    const s = Math.floor(validFrames / 25);
    const f = validFrames % 25;
    return s + ':' + f.toString().padStart(2, '0');
};

const DragRateInput = ({ value, onChange, onCommit, title, disabled, onReset }) => {
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const currentValRef = useRef(value);
    const lastClickTimeRef = useRef(0);

    useEffect(() => {
        currentValRef.current = value;
    }, [value]);

    const handleMouseDown = (e) => {
        if (disabled || value == null) return;
        e.preventDefault();
        e.stopPropagation();

        if (e.button === 1) {
            if (onReset) onReset();
            return;
        }
        if (e.button !== 0) return;

        const now = Date.now();
        if (now - lastClickTimeRef.current < 350) {
            if (onReset) onReset();
            lastClickTimeRef.current = 0;
            return;
        }
        lastClickTimeRef.current = now;

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

            if (hasMoved && onCommit && currentValRef.current != null) {
                onCommit(currentValRef.current);
            }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div 
            className="rate-box-button" 
            title={title + " (Drag up/down, Double-Click/Middle-Click to reset)"} 
            onMouseDown={disabled || value == null ? undefined : handleMouseDown}
            style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: disabled ? 'default' : 'ns-resize' }}
        >
            <span className="rate-display-value" style={{ pointerEvents: 'none' }}>
                {value != null && !disabled ? formatFrames(value) : ''}
            </span>
        </div>
    );
};

const AtemConstellationBus = ({ connectedDevice, enableTBar }) => {
    const isPanelActive = Boolean(connectedDevice && connectedDevice.ip === LOCKED_ATEM_IP);

    const [isUnlocked, setIsUnlocked] = useState(true);
    const [pgmInput, setPgmInput] = useState(null);
    const [pvwInput, setPvwInput] = useState(null);
    const [inTransition, setInTransition] = useState(false);
    const [activityFlash, setActivityFlash] = useState(false);

    const [transitionRate, setTransitionRate] = useState(null);
    const [transitionSelection, setTransitionSelection] = useState(1);
    const [uskOnAir, setUskOnAir] = useState([false, false, false, false]);

    const [dsk, setDsk] = useState({ onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: null });
    const [ftb, setFtb] = useState({ inTransition: false, isFullyBlack: false, rate: null });

    const [selectedOut, setSelectedOut] = useState(null);
    const [auxSources, setAuxSources] = useState([1, 2, 3, 4, 5, 6]);
    
    // T-Bar visual state
    const [tbarVal, setTbarVal] = useState(0); 
    const [tbarStartEnd, setTbarStartEnd] = useState('top'); 

    const flashTimerRef = useRef(null);
    const wsRef = useRef(null);

    const dispatchSysLog = (msg) => {
        window.dispatchEvent(new CustomEvent('atem:system-log', { detail: msg }));
    };

    const triggerActivityFlash = () => {
        if (!isPanelActive) return;
        setActivityFlash(true);
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setActivityFlash(false), 120);
    };

    useEffect(() => {
        const wsUrl = 'ws://localhost:' + BRIDGE_PORT;
        try {
            wsRef.current = new WebSocket(wsUrl);
            wsRef.current.onopen = () => {
                wsRef.current.send(JSON.stringify({ action: 'GET_STATE', ip: LOCKED_ATEM_IP }));
            };
            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.pgm !== undefined || data.pvw !== undefined) {
                        triggerActivityFlash();
                    }

                    if (data.pgm !== undefined) setPgmInput(Number(data.pgm));
                    if (data.pvw !== undefined) setPvwInput(Number(data.pvw));
                    
                    if (data.inTransition !== undefined) setInTransition(Boolean(data.inTransition));
                    if (data.transitionPosition !== undefined) {
                        const rawPos = Number(data.transitionPosition);
                        if (rawPos === 0 && inTransition) {
                            // Hardware reached end of transition
                            setTbarVal(0);
                            setTbarStartEnd(tbarStartEnd === 'top' ? 'bottom' : 'top');
                        } else {
                            const atemPos = rawPos / 100;
                            setTbarVal(tbarStartEnd === 'top' ? atemPos : 100 - atemPos);
                        }
                    }

                    if (data.transitionRate !== undefined) setTransitionRate(Number(data.transitionRate));
                    if (data.transitionSelection !== undefined) setTransitionSelection(Number(data.transitionSelection));
                    if (data.uskOnAir) setUskOnAir(data.uskOnAir);
                    
                    if (data.dsk) setDsk(prev => ({ ...prev, ...data.dsk }));
                    if (data.ftb) setFtb(prev => ({ ...prev, ...data.ftb }));
                    if (data.auxSources) setAuxSources(data.auxSources);

                } catch (err) {}
            };
        } catch (e) {}

        return () => {
            if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [isPanelActive]); // Restart socket if connection status changes to fetch state cleanly

    const sendCommand = (action, payload = {}) => {
        if (!isPanelActive || !isUnlocked) return;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            triggerActivityFlash();
            wsRef.current.send(JSON.stringify({ action, ip: LOCKED_ATEM_IP, ...payload }));
        }
    };

    const handleInputClick = (type, id) => {
        if (selectedOut !== null && type === 'PGM') {
            sendCommand('SET_AUX', { aux: selectedOut, source: id });
            return;
        }
        sendCommand(type === 'PGM' ? 'SET_PGM' : 'SET_PVW', { input: id });
    };

    const handleTbarChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setTbarVal(val);
        let atemPos = tbarStartEnd === 'top' ? val : 100 - val;
        sendCommand('SET_TRANS_POSITION', { position: atemPos * 100 });
    };

    const handleTransSelection = (bit) => {
        const next = transitionSelection ^ bit;
        sendCommand('TOGGLE_TRANS_SELECTION', { bit: next || 1 });
    };

    const inputSources = [
        { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }, 
        { id: 6, label: '6' }, { id: 7, label: '7' }, { id: 8, label: '8' }, { id: 9, label: '9' }, { id: 10, label: '10' }
    ];

    const internalSources = [
        { id: 0, label: 'BLK' }, { id: 1000, label: 'BARS' }, { id: 2001, label: 'COL 1' }, { id: 2002, label: 'COL 2' },
        { id: 3010, label: 'MP1' }, { id: 3020, label: 'MP2' }, { id: 'spacer-1', spacer: true }, { id: 'spacer-2', spacer: true },
        { id: 10011, label: 'PVW', isAuxOnly: true }, { id: 10010, label: 'PGM', isAuxOnly: true }
    ];

    const getIsActivePgm = (sourceId) => selectedOut !== null ? (auxSources[selectedOut] === sourceId) : (pgmInput === sourceId);
    const getIsActivePvw = (sourceId) => selectedOut !== null ? false : (pvwInput === sourceId);

    const activeLockStyle = { opacity: !isUnlocked ? 0.45 : 1, pointerEvents: !isUnlocked ? 'none' : 'auto', transition: 'opacity 0.25s ease' };
    const mutedSectionStyle = { opacity: (isPanelActive && selectedOut !== null) ? 0.35 : (!isUnlocked ? 0.45 : 1), pointerEvents: (selectedOut !== null || !isUnlocked) ? 'none' : 'auto', transition: 'opacity 0.25s ease' };

    let lcdFillPercent = tbarVal;
    let isFillFromBottom = tbarStartEnd === 'bottom';

    return (
        <div className="quadrant-master-panel">
            <div className="panel-layout-frame" style={{ gap: '16px', opacity: !isPanelActive ? 0.35 : 1, pointerEvents: !isPanelActive ? 'none' : 'auto', transition: 'opacity 0.25s ease' }}>
                
                {/* ROW 1: PROGRAM */}
                <div className="atem-section-wrapper row-one">
                    <div className="atem-section-header-row">
                        <span className={'atem-section-title ' + (isPanelActive && selectedOut !== null ? 'router-label' : '')} style={{ opacity: !isUnlocked ? 0.45 : 1 }}>
                            {isPanelActive && selectedOut !== null ? ('OUTPUT ' + (selectedOut + 1)) : 'PROGRAM'}
                        </span>
                        <div className="atem-bus-status">
                            <span className={'atem-bus-online-dot ' + (isPanelActive ? 'online' : 'offline') + (isPanelActive && activityFlash ? ' active-flash' : '')} style={{ filter: !isPanelActive ? 'grayscale(1)' : 'none' }} />
                            <span className="atem-bus-ip" style={{ filter: !isPanelActive ? 'grayscale(1)' : 'none' }}>{LOCKED_ATEM_IP}</span>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginLeft: '12px' }} title={isUnlocked ? 'Lock Panel' : 'Unlock Panel'}>
                                <input type="checkbox" className="toggle-switch-small" checked={isUnlocked} onChange={() => setIsUnlocked(!isUnlocked)} style={{ filter: !isPanelActive ? 'grayscale(1) opacity(0.5)' : 'none' }} />
                            </label>
                        </div>
                    </div>
                    <div className="atem-section-box" style={activeLockStyle}>
                        <div className="atem-bus-grid ten-cols">
                            {inputSources.map((s) => (
                                <button key={'pgm-' + s.id} className={'atem-btn-standard ' + (getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : '')} onClick={() => handleInputClick('PGM', s.id)}>
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="atem-bus-grid ten-cols">
                            {internalSources.map((s) => {
                                if (s.spacer) return <div key={s.id} className="atem-btn-spacer" />;
                                const isMuted = Boolean(s.isAuxOnly && selectedOut === null);
                                return (
                                    <button key={'pgm-int-' + s.id} className={'atem-btn-standard ' + (isMuted ? 'btn-muted ' : '') + (getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : '')} onClick={() => !isMuted && handleInputClick('PGM', s.id)} disabled={isMuted}>
                                        <span className="btn-number">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ROW 2: PREVIEW */}
                <div className="atem-section-wrapper row-two" style={mutedSectionStyle}>
                    <div className="atem-section-header-row">
                        <span className="atem-section-title">PREVIEW</span>
                    </div>
                    <div className="atem-section-box">
                        <div className="atem-bus-grid ten-cols">
                            {inputSources.map((s) => (
                                <button key={'pvw-' + s.id} className={'atem-btn-standard ' + (getIsActivePvw(s.id) ? 'tally-green' : '')} onClick={() => handleInputClick('PVW', s.id)}>
                                    <span className="btn-number">{s.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="atem-bus-grid ten-cols">
                            {internalSources.map((s) => {
                                if (s.spacer) return <div key={s.id} className="atem-btn-spacer" />;
                                const isMuted = Boolean(s.isAuxOnly);
                                return (
                                    <button key={'pvw-int-' + s.id} className={'atem-btn-standard ' + (isMuted ? 'btn-muted ' : '') + (getIsActivePvw(s.id) ? 'tally-green' : '')} onClick={() => !isMuted && handleInputClick('PVW', s.id)} disabled={isMuted}>
                                        <span className="btn-number">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ROW 3: LOWER CONTROL MODULES & T-BAR */}
                <div className="atem-flex-row row-three" style={mutedSectionStyle}>
                    <div className="atem-section-wrapper next-trans-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">NEXT TRANSITION</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid five-cols">
                                <div className="atem-btn-spacer" />
                                {[0, 1, 2, 3].map(usk => (
                                    <button key={'usk-' + usk} className={'atem-btn-standard ' + (isPanelActive && uskOnAir[usk] ? 'tally-red' : '')} onClick={() => sendCommand('TOGGLE_USK_ONAIR', { usk })}>
                                        <span className="btn-number">ON AIR</span>
                                    </button>
                                ))}

                                {[1, 2, 4, 8, 16].map((bit, idx) => {
                                    const labels = ['BKGD', 'KEY 1', 'KEY 2', 'KEY 3', 'KEY 4'];
                                    const isLit = isPanelActive && transitionSelection !== null && (transitionSelection & bit);
                                    return (
                                        <button key={'trans-' + bit} className={'atem-btn-standard ' + (isLit ? 'tally-yellow' : '')} onClick={() => handleTransSelection(bit)}>
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
                                <button className={'atem-btn-standard ' + (isPanelActive && dsk.tie ? 'tally-yellow' : '')} onClick={() => sendCommand('TOGGLE_DSK_TIE')}>
                                    <span className="btn-number">TIE</span>
                                </button>
                                <DragRateInput 
                                    value={isPanelActive ? dsk.rate : null} 
                                    disabled={!isPanelActive || !isUnlocked}
                                    onChange={(val) => setDsk(p => ({ ...p, rate: val }))} 
                                    onCommit={(val) => sendCommand('SET_DSK_RATE', { rate: val })} 
                                    onReset={() => { sendCommand('SET_DSK_RATE', { rate: 25 }); dispatchSysLog('DSK 1 Rate reset to 25 frames'); }}
                                />
                                <button className={'atem-btn-standard ' + (isPanelActive && dsk.onAir ? 'tally-red' : '')} onClick={() => sendCommand('TOGGLE_DSK_ONAIR')}>
                                    <span className="btn-number">ON AIR</span>
                                </button>
                                <button className={'atem-btn-standard ' + (isPanelActive && dsk.inTransition ? 'tally-orange' : '')} onClick={() => sendCommand('EXECUTE_DSK_AUTO')}>
                                    <span className="btn-number">AUTO</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Column 9: T-BAR (Absolute Stretched Overlap) */}
                    {enableTBar && (
                        <div className="atem-section-wrapper tbar-col-slot">
                            <div className="atem-section-box tbar-absolute-box">
                                <div className="tbar-track-layout">
                                    <div className="tbar-lcd-meter">
                                        <div className="tbar-lcd-active-trail" style={{ 
                                            top: !isFillFromBottom ? 0 : 'auto', 
                                            bottom: isFillFromBottom ? 0 : 'auto', 
                                            height: `${lcdFillPercent}%` 
                                        }} />
                                    </div>
                                    <div className="tbar-fader-axis">
                                        <input 
                                            type="range" className="tbar-range-fader" min="0" max="100" 
                                            value={tbarVal} 
                                            onChange={handleTbarChange}
                                            onMouseDown={(e) => { const p = e.target.closest('.panel'); if (p) p.draggable = false; }}
                                            onMouseUp={(e) => { const p = e.target.closest('.panel'); if (p) p.draggable = true; }}
                                            disabled={!isPanelActive || !isUnlocked}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Column 10: FTB */}
                    <div className="atem-section-wrapper ftb-col" style={{ marginLeft: enableTBar ? '4px' : 'auto' }}>
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">FTB</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid one-col">
                                <DragRateInput 
                                    value={isPanelActive ? ftb.rate : null} 
                                    disabled={!isPanelActive || !isUnlocked}
                                    onChange={(val) => setFtb(p => ({ ...p, rate: val }))} 
                                    onCommit={(val) => sendCommand('SET_FTB_RATE', { rate: val })} 
                                    onReset={() => { sendCommand('SET_FTB_RATE', { rate: 25 }); dispatchSysLog('FTB Rate reset to 25 frames'); }}
                                />
                                <button className={'atem-btn-standard ' + (isPanelActive && ftb.isFullyBlack ? 'tally-red' : (isPanelActive && ftb.inTransition ? 'tally-orange' : ''))} onClick={() => sendCommand('EXECUTE_FTB')}>
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
                                        key={'out-' + num} 
                                        className={'atem-btn-standard ' + (isPanelActive && selectedOut === idx ? 'out-active' : '')} 
                                        onClick={() => {
                                            const nextOut = selectedOut === idx ? null : idx;
                                            setSelectedOut(nextOut);
                                        }}
                                    >
                                        <span className="btn-number">OUT {num}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="atem-section-wrapper transition-col" style={{ opacity: (isPanelActive && selectedOut !== null) ? 0.35 : 1, pointerEvents: (selectedOut !== null) ? 'none' : 'auto' }}>
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">TRANSITION</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="atem-bus-grid three-cols">
                                <DragRateInput 
                                    value={isPanelActive ? transitionRate : null} 
                                    disabled={!isPanelActive || !isUnlocked}
                                    onChange={(val) => setTransitionRate(val)} 
                                    onCommit={(val) => sendCommand('SET_TRANSITION_RATE', { rate: val })} 
                                    onReset={() => { sendCommand('SET_TRANSITION_RATE', { rate: 25 }); dispatchSysLog('Transition Rate reset to 25 frames'); }}
                                />
                                <button className="atem-btn-standard cut-btn" onClick={() => sendCommand('CUT')}><span className="btn-number">CUT</span></button>
                                <button className={'atem-btn-standard auto-btn ' + (isPanelActive && inTransition ? 'trans-active' : '')} onClick={() => sendCommand('AUTO')}><span className="btn-number">AUTO</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;