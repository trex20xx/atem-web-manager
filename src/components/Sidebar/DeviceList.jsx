import React, { useState } from 'react';
import DeviceRow from './DeviceRow';
import ColorDropdown from './ColorDropdown';
import Skeleton from '../UI/Skeleton';
import { useDragDrop } from '../../hooks/useDragDrop';

// =========================================================================
// ATEM WEB MANAGER - DEVICE LIST (v2.08)
// =========================================================================

const DeviceList = ({ deviceState, enableDragDrop, forceUppercase }) => {
    const { 
        isLoading, devices, setDevices, searchFilter, groupSettings, setGroupSettings, 
        selectedDeviceId, setSelectedDeviceId, selectedGroupContext, setSelectedGroupContext,
        editingId, setEditingId, editingGroupContext, setEditingGroupContext,
        setActionState, connectDevice, validIP, ipTaken, groupExists
    } = deviceState;

    const { handleDeviceDragStart, handleGroupDragOver, handleGroupDragLeave, handleGroupDrop } = useDragDrop(enableDragDrop);
    const [groupEditForm, setGroupEditForm] = useState({ name: '', colorTag: '', description: '' });

    if (isLoading) {
        return (
            <div className="device-list" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Skeleton height="20px" width="40%" style={{ marginBottom: '8px' }} borderRadius="4px" />
                <Skeleton height="30px" />
                <Skeleton height="30px" />
                <Skeleton height="30px" />
                <Skeleton height="30px" />
                <div style={{ margin: '12px 0' }}></div>
                <Skeleton height="20px" width="30%" style={{ marginBottom: '8px' }} borderRadius="4px" />
                <Skeleton height="30px" />
                <Skeleton height="30px" />
            </div>
        );
    }

    const groups = { UNGROUPED: [] };
    Object.keys(groupSettings).forEach(g => { groups[g.toUpperCase()] = []; });

    const visible = searchFilter ? devices.filter(d => (d.name && d.name.toLowerCase().includes(searchFilter)) || (d.ip && d.ip.toLowerCase().includes(searchFilter)) || (d.group && d.group.toLowerCase().includes(searchFilter))) : devices;
    
    visible.forEach(d => { 
        const gName = (d.group || 'UNGROUPED').toUpperCase();
        if (!groups[gName]) groups[gName] = [];
        groups[gName].push(d); 
    });

    const groupNames = Object.keys(groups).sort((a,b) => a === 'UNGROUPED' ? 1 : b === 'UNGROUPED' ? -1 : a.localeCompare(b));

    const handleSaveDeviceEdit = (id, form) => {
        if (!validIP(form.ip) || ipTaken(form.ip, id)) {
            alert("Invalid or taken IP.");
            return;
        }
        if (form.name) {
            const dup = devices.find(d => d.id !== id && d.name.toLowerCase() === form.name.toLowerCase() && !d.name.includes('(Placeholder)'));
            if (dup) { alert("An entry with this name already exists."); return; }
        }

        let finalGroup = (!form.group || form.group.toUpperCase() === 'UNGROUPED') ? 'UNGROUPED' : form.group;
        const upperFinal = finalGroup.toUpperCase();
        
        const existing = devices.find(d => (d.group || 'UNGROUPED').toUpperCase() === upperFinal);
        if (existing && existing.group && existing.group.toUpperCase() !== 'UNGROUPED') finalGroup = existing.group;
        else if (groupSettings[upperFinal] && groupSettings[upperFinal].originalName) finalGroup = groupSettings[upperFinal].originalName;

        setDevices(prev => prev.map(d => d.id === id ? { ...d, ip: form.ip, name: form.name || form.ip, group: finalGroup, colorTag: form.colorTag, description: form.description } : d));
        
        if (finalGroup !== 'UNGROUPED' && !groupSettings[upperFinal]) {
            setGroupSettings(prev => ({ ...prev, [upperFinal]: { colorTag: '', originalName: finalGroup, description: '' } }));
        }
        setEditingId(null);
    };

    const handleSaveGroupEdit = (oldG) => {
        const newN = groupEditForm.name.trim();
        const upperNew = newN.toUpperCase();

        if (newN && upperNew !== oldG && groupExists(newN)) {
            alert("A group with this name already exists.");
            return;
        }

        setDevices(prev => prev.map(d => (d.group || 'UNGROUPED').toUpperCase() === oldG ? { ...d, group: newN || 'UNGROUPED' } : d));
        
        if (newN) {
            setGroupSettings(prev => {
                const next = { ...prev, [upperNew]: { colorTag: groupEditForm.colorTag, originalName: newN, description: groupEditForm.description } };
                if (upperNew !== oldG) delete next[oldG];
                return next;
            });
        }
        setEditingGroupContext(null);
    };

    const handleDrop = (deviceId, targetGroup) => {
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, group: targetGroup } : d));
    };

    return (
        <div className="device-list" onClick={(e) => {
            if (!e.target.closest('.device-wrapper') && !e.target.closest('.group-header-wrapper')) {
                setSelectedDeviceId(null);
                setSelectedGroupContext(null);
                setActionState('select-none');
            }
        }}>
            {groupNames.map((g, index) => {
                if (searchFilter && groups[g].length === 0 && !g.toLowerCase().includes(searchFilter)) return null;

                const sample = groups[g][0];
                let origG = sample && sample.group ? sample.group : (groupSettings[g] && groupSettings[g].originalName ? groupSettings[g].originalName : g);
                let col = (groupSettings[g] && groupSettings[g].colorTag) ? groupSettings[g].colorTag : '';
                let desc = (groupSettings[g] && groupSettings[g].description) ? groupSettings[g].description : '';

                return (
                    <div 
                        key={g} 
                        className="group-section"
                        onDragOver={handleGroupDragOver}
                        onDragLeave={handleGroupDragLeave}
                        onDrop={(e) => handleGroupDrop(e, origG, handleDrop)}
                    >
                        {editingGroupContext === g && g !== 'UNGROUPED' ? (
                            <div 
                                className="group-header-wrapper"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveGroupEdit(g);
                                    }
                                }}
                            >
                                <div className="group-header-accent" style={{ backgroundColor: col }}></div>
                                <div className="group-editing-inner">
                                    <div className="edit-field-wrapper">
                                        <input 
                                            className="edit-field" 
                                            placeholder="Group name" 
                                            value={groupEditForm.name} 
                                            onChange={e => setGroupEditForm({...groupEditForm, name: e.target.value})} 
                                            autoFocus 
                                        />
                                        {groupEditForm.name && (
                                            <button type="button" className="clear-field-x" onClick={() => setGroupEditForm({...groupEditForm, name: ''})}>&times;</button>
                                        )}
                                    </div>
                                    <ColorDropdown currentColor={groupEditForm.colorTag} onChange={val => setGroupEditForm({...groupEditForm, colorTag: val})} />
                                    <div className="edit-field-wrapper">
                                        <input 
                                            className="edit-field" 
                                            placeholder="Description" 
                                            value={groupEditForm.description} 
                                            onChange={e => setGroupEditForm({...groupEditForm, description: e.target.value})} 
                                        />
                                        {groupEditForm.description && (
                                            <button type="button" className="clear-field-x" onClick={() => setGroupEditForm({...groupEditForm, description: ''})}>&times;</button>
                                        )}
                                    </div>
                                    <div className="edit-actions">
                                        <button type="button" className="edit-cancel" onClick={() => setEditingGroupContext(null)}>Cancel</button>
                                        <button type="button" className="edit-save" onClick={() => handleSaveGroupEdit(g)}>Save</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div 
                                className={`group-header-wrapper ${g === selectedGroupContext ? 'selected-group' : ''}`}
                                onClick={() => {
                                    setSelectedGroupContext(g);
                                    setSelectedDeviceId(null);
                                    setEditingId(null);
                                    setEditingGroupContext(null);
                                    if (g === 'UNGROUPED') setActionState('select-none');
                                    else setActionState('group-delete');
                                }}
                                data-description={desc}
                            >
                                <div className="group-header-accent" style={{ backgroundColor: col }}></div>
                                <div className="group-header-inner">
                                    <span>{forceUppercase ? origG.toUpperCase() : origG}</span>
                                    {g !== 'UNGROUPED' && (
                                        <button 
                                            className="group-edit-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setGroupEditForm({ name: origG, colorTag: col, description: desc });
                                                setEditingId(null);
                                                setEditingGroupContext(g);
                                            }}
                                        >✎</button>
                                    )}
                                </div>
                            </div>
                        )}

                        {groups[g].map(d => (
                            <DeviceRow 
                                key={d.id}
                                device={d}
                                isSelected={selectedDeviceId === d.id}
                                isEditing={editingId === d.id}
                                forceUppercase={forceUppercase}
                                enableDragDrop={enableDragDrop}
                                handleDeviceDragStart={handleDeviceDragStart}
                                availableGroups={groupNames}
                                onSelect={(id) => {
                                    setEditingId(null); setEditingGroupContext(null);
                                    setSelectedDeviceId(id); setSelectedGroupContext(null);
                                    setActionState('delete');
                                }}
                                onConnect={connectDevice}
                                onEditStart={(id) => {
                                    setSelectedDeviceId(null); setSelectedGroupContext(null); setEditingGroupContext(null);
                                    setActionState('select-none'); setEditingId(id);
                                }}
                                onEditCancel={() => setEditingId(null)}
                                onEditSave={handleSaveDeviceEdit}
                            />
                        ))}

                        {index === groupNames.length - 1 && (
                            <div 
                                className="group-dropzone"
                                onDragOver={handleGroupDragOver}
                                onDragLeave={handleGroupDragLeave}
                                onDrop={(e) => handleGroupDrop(e, 'UNGROUPED', handleDrop)}
                            ></div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default DeviceList;