import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// =========================================================================
// ATEM WEB MANAGER - MEDIA POOL PANEL (v3.68)
// =========================================================================
// Hardware-Locked IP: 192.168.10.240
// Features persistent localStorage thumbnail caching (0ms reload on app launch),
// single-flight sequential downloading with SYNC button & click-to-fetch,
// drag-and-drop RGBA still uploading, and contextual dim/bright tally borders.

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const MediaPool = ({ connectedDevice }) => {
    // Determine active connection state
    const isPanelActive = Boolean(connectedDevice && connectedDevice.ip === LOCKED_ATEM_IP);

    const [currentPage, setCurrentPage] = useState(1);
    const [atemStills, setAtemStills] = useState([]);
    const [atemClips, setAtemClips] = useState([]);
    const [mediaPlayers, setMediaPlayers] = useState([
        { sourceType: 1, stillIndex: 0, clipIndex: 0 },
        { sourceType: 1, stillIndex: 1, clipIndex: 0 }
    ]);
    
    const [selectedMp, setSelectedMp] = useState(null);
    const [localPreviews, setLocalPreviews] = useState({});
    const [dragActive, setDragActive] = useState(null);
    const [uploadingSlot, setUploadingSlot] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // Persistent browser-side thumbnail cache
    const [cachedThumbnails, setCachedThumbnails] = useLocalStorage('atem_media_pool_thumbs', {});

    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const lastWheelTimeRef = useRef(0);

    // Single-flight download queue refs
    const atemStillsRef = useRef([]);
    const inFlightIdxRef = useRef(null);
    const pendingQueueRef = useRef([]);
    const watchdogTimerRef = useRef(null);

    const processDownloadQueue = useCallback(() => {
        if (!isPanelActive) return;
        if (inFlightIdxRef.current !== null || pendingQueueRef.current.length === 0) {
            if (pendingQueueRef.current.length === 0) {
                setIsSyncing(false);
            }
            return;
        }
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
        }

        setIsSyncing(true);
        const nextIdx = pendingQueueRef.current.shift();
        inFlightIdxRef.current = nextIdx;

        wsRef.current.send(JSON.stringify({ 
            action: 'GET_STILL', 
            ip: LOCKED_ATEM_IP, 
            index: nextIdx 
        }));

        // 8-second watchdog timeout fallback
        if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = setTimeout(() => {
            if (inFlightIdxRef.current === nextIdx) {
                inFlightIdxRef.current = null;
                processDownloadQueue();
            }
        }, 8000);
    }, [isPanelActive]);

    // Manual fetch trigger for a single slot or batch sync
    const triggerSlotFetch = useCallback((idx) => {
        if (!isPanelActive) return;
        if (!pendingQueueRef.current.includes(idx) && inFlightIdxRef.current !== idx) {
            pendingQueueRef.current.push(idx);
            processDownloadQueue();
        }
    }, [isPanelActive, processDownloadQueue]);

    const handleSyncAllStills = () => {
        if (!isPanelActive) return;
        atemStillsRef.current.forEach((still, idx) => {
            if (still.isUsed) {
                triggerSlotFetch(idx);
            }
        });
    };

    useEffect(() => {
        const initWebSocket = () => {
            const wsUrl = `ws://localhost:${BRIDGE_PORT}`;
            try {
                wsRef.current = new WebSocket(wsUrl);

                wsRef.current.onopen = () => {
                    wsRef.current.send(JSON.stringify({ action: 'CONNECT', ip: LOCKED_ATEM_IP }));
                };

                wsRef.current.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);

                        if (data.mediaPool) {
                            if (data.mediaPool.stills) {
                                setAtemStills(data.mediaPool.stills);
                                atemStillsRef.current = data.mediaPool.stills;

                                // Purge thumbnails from cache if the slot was emptied on hardware
                                data.mediaPool.stills.forEach((still, idx) => {
                                    if (!still.isUsed && cachedThumbnails[idx]) {
                                        setCachedThumbnails(prev => {
                                            const next = { ...prev };
                                            delete next[idx];
                                            return next;
                                        });
                                    }
                                });
                            }
                            if (data.mediaPool.clips) setAtemClips(data.mediaPool.clips);
                        }

                        if (data.mediaPlayers && Array.isArray(data.mediaPlayers)) {
                            setMediaPlayers(data.mediaPlayers);
                        }

                        // Received thumbnail BMP data
                        if (data.type === 'STILL_DATA' && data.data && data.index !== undefined) {
                            if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
                            const idx = data.index;
                            const atemStill = atemStillsRef.current[idx];
                            
                            const newRecord = {
                                src: data.data,
                                hash: atemStill ? atemStill.hash : '',
                                name: atemStill ? atemStill.name : ''
                            };

                            setCachedThumbnails(prev => ({ ...prev, [idx]: newRecord }));

                            if (inFlightIdxRef.current === idx) {
                                inFlightIdxRef.current = null;
                            }

                            // 250ms gap between still downloads to guarantee zero mixer interference
                            setTimeout(processDownloadQueue, 250);
                        }
                    } catch (err) {}
                };

                wsRef.current.onclose = () => {
                    if (inFlightIdxRef.current !== null) inFlightIdxRef.current = null;
                    setIsSyncing(false);
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
            if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                try { wsRef.current.close(); } catch (e) {}
            }
        };
    }, [processDownloadQueue, cachedThumbnails, setCachedThumbnails]);

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

    const handleDragOver = (e, dropId) => {
        if (!isPanelActive) return;
        e.preventDefault();
        setDragActive(dropId);
    };

    const handleDragLeave = () => {
        setDragActive(null);
    };

    const handleDrop = (e, index, type) => {
        if (!isPanelActive) return;
        e.preventDefault();
        setDragActive(null);

        if (type !== 'still') return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                
                setLocalPreviews(prev => ({
                    ...prev,
                    [`${type}-${index}`]: { src: dataUrl, name: file.name }
                }));

                const img = new Image();
                img.onload = () => {
                    setUploadingSlot(index);
                    const canvas = document.createElement('canvas');
                    canvas.width = 1920;
                    canvas.height = 1080;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, 1920, 1080);
                    
                    const scale = Math.min(1920 / img.width, 1080 / img.height);
                    const w = img.width * scale;
                    const h = img.height * scale;
                    const x = (1920 - w) / 2;
                    const y = (1080 - h) / 2;
                    ctx.drawImage(img, x, y, w, h);
                    
                    const rgba = ctx.getImageData(0, 0, 1920, 1080).data;
                    
                    const chunk = 8192;
                    let binary = '';
                    for (let i = 0; i < rgba.length; i += chunk) {
                        binary += String.fromCharCode.apply(null, rgba.subarray(i, i + chunk));
                    }
                    const b64 = window.btoa(binary);

                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ 
                            action: 'UPLOAD_STILL', 
                            ip: LOCKED_ATEM_IP, 
                            index: index, 
                            name: file.name.substring(0, 16), 
                            rgbaBase64: b64 
                        }));
                    }
                    
                    setTimeout(() => setUploadingSlot(null), 2500);
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSlotClick = (slotIndex, type) => {
        if (!isPanelActive) return;

        // If an image is used but not yet cached, click immediately fetches it
        if (type === 'still' && atemStills[slotIndex]?.isUsed && !cachedThumbnails[slotIndex]) {
            triggerSlotFetch(slotIndex);
        }

        if (!selectedMp) return;

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
        const dropId = `${type}-${actualSlotIndex}`;
        const isDragOver = isPanelActive && dragActive === dropId;
        const isUploading = isPanelActive && uploadingSlot === actualSlotIndex && type === 'still';

        const atemData = isPanelActive ? (type === 'still' ? atemStills[actualSlotIndex] : atemClips[actualSlotIndex]) : null;
        const localPreview = isPanelActive ? localPreviews[dropId] : null;
        const cachedRecord = (isPanelActive && type === 'still') ? cachedThumbnails[actualSlotIndex] : null;

        const isUsed = atemData ? atemData.isUsed : false;
        const displayName = localPreview ? localPreview.name : (atemData ? atemData.name : '');
        const displaySrc = localPreview ? localPreview.src : (cachedRecord ? cachedRecord.src : null);

        const isMp1 = isPanelActive && mediaPlayers[0] && (type === 'still' ? (mediaPlayers[0].sourceType === 1 && mediaPlayers[0].stillIndex === actualSlotIndex) : (mediaPlayers[0].sourceType === 2 && mediaPlayers[0].clipIndex === actualSlotIndex));
        const isMp2 = isPanelActive && mediaPlayers[1] && (type === 'still' ? (mediaPlayers[1].sourceType === 1 && mediaPlayers[1].stillIndex === actualSlotIndex) : (mediaPlayers[1].sourceType === 2 && mediaPlayers[1].clipIndex === actualSlotIndex));

        // Evaluate context-aware dim vs bright tally borders
        let tallyClass = '';
        if (isMp2) {
            tallyClass = selectedMp === 2 ? 'mp-tally-red' : 'mp-tally-red-dim';
        } else if (isMp1) {
            tallyClass = selectedMp === 1 ? 'mp-tally-green' : 'mp-tally-green-dim';
        }

        return (
            <div 
                className={`mp-slot ${isDragOver ? 'drag-over' : ''} ${tallyClass}`}
                onDragOver={(e) => handleDragOver(e, dropId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, actualSlotIndex, type)}
                onClick={() => handleSlotClick(actualSlotIndex, type)}
                style={{ opacity: isUploading ? 0.5 : 1 }}
                title={isPanelActive && isUsed && !displaySrc ? "Click to fetch image from ATEM" : undefined}
            >
                {isMp1 && <div className="mp-badge" style={{ left: '4px' }}>MP1</div>}
                {isMp2 && <div className="mp-badge" style={{ left: isMp1 ? '38px' : '4px' }}>MP2</div>}

                <div className="mp-thumb-container">
                    {displaySrc ? (
                        <img src={displaySrc} alt={`Slot ${slotNumber}`} className="mp-thumbnail" />
                    ) : (
                        <div className="mp-empty-circle">
                            {isUploading ? 'UP...' : slotNumber}
                        </div>
                    )}
                </div>
                {isPanelActive && (isUsed || displayName) && (
                    <div className="mp-label-bar">
                        <span className="mp-label-num">{slotNumber.toString().padStart(2, '0')}</span>
                        <span className="mp-label-text">{displayName || `Slot ${slotNumber}`}</span>
                    </div>
                )}
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
                                        key={`mp-page-btn-${pageNum}`}
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
                                className={`macro-action-text-btn ${isPanelActive && isSyncing ? 'active-red' : ''}`}
                                onClick={handleSyncAllStills}
                                title="Fetch thumbnails from ATEM"
                            >
                                {isPanelActive && isSyncing ? 'SYNCING...' : 'SYNC'}
                            </button>
                            <button 
                                className={`macro-action-text-btn ${isPanelActive && selectedMp === 1 ? 'active-green' : ''}`}
                                onClick={() => setSelectedMp(prev => prev === 1 ? null : 1)}
                            >
                                MP1
                            </button>
                            <button 
                                className={`macro-action-text-btn ${isPanelActive && selectedMp === 2 ? 'active-red' : ''}`}
                                onClick={() => setSelectedMp(prev => prev === 2 ? null : 2)}
                            >
                                MP2
                            </button>
                        </div>
                    </div>

                    <div className="macro-section-box">
                        <div className="mp-grid">
                            {Array.from({ length: 16 }).map((_, idx) => (
                                <MediaSlot key={`still-${idx}`} index={idx} type="still" startIndex={0} />
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
                                            key={`mp-page-btn-p2-${pageNum}`}
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
                                    className={`macro-action-text-btn ${isPanelActive && isSyncing ? 'active-red' : ''}`}
                                    onClick={handleSyncAllStills}
                                    title="Fetch thumbnails from ATEM"
                                >
                                    {isPanelActive && isSyncing ? 'SYNCING...' : 'SYNC'}
                                </button>
                                <button 
                                    className={`macro-action-text-btn ${isPanelActive && selectedMp === 1 ? 'active-green' : ''}`}
                                    onClick={() => setSelectedMp(prev => prev === 1 ? null : 1)}
                                >
                                    MP1
                                </button>
                                <button 
                                    className={`macro-action-text-btn ${isPanelActive && selectedMp === 2 ? 'active-red' : ''}`}
                                    onClick={() => setSelectedMp(prev => prev === 2 ? null : 2)}
                                >
                                    MP2
                                </button>
                            </div>
                        </div>

                        <div className="macro-section-box">
                            <div className="mp-grid-single-row">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <MediaSlot key={`still-p2-${idx}`} index={idx} type="still" startIndex={16} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: CLIPS 1-4 (ROW 4 OF 4x4 GRID, ROWS 2 & 3 REMAIN EMPTY) */}
                    <div>
                        <div className="atem-section-header-row">
                            <span className="atem-section-title">CLIPS</span>
                        </div>

                        <div className="macro-section-box">
                            <div className="mp-grid-single-row">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <MediaSlot key={`clip-${idx}`} index={idx} type="clip" startIndex={0} />
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