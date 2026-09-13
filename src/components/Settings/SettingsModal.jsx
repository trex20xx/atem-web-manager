import React, { useState, useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - SETTINGS MODAL (v3.12)
// =========================================================================

const QUAD_SELECT_OPTIONS = [
    { id: 1, name: '1. STREAM' },
    { id: 2, name: '2. MEDIA POOL' },
    { id: 3, name: '3. MIXER' },
    { id: 5, name: '4. MACROS' },
    { id: 0, name: 'NONE' }
];

const SettingsModal = ({ 
    isOpen, onClose, theme, setTheme, panelRadius, setPanelRadius, tallyOpacity, setTallyOpacity,
    titlePosition, setTitlePosition, showVersion, setShowVersion,
    enableDragDrop, setEnableDragDrop, enableQuadrantDrag, setEnableQuadrantDrag,
    showActionButton, setShowActionButton, forceUppercase, setForceUppercase, 
    currentVideoSource, setCurrentVideoSource, quadrantOrder, setQuadrantOrder, 
    sidebarVariant, setSidebarVariant, useDeviceCsv, setUseDeviceCsv,
    deviceCsvContent, setDeviceCsvContent
}) => {
    const modalRef = useRef(null);
    const [activeTab, setActiveTab] = useState('general');
    const [isDragging, setIsDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) return;
        setIsDragging(true);
        const rect = modalRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        };
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.userSelect = '';
        };
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        if (isOpen) setPos({ x: 0, y: 0 });
    }, [isOpen]);

    if (!isOpen) return null;

    const handleQuadrantChange = (index, value) => {
        const newVal = Number(value);
        const newOrder = [...quadrantOrder];
        
        // Enforce exclusivity: if selecting an active panel, clear it from any other quadrant
        if (newVal !== 0) {
            for (let i = 0; i < newOrder.length; i++) {
                if (i !== index && newOrder[i] === newVal) {
                    newOrder[i] = 0;
                }
            }
        }

        newOrder[index] = newVal;
        setQuadrantOrder(newOrder);
    };

    const handleCsvFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                setDeviceCsvContent(evt.target.result);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="settings-overlay show">
            <div 
                className="settings-modal" 
                ref={modalRef}
                style={pos.x !== 0 ? { position: 'absolute', left: pos.x, top: pos.y, margin: 0 } : {}}
            >
                <div className="davinci-header-bar" onMouseDown={handleMouseDown}>
                    <button className="modal-close-x" onClick={onClose}>&times;</button>
                    <div className="settings-title">Settings</div>
                    <div style={{ width: '24px' }}></div>
                </div>
                
                <div className="davinci-body-layout">
                    <div className="davinci-sidebar-tabs">
                        <button className={`davinci-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
                        <button className={`davinci-tab ${activeTab === 'streams' ? 'active' : ''}`} onClick={() => setActiveTab('streams')}>Streams (CSV)</button>
                        <button className={`davinci-tab ${activeTab === 'multiview' ? 'active' : ''}`} onClick={() => setActiveTab('multiview')}>Multiview</button>
                    </div>
                    
                    <div className="davinci-content-pane active">
                        {activeTab === 'general' && (
                            <>
                                <div className="setting-group">
                                    <label>Stream / Video URL:</label>
                                    <div className="setting-group-control">
                                        <input type="text" value={currentVideoSource} onChange={e => setCurrentVideoSource(e.target.value)} />
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Title Position:</label>
                                    <div className="setting-group-control">
                                        <select value={titlePosition} onChange={e => setTitlePosition(e.target.value)}>
                                            <option value="left">Left</option>
                                            <option value="centered">Center</option>
                                            <option value="right">Right</option>
                                            <option value="off">Off</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Color Theme:</label>
                                    <div className="setting-group-control">
                                        <select value={theme} onChange={e => setTheme(e.target.value)}>
                                            <option value="default">Dark (Default)</option>
                                            <option value="light">Light UI</option>
                                            <option value="monokai">Monokai</option>
                                            <option value="dracula">Dracula</option>
                                            <option value="onedark">One Dark Pro</option>
                                            <option value="solarized-dark">Solarized Dark</option>
                                            <option value="github-dark">GitHub Dark</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Corner Radius ({panelRadius}px):</label>
                                    <div className="setting-group-control">
                                        <input type="range" min="0" max="24" step="1" value={panelRadius} onChange={e => setPanelRadius(e.target.value)} />
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Tally Brightness ({tallyOpacity}%):</label>
                                    <div className="setting-group-control">
                                        <input type="range" min="10" max="100" step="5" value={tallyOpacity} onChange={e => setTallyOpacity(e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ margin: '24px 0', borderTop: '1px solid var(--atem-border)' }}></div>
                                
                                <div className="setting-group">
                                    <label>Sidebar Design:</label>
                                    <div className="setting-group-control">
                                        <select value={sidebarVariant} onChange={e => setSidebarVariant(e.target.value)}>
                                            <option value="classic">Classic (Solid)</option>
                                            <option value="floating">Floating (Glass)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Enable Drag & Drop:</label>
                                    <div className="setting-group-control">
                                        <input type="checkbox" className="toggle-switch" checked={enableDragDrop} onChange={e => setEnableDragDrop(e.target.checked)} />
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Show Action Button:</label>
                                    <div className="setting-group-control">
                                        <input type="checkbox" className="toggle-switch" checked={showActionButton} onChange={e => setShowActionButton(e.target.checked)} />
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Show Version Number:</label>
                                    <div className="setting-group-control">
                                        <input type="checkbox" className="toggle-switch" checked={showVersion} onChange={e => setShowVersion(e.target.checked)} />
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <label>Force Uppercase:</label>
                                    <div className="setting-group-control">
                                        <input type="checkbox" className="toggle-switch" checked={forceUppercase} onChange={e => setForceUppercase(e.target.checked)} />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'streams' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="setting-group" style={{ justifyContent: 'flex-start', margin: 0 }}>
                                    <label style={{ flex: 'none', textAlign: 'left', marginRight: '16px' }}>Use Per-Device CSV Streams:</label>
                                    <div className="setting-group-control" style={{ flex: 'none' }}>
                                        <input type="checkbox" className="toggle-switch" checked={useDeviceCsv} onChange={e => setUseDeviceCsv(e.target.checked)} />
                                    </div>
                                </div>
                                <div style={{ color: 'var(--muted)', fontSize: '11px', lineHeight: '1.4' }}>
                                    When enabled, connecting to a device automatically loads its mapped stream URL from the CSV table below. Format: <code style={{ color: 'var(--atem-text)' }}>IP, Name, StreamURL</code>
                                </div>
                                <div className="setting-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                    <label style={{ textAlign: 'left' }}>Upload CSV File:</label>
                                    <input type="file" accept=".csv,.txt" onChange={handleCsvFileUpload} style={{ color: 'var(--atem-text)', fontSize: '12px' }} />
                                </div>
                                <div className="setting-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                    <label style={{ textAlign: 'left' }}>CSV Content Mapping:</label>
                                    <textarea 
                                        value={deviceCsvContent} 
                                        onChange={e => setDeviceCsvContent(e.target.value)}
                                        placeholder="192.168.10.240, Studio Main, https://stream.mux.com/...&#10;192.168.1.10, Camera 2, https://..."
                                        style={{ width: '100%', height: '140px', background: 'var(--atem-content)', border: '1px solid var(--atem-border)', color: 'var(--atem-text)', borderRadius: '4px', padding: '8px', fontFamily: 'monospace', fontSize: '12px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'multiview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="setting-group" style={{ justifyContent: 'flex-start', margin: 0 }}>
                                    <label style={{ flex: 'none', textAlign: 'left', marginRight: '16px' }}>Enable Quadrant Dragging:</label>
                                    <div className="setting-group-control" style={{ flex: 'none' }}>
                                        <input type="checkbox" className="toggle-switch" checked={enableQuadrantDrag} onChange={e => setEnableQuadrantDrag(e.target.checked)} />
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--atem-border)' }}></div>
                                <div style={{ color: 'var(--atem-text)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Quadrant Order</div>
                                <div className="quadrant-grid-wrapper">
                                    <div className="quad-row">
                                        <div className="quad-box">
                                            <span>Top Left (Q1)</span>
                                            <select value={quadrantOrder[0]} onChange={e => handleQuadrantChange(0, e.target.value)}>
                                                {QUAD_SELECT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="quad-box">
                                            <span>Top Right (Q2)</span>
                                            <select value={quadrantOrder[1]} onChange={e => handleQuadrantChange(1, e.target.value)}>
                                                {QUAD_SELECT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="quad-row">
                                        <div className="quad-box">
                                            <span>Bottom Left (Q3)</span>
                                            <select value={quadrantOrder[2]} onChange={e => handleQuadrantChange(2, e.target.value)}>
                                                {QUAD_SELECT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="quad-box">
                                            <span>Bottom Right (Q4)</span>
                                            <select value={quadrantOrder[3]} onChange={e => handleQuadrantChange(3, e.target.value)}>
                                                {QUAD_SELECT_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="settings-footer">
                    <button className="atem-btn" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;