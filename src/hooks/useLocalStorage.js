import { useState, useEffect } from 'react';

// =========================================================================
// ATEM WEB MANAGER - USE LOCAL STORAGE HOOK (v1.77)
// =========================================================================
// Acts as a local database. Reads from window.localStorage on mount,
// and automatically syncs state changes back to the browser's memory.

export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        if (typeof window === "undefined") return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, value]);

    return [value, setValue];
}