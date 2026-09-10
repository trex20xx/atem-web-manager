import React, { useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - QUADRANT CONTEXT MENU (v2.58)
// =========================================================================

const QUAD_OPTIONS = [
    { id: 1, name: '1. STREAM' },
    { id: 2, name: '2. MEDIA POOL' },
    { id: 3, name: '3. MIXER' },
    { id: 4, name: '4. MACROS' },
    { id: 0, name: 'SELECT NONE' }
];

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
            {QUAD_OPTIONS.map((opt) => (
                <div 
                    key={`ctx-quad-${opt.id}`} 
                    className="quadrant-context-item"
                    onClick={() => { onSelectQuadrant(opt.id); onClose(); }}
                >
                    <span>{opt.name}</span>
                    {currentQuad === opt.id && <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✓</span>}
                </div>
            ))}
        </div>
    );
}