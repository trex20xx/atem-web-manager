import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - ATEM MACROS PANEL (v2.19.0)
// =========================================================================
// 100 Macro slots (5 pages x 20), Recall & Run logic, pagination dots.

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
    const [mode, setMode] = useState('run'); // 'run' | 'create'
    const [loopEnabled, setLoopEnabled] = useState(false);
    
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

    // Calculate current page slice (20 macros per page)
    const startIndex = (currentPage - 1) * MACROS_PER_PAGE;
    const currentMacroIndices = Array.from({ length: MACROS_PER_PAGE }, (_, i) => startIndex + i);

    const getMacroName = (index) => {
        if (macroProperties && macroProperties[index] && macroProperties[index].name) {
            return macroProperties[index].name;
        }
        return '';
    };

    const getStatusBarText = () => {
        if (macroPlayer.isRunning) {
            const runningName = getMacroName(macroPlayer.macroIndex) || `Macro ${macroPlayer.macroIndex + 1}`;
            return `Running: ${runningName}`;
        }
        if (selectedMacroIndex !== null) {
            const selectedName = getMacroName(selectedMacroIndex) || `Macro ${selectedMacroIndex + 1}`;
            if (!recallAndRun) {
                return `${selectedName} selected — Click Play to run`;
            }
            return `${selectedName} selected`;
        }
        return recallAndRun ? 'Click macro to run' : 'Click macro to select';
    };

    return (
        <div className="atem-macros-panel">
            {/* 1. Header with Mode Select */}
            <div className="macro-header-bar">
                <div className="macro-header-title">Macros</div>
                <div className="macro-mode-switch">
                    <button 
                        className={`macro-mode-btn ${mode === 'create' ? 'active' : ''}`}
                        onClick={() => setMode('create')}
                    >
                        Create
                    </button>
                    <button 
                        className={`macro-mode-btn ${mode === 'run' ? 'active' : ''}`}
                        onClick={() => setMode('run')}
                    >
                        Run
                    </button>
                </div>
            </div>

            {/* 2. Control Toolbar */}
            <div className="macro-toolbar">
                <div 
                    className="macro-toggle-group"
                    onClick={() => setRecallAndRun(prev => !prev)}
                    title="When enabled, clicking a macro executes it immediately"
                >
                    <div className={`macro-toggle-circle ${recallAndRun ? 'active' : ''}`} />
                    <span className="macro-toggle-label">Recall and Run</span>
                </div>

                <div className="macro-actions-group">
                    {/* Loop Toggle */}
                    <button 
                        className={`macro-action-btn ${loopEnabled ? 'active' : ''}`}
                        onClick={() => setLoopEnabled(prev => !prev)}
                        title="Loop Macro"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                        </svg>
                    </button>

                    {/* Play / Run Button */}
                    <button 
                        className={`macro-action-btn play-btn ${selectedMacroIndex !== null ? 'ready' : 'disabled'}`}
                        onClick={handlePlayClick}
                        title="Run Selected Macro"
                        disabled={selectedMacroIndex === null}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>

                    {/* Stop Button */}
                    <button 
                        className={`macro-action-btn stop-btn ${macroPlayer.isRunning ? 'active' : ''}`}
                        onClick={stopMacro}
                        title="Stop Macro"
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M6 6h12v12H6z"/>
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
                            <span className="macro-slot-text">
                                {name ? name : ''}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 4. Macro Status Display */}
            <div className="macro-status-bar">
                <span className="macro-status-text">{getStatusBarText()}</span>
            </div>

            {/* 5. Pagination Controls with Indicator Dots */}
            <div className="macro-pagination-footer">
                <button 
                    className="macro-page-nav-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Previous Page"
                >
                    &lt;
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
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default AtemMacros;