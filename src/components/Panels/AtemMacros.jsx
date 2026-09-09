import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM MACROS PANEL (v2.20.0)
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
    const [recallAndRun, setRecallAndRun] = useState(true);
    
    // Live hardware state from bridge
    const [macroPlayer, setMacroPlayer] = useState({ isRunning: false, isWaiting: false, loop: false, macroIndex: -1 });
    const [macroProperties, setMacroProperties] = useState([]);
    const [bridgeStatus, setBridgeStatus] = useState('connecting');
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);

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

    const handleMacroClick = (index) => {
        setSelectedMacroIndex(index);
        if (recallAndRun) {
            runMacro(index);
        }
    };

    const handlePlayClick = () => {
        if (selectedMacroIndex !== null) {
            runMacro(selectedMacroIndex);
        }
    };

    const startIndex = (currentPage - 1) * MACROS_PER_PAGE;
    const currentMacroIndices = Array.from({ length: MACROS_PER_PAGE }, (_, i) => startIndex + i);

    const getMacroName = (index) => {
        if (macroProperties && macroProperties[index] && macroProperties[index].name) {
            return macroProperties[index].name;
        }
        return '';
    };

    return (
        <div className="atem-macros-panel">
            {/* 1. Header */}
            <div className="macro-header-bar">
                <div className="macro-header-title">MACROS</div>
            </div>

            {/* 2. Control Toolbar */}
            <div className="macro-toolbar">
                <div 
                    className="macro-toggle-group"
                    onClick={() => setRecallAndRun(prev => !prev)}
                    title="When enabled, clicking a macro executes it immediately"
                >
                    <div className={`macro-toggle-circle ${recallAndRun ? 'active' : ''}`} />
                    <span className="macro-toggle-label">RECALL AND RUN</span>
                </div>

                <div className="macro-actions-group">
                    {/* Modern Flat Loop */}
                    <button 
                        className={`macro-action-btn ${macroPlayer.loop ? 'active-loop' : ''}`}
                        onClick={toggleLoop}
                        title="Loop Macro"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
                        </svg>
                    </button>

                    {/* Modern Flat Play */}
                    <button 
                        className={`macro-action-btn play-btn ${selectedMacroIndex !== null ? 'ready' : 'disabled'}`}
                        onClick={handlePlayClick}
                        title="Run Selected Macro"
                        disabled={selectedMacroIndex === null}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                        </svg>
                    </button>

                    {/* Modern Flat Stop */}
                    <button 
                        className={`macro-action-btn stop-btn ${macroPlayer.isRunning ? 'active' : ''}`}
                        onClick={stopMacro}
                        title="Stop Macro"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M8 6h8c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* 3. 20-Button Matrix Grid (2 Columns x 10 Rows) */}
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
                            title={`Macro ${macroIdx + 1}${name ? `: ${name}` : ''}`}
                        >
                            <div className="macro-slot-content">
                                <span className="macro-slot-num">{macroIdx + 1}</span>
                                <span className="macro-slot-text">{name}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 4. Centered Pagination Footer */}
            <div className="macro-pagination-footer">
                <div className="macro-pagination-wrapper">
                    <button 
                        className="macro-page-nav-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        title="Previous Page"
                    >
                        <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
                    </button>

                    <div className="macro-page-dots-container">
                        {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={`page-dot-${pageNum}`}
                                className={`macro-page-dot ${currentPage === pageNum ? 'active' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                                title={`Page ${pageNum} (Macros ${(pageNum - 1) * 20 + 1}–${pageNum * 20})`}
                            />
                        ))}
                    </div>

                    <button 
                        className="macro-page-nav-btn"
                        onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
                        disabled={currentPage === TOTAL_PAGES}
                        title="Next Page"
                    >
                        <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AtemMacros;