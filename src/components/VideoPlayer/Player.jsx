import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import OverlayDrawer from './OverlayDrawer';
import QualityMenu from './QualityMenu';
import { takeSnapshot } from './SnapshotEngine';

// =========================================================================
// ATEM WEB MANAGER - PLAYER COMPONENT (v1.75)
// =========================================================================

// Global memory for video state retention during quadrant swapping
let globalVideoState = { time: 0, paused: true };

// Register Custom Video.js Buttons Once
if (typeof videojs !== 'undefined' && !videojs.getComponent('QualityBtn')) {
    const Button = videojs.getComponent('Button');

    class QualityBtn extends Button {
        createEl() {
            const el = super.createEl('button', { className: 'vjs-quality-btn vjs-control vjs-button', title: 'Video Quality' });
            el.innerHTML = `<span class="vjs-icon-placeholder" style="display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg></span>`;
            return el;
        }
        handleClick(e) {
            if(e) e.stopPropagation();
            this.player().el().dispatchEvent(new CustomEvent('toggle-quality-panel', { bubbles: true }));
        }
    }
    videojs.registerComponent('QualityBtn', QualityBtn);

    class OverlayBtn extends Button {
        createEl() {
            const el = super.createEl('button', { className: 'vjs-overlay-btn vjs-control vjs-button', title: 'Overlay Tools' });
            el.innerHTML = `<span class="vjs-icon-placeholder" style="display:flex;align-items:center;justify-content:center;"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/></svg></span>`;
            return el;
        }
        handleClick(e) {
            if(e) e.stopPropagation();
            this.player().el().dispatchEvent(new CustomEvent('toggle-overlay-panel', { bubbles: true }));
        }
    }
    videojs.registerComponent('OverlayBtn', OverlayBtn);
}

