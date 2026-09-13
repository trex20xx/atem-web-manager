import React, { useState, useEffect } from 'react';

// =========================================================================
// ATEM WEB MANAGER - SEARCH BAR (v1.75)
// =========================================================================

const SearchBar = ({ deviceState, showActionButton }) => {
    const { searchFilter, setSearchFilter, devices, validIP, ipTaken, groupExists, setActionState, setPendingAddIp, setPendingGroupName, setSelectedDeviceId, setSelectedGroupContext, setEditingId, setEditingGroupContext, addDevice } = deviceState;
    const [inputValue, setInputValue] = useState('');
    const [isInvalid, setIsInvalid] = useState(false);

    // Sync input with search filter if cleared externally
    useEffect(() => {
        if (searchFilter === '') {
            setInputValue('');
            setIsInvalid(false);
        }
    }, [searchFilter]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && showActionButton) {
            const query = inputValue.trim();
            if (validIP(query) && !ipTaken(query)) {
                addDevice(query);
                setInputValue('');
                setSearchFilter('');
                setIsInvalid(false);
                setActionState('select-none');
            }
        }
    };

    const handleInput = (e) => {
        const query = e.target.value.trim();
        setInputValue(query);
        setSearchFilter(query.toLowerCase());
        setEditingId(null);
        setEditingGroupContext(null);
        setIsInvalid(false);
        setSelectedGroupContext(null);

        if (query === '') {
            setPendingAddIp(null);
            setPendingGroupName(null);
            setSelectedDeviceId(null);
            setActionState('select-none');
            return;
        }

        const exactMatch = devices.find(d => d.ip.toLowerCase() === query.toLowerCase() || (d.name && d.name.toLowerCase() === query.toLowerCase()));
        if (exactMatch) {
            setPendingAddIp(null);
            setPendingGroupName(null);
            setSelectedDeviceId(exactMatch.id);
            setActionState(showActionButton ? 'delete' : 'select-none');
            return;
        }

        setSelectedDeviceId(null);
        if (/^[0-9.]+$/.test(query)) {
            if (query.split('.').length === 4 && validIP(query)) {
                if (ipTaken(query)) {
                    setIsInvalid(true);
                    setPendingAddIp(null);
                    setActionState('select-none');
                    return;
                }
                setPendingAddIp(query);
                setActionState(showActionButton ? 'add' : 'select-none');
                return;
            }
            setIsInvalid(!/^(\d{1,3}\.?){1,4}$/.test(query) || !query.split('.').every(s => s === '' || Number(s) <= 255));
            setPendingAddIp(null);
            setActionState('select-none');
            return;
        }

        if (groupExists(query)) {
            setPendingGroupName(query);
            setPendingAddIp(null);
            setSelectedGroupContext(query.toUpperCase());
            if (query.toUpperCase() === 'UNGROUPED') setActionState('select-none');
            else setActionState(showActionButton ? 'group-delete' : 'select-none');
        } else {
            setPendingGroupName(query);
            setPendingAddIp(null);
            setActionState(showActionButton ? 'group-add' : 'select-none');
        }
    };

    return (
        <div className="search-container">
            <input 
                className={`search ${isInvalid ? 'invalid' : ''}`} 
                type="text" 
                placeholder={/^[0-9.]+$/.test(inputValue) || inputValue === '' ? "Search..." : "Add or type group name..."} 
                autoComplete="off" 
                spellCheck="false"
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default SearchBar;