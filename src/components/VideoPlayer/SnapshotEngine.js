import React from 'react';
import Panel from './Panel';

// =========================================================================
// ATEM WEB MANAGER - QUADRANT GRID (v1.75)
// =========================================================================

const QuadrantGrid = ({ 
    quadrantOrder, currentVideoSource, isConnected, enableDragDrop,
    handleQuadrantDragStart, handleQuadrantDragOver, handleQuadrantDragLeave, handleQuadrantDrop, setQuadrantOrder
}) => {
    const handleSwapCallback = (sourceIndex, targetIndex) => {
        const newOrder = [...quadrantOrder];
        const temp = newOrder[targetIndex];
        newOrder[targetIndex] = newOrder[sourceIndex];
        newOrder[sourceIndex] = temp;
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
                    enableDragDrop={enableDragDrop}
                    handleDragStart={handleQuadrantDragStart}
                    handleDragOver={handleQuadrantDragOver}
                    handleDragLeave={handleQuadrantDragLeave}
                    handleDrop={(e, targetIndex) => handleQuadrantDrop(e, targetIndex, handleSwapCallback)}
                />
            ))}
        </>
    );
};

export default QuadrantGrid;