import React from 'react';

// =========================================================================
// ATEM WEB MANAGER - SKELETON UI (v1.76)
// =========================================================================

const Skeleton = ({ width = '100%', height = '30px', borderRadius = 'var(--pill-radius)', style }) => {
    return (
        <div 
            className="skeleton-box" 
            style={{ width, height, borderRadius, ...style }}
        />
    );
};

export default Skeleton;