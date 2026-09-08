import React, { useState } from 'react';
import SearchBar from './SearchBar';
import DeviceList from './DeviceList';
import BottomActionBtn from './BottomActionBtn';

// =========================================================================
// ATEM WEB MANAGER - SIDEBAR COMPONENT (v1.78)
// =========================================================================

const Sidebar = ({ 
    height, 
    showActionButton, 
    enableDragDrop, 
    forceUppercase, 
    deviceState,
    variant = 'classic'
}) => {
    // V1.78 Hover Logic simplified (removed timer)
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className={`sidebar variant-${variant}`} 
            style={{ height: `${height}px` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <SearchBar deviceState={deviceState} showActionButton={showActionButton} /> 
            <DeviceList deviceState={deviceState} enableDragDrop={enableDragDrop} forceUppercase={forceUppercase} /> 
            <BottomActionBtn 
                deviceState={deviceState} 
                showActionButton={showActionButton} 
                isVisible={isHovered || deviceState.actionState !== 'select-none'} 
            /> 
        </div>
    );
};

export default Sidebar;