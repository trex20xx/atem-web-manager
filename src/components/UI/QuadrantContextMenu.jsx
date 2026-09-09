import React, { useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - QUADRANT CONTEXT MENU (v2.07)
// =========================================================================

export default function QuadrantContextMenu({ x, y, currentQuad, onClose, onSelectQuadrant }) {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={menuRef} 
            className="quadrant-context-menu" 
            style={{ top: y, left: x }}
        >
            <div className="quadrant-context-header">ASSIGN QUADRANT</div>
            {[1, 2, 3, 4].map((quad) => (
                <div 
                    key={`ctx-quad-${quad}`} 
                    className="quadrant-context-item"
                    onClick={() => { onSelectQuadrant(quad); onClose(); }}
                >
                    <span>Quadrant {quad}</span>
                    {currentQuad === quad && <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✓</span>}
                </div>
            ))}
        </div>
    );
}