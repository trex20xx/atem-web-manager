import React, { useState } from 'react';
import SearchBar from './SearchBar';
import DeviceList from './DeviceList';
import BottomActionBtn from './BottomActionBtn';

// =========================================================================
// ATEM WEB MANAGER - SIDEBAR COMPONENT (v3.65)
// =========================================================================
// Receives dynamic 'top' and 'height' coordinates from App.jsx to guarantee
// perfect vertical alignment with the 16:9 multiview quadrants when docked.

const Sidebar = ({ 
    top, height, showActionButton, enableDragDrop, forceUppercase, 
    deviceState, variant = 'classic', isCollapsed, isRevealed, setIsRevealed
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside 
            className={`sidebar variant-${variant} ${isCollapsed ? 'collapsed' : ''} ${isRevealed ? 'revealed' : ''}`} 
            style={{ 
                height: isCollapsed ? '100vh' : `${height}px`,
                top: isCollapsed ? '0px' : `${top}px`
            }}
            onMouseEnter={() => {
                setIsHovered(true);
                if (isCollapsed && setIsRevealed) setIsRevealed(true);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                if (isCollapsed && setIsRevealed) setIsRevealed(false);
            }}
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