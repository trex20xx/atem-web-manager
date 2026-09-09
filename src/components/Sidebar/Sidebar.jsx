import React, { useState } from 'react';
import SearchBar from './SearchBar';
import DeviceList from './DeviceList';
import BottomActionBtn from './BottomActionBtn';

// =========================================================================
// ATEM WEB MANAGER - SIDEBAR COMPONENT (v2.07)
// =========================================================================

const Sidebar = ({ 
    height, showActionButton, enableDragDrop, forceUppercase, 
    deviceState, variant = 'classic', isCollapsed, onToggleCollapse
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside 
            className={`sidebar variant-${variant} ${isCollapsed ? 'collapsed' : ''}`} 
            style={{ height: `${height}px` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="sidebar-header-bar">
                <span className="sidebar-title">ATEM WEB MANAGER</span>
                <button 
                    className="sidebar-collapse-toggle" 
                    onClick={onToggleCollapse}
                    title="Collapse navigation menu"
                >
                    <svg viewBox="0 0 24 24">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                    </svg>
                </button>
            </div>

            <div className="sidebar-content-wrapper">
                <SearchBar deviceState={deviceState} showActionButton={showActionButton} /> 
                <DeviceList deviceState={deviceState} enableDragDrop={enableDragDrop} forceUppercase={forceUppercase} /> 
                <BottomActionBtn 
                    deviceState={deviceState} 
                    showActionButton={showActionButton} 
                    isVisible={isHovered || deviceState.actionState !== 'select-none'} 
                /> 
            </div>
        </aside>
    );
};

export default Sidebar;