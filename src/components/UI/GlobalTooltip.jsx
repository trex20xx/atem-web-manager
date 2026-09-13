import React, { useEffect, useRef } from 'react';

// =========================================================================
// ATEM WEB MANAGER - GLOBAL TOOLTIP (v3.01)
// =========================================================================

export default function GlobalTooltip() {
    const tooltipRef = useRef(null);

    useEffect(() => {
        const updatePosition = (target) => {
            const tip = tooltipRef.current;
            if (!tip || !target) return;

            const rect = target.getBoundingClientRect();
            const tipWidth = tip.offsetWidth || 160;
            const tipHeight = tip.offsetHeight || 36;
            const margin = 12;

            let left = rect.left + (rect.width / 2) - (tipWidth / 2);
            if (left < margin) {
                left = margin;
            } else if (left + tipWidth > window.innerWidth - margin) {
                left = window.innerWidth - tipWidth - margin;
            }

            let top = rect.bottom + 8;
            if (top + tipHeight > window.innerHeight - margin) {
                top = rect.top - tipHeight - 8;
            }

            tip.style.left = `${Math.round(left)}px`;
            tip.style.top = `${Math.round(top)}px`;
        };

        const onMouseOver = (e) => {
            const target = e.target.closest('[data-description]');
            if (target && target.dataset.description && tooltipRef.current) {
                const desc = target.dataset.description;
                const note = target.dataset.note;

                if (note && note.trim() !== '') {
                    tooltipRef.current.innerHTML = `<div class="tooltip-title">${desc}</div><div class="tooltip-divider"></div><div class="tooltip-note">${note}</div>`;
                } else {
                    tooltipRef.current.innerHTML = `<div class="tooltip-title" style="margin:0">${desc}</div>`;
                }

                tooltipRef.current.style.display = 'block';
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