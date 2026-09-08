import React, { useState } from 'react';
import SearchBar from './SearchBar';
import DeviceList from './DeviceList';
import BottomActionBtn from './BottomActionBtn';

// =========================================================================
// ATEM WEB MANAGER - SIDEBAR COMPONENT (v1.75)
// =========================================================================
// Draggable sidebar layout containing Search, Devices, and Action button.

const Sidebar = ({ 
    height, 
    showActionButton, 
    enableDragDrop, 
    forceUppercase, 
    deviceState 
}) => {
    // Inactivity timer logic for the bottom button container hiding mechanism
    const [isHovered, setIsHovered] = useState(true);
    let inactivityTimer = null;

    const resetInactivityTimer = () => {
        setIsHovered(true);
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (deviceState.actionState === 'select-none') {
                setIsHovered(false);
            }
        }, 3000);
    };

    return (
        <div 
            className="sidebar" 
            style={{ height: `${height}px` }}
            onMouseMove={resetInactivityTimer}
            onClick={resetInactivityTimer}
        >
            {/* 1. SEARCH BAR */}
            <SearchBar 
                deviceState={deviceState} 
                showActionButton={showActionButton} 
            /> 
            
            {/* 2. DEVICE LIST & GROUPS */}
            <DeviceList 
                deviceState={deviceState} 
                enableDragDrop={enableDragDrop}
                forceUppercase={forceUppercase}
            /> 

            {/* 3. BOTTOM ACTION BUTTON */}
            <BottomActionBtn 
                deviceState={deviceState} 
                showActionButton={showActionButton}
                isVisible={isHovered || deviceState.actionState !== 'select-none'}
            /> 
        </div>
    );
};

export default Sidebar;