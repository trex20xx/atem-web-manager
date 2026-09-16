import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM COMPACT MACROS PANEL (v3.55)
// =========================================================================
// Hardware-Locked IP: 192.168.10.240
// Switcher Button Geometry: 36px Height | 4px Grid Gaps | 786px Width
// Lifecycle States:
//   - Disconnected: Muted Standby Mode (uniform 0.35 opacity, pointer-events: none,
//                   NO buttons lit, neutral unpressed slate)
//   - Connected: Active Mode (opacity: 1, pointer-events: auto, live macro names)

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;
const TOTAL_MACROS = 100;
const MACROS_PER_PAGE = 40;

const AtemMacrosCompact = ({ connectedDevice }) => {
    // Determine active connection state
    const isPanelActive = Boolean(connectedDevice && connectedDevice.ip === LOCKED_ATEM_IP);

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMacroIndex, setSelectedMacroIndex] = useState(null);
    const [autoRun, setAutoRun] = useState(true);
    
    const [macroPlayer, setMacroPlayer] = useState({ isRunning: false, isWaiting: false, loop: false, macroIndex: -1 });
    const [macroProperties, setMacroProperties] = useState([]);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');
    
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const lastWheelTimeRef = useRef(0);

    const initWebSocket = () => {
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
                    if (data.macroPlayer) setMacroPlayer(data.macroPlayer);
                    if (data.macroProperties && Array.isArray(data.macroProperties)) {
                        setMacroProperties(data.macroProperties);
                    }
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
                try { wsRef.current.close(); } catch (e) {}
            }
        };
    }, []);

    const handlePanelWheel = (e) => {
        if (!isPanelActive) return;

        const now = Date.now();
        if (now - lastWheelTimeRef.current < 45) return;
        
        if (Math.abs(e.deltaY) > 1 || Math.abs(e.deltaX) > 1) {
            lastWheelTimeRef.current = now;
            if (e.deltaY > 0 || e.deltaX > 0) {
                setCurrentPage(p => Math.min(3, p + 1));
            } else if (e.deltaY < 0 || e.deltaX < 0) {
                setCurrentPage(p => Math.max(1, p - 1));
            }
        }
    };

    const sendCommand = (action, payload = {}) => {
        if (!isPanelActive) return;

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ action, ip: LOCKED_ATEM_IP, ...payload }));
            } catch (err) {}
        }
    };

    const runMacro = (index) => {
        if (!isPanelActive || index === null || index < 0) return;
        sendCommand('MACRO_RUN', { index });
    };

    const stopMacro = () => {
        if (!isPanelActive) return;
        sendCommand('MACRO_STOP');
    };

    const toggleLoop = () => {
        if (!isPanelActive) return;
        sendCommand('MACRO_LOOP', { loop: !macroPlayer.loop });
    };

    const getMacroName = (index) => {
        if (macroProperties && macroProperties[index] && macroProperties[index].name) {
            return macroProperties[index].name;
        }
        return '';
    };

    const getMacroDescription = (index) => {
        if (macroProperties && macroProperties[index] && macroProperties[index].description) {
            return macroProperties[index].description;
        }
        return '';
    };

    const handleMacroClick = (index) => {
        if (!isPanelActive) return;

        const name = getMacroName(index);
        const isEmpty = !name || name.trim() === '';

        if (isEmpty) {
            stopMacro();
            setSelectedMacroIndex(null);
            return;
        }

        setSelectedMacroIndex(index);

        if (autoRun) {
            const isCurrentlyRunning = macroPlayer.isRunning && (macroPlayer.macroIndex === index);
            if (isCurrentlyRunning) {
                stopMacro();
            } else {
                runMacro(index);
            }
        }
    };

    const handlePlayClick = () => {
        if (!isPanelActive || selectedMacroIndex === null) return;
        const name = getMacroName(selectedMacroIndex);
        if (!name || name.trim() === '') {
            stopMacro();
            setSelectedMacroIndex(null);
            return;
        }
        runMacro(selectedMacroIndex);
    };

    const startIndex = (currentPage - 1) * MACROS_PER_PAGE;
    const currentCount = currentPage === 3 ? 20 : MACROS_PER_PAGE;
    const currentMacroIndices = Array.from({ length: currentCount }, (_, i) => startIndex + i);

    return (
        <div className="quadrant-master-panel" onWheel={handlePanelWheel}>
            <div 
                className="panel-layout-frame" 
                style={{ 
                    justifyContent: 'flex-start',
                    opacity: isPanelActive ? 1 : 0.35,
                    pointerEvents: isPanelActive ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease'
                }}
            >
                <div className="macro-compact-header-row">
                    <div className="macro-title-group">
                        <span className="atem-section-title">MACROS</span>
                        <div className="macro-page-buttons">
                            {[1, 2, 3].map((pageNum) => (
                                <button
                                    key={`macro-page-btn-${pageNum}`}
                                    className={`macro-action-text-btn ${isPanelActive && currentPage === pageNum ? 'active-orange' : ''}`}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="macro-actions-group">
                        <button 
                            className={`macro-action-text-btn ${isPanelActive && macroPlayer.loop ? 'active-orange' : ''}`}
                            onClick={toggleLoop}
                        >
                            LOOP
                        </button>

                        <button 
                            className={`macro-action-text-btn ${isPanelActive && autoRun ? 'active-orange' : ''}`}
                            onClick={() => setAutoRun(prev => !prev)}
                        >
                            AUTORUN
                        </button>

                        <button 
                            className={`macro-action-text-btn ${isPanelActive && selectedMacroIndex !== null ? 'active-green' : 'disabled'}`}
                            onClick={handlePlayClick}
                            disabled={!isPanelActive || selectedMacroIndex === null}
                        >
                            PLAY
                        </button>

                        <button 
                            className={`macro-action-text-btn ${isPanelActive && macroPlayer.isRunning ? 'active-red' : 'disabled'}`}
                            onClick={stopMacro}
                            disabled={!isPanelActive || !macroPlayer.isRunning}
                        >
                            STOP
                        </button>
                    </div>
                </div>

                <div className="macro-section-box">
                    <div className="macro-matrix-grid-compact">
                        {currentMacroIndices.map((macroIdx) => {
                            const rawName = isPanelActive ? getMacroName(macroIdx) : '';
                            const rawDesc = isPanelActive ? getMacroDescription(macroIdx) : '';
                            const displayName = rawName ? rawName : '';
                            const displayNum = (macroIdx + 1).toString().padStart(2, '0');
                            const isSelected = isPanelActive && selectedMacroIndex === macroIdx;
                            const isRunning = isPanelActive && macroPlayer.isRunning && macroPlayer.macroIndex === macroIdx;

                            const isOverflowing = displayName.length > 18;
                            const hasNote = rawDesc && rawDesc.trim() !== '';
                            
                            const tooltipTitle = isPanelActive && (isOverflowing || hasNote) ? displayName : undefined;
                            const tooltipNote = isPanelActive && hasNote ? rawDesc : undefined;

                            return (
                                <button
                                    key={`macro-compact-btn-${macroIdx}`}
                                    className={`macro-compact-btn ${isSelected ? 'selected' : ''} ${isRunning ? 'running' : ''}`}
                                    onClick={() => handleMacroClick(macroIdx)}
                                    data-description={tooltipTitle}
                                    data-note={tooltipNote}
                                >
                                    <div className="macro-compact-content">
                                        <span className="macro-compact-num">{displayNum}</span>
                                        <span className="macro-compact-text">{displayName}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtemMacrosCompact;