import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - MEDIA POOL PANEL (v3.22)
// =========================================================================

const LOCKED_ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

const MediaPool = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [atemStills, setAtemStills] = useState([]);
    const [atemClips, setAtemClips] = useState([]);
    
    // Stores downloaded ATEM thumbnail base64 data strings (keyed by index)
    const [downloadedStills, setDownloadedStills] = useState({});
    
    // Stores locally dragged temporary previews before upload finishes
    const [localPreviews, setLocalPreviews] = useState({});
    const [dragActive, setDragActive] = useState(null);
    const [uploadingSlot, setUploadingSlot] = useState(null);

    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);

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
                                // Trigger a fetch for any used still we don't have yet
                                data.mediaPool.stills.forEach((still, idx) => {
                                    if (still.isUsed && !downloadedStills[idx]) {
                                        wsRef.current.send(JSON.stringify({ action: 'GET_STILL', ip: LOCKED_ATEM_IP, index: idx }));
                                    }
                                });
                            }
                            if (data.mediaPool.clips) setAtemClips(data.mediaPool.clips);
                        }
                        if (data.type === 'STILL_DATA' && data.data) {
                            setDownloadedStills(prev => ({ ...prev, [data.index]: data.data }));
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
    }, [downloadedStills]);

    const handleDragOver = (e, dropId) => {
        e.preventDefault();
        setDragActive(dropId);
    };

    const handleDragLeave = () => {
        setDragActive(null);
    };

    const handleDrop = (e, index, type) => {
        e.preventDefault();
        setDragActive(null);

        if (type !== 'still') return; // ATEM libraries currently only support Still uploads reliably over network

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const reader = new FileReader();
            
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                
                // Show temporary local preview instantly
                setLocalPreviews(prev => ({
                    ...prev,
                    [`${type}-${index}`]: { src: dataUrl, name: file.name }
                }));

                // Process image for ATEM Upload (requires raw 1920x1080 RGBA array)
                const img = new Image();
                img.onload = () => {
                    setUploadingSlot(index);
                    const canvas = document.createElement('canvas');
                    canvas.width = 1920;
                    canvas.height = 1080;
                    const ctx = canvas.getContext('2d');
                    
                    // Draw black background (in case of transparency)
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, 1920, 1080);
                    
                    // Center and scale image to fit 1920x1080
                    const scale = Math.min(1920 / img.width, 1080 / img.height);
                    const w = img.width * scale;
                    const h = img.height * scale;
                    const x = (1920 - w) / 2;
                    const y = (1080 - h) / 2;
                    ctx.drawImage(img, x, y, w, h);
                    
                    const rgba = ctx.getImageData(0, 0, 1920, 1080).data;
                    
                    // Fast convert 8MB Uint8Array to Base64
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
                    
                    setTimeout(() => setUploadingSlot(null), 2000);
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
        }
    };

    const MediaSlot = ({ index, type, startIndex = 0 }) => {
        const slotNumber = startIndex + index + 1;
        const dropId = `${type}-${index}`;
        const isDragOver = dragActive === dropId;
        const isUploading = uploadingSlot === index && type === 'still';

        const atemData = type === 'still' ? atemStills[slotNumber - 1] : atemClips[slotNumber - 1];
        const localPreview = localPreviews[dropId];
        const downloadedImg = type === 'still' ? downloadedStills[slotNumber - 1] : null;

        const isUsed = atemData ? atemData.isUsed : false;
        const displayName = localPreview ? localPreview.name : (atemData ? atemData.name : '');
        
        // Priority: 1. Local drag preview, 2. Downloaded ATEM image
        const displaySrc = localPreview ? localPreview.src : downloadedImg;

        return (
            <div 
                className={`mp-slot ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, dropId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slotNumber - 1, type)}
                style={{ opacity: isUploading ? 0.5 : 1 }}
            >
                <div className="mp-thumb-container">
                    {displaySrc ? (
                        <img src={displaySrc} alt={`Slot ${slotNumber}`} className="mp-thumbnail" />
                    ) : (
                        <div className="mp-empty-circle" style={{ borderColor: isUsed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)' }}>
                            {isUploading ? 'UP...' : slotNumber}
                        </div>
                    )}
                </div>
                {(isUsed || displayName) && (
                    <div className="mp-label-bar">
                        <span className="mp-label-num">{slotNumber.toString().padStart(2, '0')}</span>
                        <span className="mp-label-text">{displayName || `Used Slot ${slotNumber}`}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="atem-macros-panel compact-layout">
            <div className="macro-compact-header-row">
                <div className="macro-title-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                    <div className="atem-section-title">MEDIA · CLIPS</div>
                    <div className="macro-page-buttons" style={{ display: 'flex', gap: '4px' }}>
                        {[1, 2].map((pageNum) => (
                            <button
                                key={`mp-page-btn-${pageNum}`}
                                className={`macro-action-text-btn ${currentPage === pageNum ? 'active-orange' : ''}`}
                                onClick={() => setCurrentPage(pageNum)}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="atem-bus-content-layout">
                {currentPage === 1 ? (
                    <div className="atem-section-wrapper" style={{ width: '786px', margin: '0 auto' }}>
                        <div className="atem-section-header-row">
                            <div className="atem-section-title">MEDIA · STILLS</div>
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
                    <div className="atem-section-wrapper" style={{ width: '786px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div className="atem-section-header-row">
                                <div className="atem-section-title">MEDIA · STILLS</div>
                            </div>
                            <div className="macro-section-box">
                                <div className="mp-grid">
                                    {Array.from({ length: 4 }).map((_, idx) => (
                                        <MediaSlot key={`still-p2-${idx}`} index={idx} type="still" startIndex={16} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="atem-section-header-row">
                                <div className="atem-section-title">CLIPS</div>
                            </div>
                            <div className="macro-section-box">
                                <div className="mp-grid">
                                    {Array.from({ length: 4 }).map((_, idx) => (
                                        <MediaSlot key={`clip-${idx}`} index={idx} type="clip" startIndex={0} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPool;