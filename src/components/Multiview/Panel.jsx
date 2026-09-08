import React from 'react';
import Player from '../VideoPlayer/Player';
import AtemConstellationBus from '../Panels/AtemConstellationBus';
import ErrorBoundary from '../UI/ErrorBoundary';

// =========================================================================
// ATEM WEB MANAGER - PANEL COMPONENT (v1.82)
// =========================================================================

const Panel = ({ 
    panelId, positionIndex, currentVideoSource, isConnected, connectedDevice,
    enableQuadrantDrag, handleDragStart, handleDragOver, handleDragLeave, handleDrop 
}) => {

    const renderPanelContent = () => {
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
            draggable={enableQuadrantDrag}
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