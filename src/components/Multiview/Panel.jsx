import React from 'react';
import Player from '../VideoPlayer/Player';

// =========================================================================
// ATEM WEB MANAGER - PANEL COMPONENT (v1.79)
// =========================================================================

const Panel = ({ 
    panelId, positionIndex, currentVideoSource, isConnected, 
    enableQuadrantDrag, handleDragStart, handleDragOver, handleDragLeave, handleDrop 
}) => {
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
                {panelId === 1 && isConnected && (
                    <Player currentVideoSource={currentVideoSource} />
                )}
            </div>
        </div>
    );
};

export default Panel;