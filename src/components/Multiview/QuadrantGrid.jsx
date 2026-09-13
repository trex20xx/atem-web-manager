import React from 'react';
import Panel from './Panel';

// =========================================================================
// ATEM WEB MANAGER - QUADRANT GRID (v3.12)
// =========================================================================
// Enforces panel exclusivity: if a selected panel already exists in another 
// quadrant, that other quadrant is set to 0 (None) instead of swapping.

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
        
        // If assigning a specific active panel (1, 2, 3, 5), ensure exclusivity across quadrants
        if (quadId !== 0) {
            for (let i = 0; i < newOrder.length; i++) {
                if (i !== slotIndex && newOrder[i] === quadId) {
                    newOrder[i] = 0; // Unload from previous quadrant
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