import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM MACROS PANEL (v2.55)
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
    
    // Live hardware state from bridge
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
                try { wsRef.current.close(); } catch(e) {}
            }
        };
    }, []);

    // Accelerated mouse wheel pagination across the entire macro quadrant
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

    // Scrub / slide pagination by holding mouse down across dots
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

        // Clicking an empty macro executes a stop command
        if (isEmpty) {
            stopMacro();
            setSelectedMacroIndex(null);
            return;
        }

        // Clicking the same macro a second time executes a stop command
        if (selectedMacroIndex === index) {
            stopMacro();
            setSelectedMacroIndex(null);
            return;
        }

        setSelectedMacroIndex(index);
        if (autoRun) {
            runMacro(index);
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

    const handleMacroMouseEnter = (e, macroIdx, name) => {
        const textEl = e.currentTarget.querySelector('.macro-slot-text');
        if (textEl && name && textEl.scrollWidth > textEl.clientWidth) {
            e.currentTarget.setAttribute('data-description', `Macro ${macroIdx + 1}: ${name}`);
        } else {
            e.currentTarget.removeAttribute('data-description');
        }
    };

    const startIndex = (currentPage - 1) * MACROS_PER_PAGE;
    const currentMacroIndices = Array.from({ length: MACROS_PER_PAGE }, (_, i) => startIndex + i);

    return (
        <div className="atem-macros-panel" onWheel={handlePanelWheel}>
            {/* Header Bar without divider line */}
            <div className="macro-header-bar">
                <div className="macro-header-title">MACROS</div>

                <div className="macro-actions-group">
                    {/* Auto-Run Icon (Matched to play button dimensions) */}
                    <button 
                        className={`macro-action-btn ${autoRun ? 'active-orange' : ''}`}
                        onClick={() => setAutoRun(prev => !prev)}
                        data-description={autoRun ? "Auto-Run: ON" : "Auto-Run: OFF"}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M4.5 6.8v10.4c0 .8.87 1.28 1.54.85l6.46-4.14V17.2c0 .8.87 1.28 1.54.85l6.46-4.14a1 1 0 0 0 0-1.72l-6.46-4.14a1 1 0 0 0-1.54.85v3.3L6.04 5.95A1 1 0 0 0 4.5 6.8z" fill="currentColor"/>
                        </svg>
                    </button>

                    {/* Loop icon */}
                    <button 
                        className={`macro-action-btn ${macroPlayer.loop ? 'active-orange' : ''}`}
                        onClick={toggleLoop}
                        data-description="Loop Macro"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M17 17H7a4 4 0 0 1-4-4v-1h2v1a2 2 0 0 0 2 2h10v-3l4 4-4 4v-3zm-10-10h10a4 4 0 0 1 4 4v1h-2v-1a2 2 0 0 0-2-2H7v3L3 7l4-4v3z"/>
                        </svg>
                    </button>

                    {/* Play button */}
                    <button 
                        className={`macro-action-btn play-btn ${selectedMacroIndex !== null ? 'ready-orange' : 'disabled'}`}
                        onClick={handlePlayClick}
                        data-description="Run Selected Macro"
                        disabled={selectedMacroIndex === null}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                        </svg>
                    </button>

                    {/* Stop button */}
                    <button 
                        className={`macro-action-btn stop-btn ${macroPlayer.isRunning ? 'active-orange' : ''}`}
                        onClick={stopMacro}
                        data-description="Stop Macro"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* 20-Button Matrix Grid (Column 1: 1-10; Column 2: 11-20) */}
            <div className="macro-matrix-grid">
                {currentMacroIndices.map((macroIdx) => {
                    const name = getMacroName(macroIdx);
                    const isSelected = selectedMacroIndex === macroIdx;
                    const isRunning = macroPlayer.isRunning && macroPlayer.macroIndex === macroIdx;

                    return (
                        <button
                            key={`macro-btn-${macroIdx}`}
                            className={`macro-slot-btn ${isSelected ? 'selected' : ''} ${isRunning ? 'running' : ''}`}
                            onClick={() => handleMacroClick(macroIdx)}
                            onMouseEnter={(e) => handleMacroMouseEnter(e, macroIdx, name)}
                            onMouseLeave={(e) => e.currentTarget.removeAttribute('data-description')}
                        >
                            <div className="macro-slot-content">
                                <span className="macro-slot-num">{macroIdx + 1}</span>
                                <span className="macro-slot-text">{name ? name.toUpperCase() : ''}</span>

                                {/* Mini Transport Controls on Macro Hover */}
                                {name && (
                                    <div className="macro-slot-actions">
                                        <div 
                                            className={`macro-mini-action-btn ${macroPlayer.loop ? 'active-orange' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); toggleLoop(); }}
                                            data-description="Loop"
                                        >
                                            <svg viewBox="0 0 24 24"><path d="M17 17H7a4 4 0 0 1-4-4v-1h2v1a2 2 0 0 0 2 2h10v-3l4 4-4 4v-3zm-10-10h10a4 4 0 0 1 4 4v1h-2v-1a2 2 0 0 0-2-2H7v3L3 7l4-4v3z"/></svg>
                                        </div>
                                        <div 
                                            className="macro-mini-action-btn"
                                            onClick={(e) => { e.stopPropagation(); runMacro(macroIdx); }}
                                            data-description="Run Macro"
                                        >
                                            <svg viewBox="0 0 24 24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>
                                        </div>
                                        <div 
                                            className={`macro-mini-action-btn ${isRunning ? 'active-orange' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); stopMacro(); }}
                                            data-description="Stop Macro"
                                        >
                                            <svg viewBox="0 0 24 24"><path d="M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"/></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Pagination Footer with Bold Navigation Arrows */}
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