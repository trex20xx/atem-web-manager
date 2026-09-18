import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM 1 M/E CONSTELLATION HD BUS (v3.89)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const formatFrames = (frames) => {
    if (frames == null) return '';
    const validFrames = parseInt(frames, 10) || 0;
    const s = Math.floor(validFrames / 25);
    const f = validFrames % 25;
    return s + ':' + f.toString().padStart(2, '0');
};

const DragRateInput = ({ value, onChange, onCommit, disabled, onReset }) => {
    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const currentValRef = useRef(value);
    const lastClickTimeRef = useRef(0);

    useEffect(() => { currentValRef.current = value; }, [value]);

    const handleMouseDown = (e) => {
        if (disabled || value == null) return;
        e.preventDefault();
        e.stopPropagation();

        // Middle-click instant reset
        if (e.button === 1) {
            if (onReset) onReset();
            return;
        }
        if (e.button !== 0) return;

        // Double-click instant reset
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
            title="Drag up/down, Double-Click or Middle-Click to reset"
            onMouseDown={disabled || value == null ? undefined : handleMouseDown}
            style={{ cursor: disabled ? 'default' : 'ns-resize' }}
        >
            <span className="rate-display-value">
                {value != null && !disabled ? formatFrames(value) : ''}
            </span>
        </div>
    );
};

const AtemConstellationBus = ({ connectedDevice }) => {
    const isPanelActive = Boolean(connectedDevice && connectedDevice.ip === LOCKED_ATEM_IP);

    const [isUnlocked, setIsUnlocked] = useState(true);
    const [pgmInput, setPgmInput] = useState(1);
    const [pvwInput, setPvwInput] = useState(2);
    const [inTransition, setInTransition] = useState(false);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');
    const [activityFlash, setActivityFlash] = useState(false);

    const [transitionRate, setTransitionRate] = useState(25);
    const [transitionSelection, setTransitionSelection] = useState(1);
    const [uskOnAir, setUskOnAir] = useState([false, false, false, false]);

    const [dsk, setDsk] = useState({ onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: 25 });
    const [ftb, setFtb] = useState({ inTransition: false, isFullyBlack: false, rate: 25 });

    const [selectedOut, setSelectedOut] = useState(null);
    const [auxSources, setAuxSources] = useState([1, 2, 3, 4, 5, 6]);

    const flashTimerRef = useRef(null);
    const wsRef = useRef(null);

    const dispatchSysLog = (msg) => window.dispatchEvent(new CustomEvent('atem:system-log', { detail: msg }));

    const triggerActivityFlash = () => {
        if (!isPanelActive) return;
        setActivityFlash(true);
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setActivityFlash(false), 120);
    };

    useEffect(() => {
        wsRef.current = new WebSocket(`ws://localhost:${BRIDGE_PORT}`);
        wsRef.current.onopen = () => {
            setBridgeStatus('standby');
            wsRef.current.send(JSON.stringify({ action: 'CONNECT', ip: LOCKED_ATEM_IP }));
            wsRef.current.send(JSON.stringify({ action: 'GET_STATE', ip: LOCKED_ATEM_IP }));
        };
        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type !== 'STATE') return;
                
                triggerActivityFlash();
                setBridgeStatus(data.hardwareConnected ? 'linked' : 'standby');
                if (data.pgm !== undefined) setPgmInput(Number(data.pgm));
                if (data.pvw !== undefined) setPvwInput(Number(data.pvw));
                if (data.inTransition !== undefined) setInTransition(Boolean(data.inTransition));
                if (data.transitionRate !== undefined) setTransitionRate(Number(data.transitionRate));
                if (data.transitionSelection !== undefined) setTransitionSelection(Number(data.transitionSelection));
                if (data.uskOnAir) setUskOnAir(data.uskOnAir);
                if (data.dsk) setDsk(data.dsk);
                if (data.ftb) setFtb(data.ftb);
                if (data.auxSources && Array.isArray(data.auxSources)) setAuxSources(data.auxSources.map(Number));
            } catch (err) {}
        };
        return () => { if (wsRef.current) wsRef.current.close(); };
    }, []);

    const sendCommand = (action, payload = {}) => {
        if (!isPanelActive || !isUnlocked) return;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ action, ip: LOCKED_ATEM_IP, ...payload }));
        }
    };

    const inputSources = [ { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' }, { id: 5, label: '5' }, { id: 6, label: '6' }, { id: 7, label: '7' }, { id: 8, label: '8' }, { id: 9, label: '9' }, { id: 10, label: '10' } ];
    const internalSources = [ { id: 0, label: 'BLK' }, { id: 1000, label: 'BARS' }, { id: 2001, label: 'COL 1' }, { id: 2002, label: 'COL 2' }, { id: 3010, label: 'MP1' }, { id: 3020, label: 'MP2' }, { id: 'spacer-1', spacer: true }, { id: 'spacer-2', spacer: true }, { id: 10011, label: 'PVW', isAuxOnly: true }, { id: 10010, label: 'PGM', isAuxOnly: true } ];
    const auxOutputsList = [1, 2, 3, 4, 5, 6];

    const getIsActivePgm = (id) => selectedOut !== null ? (auxSources[selectedOut] === id) : (pgmInput === id);
    const getIsActivePvw = (id) => selectedOut !== null ? false : (pvwInput === id);

    const activeLockStyle = {
        opacity: !isUnlocked ? 0.45 : 1,
        pointerEvents: !isUnlocked ? 'none' : 'auto',
        transition: 'opacity 0.25s ease'
    };

    const mutedSectionStyle = {
        opacity: (isPanelActive && selectedOut !== null) ? 0.35 : (!isUnlocked ? 0.45 : 1), 
        pointerEvents: (selectedOut !== null || !isUnlocked) ? 'none' : 'auto',
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
                        <span className={'atem-section-title ' + (selectedOut !== null ? 'router-label' : '')}>
                            {selectedOut !== null ? `OUTPUT ${selectedOut + 1}` : 'PROGRAM'}
                        </span>
                        <div className="atem-bus-status">
                            <span 
                                className={'atem-bus-online-dot ' + (bridgeStatus === 'linked' ? 'online' : 'offline') + (isPanelActive && activityFlash ? ' active-flash' : '')} 
                                style={{ filter: !isPanelActive ? 'grayscale(1)' : 'none' }} 
                            />
                            <span className="atem-bus-ip" style={{ filter: !isPanelActive ? 'grayscale(1)' : 'none' }}>{LOCKED_ATEM_IP}</span>
                            <label style={{ display: 'flex', marginLeft: '12px', cursor: 'pointer' }} title={isUnlocked ? 'Lock Panel' : 'Unlock Panel'}>
                                <input 
                                    type="checkbox" 
                                    className="toggle-switch-small" 
                                    checked={isUnlocked} 
                                    onChange={() => {
                                        const next = !isUnlocked;
                                        setIsUnlocked(next);
                                        dispatchSysLog('Mixer Panel ' + (next ? 'UNLOCKED' : 'LOCKED'));
                                    }} 
                                    style={{ filter: !isPanelActive ? 'grayscale(1) opacity(0.5)' : 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                    <div className="atem-section-box" style={activeLockStyle}>
                        <div className="atem-bus-grid ten-cols">
                            {inputSources.map((s) => (
                                <button 
                                    key={'pgm-' + s.id} 
                                    className={'atem-btn-standard ' + (getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : '')} 
                                    onClick={() => sendCommand('SET_PGM', { input: s.id })}
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
                                        key={'pgm-int-' + s.id} 
                                        className={'atem-btn-standard ' + (isMuted ? 'btn-muted ' : '') + (getIsActivePgm(s.id) ? (selectedOut !== null ? 'tally-orange' : 'tally-red') : '')} 
                                        onClick={() => !isMuted && sendCommand('SET_PGM', { input: s.id })} 
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
                <div className="atem-section-wrapper row-two" style={mutedSectionStyle}>
                    <div className="atem-section-header-row">
                        <span className="atem-section-title">PREVIEW</span>
                    </div>
                    <div className="atem-section-box">
                        <div className="atem-bus-grid ten-cols">
                            {inputSources.map((s) => (
                                <button 
                                    key={'pvw-' + s.id} 
                                    className={'atem-btn-standard ' + (getIsActivePvw(s.id) ? 'tally-green' : '')} 
                                    onClick={() => sendCommand('SET_PVW', { input: s.id })}
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
                                        key={'pvw-int-' + s.id} 
                                        className={'atem-btn-standard ' + (isMuted ? 'btn-muted ' : '') + (getIsActivePvw(s.id) ? 'tally-green' : '')} 
                                        onClick={() => !isMuted && sendCommand('SET_PVW', { input: s.id })} 
                                        disabled={isMuted}
                                    >
                                        <span className="btn-number">{s.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ROW 3: LOWER CONTROL MODULES (NEXT TRANSITION, DSK 1, FTB) */}
                <div className="atem-flex-row row-three" style={mutedSectionStyle}>
                    {/* Next Transition (Cols 1-5, 396px) */}
                    <div className="atem-section-wrapper next-trans-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">NEXT TRANSITION</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid five-cols">
                                <div className="atem-btn-spacer" />
                                {[0, 1, 2, 3].map(usk => (
                                    <button 
                                        key={'usk-' + usk} 
                                        className={'atem-btn-standard ' + (uskOnAir[usk] ? 'tally-red' : '')} 
                                        onClick={() => sendCommand('TOGGLE_USK_ONAIR', { usk, state: !uskOnAir[usk] })}
                                    >
                                        <span className="btn-number">ON AIR</span>
                                    </button>
                                ))}
                                {[1, 2, 4, 8, 16].map((bit, idx) => {
                                    const labels = ['BKGD', 'KEY 1', 'KEY 2', 'KEY 3', 'KEY 4'];
                                    const isLit = (transitionSelection & bit) !== 0;
                                    return (
                                        <button 
                                            key={'trans-' + bit} 
                                            className={'atem-btn-standard ' + (isLit ? 'tally-yellow' : '')} 
                                            onClick={() => sendCommand('TOGGLE_TRANS_SELECTION', { bit })}
                                        >
                                            <span className="btn-number">{labels[idx]}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* DSK 1 (Cols 7-8, 162px, margin-left: 72px) */}
                    <div className="atem-section-wrapper dsk-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">DSK 1</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid two-cols">
                                <button 
                                    className={'atem-btn-standard ' + (dsk.tie ? 'tally-yellow' : '')} 
                                    onClick={() => sendCommand('TOGGLE_DSK_TIE', { tie: !dsk.tie })}
                                >
                                    <span className="btn-number">TIE</span>
                                </button>
                                <DragRateInput 
                                    value={dsk.rate} 
                                    onChange={r => setDsk(prev => ({ ...prev, rate: r }))} 
                                    onCommit={val => sendCommand('SET_DSK_RATE', { rate: val })} 
                                    onReset={() => sendCommand('SET_DSK_RATE', { rate: 25 })} 
                                    disabled={!isPanelActive || !isUnlocked}
                                />
                                <button 
                                    className={'atem-btn-standard ' + (dsk.onAir ? 'tally-red' : '')} 
                                    onClick={() => sendCommand('TOGGLE_DSK_ONAIR', { onAir: !dsk.onAir })}
                                >
                                    <span className="btn-number">ON AIR</span>
                                </button>
                                <button 
                                    className={'atem-btn-standard ' + (dsk.inTransition ? 'tally-orange' : '')} 
                                    onClick={() => sendCommand('EXECUTE_DSK_AUTO')}
                                >
                                    <span className="btn-number">AUTO</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FTB (Col 10, 84px, margin-left: auto) */}
                    <div className="atem-section-wrapper ftb-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">FTB</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="two-row-grid one-col">
                                <DragRateInput 
                                    value={ftb.rate} 
                                    onChange={r => setFtb(prev => ({ ...prev, rate: r }))} 
                                    onCommit={val => sendCommand('SET_FTB_RATE', { rate: val })} 
                                    onReset={() => sendCommand('SET_FTB_RATE', { rate: 25 })} 
                                    disabled={!isPanelActive || !isUnlocked}
                                />
                                <button 
                                    className={'atem-btn-standard ' + (ftb.isFullyBlack ? 'tally-red' : (ftb.inTransition ? 'tally-orange' : ''))} 
                                    onClick={() => sendCommand('EXECUTE_FTB')}
                                >
                                    <span className="btn-number">FTB</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 4: BOTTOM ROW (OUTPUTS & TRANSITION) */}
                <div className="atem-flex-row row-four" style={activeLockStyle}>
                    {/* Outputs (Cols 1-6, 474px) */}
                    <div className="atem-section-wrapper outputs-col">
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">OUTPUTS</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="atem-bus-grid six-cols">
                                {auxOutputsList.map((num, idx) => (
                                    <button 
                                        key={'out-' + num} 
                                        className={'atem-btn-standard ' + (selectedOut === idx ? 'out-active' : '')} 
                                        onClick={() => {
                                            const nextOut = selectedOut === idx ? null : idx;
                                            setSelectedOut(nextOut);
                                            dispatchSysLog('Aux Routing Mode: ' + (nextOut !== null ? ('OUT ' + (nextOut + 1)) : 'OFF'));
                                        }}
                                    >
                                        <span className="btn-number">OUT {num}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Transition (Cols 8-10, 240px: Rate, CUT, AUTO) */}
                    <div className="atem-section-wrapper transition-col" style={{ opacity: selectedOut !== null ? 0.35 : 1, pointerEvents: selectedOut !== null ? 'none' : 'auto' }}>
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">TRANSITION</span>
                        </div>
                        <div className="atem-section-box">
                            <div className="atem-bus-grid three-cols">
                                <DragRateInput 
                                    value={transitionRate} 
                                    onChange={r => setTransitionRate(r)} 
                                    onCommit={val => sendCommand('SET_TRANSITION_RATE', { rate: val })} 
                                    onReset={() => sendCommand('SET_TRANSITION_RATE', { rate: 25 })} 
                                    disabled={!isPanelActive || !isUnlocked}
                                />
                                <button className="atem-btn-standard cut-btn" onClick={() => sendCommand('CUT')}><span className="btn-number">CUT</span></button>
                                <button className={'atem-btn-standard auto-btn ' + (inTransition ? 'trans-active' : '')} onClick={() => sendCommand('AUTO')}><span className="btn-number">AUTO</span></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtemConstellationBus;