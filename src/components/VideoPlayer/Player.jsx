import React, { useEffect, useRef, useState, useCallback } from 'react';
import OverlayDrawer from './OverlayDrawer';
import QualityMenu from './QualityMenu';
import { takeSnapshot } from './SnapshotEngine';

// =========================================================================
// ATEM WEB MANAGER - PLAYER COMPONENT (v3.57)
// =========================================================================
// YouTube IFrame API + HTML5 Video Engine with bespoke desktop controls.
// Features discrete muted-grey crossed-out camera placeholder when disconnected,
// and dynamic corner radius clipping matching all other quadrant windows.

const extractYouTubeId = (url) => {
    if (!url) return null;
    const str = url.trim();
    if (str.length === 11 && !str.includes('/') && !str.includes('?')) return str;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = str.match(regExp);
    return match ? match[1] : null;
};

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const paddedSecs = secs.toString().padStart(2, '0');
    if (hrs > 0) {
        const paddedMins = mins.toString().padStart(2, '0');
        return `${hrs}:${paddedMins}:${paddedSecs}`;
    }
    return `${mins}:${paddedSecs}`;
};

const Player = ({ currentVideoSource, isConnected = true }) => {
    const wrapperRef = useRef(null);
    const videoRef = useRef(null);
    const ytPlayerRef = useRef(null);
    const ytMountRef = useRef(null);
    const imgRef = useRef(null);
    const pollTimerRef = useRef(null);
    const hideTimerRef = useRef(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);

    // Overlay Tools Drawer & Quality Menu
    const [showOverlay, setShowOverlay] = useState(false);
    const [showQuality, setShowQuality] = useState(false);
    const [wipeState, setWipeState] = useState({ clipH: 0, clipV: 0, revH: false, revV: false, opacity: 40 });
    const [overlayImg, setOverlayImg] = useState(null);
    const [overlaySrc, setOverlaySrc] = useState('');

    const ytId = extractYouTubeId(currentVideoSource);
    const isYouTube = Boolean(ytId);

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        if (isPlaying && !showOverlay && !showQuality && !isVolumeHovered) {
            hideTimerRef.current = setTimeout(() => {
                setShowControls(false);
            }, 2500);
        }
    }, [isPlaying, showOverlay, showQuality, isVolumeHovered]);

    const handleMouseMove = () => {
        resetHideTimer();
    };

    const handleMouseLeave = () => {
        if (isPlaying && !showOverlay && !showQuality && !isVolumeHovered) {
            setShowControls(false);
        }
    };

    // -------------------------------------------------------------------------
    // ENGINE A: YOUTUBE IFRAME API
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!isConnected || !isYouTube) return;

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const initYT = () => {
            if (!ytMountRef.current) return;
            if (ytPlayerRef.current) {
                try { ytPlayerRef.current.destroy(); } catch (e) {}
            }

            ytPlayerRef.current = new window.YT.Player(ytMountRef.current, {
                videoId: ytId,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    enablejsapi: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    cc_load_policy: 0,
                    cc_lang_pref: 'none'
                },
                events: {
                    onReady: (e) => {
                        const dur = e.target.getDuration() || 0;
                        setDuration(dur);
                        e.target.setVolume(volume);
                        if (isMuted) e.target.mute();
                        try {
                            if (typeof e.target.unloadModule === 'function') {
                                e.target.unloadModule('captions');
                            }
                        } catch (err) {}
                    },
                    onStateChange: (e) => {
                        if (e.data === 1) {
                            setIsPlaying(true);
                        } else if (e.data === 2 || e.data === 0) {
                            setIsPlaying(false);
                        }
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initYT();
        } else {
            window.onYouTubeIframeAPIReady = initYT;
        }

        pollTimerRef.current = setInterval(() => {
            if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
                try {
                    const ct = ytPlayerRef.current.getCurrentTime() || 0;
                    const dur = ytPlayerRef.current.getDuration() || 0;
                    const buf = (ytPlayerRef.current.getVideoLoadedFraction() || 0) * 100;
                    setCurrentTime(ct);
                    if (dur > 0) setDuration(dur);
                    setBuffered(buf);
                } catch (e) {}
            }
        }, 250);

        return () => {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            if (ytPlayerRef.current) {
                try { ytPlayerRef.current.destroy(); } catch (e) {}
                ytPlayerRef.current = null;
            }
        };
    }, [isConnected, isYouTube, ytId]);

    // -------------------------------------------------------------------------
    // ENGINE B: HTML5 VIDEO (MP4, HLS, VLC)
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!isConnected || isYouTube) return;
        const v = videoRef.current;
        if (!v) return;

        v.volume = volume / 100;
        v.muted = isMuted;

        const onTimeUpdate = () => {
            setCurrentTime(v.currentTime);
            if (v.duration) setDuration(v.duration);
            if (v.buffered && v.buffered.length > 0) {
                setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
            }
        };

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onLoadedMeta = () => {
            setDuration(v.duration || 0);
        };

        v.addEventListener('timeupdate', onTimeUpdate);
        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        v.addEventListener('loadedmetadata', onLoadedMeta);

        return () => {
            v.removeEventListener('timeupdate', onTimeUpdate);
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
            v.removeEventListener('loadedmetadata', onLoadedMeta);
        };
    }, [isConnected, isYouTube, currentVideoSource, volume, isMuted]);

    const togglePlay = () => {
        if (isYouTube) {
            if (!ytPlayerRef.current) return;
            if (isPlaying) {
                ytPlayerRef.current.pauseVideo();
            } else {
                ytPlayerRef.current.playVideo();
            }
        } else if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(() => {});
            }
        }
        resetHideTimer();
    };

    const handleVolumeChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setVolume(val);
        setIsMuted(val === 0);

        if (isYouTube && ytPlayerRef.current) {
            ytPlayerRef.current.setVolume(val);
            if (val === 0) ytPlayerRef.current.mute();
            else ytPlayerRef.current.unMute();
        } else if (videoRef.current) {
            videoRef.current.volume = val / 100;
            videoRef.current.muted = val === 0;
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);

        if (isYouTube && ytPlayerRef.current) {
            if (next) ytPlayerRef.current.mute();
            else {
                ytPlayerRef.current.unMute();
                ytPlayerRef.current.setVolume(volume || 50);
            }
        } else if (videoRef.current) {
            videoRef.current.muted = next;
        }
    };

    const handleScrubberClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const seekTarget = pos * duration;

        if (isYouTube && ytPlayerRef.current) {
            ytPlayerRef.current.seekTo(seekTarget, true);
        } else if (videoRef.current) {
            videoRef.current.currentTime = seekTarget;
        }
        setCurrentTime(seekTarget);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            wrapperRef.current?.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
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
        const videoTech = wrapperRef.current?.querySelector('video');
        takeSnapshot(videoTech, imgRef.current, wipeState);
    };

    // -------------------------------------------------------------------------
    // DISCONNECTED STANDBY SURFACE (Discrete Crossed-Out Camera)
    // -------------------------------------------------------------------------
    if (!isConnected) {
        return (
            <div className="stream-disconnected-surface">
                <svg 
                    className="stream-cam-off-svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d="M10.66 5H14a2 2 0 0 1 2 2v2.34l1 1L23 7v10l-3.34-2.34" />
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1.34" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
            </div>
        );
    }

    const t = wipeState.revV ? 0 : wipeState.clipV;
    const b = wipeState.revV ? wipeState.clipV : 0;
    const l = wipeState.revH ? 0 : wipeState.clipH;
    const r = wipeState.revH ? wipeState.clipH : 0;
    const clipStyle = { clipPath: `inset(${t}% ${r}% ${b}% ${l}%)` };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div 
            className="stream-container" 
            ref={wrapperRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Surface */}
            <div className="stream-video-surface" onClick={togglePlay}>
                {isYouTube ? (
                    <div className="yt-embed-wrapper">
                        <div ref={ytMountRef} className="yt-iframe-mount" />
                    </div>
                ) : (
                    <video 
                        ref={videoRef} 
                        className="html5-video-surface"
                        src={currentVideoSource}
                        crossOrigin="anonymous" 
                        playsInline 
                    />
                )}
            </div>

            {/* Custom Overlay Wipe & Snapshot Layer */}
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

            {/* Overlay Drawer */}
            <OverlayDrawer 
                show={showOverlay}
                overlayImg={overlayImg}
                onImageUpload={handleImageUpload}
                onClearImage={handleClearImage}
                wipeState={wipeState}
                setWipeState={setWipeState}
                onSnapshot={handleSnapshot}
            />

            {/* Quality Menu */}
            <QualityMenu 
                show={showQuality} 
                onResolutionSelect={() => setShowQuality(false)} 
            />

            {/* YouTube Replica Controls Overlay */}
            <div className={`yt-replica-control-bar ${showControls || !isPlaying ? 'visible' : ''}`}>
                {/* Full-width Red Scrubber Track */}
                <div className="yt-scrubber-rail" onClick={handleScrubberClick}>
                    <div className="yt-scrubber-buffer" style={{ width: `${buffered}%` }} />
                    <div className="yt-scrubber-progress" style={{ width: `${progressPercent}%` }}>
                        <div className="yt-scrubber-thumb" />
                    </div>
                </div>

                {/* Bottom Control Buttons Row */}
                <div className="yt-buttons-row">
                    <div className="yt-left-group">
                        <button className="yt-ctrl-btn" onClick={togglePlay} title={isPlaying ? "Pause (k)" : "Play (k)"}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                            )}
                        </button>

                        <div 
                            className="yt-volume-cluster"
                            onMouseEnter={() => setIsVolumeHovered(true)}
                            onMouseLeave={() => setIsVolumeHovered(false)}
                        >
                            <button className="yt-ctrl-btn" onClick={toggleMute} title={isMuted ? "Unmute (m)" : "Mute (m)"}>
                                {isMuted || volume === 0 ? (
                                    <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V4L9 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>
                                ) : volume < 50 ? (
                                    <svg viewBox="0 0 24 24"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" fill="currentColor"/></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L9 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/></svg>
                                )}
                            </button>
                            
                            <div className="yt-volume-slider-box">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="yt-volume-slider"
                                />
                            </div>
                        </div>

                        <div className="yt-timecode-box">
                            <span className="yt-time-current">{formatTime(currentTime)}</span>
                            <span className="yt-time-sep"> / </span>
                            <span className="yt-time-duration">{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="yt-center-space" />

                    <div className="yt-right-group">
                        <button 
                            className={`yt-ctrl-btn ${showQuality ? 'active-icon' : ''}`}
                            onClick={() => { setShowQuality(p => !p); setShowOverlay(false); }}
                            title="Settings / Quality"
                        >
                            <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.05-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.22-.07.49-.12-.61l2.03 1.58c-.04.3-.06.61-.06.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6S13.98,15.6,12,15.6z" fill="currentColor"/></svg>
                        </button>

                        <button 
                            className={`yt-ctrl-btn ${showOverlay ? 'active-icon' : ''}`}
                            onClick={() => { setShowOverlay(p => !p); setShowQuality(false); }}
                            title="Overlay Tools (Wipe / Snapshot)"
                        >
                            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" fill="currentColor"/></svg>
                        </button>

                        <button 
                            className="yt-ctrl-btn" 
                            onClick={toggleFullscreen} 
                            title="Fullscreen"
                        >
                            <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" fill="currentColor"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Player;