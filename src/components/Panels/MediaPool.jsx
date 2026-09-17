import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - MEDIA POOL PANEL (v3.76)
// =========================================================================
// Features centered slot numbers, colored MP1/MP2 header labels matching tallies,
// concentric dual-tally nesting with the most recently routed player displayed
// as the smaller inner tally, and inset flat Material slot clearing.

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const MediaPool = ({ connectedDevice }) => {
    const isPanelActive = Boolean(connectedDevice && connectedDevice.ip === LOCKED_ATEM_IP);

    const [currentPage, setCurrentPage] = useState(1);
    const [atemStills, setAtemStills] = useState([]);
    const [atemClips, setAtemClips] = useState([]);
    const [mediaPlayers, setMediaPlayers] = useState([
        { sourceType: 1, stillIndex: 0, clipIndex: 0 },
        { sourceType: 1, stillIndex: 1, clipIndex: 0 }
    ]);
    
    const [selectedMp, setSelectedMp] = useState(null);
    const [lastAssignedMp, setLastAssignedMp] = useState(2);

    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const lastWheelTimeRef = useRef(0);

    useEffect(() => {
        const initWebSocket = () => {
            const wsUrl = 'ws://localhost:' + BRIDGE_PORT;
            try {
                wsRef.current = new WebSocket(wsUrl);

                wsRef.current.onopen = () => {
                    wsRef.current.send(JSON.stringify({ action: 'CONNECT', ip: LOCKED_ATEM_IP }));
                };

                wsRef.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.mediaPool) {
                            if (data.mediaPool.stills) setAtemStills(data.mediaPool.stills);
                            if (data.mediaPool.clips) setAtemClips(data.mediaPool.clips);
                        }

                        if (data.mediaPlayers && Array.isArray(data.mediaPlayers)) {
                            setMediaPlayers(data.mediaPlayers);
                        }
                    } catch (err) {}
                };

                wsRef.current.onclose = () => {
                    if (!reconnectTimerRef.current) {
                        reconnectTimerRef.current = setTimeout(() => {
                            reconnectTimerRef.current = null;
                            initWebSocket();
                        }, 2500);
                    }
                };
            } catch (e) {
                if (!reconnectTimerRef.current) {
                    reconnectTimerRef.current = setTimeout(() => {
                        reconnectTimerRef.current = null;
                        initWebSocket();
                    }, 2500);
                }
            }
        };

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
                setCurrentPage(2);
            } else if (e.deltaY < 0 || e.deltaX < 0) {
                setCurrentPage(1);
            }
        }
    };

    const handleSlotClick = (slotIndex, type) => {
        if (!isPanelActive || !selectedMp) return;

        setLastAssignedMp(selectedMp);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action: 'SET_MEDIA_PLAYER_SOURCE',
                ip: LOCKED_ATEM_IP,
                player: selectedMp - 1,
                sourceType: type === 'still' ? 1 : 2,
                stillIndex: type === 'still' ? slotIndex : 0,
                clipIndex: type === 'clip' ? slotIndex : 0
            }));
        }
    };

    const MediaSlot = ({ index, type, startIndex = 0 }) => {
        const slotNumber = startIndex + index + 1;
        const actualSlotIndex = startIndex + index;

        const atemData = isPanelActive ? (type === 'still' ? atemStills[actualSlotIndex] : atemClips[actualSlotIndex]) : null;
        const isUsed = atemData ? atemData.isUsed : false;
        const displayName = atemData ? atemData.name : '';

        const isMp1 = isPanelActive && mediaPlayers[0] && (type === 'still' ? (mediaPlayers[0].sourceType === 1 && mediaPlayers[0].stillIndex === actualSlotIndex) : (mediaPlayers[0].sourceType === 2 && mediaPlayers[0].clipIndex === actualSlotIndex));
        const isMp2 = isPanelActive && mediaPlayers[1] && (type === 'still' ? (mediaPlayers[1].sourceType === 1 && mediaPlayers[1].stillIndex === actualSlotIndex) : (mediaPlayers[1].sourceType === 2 && mediaPlayers[1].clipIndex === actualSlotIndex));

        const hasBoth = isMp1 && isMp2;
        let outerTallyClass = '';
        let innerTallyClass = '';

        if (hasBoth) {
            if (lastAssignedMp === 1) {
                outerTallyClass = 'mp-tally-red';
                innerTallyClass = 'mp-inner-green';
            } else {
                outerTallyClass = 'mp-tally-green';
                innerTallyClass = 'mp-inner-red';
            }
        } else if (isMp1) {
            outerTallyClass = 'mp-tally-green';
        } else if (isMp2) {
            outerTallyClass = 'mp-tally-red';
        }

        return (
            <div 
                className={'mp-slot ' + outerTallyClass}
                onClick={() => handleSlotClick(actualSlotIndex, type)}
                data-description={isPanelActive && (isUsed || displayName) ? (displayName || ('Slot ' + slotNumber)) : undefined}
            >
                {hasBoth && innerTallyClass && (
                    <div className={'mp-inner-tally ' + innerTallyClass} />
                )}

                {isPanelActive && type === 'still' && isUsed && (
                    <button 
                        className="mp-clear-btn" 
                        title="Clear slot from hardware" 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isPanelActive && wsRef.current) {
                                wsRef.current.send(JSON.stringify({ action: 'CLEAR_STILL', ip: LOCKED_ATEM_IP, index: actualSlotIndex }));
                            }
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="9" height="9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}

                <div className="mp-thumb-container">
                    <div className="mp-empty-circle" style={{ borderColor: isUsed ? 'var(--orange-hl)' : 'var(--atem-border)', color: isUsed ? 'var(--text)' : 'var(--muted)' }}>
                        {slotNumber}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="quadrant-master-panel" onWheel={handlePanelWheel}>
            {currentPage === 1 ? (
                /* PAGE 1: STILLS 1-16 (Strict 4x4 Grid in 424px Frame) */
                <div 
                    className="panel-layout-frame"
                    style={{
                        opacity: isPanelActive ? 1 : 0.35,
                        pointerEvents: isPanelActive ? 'auto' : 'none',
                        transition: 'opacity 0.25s ease'
                    }}
                >
                    <div className="macro-compact-header-row">
                        <div className="macro-title-group">
                            <span className="atem-section-title">STILLS</span>
                            <div className="macro-page-buttons">
                                {[1, 2].map((pageNum) => (
                                    <button
                                        key={'mp-page-btn-' + pageNum}
                                        className={'macro-action-text-btn ' + (isPanelActive && currentPage === pageNum ? 'active-orange' : '')}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="macro-actions-group">
                            <button 
                                className={'macro-action-text-btn mp1-header-btn ' + (isPanelActive && selectedMp === 1 ? 'active' : '')}
                                onClick={() => setSelectedMp(prev => prev === 1 ? null : 1)}
                            >
                                MP1
                            </button>
                            <button 
                                className={'macro-action-text-btn mp2-header-btn ' + (isPanelActive && selectedMp === 2 ? 'active' : '')}
                                onClick={() => setSelectedMp(prev => prev === 2 ? null : 2)}
                            >
                                MP2
                            </button>
                        </div>
                    </div>

                    <div className="macro-section-box">
                        <div className="mp-grid">
                            {Array.from({ length: 16 }).map((_, idx) => (
                                <MediaSlot key={'still-' + idx} index={idx} type="still" startIndex={0} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* PAGE 2: STILLS 17-20 in Row 1, CLIPS 1-4 in Row 4 (424px Frame with space-between) */
                <div 
                    className="panel-layout-frame" 
                    style={{ 
                        justifyContent: 'space-between',
                        opacity: isPanelActive ? 1 : 0.35,
                        pointerEvents: isPanelActive ? 'auto' : 'none',
                        transition: 'opacity 0.25s ease'
                    }}
                >
                    {/* SECTION 1: STILLS 17-20 (ROW 1 OF 4x4 GRID) */}
                    <div>
                        <div className="macro-compact-header-row">
                            <div className="macro-title-group">
                                <span className="atem-section-title">STILLS</span>
                                <div className="macro-page-buttons">
                                    {[1, 2].map((pageNum) => (
                                        <button
                                            key={'mp-page-btn-p2-' + pageNum}
                                            className={'macro-action-text-btn ' + (isPanelActive && currentPage === pageNum ? 'active-orange' : '')}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="macro-actions-group">
                                <button 
                                    className={'macro-action-text-btn mp1-header-btn ' + (isPanelActive && selectedMp === 1 ? 'active' : '')}
                                    onClick={() => setSelectedMp(prev => prev === 1 ? null : 1)}
                                >
                                    MP1
                                </button>
                                <button 
                                    className={'macro-action-text-btn mp2-header-btn ' + (isPanelActive && selectedMp === 2 ? 'active' : '')}
                                    onClick={() => setSelectedMp(prev => prev === 2 ? null : 2)}
                                >
                                    MP2
                                </button>
                            </div>
                        </div>

                        <div className="macro-section-box">
                            <div className="mp-grid-single-row">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <MediaSlot key={'still-p2-' + idx} index={idx} type="still" startIndex={16} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CLIPS 1-4 (ROW 4 OF 4x4 GRID) */}
                    <div>
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">CLIPS</span>
                        </div>

                        <div className="macro-section-box">
                            <div className="mp-grid-single-row">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <MediaSlot key={'clip-' + idx} index={idx} type="clip" startIndex={0} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaPool;