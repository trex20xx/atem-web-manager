import React, { useState, useEffect, useRef } from 'react';
import { APP_VERSION } from '../../version';

// =========================================================================
// ATEM WEB MANAGER - CONSOLE PANEL (v3.81)
// =========================================================================
// Features Pandorum/Orbitron typography standby screen, full-height log layout,
// inline ALL source activation, adjacent device filter/export controls,
// and subtle LCD screen shader overlay support.

let globalBridgeLogs = [];
const MAX_LOG_HISTORY = 400;

const ConsolePanel = ({ 
    activeDeviceIp = '192.168.10.240', 
    isConnected = false, 
    consoleFont = 'Pandorum', 
    consoleLcdEffect = false 
}) => {
    const [logs, setLogs] = useState(() => [...globalBridgeLogs]);
    const [showAllDevices, setShowAllDevices] = useState(false);
    const [filters, setFilters] = useState({ 
        USER: true, 
        ATEM: true, 
        BRIDGE: true, 
        SYSTEM: true 
    });
    
    const endRef = useRef(null);
    const bodyRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        const wsUrl = 'ws://localhost:8080';
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'LOG') {
                    const src = data.source || 'BRIDGE';
                    const enriched = { 
                        ...data, 
                        source: src, 
                        ip: data.ip || (src === 'SYSTEM' ? 'SYSTEM' : '192.168.10.240') 
                    };

                    const lastLog = globalBridgeLogs[globalBridgeLogs.length - 1];
                    const isDuplicate = lastLog && 
                        lastLog.source === enriched.source && 
                        lastLog.message === enriched.message && 
                        (enriched.timestamp - lastLog.timestamp) < 250;

                    if (!isDuplicate) {
                        globalBridgeLogs.push(enriched);
                        if (globalBridgeLogs.length > MAX_LOG_HISTORY) {
                            globalBridgeLogs.shift();
                        }
                        setLogs([...globalBridgeLogs]);
                    }
                }
            } catch (err) {}
        };

        const handleSysLog = (e) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ action: 'SYSTEM_LOG', message: e.detail }));
            }
        };

        window.addEventListener('atem:system-log', handleSysLog);

        return () => {
            window.removeEventListener('atem:system-log', handleSysLog);
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (endRef.current && isConnected) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isConnected]);

    const toggleFilter = (f) => {
        setFilters(prev => ({ ...prev, [f]: !prev[f] }));
    };

    const handleEnableAllSources = () => {
        setFilters({ USER: true, ATEM: true, BRIDGE: true, SYSTEM: true });
    };

    const areAllSourcesActive = filters.USER && filters.ATEM && filters.BRIDGE && filters.SYSTEM;

    const currentIp = activeDeviceIp || '192.168.10.240';
    
    const visibleLogs = logs.filter(log => {
        if (!showAllDevices && log.source !== 'SYSTEM') {
            if (log.ip && log.ip !== 'SYSTEM' && log.ip !== currentIp) {
                return false;
            }
        }
        return filters[log.source];
    });

    const handleExport = () => {
        const textContent = visibleLogs.map(log => {
            const timeStr = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
            return '[' + timeStr + '] [' + log.source + '] ' + log.message;
        }).join('\r\n');

        const pad = (n) => String(n).padStart(2, '0');
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = pad(now.getMonth() + 1);
        const dd = pad(now.getDate());
        const hh = pad(now.getHours());
        const min = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        const timestampStr = yyyy + '-' + mm + '-' + dd + '_' + hh + '-' + min + '-' + ss;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'ATEM_WEB_MANAGER_' + timestampStr + '.txt';
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!isConnected) {
        return (
            <div className="quadrant-master-panel">
                <div className="panel-layout-frame" style={{ justifyContent: 'flex-start', height: '100%' }}>
                    <div className="macro-compact-header-row">
                        <span className="atem-section-title">CONSOLE</span>
                    </div>
                    <div className={'macro-section-box console-box ' + (consoleLcdEffect ? 'console-lcd-effect' : '')} style={{ flex: 1, minHeight: 0, padding: '12px' }}>
                        <div className="console-standby-container">
                            <div className="console-standby-title" style={{ fontFamily: consoleFont + ', Orbitron, Oxanium, sans-serif' }}>
                                ATEM WEB MANAGER
                            </div>
                            <div className="console-standby-version">
                                {APP_VERSION}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quadrant-master-panel">
            <div className="panel-layout-frame" style={{ justifyContent: 'flex-start', height: '100%' }}>
                <div className="macro-compact-header-row">
                    <div className="macro-title-group">
                        <span className="atem-section-title">CONSOLE</span>
                    </div>
                    <div className="macro-actions-group">
                        <button 
                            className={'macro-action-text-btn ' + (areAllSourcesActive ? 'active-white' : '')} 
                            onClick={handleEnableAllSources}
                            title="Enable all log sources"
                        >
                            ALL
                        </button>
                        <button 
                            className={'macro-action-text-btn ' + (filters.USER ? 'active-user' : '')} 
                            onClick={() => toggleFilter('USER')}
                        >
                            USER
                        </button>
                        <button 
                            className={'macro-action-text-btn ' + (filters.ATEM ? 'active-atem' : '')} 
                            onClick={() => toggleFilter('ATEM')}
                        >
                            ATEM
                        </button>
                        <button 
                            className={'macro-action-text-btn ' + (filters.BRIDGE ? 'active-bridge' : '')} 
                            onClick={() => toggleFilter('BRIDGE')}
                        >
                            BRIDGE
                        </button>
                        <button 
                            className={'macro-action-text-btn ' + (filters.SYSTEM ? 'active-system' : '')} 
                            onClick={() => toggleFilter('SYSTEM')}
                        >
                            SYSTEM
                        </button>
                        <span style={{ color: 'var(--atem-border)', margin: '0 2px' }}>|</span>
                        <button 
                            className={'macro-action-text-btn ' + (showAllDevices ? 'active-white' : '')} 
                            onClick={() => setShowAllDevices(prev => !prev)}
                            title="Toggle between active connected device and all devices"
                        >
                            {showAllDevices ? 'ALL DEVICES' : 'CURRENT'}
                        </button>
                        <button className="macro-action-text-btn" onClick={handleExport}>
                            EXPORT
                        </button>
                    </div>
                </div>
                <div className={'macro-section-box console-box ' + (consoleLcdEffect ? 'console-lcd-effect' : '')} style={{ flex: 1, minHeight: 0, padding: '8px' }}>
                    <div className="console-body" ref={bodyRef}>
                        {visibleLogs.map((log, i) => {
                            const time = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
                            const srcClass = 'src-' + log.source.toLowerCase();
                            return (
                                <div key={i} className="log-line">
                                    <span className="log-time">{'[' + time + ']'}</span>
                                    <span className={'log-source ' + srcClass}>{'[' + log.source + ']'}</span>
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