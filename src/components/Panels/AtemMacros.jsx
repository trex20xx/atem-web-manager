import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM MACROS PANEL (v3.07)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;
const MACROS_PER_PAGE = 20;
const TOTAL_PAGES = 5;

const AtemMacros = ({ connectedDevice }) => {
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

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMacroIndex, setSelectedMacroIndex] = useState(null);
    const [autoRun, setAutoRun] = useState(true);
    const [isDraggingDots, setIsDraggingDots] = useState(false);
    
    const [macroPlayer, setMacroPlayer] = useState({ isRunning: false, isWaiting: false, loop: false, macroIndex: -1 });
    const [macroProperties, setMacroProperties] = useState([]);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');
    
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const dotsContainerRef = useRef(null);
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
                    console.error('[AtemMacros] Parse Error:', err);
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
                setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1));
            } else if (e.deltaY < 0 || e.deltaX < 0) {
                setCurrentPage(p => Math.max(1, p - 1));
            }
        }
    };

    const updatePageFromClientX = (clientX) => {
        if (!dotsContainerRef.current) return;
        const rect = dotsContainerRef.current.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const progress = Math.max(0, Math.min(1, relativeX / rect.width));
        const targetPage = Math.min(TOTAL_PAGES, Math.max(1, Math.ceil(progress * TOTAL_PAGES)));
        setCurrentPage(targetPage);
    };

    const handleDotsMouseDown = (e) => {
        setIsDraggingDots(true);
        updatePageFromClientX(e.clientX);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingDots) {
                updatePageFromClientX(e.clientX);
            }
        };
        const handleMouseUp = () => {
            if (isDraggingDots) {
                setIsDraggingDots(false);
            }
        };

        if (isDraggingDots) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingDots]);

    const sendCommand = (action, payload = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({ action, ip: LOCKED_ATEM_IP, ...payload }));
            } catch (err) {
                console.warn('[AtemMacros] Dispatch failed.');
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

    const startIndex = (currentPage - 1) * MACROS_PER_PAGE;
    const currentMacroIndices = Array.from({ length: MACROS_PER_PAGE }, (_, i) => startIndex + i);

    return (
        <div className="atem-macros-panel" onWheel={handlePanelWheel}>
            <div className="macro-header-bar">
                <div className="macro-header-title">MACROS</div>

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

            <div className="macro-matrix-grid">
                {currentMacroIndices.map((macroIdx) => {
                    const rawName = getMacroName(macroIdx);
                    const displayName = rawName ? rawName : '';
                    const displayNum = (macroIdx + 1).toString().padStart(2, '0');
                    const isSelected = selectedMacroIndex === macroIdx;
                    const isRunning = macroPlayer.isRunning && macroPlayer.macroIndex === macroIdx;

                    const isOverflowing = displayName.length > 18;
                    const tooltipTitle = isOverflowing ? displayName : undefined;

                    return (
                        <button
                            key={`macro-btn-${macroIdx}`}
                            className={`macro-slot-btn ${isSelected ? 'selected' : ''} ${isRunning ? 'running' : ''}`}
                            onClick={() => handleMacroClick(macroIdx)}
                            data-description={tooltipTitle}
                        >
                            <div className="macro-slot-content">
                                <span className="macro-slot-num">{displayNum}</span>
                                <span className="macro-slot-text">{displayName}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="macro-pagination-footer">
                <div className="macro-pagination-wrapper">
                    <button 
                        className="macro-page-nav-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        data-description={currentPage === 1 ? undefined : "Previous Page"}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M14.5 17.5L9 12l5.5-5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>

                    <div 
                        className="macro-page-dots-container"
                        ref={dotsContainerRef}
                        onMouseDown={handleDotsMouseDown}
                    >
                        {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={`page-dot-${pageNum}`}
                                className={`macro-page-dot ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setCurrentPage(pageNum); }}
                                data-description={`Page ${pageNum} (Macros ${(pageNum - 1) * 20 + 1}–${pageNum * 20})`}
                            />
                        ))}
                    </div>

                    <button 
                        className="macro-page-nav-btn"
                        onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
                        disabled={currentPage === TOTAL_PAGES}
                        data-description={currentPage === TOTAL_PAGES ? undefined : "Next Page"}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9.5 6.5L15 12l-5.5 5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtemMacros;