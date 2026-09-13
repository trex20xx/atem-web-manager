import React from 'react';

// =========================================================================
// ATEM WEB MANAGER - OVERLAY DRAWER (v1.75)
// =========================================================================

const OverlayDrawer = ({ show, overlayImg, onImageUpload, onClearImage, wipeState, setWipeState, onSnapshot }) => {
    if (!show) return null;

    const stopProp = e => e.stopPropagation();
    const lockDrag = e => { const p = e.target.closest('.panel'); if (p) p.draggable = false; };
    const unlockDrag = e => { const p = e.target.closest('.panel'); if (p) p.draggable = true; };

    return (
        <div 
            className="stream-tools-panel show"
            onMouseDown={stopProp} onTouchStart={stopProp}
            onMouseEnter={lockDrag} onMouseLeave={unlockDrag}
        >
            <div className="stream-tools-row">
                <label className="tool-text-btn">
                    <span>{overlayImg ? overlayImg.name : 'Choose File...'}</span>
                    <input type="file" accept="image/*" onChange={onImageUpload} />
                </label>
            </div>
            <div className="stream-tools-row">
                <button className="tool-text-btn" onClick={onClearImage}>Clear Image</button>
            </div>
            <div className="stream-tools-row">
                <label>Opacity: <span>{wipeState.opacity}%</span></label>
                <input type="range" min="0" max="100" value={wipeState.opacity} onMouseDown={stopProp} onChange={e => setWipeState({...wipeState, opacity: e.target.value})} />
            </div>
            <div className="stream-tools-row">
                <label>Horizontal Split Wipe: <span>{wipeState.clipH == 0 ? 'Off' : `${wipeState.clipH}%`}</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="range" min="0" max="100" value={wipeState.clipH} style={{ flex: 1 }} onMouseDown={stopProp} onChange={e => setWipeState({...wipeState, clipH: e.target.value})} />
                    <label style={{ cursor: 'pointer', color: '#bbb' }} title="Reverse Direction">
                        <input type="checkbox" className="toggle-switch" checked={wipeState.revH} onChange={e => setWipeState({...wipeState, revH: e.target.checked})} />
                    </label>
                </div>
            </div>
            <div className="stream-tools-row">
                <label>Vertical Split Wipe: <span>{wipeState.clipV == 0 ? 'Off' : `${wipeState.clipV}%`}</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="range" min="0" max="100" value={wipeState.clipV} style={{ flex: 1 }} onMouseDown={stopProp} onChange={e => setWipeState({...wipeState, clipV: e.target.value})} />
                    <label style={{ cursor: 'pointer', color: '#bbb' }} title="Reverse Direction">
                        <input type="checkbox" className="toggle-switch" checked={wipeState.revV} onChange={e => setWipeState({...wipeState, revV: e.target.checked})} />
                    </label>
                </div>
            </div>
            <div className="stream-tools-row" style={{ marginTop: '4px' }}>
                <button className="tool-text-btn" onClick={onSnapshot} style={{ fontWeight: 600 }}>Take Snapshot</button>
            </div>
        </div>
    );
};

export default OverlayDrawer;