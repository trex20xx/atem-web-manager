import React from 'react';
import Panel from './Panel';

// =========================================================================
// ATEM WEB MANAGER - QUADRANT GRID (v3.79)
// =========================================================================
// Enforces panel exclusivity across multiview quadrants and forwards
// activeDeviceIp to child panels for localized telemetry filtration.

const QuadrantGrid = ({ 
    quadrantOrder, currentVideoSource, isConnected, connectedDevice, activeDeviceIp, isLoading, enableQuadrantDrag,
    handleQuadrantDragStart, handleQuadrantDragOver, handleQuadrantDragLeave, handleQuadrantDrop, setQuadrantOrder
}) => {
    const handleSwapCallback = (sourceIndex, targetIndex) => {
        const newOrder = [...quadrantOrder];
        const temp = newOrder[targetIndex];
        newOrder[targetIndex] = newOrder[sourceIndex];
        newOrder[sourceIndex] = temp;
        setQuadrantOrder(newOrder);
    };

    const handleReorderQuadrant = (slotIndex, quadId) => {
        const newOrder = [...quadrantOrder];
        
        if (quadId !== 0) {
            for (let i = 0; i < newOrder.length; i++) {
                if (i !== slotIndex && newOrder[i] === quadId) {
                    newOrder[i] = 0;
                }
            }
        }

        newOrder[slotIndex] = quadId;
        setQuadrantOrder(newOrder);
    };

    return (
        <>
            {[0, 1, 2, 3].map((posIndex) => (
                <Panel 
                    key={'quadrant-pos-' + posIndex}
                    panelId={quadrantOrder[posIndex]}
                    positionIndex={posIndex}
                    currentVideoSource={currentVideoSource}
                    isConnected={isConnected}
                    connectedDevice={connectedDevice}
                    activeDeviceIp={activeDeviceIp}
                    isLoading={isLoading}
                    enableQuadrantDrag={enableQuadrantDrag}
                    handleDragStart={handleQuadrantDragStart}
                    handleDragOver={handleQuadrantDragOver}
                    handleDragLeave={handleQuadrantDragLeave}
                    handleDrop={(e, targetIndex) => handleQuadrantDrop(e, targetIndex, handleSwapCallback)}
                    onReorderQuadrant={handleReorderQuadrant}
                />
            ))}
        </>
    );
};

export default QuadrantGrid;