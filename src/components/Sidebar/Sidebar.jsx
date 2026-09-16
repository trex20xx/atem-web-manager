import React, { useState } from 'react';
import SearchBar from './SearchBar';
import DeviceList from './DeviceList';
import BottomActionBtn from './BottomActionBtn';

// =========================================================================
// ATEM WEB MANAGER - SIDEBAR COMPONENT (v3.62)
// =========================================================================
// Supports docked in-flow navigation and gapless 100vh full-height overlay
// sliding in collapsed mode with left-edge hover reveal.

const Sidebar = ({ 
    height, showActionButton, enableDragDrop, forceUppercase, 
    deviceState, variant = 'classic', isCollapsed, isRevealed, setIsRevealed
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside 
            className={`sidebar variant-${variant} ${isCollapsed ? 'collapsed' : ''} ${isRevealed ? 'revealed' : ''}`} 
            style={{ height: isCollapsed ? '100vh' : `${height}px` }}
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