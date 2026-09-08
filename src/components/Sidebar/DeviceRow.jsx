import React, { useState } from 'react';
import ColorDropdown from './ColorDropdown';

// =========================================================================
// ATEM WEB MANAGER - DEVICE ROW (v1.75)
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
    handleDeviceDragStart
}) => {
    const [editForm, setEditForm] = useState({
        name: device.name !== device.ip ? device.name : '',
        ip: device.ip,
        group: (!device.group || device.group.toUpperCase() === 'UNGROUPED') ? '' : device.group,
        colorTag: device.colorTag || '',
        description: device.description || ''
    });

    if (isEditing) {
        return (
            <div className="device-wrapper editing">
                <div className="device-accent" style={{ backgroundColor: editForm.colorTag || 'transparent' }}></div>
                <div className="device-editing-inner">
                    <div className="edit-field-wrapper">
                        <input className="edit-field" placeholder="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} autoFocus />
                    </div>
                    <div className="edit-field-wrapper">
                        <input className="edit-field" placeholder="IP address" value={editForm.ip} onChange={e => setEditForm({...editForm, ip: e.target.value})} />
                    </div>
                    <div className="edit-field-wrapper">
                        <input className="edit-field" placeholder="Group name" value={editForm.group} onChange={e => setEditForm({...editForm, group: e.target.value})} />
                    </div>
                    <ColorDropdown currentColor={editForm.colorTag} onChange={val => setEditForm({...editForm, colorTag: val})} />
                    <div className="edit-field-wrapper">
                        <input className="edit-field" placeholder="Description" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                    </div>
                    <div className="edit-actions">
                        <button className="edit-cancel" onClick={onEditCancel}>Cancel</button>
                        <button className="edit-save" onClick={() => onEditSave(device.id, editForm)}>Save</button>
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
                    onConnect(device.id); // Double click to connect, simple adaptation of time-based original
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