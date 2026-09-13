import React, { useState } from 'react';
import SearchBar from './SearchBar';
import DeviceList from './DeviceList';
import BottomActionBtn from './BottomActionBtn';

// =========================================================================
// ATEM WEB MANAGER - SIDEBAR COMPONENT (v2.16.0)
// =========================================================================

const Sidebar = ({ 
    height, showActionButton, enableDragDrop, forceUppercase, 
    deviceState, variant = 'classic', isCollapsed
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside 
            className={`sidebar variant-${variant} ${isCollapsed ? 'collapsed' : ''}`} 
            style={{ height: `${height}px` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <SearchBar deviceState={deviceState} showActionButton={showActionButton} /> 
            
            <DeviceList 
                deviceState={deviceState} 
                enableDragDrop={enableDragDrop} 
                forceUppercase={forceUppercase} 
            /> 
            
            <BottomActionBtn 
                deviceState={deviceState} 
                showActionButton={showActionButton} 
                isVisible={isHovered || deviceState.actionState !== 'select-none'} 
            /> 
        </aside>
    );
};

export default Sidebar;