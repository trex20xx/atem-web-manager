import React, { useState, useRef, useEffect } from 'react';
import ColorDropdown from './ColorDropdown';

// =========================================================================
// ATEM WEB MANAGER - DEVICE ROW (v2.08)
// =========================================================================

const DeviceRow = ({ 
    device, 
    isSelected, 
    isEditing, 
    forceUppercase, 
    onSelect, 
    onConnect, 
    onEditStart, 
    onEditCancel, 
    onEditSave,
    enableDragDrop,
    handleDeviceDragStart,
    availableGroups = []
}) => {
    const [editForm, setEditForm] = useState({
        name: device.name !== device.ip ? device.name : '',
        ip: device.ip,
        group: (!device.group || device.group.toUpperCase() === 'UNGROUPED') ? '' : device.group,
        colorTag: device.colorTag || '',
        description: device.description || ''
    });

    const [showGroupMenu, setShowGroupMenu] = useState(false);
    const groupMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
                setShowGroupMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onEditSave(device.id, editForm);
        }
    };

    if (isEditing) {
        return (
            <div className="device-wrapper editing" onKeyDown={handleKeyDown}>
                <div className="device-accent" style={{ backgroundColor: editForm.colorTag || 'transparent' }}></div>
                <div className="device-editing-inner">
                    <div className="edit-field-wrapper">
                        <input 
                            className="edit-field" 
                            placeholder="Name" 
                            value={editForm.name} 
                            onChange={e => setEditForm({...editForm, name: e.target.value})} 
                            autoFocus 
                        />
                        {editForm.name && (
                            <button type="button" className="clear-field-x" onClick={() => setEditForm({...editForm, name: ''})}>&times;</button>
                        )}
                    </div>
                    
                    <div className="edit-field-wrapper">
                        <input 
                            className="edit-field" 
                            placeholder="IP address" 
                            value={editForm.ip} 
                            onChange={e => setEditForm({...editForm, ip: e.target.value})} 
                        />
                    </div>
                    
                    <div className="edit-field-wrapper" ref={groupMenuRef}>
                        <input 
                            className="edit-field" 
                            placeholder="Group name" 
                            value={editForm.group} 
                            onFocus={() => setShowGroupMenu(true)}
                            onChange={e => {
                                setEditForm({...editForm, group: e.target.value});
                                setShowGroupMenu(true);
                            }} 
                        />
                        {editForm.group && (
                            <button type="button" className="clear-field-x" onClick={() => setEditForm({...editForm, group: ''})}>&times;</button>
                        )}
                        {showGroupMenu && availableGroups.length > 0 && (
                            <div className="group-select-menu">
                                {availableGroups.map((gName) => (
                                    <div 
                                        key={gName}
                                        className="group-select-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setEditForm({...editForm, group: gName === 'UNGROUPED' ? '' : gName});
                                            setShowGroupMenu(false);
                                        }}
                                    >
                                        {gName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <ColorDropdown 
                        currentColor={editForm.colorTag} 
                        onChange={val => setEditForm({...editForm, colorTag: val})} 
                    />

                    <div className="edit-field-wrapper">
                        <input 
                            className="edit-field" 
                            placeholder="Description" 
                            value={editForm.description} 
                            onChange={e => setEditForm({...editForm, description: e.target.value})} 
                        />
                        {editForm.description && (
                            <button type="button" className="clear-field-x" onClick={() => setEditForm({...editForm, description: ''})}>&times;</button>
                        )}
                    </div>

                    <div className="edit-actions">
                        <button type="button" className="edit-cancel" onClick={onEditCancel}>Cancel</button>
                        <button type="button" className="edit-save" onClick={() => onEditSave(device.id, editForm)}>Save</button>
                    </div>
                </div>
            </div>
        );
    }

    let dispName = (!device.name || device.name === device.ip) ? device.ip : device.name;
    if (forceUppercase) dispName = dispName.toUpperCase();

    return (
        <div 
            className={`device-wrapper ${isSelected ? 'selected' : ''}`}
            draggable={enableDragDrop}
            onDragStart={(e) => handleDeviceDragStart(e, device.id)}
            onClick={(e) => {
                if (e.detail === 2) {
                    onConnect(device.id);
                } else {
                    onSelect(device.id);
                }
            }}
            data-description={device.description}
        >
            <div className="device-accent" style={{ backgroundColor: device.colorTag || 'transparent' }}></div>
            <div className={`device-inner ${device.status === 'online' ? 'connected-row' : ''}`}>
                <div className={`status ${device.status}`}></div>
                <div className="device-text">
                    <div className="device-name">{dispName}</div>
                </div>
                <button 
                    className="edit-btn" 
                    title="Edit"
                    onClick={(e) => { e.stopPropagation(); onEditStart(device.id); }}
                >✎</button>
            </div>
        </div>
    );
};

export default DeviceRow;