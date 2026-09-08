import React from 'react';

// =========================================================================
// ATEM WEB MANAGER - BOTTOM ACTION BTN (v1.75)
// =========================================================================

const BottomActionBtn = ({ deviceState, showActionButton, isVisible }) => {
    const { actionState, setActionState, selectedDeviceId, selectedGroupContext, pendingAddIp, pendingGroupName, addDevice, deleteDevice, setGroupSettings, setDevices } = deviceState;

    if (!showActionButton) return null;

    const getBtnProps = () => {
        switch (actionState) {
            case 'group-delete': return { className: 'action-delete', text: 'DELETE' };
            case 'group-delete-confirm': return { className: 'action-delete confirm', text: 'CONFIRM' };
            case 'group-add': return { className: 'action-group-mode', text: 'ADD' };
            case 'group-add-confirm': return { className: 'action-group-mode confirm', text: 'CONFIRM' };
            case 'delete': return { className: 'action-delete', text: 'DELETE' };
            case 'delete-confirm': return { className: 'action-delete confirm', text: 'CONFIRM' };
            case 'add': return { className: 'action-add', text: 'ADD' };
            case 'add-confirm': return { className: 'action-add confirm', text: 'CONFIRM' };
            default: return { className: 'action-select-none', text: 'SELECT ITEM', disabled: true };
        }
    };

    const handleClick = () => {
        if (actionState === 'select-none') return;
        
        if (actionState === 'group-delete') { setActionState('group-delete-confirm'); return; }
        if (actionState === 'group-delete-confirm') {
            if (selectedGroupContext && selectedGroupContext !== 'UNGROUPED') {
                setDevices(prev => prev.map(d => (d.group || 'UNGROUPED').toUpperCase() === selectedGroupContext ? { ...d, group: 'UNGROUPED' } : d));
                setGroupSettings(prev => { const next = { ...prev }; delete next[selectedGroupContext]; return next; });
            }
            deviceState.setSearchFilter('');
            deviceState.setSelectedGroupContext(null);
            setActionState('select-none');
            return;
        }

        if (actionState === 'group-add') { setActionState('group-add-confirm'); return; }
        if (actionState === 'group-add-confirm') {
            if (pendingGroupName) {
                const exactG = pendingGroupName.trim();
                const cleanG = exactG.toUpperCase();
                if (!deviceState.groupExists(cleanG)) {
                    setGroupSettings(prev => ({ ...prev, [cleanG]: { colorTag: '', originalName: exactG, description: '' } }));
                }
            }
            deviceState.setPendingGroupName(null);
            deviceState.setSearchFilter('');
            setActionState('select-none');
            return;
        }

        if (actionState === 'delete') { setActionState('delete-confirm'); return; }
        if (actionState === 'delete-confirm') {
            deleteDevice(selectedDeviceId);
            deviceState.setSelectedDeviceId(null);
            if (!selectedGroupContext) deviceState.setSearchFilter('');
            setActionState('select-none');
            return;
        }

        if (actionState === 'add') { setActionState('add-confirm'); return; }
        if (actionState === 'add-confirm') {
            if (pendingAddIp && deviceState.validIP(pendingAddIp) && !deviceState.ipTaken(pendingAddIp)) {
                addDevice(pendingAddIp);
            }
            deviceState.setPendingAddIp(null);
            deviceState.setSearchFilter('');
            setActionState('select-none');
            return;
        }
    };

    const props = getBtnProps();

    return (
        <div className={`action-container ${isVisible ? 'visible' : ''}`}>
            <button 
                id="actionButton"
                className={`action-btn ${props.className}`} 
                onClick={handleClick}
                disabled={props.disabled}
            >
                {props.text}
            </button>
        </div>
    );
};

export default BottomActionBtn;