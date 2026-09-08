import { useState, useRef, useCallback } from 'react';

// =========================================================================
// ATEM WEB MANAGER - USE DEVICES HOOK (v1.75)
// =========================================================================
// Manages the global state for devices, groups, and the action button logic.

export const mutedColors = [
    { name: 'Default Grey', hex: '' },
    { name: 'Muted Red', hex: '#8a4b48' },
    { name: 'Pastel Orange', hex: '#a66332' },
    { name: 'Gold Yellow', hex: '#8a701a' },
    { name: 'Pastel Green', hex: '#487540' },
    { name: 'Muted Teal', hex: '#316361' },
    { name: 'Pastel Blue', hex: '#3b5f94' },
    { name: 'Muted Purple', hex: '#6355b8' },
    { name: 'Pastel Pink', hex: '#8c4468' },
    { name: 'Muted Brown', hex: '#6e5138' },
    { name: 'Slate Gray', hex: '#485459' },
    { name: 'Warm Gray', hex: '#595252' }
];

const initialDevices = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    ip: `192.168.1.${10 + i}`,
    name: `192.168.1.${10 + i}`,
    group: 'UNGROUPED',
    status: 'offline',
    description: '',
    colorTag: ''
}));

export function useDevices() {
    const [devices, setDevices] = useState(initialDevices);
    const [groupSettings, setGroupSettings] = useState({});
    const [nextId, setNextId] = useState(17);
    
    // UI Selection State
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [selectedGroupContext, setSelectedGroupContext] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingGroupContext, setEditingGroupContext] = useState(null);
    
    // Search & Action State
    const [searchFilter, setSearchFilter] = useState('');
    const [pendingAddIp, setPendingAddIp] = useState(null);
    const [pendingGroupName, setPendingGroupName] = useState(null);
    
    // Bottom Action Button State Logic
    const [actionState, _setActionState] = useState('select-none');
    const actionTimerRef = useRef(null);

    // Validation Helpers
    const validIP = useCallback((ip) => /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip), []);
    const ipTaken = useCallback((ip, excludeId) => devices.some(d => d.ip === ip && d.id !== excludeId), [devices]);
    const groupExists = useCallback((name) => {
        const clean = name.trim().toUpperCase();
        return groupSettings[clean] !== undefined || devices.some(d => (d.group || 'UNGROUPED').toUpperCase() === clean && d.ip !== '0.0.0.0');
    }, [groupSettings, devices]);

    // [LOCKED] 3-State Action Button Timeout Logic
    const setActionState = useCallback((state) => {
        if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
        _setActionState(state);
        
        // ONLY confirm states have a timeout. They revert to their base state after 3 seconds.
        if (state.endsWith('-confirm')) {
            actionTimerRef.current = setTimeout(() => {
                _setActionState(state.replace('-confirm', ''));
            }, 3000);
        }
    }, []);

    const addDevice = (ip) => {
        setDevices(prev => [...prev, { id: nextId, ip, name: ip, group: 'UNGROUPED', status: 'offline', dateAdded: Date.now(), colorTag: '', description: '' }]);
        setNextId(prev => prev + 1);
    };

    const deleteDevice = (id) => {
        setDevices(prev => prev.filter(d => d.id !== id));
    };

    const connectDevice = (id) => {
        setDevices(prev => prev.map(d => {
            if (d.id === id) return { ...d, status: d.status === 'online' ? 'offline' : 'online', lastConnected: Date.now() };
            return { ...d, status: 'offline' };
        }));
    };

    return {
        devices, setDevices,
        groupSettings, setGroupSettings,
        selectedDeviceId, setSelectedDeviceId,
        selectedGroupContext, setSelectedGroupContext,
        editingId, setEditingId,
        editingGroupContext, setEditingGroupContext,
        searchFilter, setSearchFilter,
        pendingAddIp, setPendingAddIp,
        pendingGroupName, setPendingGroupName,
        actionState, setActionState,
        validIP, ipTaken, groupExists,
        addDevice, deleteDevice, connectDevice
    };
}