import React, { useState, useRef, useEffect } from 'react';
import { mutedColors } from '../../hooks/useDevices';

// =========================================================================
// ATEM WEB MANAGER - COLOR DROPDOWN (v1.75)
// =========================================================================

const ColorDropdown = ({ currentColor, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const matched = mutedColors.find(m => m.hex === currentColor);
    const label = matched ? matched.name : 'Custom';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="color-dropdown-box" ref={wrapperRef}>
            <div className="color-dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
                <div 
                    className="color-swatch-box" 
                    style={{ background: currentColor || 'transparent', border: !currentColor ? '1px solid var(--group-divider-color)' : 'none' }}
                ></div>
                <span className="color-label">{label}</span>
            </div>
            {isOpen && (
                <div className="color-dropdown-list show">
                    {mutedColors.map((c, i) => (
                        <div 
                            key={i} 
                            className="color-dropdown-option" 
                            onClick={() => { onChange(c.hex); setIsOpen(false); }}
                        >
                            <div 
                                className="color-swatch-box" 
                                style={{ background: c.hex || 'transparent', border: !c.hex ? '1px solid var(--group-divider-color)' : 'none' }}
                            ></div>
                            <span>{c.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ColorDropdown;