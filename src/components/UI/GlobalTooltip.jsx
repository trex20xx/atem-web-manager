import React, { useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - GLOBAL TOOLTIP (v2.60)
// =========================================================================
// Google AI Studio replica: Anchored directly below the mouse/element, horizontally centered,
// with left/right boundary clamping to prevent screen edge overflow.

export default function GlobalTooltip() {
    const tooltipRef = useRef(null);

    useEffect(() => {
        const updatePosition = (target) => {
            const tip = tooltipRef.current;
            if (!tip || !target) return;

            const rect = target.getBoundingClientRect();
            const tipWidth = tip.offsetWidth || 120;
            const tipHeight = tip.offsetHeight || 26;
            const margin = 12;

            // Horizontally center directly beneath the hovered element
            let left = rect.left + (rect.width / 2) - (tipWidth / 2);

            // Left/Right boundary clamping
            if (left < margin) {
                left = margin;
            } else if (left + tipWidth > window.innerWidth - margin) {
                left = window.innerWidth - tipWidth - margin;
            }

            // Anchor exactly below the element
            let top = rect.bottom + 8;
            
            // Flip above if hitting the bottom edge
            if (top + tipHeight > window.innerHeight - margin) {
                top = rect.top - tipHeight - 8;
            }

            tip.style.left = `${Math.round(left)}px`;
            tip.style.top = `${Math.round(top)}px`;
        };

        const onMouseOver = (e) => {
            const target = e.target.closest('[data-description]');
            if (target && target.dataset.description && tooltipRef.current) {
                tooltipRef.current.textContent = target.dataset.description;
                tooltipRef.current.style.display = 'block';
                // Trigger layout pass before measuring actual dimensions
                requestAnimationFrame(() => {
                    updatePosition(target);
                });
            }
        };

        const onMouseOut = (e) => {
            if (e.target.closest('[data-description]') && tooltipRef.current) {
                tooltipRef.current.style.display = 'none';
            }
        };

        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
        };
    }, []);

    return <div ref={tooltipRef} className="global-tooltip" />;
}