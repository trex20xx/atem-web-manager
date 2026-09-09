import React from 'react';
import Panel from './Panel';

// =========================================================================
// ATEM WEB MANAGER - QUADRANT GRID (v2.07)
// =========================================================================

const QuadrantGrid = ({ 
    quadrantOrder, currentVideoSource, isConnected, connectedDevice, isLoading, enableQuadrantDrag,
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
        const currentQuadInSlot = newOrder[slotIndex];
        
        if (currentQuadInSlot === quadId) return;

        const indexOfSourceQuad = newOrder.indexOf(quadId);
        newOrder[slotIndex] = quadId;
        newOrder[indexOfSourceQuad] = currentQuadInSlot;
        
        setQuadrantOrder(newOrder);
    };

    return (
        <>
            {[0, 1, 2, 3].map((posIndex) => (
                <Panel 
                    key={`quadrant-pos-${posIndex}`}
                    panelId={quadrantOrder[posIndex]}
                    positionIndex={posIndex}
                    currentVideoSource={currentVideoSource}
                    isConnected={isConnected}
                    connectedDevice={connectedDevice}
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