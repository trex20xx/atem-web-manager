import React from 'react';

// =========================================================================
// ATEM WEB MANAGER - QUALITY MENU (v1.75)
// =========================================================================

const QualityMenu = ({ show, onResolutionSelect }) => {
    if (!show) return null;

    return (
        <div 
            className="stream-tools-panel quality-panel show"
            onMouseDown={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
            onMouseEnter={e => { const p = e.target.closest('.panel'); if (p) p.draggable = false; }}
            onMouseLeave={e => { const p = e.target.closest('.panel'); if (p) p.draggable = true; }}
        >
            <div className="stream-tools-row"><button className="tool-text-btn res-btn" onClick={(e) => { e.stopPropagation(); onResolutionSelect('highest'); }}>4K</button></div>
            <div className="stream-tools-row"><button className="tool-text-btn res-btn" onClick={(e) => { e.stopPropagation(); onResolutionSelect('high'); }}>1080p</button></div>
            <div className="stream-tools-row"><button className="tool-text-btn res-btn" onClick={(e) => { e.stopPropagation(); onResolutionSelect('medium'); }}>720p</button></div>
        </div>
    );
};

export default QualityMenu;