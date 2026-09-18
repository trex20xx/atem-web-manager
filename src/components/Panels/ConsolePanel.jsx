import React, { useState, useEffect, useRef } from 'react';
import { APP_VERSION } from '../../version';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// =========================================================================
// ATEM WEB MANAGER - CONSOLE PANEL (v3.89)
// =========================================================================

let globalBridgeLogs = [];
const MAX_LOG_HISTORY = 400;

const formatLocalTime = (ts, mode) => {
    if (mode === 'none') return '';
    const d = new Date(ts);
    const pad = (n, len = 2) => String(n).padStart(len, '0');
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    if (mode === 'no-ms') {
        return `[${hh}:${mm}:${ss}]`;
    }
    const ms = pad(d.getMilliseconds(), 3);
    return `[${hh}:${mm}:${ss}.${ms}]`;
};

const formatPrettyMessage = (msg) => {
    if (typeof msg !== 'string') return String(msg);
    if (msg.includes('source set to') || msg.includes('Set ') || msg.includes('routed to') || msg.includes('set to Input')) {
        return msg;
    }
    if (msg.includes('Routed Media Player') && msg.includes('{')) {
        try {
            const match = msg.match(/Routed Media Player (\d+) source: (\{.*\})/);
            if (match) {
                const pNum = match[1];
                const obj = JSON.parse(match[2]);
                const isStill = obj.sourceType === 1 || obj.stillIndex !== undefined;
                const idx = isStill ? ((obj.stillIndex || 0) + 1) : ((obj.clipIndex || 0) + 1);
                return `MP${pNum} source set to ${isStill ? 'Still' : 'Clip'} ${idx}`;
            }
        } catch(e) {}
    }
    return msg;
};

const ConsolePanel = ({ 
    activeDeviceIp = '192.168.10.240', 
    isConnected = false, 
    consoleFont = 'Pandorum', 
    consoleLcdEffect = false 
}) => {
    const [logs, setLogs] = useState(() => [...globalBridgeLogs]);
    const [showAllDevices, setShowAllDevices] = useState(false);
    const [isCleared, setIsCleared] = useState(false);
    const [clearTimestamp, setClearTimestamp] = useState(0);
    const [timeMode, setTimeMode] = useState('full'); // 'full' -> 'no-ms' -> 'none'
    const [filters, setFilters] = useState({ 
        USER: true, 
        ATEM: true, 
        BRIDGE: true, 
        SYSTEM: true 
    });

    const [localLcdSheen] = useLocalStorage('atem_consoleLcdSheen', false);
    const [localLcdEffect] = useLocalStorage('atem_consoleLcdEffect', false);

    const isScanlines = consoleLcdEffect || localLcdEffect;
    const isSheen = localLcdSheen;
    
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

    const handleClearReset = () => {
        if (isCleared) {
            setIsCleared(false);
            setClearTimestamp(0);
        } else {
            setIsCleared(true);
            setClearTimestamp(Date.now());
        }
    };

    const handleTimeCycle = () => {
        if (timeMode === 'full') setTimeMode('no-ms');
        else if (timeMode === 'no-ms') setTimeMode('none');
        else setTimeMode('full');
    };

    const areAllSourcesActive = filters.USER && filters.ATEM && filters.BRIDGE && filters.SYSTEM;
    const currentIp = activeDeviceIp || '192.168.10.240';
    
    const visibleLogs = logs.filter(log => {
        if (isCleared && log.timestamp <= clearTimestamp) return false;
        
        if (!showAllDevices && log.source !== 'SYSTEM') {
            if (log.ip && log.ip !== 'SYSTEM' && log.ip !== currentIp) {
                return false;
            }
        }
        return filters[log.source];
    });

    const handleExport = () => {
        const textContent = logs.filter(log => {
            if (!showAllDevices && log.source !== 'SYSTEM' && log.ip !== 'SYSTEM' && log.ip !== currentIp) return false;
            return filters[log.source];
        }).map(log => {
            const timeStr = formatLocalTime(log.timestamp, 'full');
            return timeStr + ' [' + log.source + '] ' + formatPrettyMessage(log.message);
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

    const boxClasses = [
        'macro-section-box',
        'console-box',
        isScanlines ? 'console-lcd-scanlines' : '',
        isSheen ? 'console-glossy-dark' : ''
    ].filter(Boolean).join(' ');

    if (!isConnected) {
        return (
            <div className="quadrant-master-panel">
                <div className="panel-layout-frame" style={{ justifyContent: 'flex-start', height: '100%' }}>
                    <div className="macro-compact-header-row">
                        <span className="atem-section-title">CONSOLE</span>
                    </div>
                    <div className={boxClasses} style={{ flex: 1, minHeight: 0, padding: '12px' }}>
                        {isSheen && <div className="console-lcd-reflection" />}
                        <div className="console-standby-container">
                            <div className="console-standby-title" style={{ fontFamily: `"${consoleFont}", Orbitron, Oxanium, sans-serif`, color: 'var(--muted)', opacity: 0.35 }}>
                                ATEM WEB MANAGER
                            </div>
                            <div className="console-standby-version" style={{ color: 'var(--muted)', opacity: 0.35 }}>
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
                        {!areAllSourcesActive && (
                            <button 
                                className="macro-action-text-btn" 
                                onClick={handleEnableAllSources}
                                title="Enable all log sources"
                            >
                                ALL
                            </button>
                        )}
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
                        <button 
                            className={'macro-action-text-btn ' + (timeMode !== 'full' ? 'active-orange' : '')}
                            style={{ color: timeMode === 'full' ? '#5c6370' : undefined }}
                            onClick={handleTimeCycle}
                            title="Cycle timestamps: Full [HH:MM:SS.mmm] -> Seconds [HH:MM:SS] -> Hidden"
                        >
                            TIME
                        </button>
                        <span style={{ color: 'var(--atem-border)', margin: '0 4px', display: 'inline-flex', alignItems: 'center', height: '14px', lineHeight: '14px' }}>|</span>
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
                        <button className={'macro-action-text-btn ' + (isCleared ? 'active-red' : '')} onClick={handleClearReset}>
                            {isCleared ? 'RESET' : 'CLEAR'}
                        </button>
                    </div>
                </div>
                <div className={boxClasses} style={{ flex: 1, minHeight: 0, padding: '8px' }}>
                    {isSheen && <div className="console-lcd-reflection" />}
                    <div className="console-body selectable" ref={bodyRef}>
                        {visibleLogs.map((log, i) => {
                            const timeStr = formatLocalTime(log.timestamp, timeMode);
                            const srcClass = 'src-' + log.source.toLowerCase();
                            const prettyMsg = formatPrettyMessage(log.message);
                            return (
                                <div key={i} className="log-line">
                                    {timeMode !== 'none' && <span className="log-time">{timeStr}</span>}
                                    <span className={'log-source ' + srcClass}>{'[' + log.source + ']'}</span>
                                    <span className="log-msg">{prettyMsg}</span>
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