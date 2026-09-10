import React, { useState } from 'react';
import Player from '../VideoPlayer/Player';
import AtemConstellationBus from '../Panels/AtemConstellationBus';
import AtemMacros from '../Panels/AtemMacros';
import ErrorBoundary from '../UI/ErrorBoundary';
import Skeleton from '../UI/Skeleton';
import QuadrantContextMenu from '../UI/QuadrantContextMenu';

// =========================================================================
// ATEM WEB MANAGER - PANEL COMPONENT (v2.58)
// =========================================================================
// 1: Stream | 2: Media Pool | 3: Mixer | 4: Macros | 0: None

const Panel = ({ 
    panelId, positionIndex, currentVideoSource, isConnected, connectedDevice, isLoading,
    enableQuadrantDrag, handleDragStart, handleDragOver, handleDragLeave, handleDrop, onReorderQuadrant 
}) => {
    const [contextMenu, setContextMenu] = useState(null);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
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

        // None / Empty slot
        if (panelId === 0) {
            return null;
        }

        // 1. STREAM
        if (panelId === 1 && isConnected) {
            return <Player currentVideoSource={currentVideoSource} />;
        }

        // 2. MEDIA POOL (Matching title style & centered backdrop number)
        if (panelId === 2 && isConnected) {
            return (
                <div className="media-pool-panel">
                    <div className="media-pool-header">
                        <span className="media-pool-title">MEDIA POOL</span>
                    </div>
                    <div className="panel-muted-num">2</div>
                </div>
            );
        }

        // 3. MIXER (ATEM Constellation HD Bus)
        if (panelId === 3 && isConnected && connectedDevice?.ip === '192.168.10.240') {
            return <AtemConstellationBus connectedDevice={connectedDevice} />;
        }

        // 4. MACROS
        if (panelId === 4 && isConnected && connectedDevice?.ip === '192.168.10.240') {
            return <AtemMacros connectedDevice={connectedDevice} />;
        }

        return null;
    };

    const content = renderPanelContent();

    return (
        <>
            <div 
                className="panel"
                draggable={enableQuadrantDrag && !isLoading}
                onDragStart={(e) => handleDragStart(e, positionIndex)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, positionIndex)}
                onContextMenu={handleContextMenu}
            >
                {/* Display centered backdrop number when unpopulated or when SELECT NONE is active */}
                {(!content || panelId === 0) && (
                    <div className="panel-muted-num">{panelId === 0 ? positionIndex + 1 : panelId}</div>
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