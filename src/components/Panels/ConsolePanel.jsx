import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - CONSOLE PANEL (v3.78)
// =========================================================================
// Features persistent module-level log buffering to ensure historical entries
// are never purged when swapping quadrant assignments. 
// Includes an inline sliding multi-source filter tray (USER, ATEM, BRIDGE, SYSTEM)
// and strict color mapping to mute visual noise while preserving hierarchy.

let globalBridgeLogs = [];
const MAX_LOG_HISTORY = 350;

const ConsolePanel = () => {
    const [logs, setLogs] = useState(() => [...globalBridgeLogs]);
    const [filters, setFilters] = useState({ USER: true, ATEM: true, BRIDGE: true, SYSTEM: true });
    const [filtersOpen, setFiltersOpen] = useState(false);
    
    const endRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'LOG') {
                    // Fallback to BRIDGE if source is somehow missing
                    const src = data.source || 'BRIDGE';
                    const enriched = { ...data, source: src };
                    globalBridgeLogs.push(enriched);
                    if (globalBridgeLogs.length > MAX_LOG_HISTORY) {
                        globalBridgeLogs.shift();
                    }
                    setLogs([...globalBridgeLogs]);
                }
            } catch (err) {}
        };

        const handleSysLog = (e) => {
            const data = {
                type: 'LOG',
                level: 'info',
                source: 'SYSTEM',
                message: e.detail,
                timestamp: Date.now()
            };
            globalBridgeLogs.push(data);
            if (globalBridgeLogs.length > MAX_LOG_HISTORY) {
                globalBridgeLogs.shift();
            }
            setLogs([...globalBridgeLogs]);
            
            // Forward to bridge so all clients sync
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ action: 'SYSTEM_LOG', message: e.detail }));
            }
        };

        window.addEventListener('atem:system-log', handleSysLog);

        return () => {
            window.removeEventListener('atem:system-log', handleSysLog);
            ws.close();
        };
    }, []);

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const toggleFilter = (f) => {
        setFilters(prev => ({ ...prev, [f]: !prev[f] }));
    };

    const visibleLogs = logs.filter(log => filters[log.source]);

    const handleExport = () => {
        const textContent = visibleLogs.map(log => {
            const timeStr = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
            return `[${timeStr}] [${log.source}] ${log.message}`;
        }).join('\r\n');

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `atem-bridge-logs-${Date.now()}.txt`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="quadrant-master-panel">
            <div className="panel-layout-frame" style={{ justifyContent: 'flex-start' }}>
                <div className="macro-compact-header-row">
                    <div className="macro-title-group">
                        <span className="atem-section-title">BRIDGE CONSOLE</span>
                    </div>
                    <div className="macro-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={`console-filter-tray ${filtersOpen ? 'open' : ''}`}>
                            {['USER', 'ATEM', 'BRIDGE', 'SYSTEM'].map(src => (
                                <button 
                                    key={src} 
                                    className={`filter-tag ${filters[src] ? 'active' : ''} tag-${src.toLowerCase()}`} 
                                    onClick={() => toggleFilter(src)}
                                >
                                    {src}
                                </button>
                            ))}
                        </div>
                        <button className={`macro-action-text-btn ${filtersOpen ? 'active-orange' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
                            FILTER
                        </button>
                        <button className="macro-action-text-btn" onClick={handleExport}>
                            EXPORT
                        </button>
                    </div>
                </div>
                <div className="macro-section-box" style={{ flex: 1, minHeight: 0, padding: '8px' }}>
                    <div className="console-body" ref={bodyRef} style={{ height: '360px', overflowY: 'auto' }}>
                        {visibleLogs.map((log, i) => {
                            const time = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
                            const srcClass = `src-${log.source.toLowerCase()}`;
                            return (
                                <div key={i} className="log-line">
                                    <span className="log-time">[{time}]</span>
                                    <span className={`log-source ${srcClass}`}>[{log.source}]</span>
                                    <span className="log-msg">{log.message}</span>
                                </div>
                            );
                        })}
                        <div ref={endRef} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsolePanel;