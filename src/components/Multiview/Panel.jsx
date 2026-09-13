import React, { useState } from 'react';
import Player from '../VideoPlayer/Player';
import AtemConstellationBus from '../Panels/AtemConstellationBus';
import AtemMacrosCompact from '../Panels/AtemMacrosCompact';
import ErrorBoundary from '../UI/ErrorBoundary';
import Skeleton from '../UI/Skeleton';
import QuadrantContextMenu from '../UI/QuadrantContextMenu';

// =========================================================================
// ATEM WEB MANAGER - PANEL COMPONENT (v3.12)
// =========================================================================
// 1: Stream | 2: Media Pool | 3: Mixer | 5: Macros Compact | 0: None
// Exclusivity enforcement: selecting a panel unloads it from any other quadrant.

const Panel = ({ 
    panelId, positionIndex, currentVideoSource, isConnected, connectedDevice, isLoading,
    enableQuadrantDrag, handleDragStart, handleDragOver, handleDragLeave, handleDrop, onReorderQuadrant 
}) => {
    const [contextMenu, setContextMenu] = useState(null);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const getPanelTitle = (id) => {
        switch (id) {
            case 1: return 'STREAM';
            case 2: return 'MEDIA POOL';
            case 3: return 'MIXER';
            case 5: return 'MACROS';
            default: return '';
        }
    };

    const renderPanelContent = () => {
        if (isLoading) {
            return (
                <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                    <Skeleton height="40%" width="100%" borderRadius="8px" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Skeleton height="32px" width="30%" borderRadius="16px" />
                        <Skeleton height="32px" width="20%" borderRadius="16px" />
                    </div>
                </div>
            );
        }

        if (panelId === 0) {
            return null;
        }

        if (!isConnected) {
            return (
                <div className="panel-idle-container">
                    <div className="panel-idle-header">
                        <span className="panel-idle-title">{getPanelTitle(panelId)}</span>
                    </div>

                    {panelId === 1 && (
                        <div className="stream-offline-placeholder">
                            <svg viewBox="0 0 24 24" className="stream-cam-off-svg">
                                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2zM5 16V8h1.73l8 8H5z" fill="currentColor"/>
                            </svg>
                        </div>
                    )}
                </div>
            );
        }

        if (panelId === 1) {
            return <Player currentVideoSource={currentVideoSource} />;
        }

        if (panelId === 2) {
            return (
                <div className="media-pool-panel">
                    <div className="media-pool-header">
                        <span className="media-pool-title">MEDIA POOL</span>
                    </div>
                    <div className="panel-muted-num">2</div>
                </div>
            );
        }

        if (panelId === 3 && connectedDevice?.ip === '192.168.10.240') {
            return <AtemConstellationBus connectedDevice={connectedDevice} />;
        }

        if (panelId === 5 && connectedDevice?.ip === '192.168.10.240') {
            return <AtemMacrosCompact connectedDevice={connectedDevice} />;
        }

        return null;
    };

    const content = renderPanelContent();

    return (
        <>
            <div 
                className={`panel ${!isConnected && panelId !== 0 ? 'panel-disconnected' : ''}`}
                draggable={enableQuadrantDrag && !isLoading}
                onDragStart={(e) => handleDragStart(e, positionIndex)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, positionIndex)}
                onContextMenu={handleContextMenu}
            >
                {/* Backdrop number displayed when panelId is 0 (None) */}
                {panelId === 0 && (
                    <div className="panel-muted-num">{positionIndex + 1}</div>
                )}
                
                <div className="panel-content">
                    <ErrorBoundary>
                        {content}
                    </ErrorBoundary>
                </div>
            </div>

            {contextMenu && (
                <QuadrantContextMenu 
                    x={contextMenu.x}
                    y={contextMenu.y}
                    currentQuad={panelId}
                    onClose={() => setContextMenu(null)}
                    onSelectQuadrant={(quadId) => {
                        if (onReorderQuadrant) {
                            onReorderQuadrant(positionIndex, quadId);
                        }
                    }}
                />
            )}
        </>
    );
};

export default Panel;