import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM COMPACT MACROS PANEL (v3.11)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;
const TOTAL_MACROS = 100;
const MACROS_PER_PAGE = 40;

const AtemMacrosCompact = ({ connectedDevice }) => {
    if (!connectedDevice || connectedDevice.ip !== LOCKED_ATEM_IP) {
        return (
            <div className="atem-bus-locked-container">
                <div className="atem-bus-lock-badge">HARDWARE LOCK ENFORCED</div>
                <div className="atem-bus-lock-desc">
                    ATEM Macros panel is restricted exclusively to <strong>{LOCKED_ATEM_IP}</strong>.
                </div>
            </div>
        );
    }

    const [currentPage, setCurrentPage] = useState(1); // Page 1: 1-40, Page 2: 41-80, Page 3: 81-100
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
                } catch (err) {
                    console.error('[AtemMacrosCompact] Parse Error:', err);
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
                try { wsRef.current.close(); } catch (e) {}
            }
        };
    }, []);

    const handlePanelWheel = (e) => {
        const now = Date.now();
        if (now - lastWheelTimeRef.current < 35) return;
        
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
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ action, ip: LOCKED_ATEM_IP, ...payload }));
            } catch (err) {
                console.warn('[AtemMacrosCompact] Dispatch failed.');
            }
        }
    };

    const runMacro = (index) => {
        if (index === null || index < 0) return;
        sendCommand('MACRO_RUN', { index });
    };

    const stopMacro = () => {
        sendCommand('MACRO_STOP');
    };

    const toggleLoop = () => {
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
        if (selectedMacroIndex !== null) {
            const name = getMacroName(selectedMacroIndex);
            if (!name || name.trim() === '') {
                stopMacro();
                setSelectedMacroIndex(null);
                return;
            }
            runMacro(selectedMacroIndex);
        }
    };

    // Calculate indices based on page (Page 1: 0-39, Page 2: 40-79, Page 3: 80-99)
    const startIndex = (currentPage - 1) * MACROS_PER_PAGE;
    const currentCount = currentPage === 3 ? 20 : MACROS_PER_PAGE; // Page 3 has 20 macros (81-100)
    const currentMacroIndices = Array.from({ length: currentCount }, (_, i) => startIndex + i);

    return (
        <div className="atem-macros-panel compact-layout" onWheel={handlePanelWheel}>
            <div className="macro-compact-header-row">
                <div className="macro-title-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="atem-section-title">MACROS</div>
                    <div className="macro-page-buttons" style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2, 3].map((pageNum) => (
                            <button
                                key={`macro-page-btn-${pageNum}`}
                                className={`macro-action-text-btn ${currentPage === pageNum ? 'active-orange' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                                data-description={`Switch to Macros Page ${pageNum} (${pageNum === 1 ? '1-40' : pageNum === 2 ? '41-80' : '81-100'})`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="macro-actions-group">
                    <button 
                        className={`macro-action-text-btn ${macroPlayer.loop ? 'active-orange' : ''}`}
                        onClick={toggleLoop}
                        data-description="Loop Macro"
                    >
                        LOOP
                    </button>

                    <button 
                        className={`macro-action-text-btn ${autoRun ? 'active-orange' : ''}`}
                        onClick={() => setAutoRun(prev => !prev)}
                        data-description={`AUTORUN MACRO: ${autoRun ? 'ON' : 'OFF'}`}
                    >
                        AUTORUN
                    </button>

                    <button 
                        className={`macro-action-text-btn ${selectedMacroIndex !== null ? 'active-green' : 'disabled'}`}
                        onClick={handlePlayClick}
                        data-description="Run Selected Macro"
                        disabled={selectedMacroIndex === null}
                    >
                        PLAY
                    </button>

                    <button 
                        className={`macro-action-text-btn ${macroPlayer.isRunning ? 'active-red' : 'disabled'}`}
                        onClick={stopMacro}
                        data-description="Stop Macro"
                        disabled={!macroPlayer.isRunning}
                    >
                        STOP
                    </button>
                </div>
            </div>

            <div className="macro-section-box">
                <div className="macro-matrix-grid-compact">
                    {currentMacroIndices.map((macroIdx) => {
                        const rawName = getMacroName(macroIdx);
                        const rawDesc = getMacroDescription(macroIdx);
                        const displayName = rawName ? rawName : '';
                        const displayNum = (macroIdx + 1).toString().padStart(2, '0');
                        const isSelected = selectedMacroIndex === macroIdx;
                        const isRunning = macroPlayer.isRunning && macroPlayer.macroIndex === macroIdx;

                        const isOverflowing = displayName.length > 18;
                        const hasNote = rawDesc && rawDesc.trim() !== '';
                        
                        const tooltipTitle = (isOverflowing || hasNote) ? displayName : undefined;
                        const tooltipNote = hasNote ? rawDesc : undefined;

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
    );
};

export default AtemMacrosCompact;