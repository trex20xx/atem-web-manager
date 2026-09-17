import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - CONSOLE PANEL (v3.72)
// =========================================================================
// bridge console follows the same design as the other panels in terms of corner 
// radius, padding, centering, aligning, scaling. All future panels should actually do.
// Displays detailed log streams from the ATEM switcher, including explicit buttons 
// presses, connection parameters, and includes a log exporter function.

const ConsolePanel = () => {
    const [logs, setLogs] = useState([]);
    const endRef = useRef(null);
    const bodyRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'LOG') {
                    setLogs(prev => [...prev, data].slice(-250)); // Keep last 250 rows
                }
            } catch (err) {}
        };
        return () => ws.close();
    }, []);

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const handleExport = () => {
        const textContent = logs.map(log => {
            const timeStr = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
            return `[${timeStr}] [${log.level.toUpperCase()}] ${log.message}`;
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
                    <div className="macro-actions-group">
                        <button className="macro-action-text-btn" onClick={handleExport}>EXPORT</button>
                    </div>
                </div>
                <div className="macro-section-box" style={{ flex: 1, minHeight: 0, padding: '8px' }}>
                    <div className="console-body" ref={bodyRef} style={{ height: '360px', overflowY: 'auto' }}>
                        {logs.map((log, i) => {
                            const time = new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1);
                            return (
                                <div key={i} className={`log-line log-${log.level}`}>
                                    <span className="log-time">[{time}]</span>
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