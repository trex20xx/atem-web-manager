import React, { useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - GLOBAL TOOLTIP (v1.79)
// =========================================================================

export default function GlobalTooltip() {
    const tooltipRef = useRef(null);

    useEffect(() => {
        const onMouseOver = (e) => {
            const el = e.target.closest('[data-description]');
            if (el && el.dataset.description && tooltipRef.current) {
                tooltipRef.current.textContent = el.dataset.description;
                tooltipRef.current.style.display = 'block';
            }
        };
        const onMouseMove = (e) => {
            if (tooltipRef.current && tooltipRef.current.style.display === 'block') {
                tooltipRef.current.style.left = (e.clientX + 12) + 'px';
                tooltipRef.current.style.top = (e.clientY + 12) + 'px';
            }
        };
        const onMouseOut = (e) => {
            if (e.target.closest('[data-description]') && tooltipRef.current) {
                tooltipRef.current.style.display = 'none';
            }
        };

        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return <div ref={tooltipRef} className="global-tooltip" />;
}