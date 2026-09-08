import React from 'react';
import Player from '../VideoPlayer/Player';
import AtemConstellationBus from '../Panels/AtemConstellationBus';
import ErrorBoundary from '../UI/ErrorBoundary';
import Skeleton from '../UI/Skeleton';

// =========================================================================
// ATEM WEB MANAGER - PANEL COMPONENT (v1.84)
// =========================================================================
// Renders Quadrant Skeletons during initial startup (isLoading).

const Panel = ({ 
    panelId, positionIndex, currentVideoSource, isConnected, connectedDevice, isLoading,
    enableQuadrantDrag, handleDragStart, handleDragOver, handleDragLeave, handleDrop 
}) => {

    const renderPanelContent = () => {
        // V1.84 - Render Shimmering Quadrant Skeletons during startup load
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

        if (panelId === 1 && isConnected) {
            return <Player currentVideoSource={currentVideoSource} />;
        }

        if (panelId === 3 && isConnected && connectedDevice?.ip === '192.168.10.240') {
            return <AtemConstellationBus connectedDevice={connectedDevice} />;
        }

        return null;
    };

    const content = renderPanelContent();

    return (
        <div 
            className="panel"
            draggable={enableQuadrantDrag && !isLoading}
            onDragStart={(e) => handleDragStart(e, positionIndex)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, positionIndex)}
        >
            <div className="panel-muted-num">{panelId}</div>
            <div className="panel-content">
                <ErrorBoundary>
                    {content}
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default Panel;