import { useCallback } from 'react';

// =========================================================================
// ATEM WEB MANAGER - USE DRAG DROP HOOK (v1.75)
// =========================================================================
// Manages the HTML5 drag-and-drop physics for both Device re-grouping 
// and Quadrant swapping.

export function useDragDrop(enableDragDrop) {
    
    // --- DEVICE TO GROUP DRAG LOGIC ---
    const handleDeviceDragStart = useCallback((e, deviceId) => {
        if (!enableDragDrop) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', deviceId);
        e.dataTransfer.effectAllowed = 'move';
    }, [enableDragDrop]);

    const handleGroupDragOver = useCallback((e) => {
        if (!enableDragDrop) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over-group');
    }, [enableDragDrop]);

    const handleGroupDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over-group');
    }, []);

    const handleGroupDrop = useCallback((e, targetGroup, onDropCallback) => {
        if (!enableDragDrop) return;
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over-group');
        
        const draggedId = Number(e.dataTransfer.getData('text/plain'));
        if (draggedId && onDropCallback) {
            onDropCallback(draggedId, targetGroup);
        }
    }, [enableDragDrop]);

    // --- QUADRANT SWAP DRAG LOGIC ---
    const handleQuadrantDragStart = useCallback((e, positionIndex) => {
        e.dataTransfer.setData('quadrant/pos', positionIndex);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleQuadrantDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.classList.add('drag-over-quadrant');
    }, []);

    const handleQuadrantDragLeave = useCallback((e) => {
        e.currentTarget.classList.remove('drag-over-quadrant');
    }, []);

    const handleQuadrantDrop = useCallback((e, targetIndex, onSwapCallback) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over-quadrant');
        
        const sourceIndex = e.dataTransfer.getData('quadrant/pos');
        if (sourceIndex !== '' && sourceIndex !== null) {
            const parsedSource = Number(sourceIndex);
            if (parsedSource !== targetIndex && onSwapCallback) {
                onSwapCallback(parsedSource, targetIndex);
            }
        }
    }, []);

    return {
        handleDeviceDragStart,
        handleGroupDragOver,
        handleGroupDragLeave,
        handleGroupDrop,
        handleQuadrantDragStart,
        handleQuadrantDragOver,
        handleQuadrantDragLeave,
        handleQuadrantDrop
    };
}