const Player = ({ currentVideoSource }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const wrapperRef = useRef(null);
    const imgRef = useRef(null);
    
    // Panel Toggles
    const [showOverlay, setShowOverlay] = useState(false);
    const [showQuality, setShowQuality] = useState(false);
    
    // Wipe State
    const [wipeState, setWipeState] = useState({ clipH: 0, clipV: 0, revH: false, revV: false, opacity: 40 });
    const [overlayImg, setOverlayImg] = useState(null);
    const [overlaySrc, setOverlaySrc] = useState('');

    useEffect(() => {
        if (!videoRef.current) return;

        const isYT = currentVideoSource.includes('youtube') || currentVideoSource.includes('youtu.be') || currentVideoSource.length === 11;
        const ytId = isYT ? (currentVideoSource.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/) || [])[1] : null;
        const srcObj = isYT && ytId ? { type: 'video/youtube', src: `https://www.youtube.com/watch?v=${ytId}` } : { type: 'video/mp4', src: currentVideoSource };

        const player = videojs(videoRef.current, {
            techOrder: ['youtube', 'html5'],
            sources: [srcObj],
            controls: true,
            preload: 'auto',
            youtube: { ytControls: 0, customVars: { rel: 0, modestbranding: 1, playsinline: 1 } },
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'customControlSpacer',
                    'fullscreenToggle'
                ],
                volumePanel: { inline: true, volumeControl: { vertical: false } }
            }
        });
        
        playerRef.current = player;

        player.ready(() => {
            if (globalVideoState.time > 0) player.currentTime(globalVideoState.time);
            if (!globalVideoState.paused) player.play().catch(()=>{});

            const cb = player.controlBar;
            if (cb) {
                const disableDrag = function() { const p = this.closest('.panel'); if(p) p.draggable = false; };
                const enableDrag = function() { const p = this.closest('.panel'); if(p) p.draggable = true; };
                const stopProp = e => e.stopPropagation();

                cb.el().onmouseenter = disableDrag;
                cb.el().onmouseleave = enableDrag;
                cb.el().onmousedown = stopProp;
                cb.el().ontouchstart = stopProp;

                const fsBtn = cb.getChild('FullscreenToggle');
                const fsIndex = fsBtn ? cb.children().indexOf(fsBtn) : cb.children().length;
                if (!cb.getChild('QualityBtn')) cb.addChild('QualityBtn', {}, fsIndex);
                if (!cb.getChild('OverlayBtn')) cb.addChild('OverlayBtn', {}, fsIndex + 1);
            }
        });

        // Event listeners bridging Video.js UI to React State
        const handleQualityToggle = () => { setShowQuality(p => !p); setShowOverlay(false); };
        const handleOverlayToggle = () => { setShowOverlay(p => !p); setShowQuality(false); };
        
        const el = player.el();
        el.addEventListener('toggle-quality-panel', handleQualityToggle);
        el.addEventListener('toggle-overlay-panel', handleOverlayToggle);

        return () => {
            if (player && !player.isDisposed()) {
                globalVideoState.time = player.currentTime() || 0;
                globalVideoState.paused = player.paused();
                player.dispose();
            }
        };
    }, [currentVideoSource]);

    // Handle Click Outside to close panels
    useEffect(() => {
        const clickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                if (!e.target.closest('.vjs-quality-btn') && !e.target.closest('.vjs-overlay-btn')) {
                    setShowOverlay(false);
                    setShowQuality(false);
                }
            }
        };
        document.addEventListener('click', clickOutside);
        return () => document.removeEventListener('click', clickOutside);
    }, []);

    const handleResolutionSelect = (res) => {
        if (playerRef.current) {
            const ct = playerRef.current.currentTime();
            const isPaused = playerRef.current.paused();
            let newSrc = currentVideoSource.replace(/highest\.mp4|high\.mp4|medium\.mp4|low\.mp4/g, `${res}.mp4`);
            
            playerRef.current.src(newSrc);
            playerRef.current.ready(() => {
                playerRef.current.currentTime(ct);
                if (!isPaused) playerRef.current.play().catch(()=>{});
            });
        }
        setShowQuality(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOverlayImg(file);
            const reader = new FileReader();
            reader.onload = (evt) => setOverlaySrc(evt.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setOverlayImg(null);
        setOverlaySrc('');
        setWipeState({ ...wipeState, clipH: 0, clipV: 0 });
    };

    const handleSnapshot = () => {
        const videoTech = wrapperRef.current?.querySelector('video.vjs-tech');
        takeSnapshot(videoTech, imgRef.current, wipeState);
    };

    const t = wipeState.revV ? 0 : wipeState.clipV;
    const b = wipeState.revV ? wipeState.clipV : 0;
    const l = wipeState.revH ? 0 : wipeState.clipH;
    const r = wipeState.revH ? wipeState.clipH : 0;
    const clipStyle = { clipPath: `inset(${t}% ${r}% ${b}% ${l}%)` };

    return (
        <div className="stream-container" ref={wrapperRef}>
            <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-big-play-centered stream-video" crossOrigin="anonymous" playsInline></video>
            </div>
            
            <div className="stream-wipe-layer" style={clipStyle}>
                <div className="stream-overlay-layer">
                    <img 
                        ref={imgRef}
                        src={overlaySrc} 
                        className="custom-overlay-img" 
                        crossOrigin="anonymous" 
                        style={{ display: overlaySrc ? 'block' : 'none', opacity: wipeState.opacity / 100 }} 
                        alt="overlay" 
                    />
                </div>
            </div>

            <OverlayDrawer 
                show={showOverlay}
                overlayImg={overlayImg}
                onImageUpload={handleImageUpload}
                onClearImage={handleClearImage}
                wipeState={wipeState}
                setWipeState={setWipeState}
                onSnapshot={handleSnapshot}
            />

            <QualityMenu 
                show={showQuality} 
                onResolutionSelect={handleResolutionSelect} 
            />
        </div>
    );
};

export default Player;