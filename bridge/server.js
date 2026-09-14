// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v3.26)
// =========================================================================
// Bidirectional switcher bus, macro execution, aux router, DSK, FTB, and Media Pool.

const { Atem } = require('atem-connection');
const WebSocket = require('ws');
const http = require('http');

let ATEM_IP = process.env.ATEM_IP || '192.168.10.240';
const BRIDGE_PORT = 8080;
const VITE_PORT = 3000;
const startTime = Date.now();

console.log(`[ATEM Bridge v3.26] Starting bridge service...`);
console.log(`[ATEM Bridge v3.26] Target ATEM Switcher IP: ${ATEM_IP}`);

let atem = new Atem();
let isAtemConnected = false;
let reconnectTimer = null;

// Authoritative switcher state cache
let currentPgm = 1;
let currentPvw = 2;
let currentInTransition = false;
let currentTransitionRate = 30;
let currentTransitionSelection = 1; 
let currentUskOnAir = [false, false, false, false];
let currentAux = [1, 2, 3, 4, 5, 6];

let dsk = { onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: 30 };
let ftb = { inTransition: false, isFullyBlack: false, rate: 30 };
let mediaPool = { stills: [], clips: [] };
let mediaPlayers = [
    { sourceType: 1, stillIndex: 0, clipIndex: 0 },
    { sourceType: 1, stillIndex: 1, clipIndex: 0 }
];

// Single-threaded Sequential Data Transfer Queue (ATEM UDP hardware can only handle 1 transfer at a time)
let isTransferring = false;
const transferQueue = [];

function processTransferQueue() {
    if (isTransferring || transferQueue.length === 0) return;
    if (!isAtemConnected) {
        setTimeout(processTransferQueue, 1500);
        return;
    }
    
    isTransferring = true;
    const task = transferQueue.shift();
    
    task()
        .catch(err => {
            console.warn('[ATEM Bridge Transfer Warning]:', err.message || err);
        })
        .finally(() => {
            isTransferring = false;
            setTimeout(processTransferQueue, 350); // 350ms breather between transfers to prevent ATEM UDP drop
        });
}

function queueDownloadStill(index) {
    if (transferQueue.some(t => t.type === 'download' && t.index === index)) return;

    const task = () => new Promise((resolve) => {
        if (!isAtemConnected || typeof atem.downloadStill !== 'function') {
            return resolve();
        }
        console.log(`[ATEM Bridge] Downloading Still ${index + 1} from ATEM...`);
        atem.downloadStill(index, 'rgba')
            .then(rgbaBuffer => {
                let width = 1920; let height = 1080;
                if (rgbaBuffer.length === 1280 * 720 * 4) { width = 1280; height = 720; }
                else if (rgbaBuffer.length === 3840 * 2160 * 4) { width = 3840; height = 2160; }

                const bmpDataUri = downscaleRgbaToThumbnailBmp(rgbaBuffer, width, height, 320, 180);
                const payload = JSON.stringify({ type: 'STILL_DATA', index, data: bmpDataUri });
                
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) client.send(payload);
                });
                console.log(`[ATEM Bridge] Successfully downloaded Still ${index + 1}`);
                resolve();
            })
            .catch(err => {
                console.warn(`[ATEM Bridge] Download failed for Still ${index + 1}:`, err.message || err);
                resolve();
            });
    });
    task.type = 'download';
    task.index = index;
    transferQueue.push(task);
    processTransferQueue();
}

function queueUploadStill(index, buffer, name) {
    const task = () => new Promise((resolve) => {
        if (!isAtemConnected || typeof atem.uploadStill !== 'function') {
            return resolve();
        }
        console.log(`[ATEM Bridge] Uploading to Still ${index + 1}...`);
        atem.uploadStill(index, buffer, name || `Still ${index + 1}`, '')
            .then(() => {
                console.log(`[ATEM Bridge] Successfully uploaded to Still ${index + 1}`);
                broadcastState();
                setTimeout(() => queueDownloadStill(index), 600);
                resolve();
            })
            .catch(err => {
                console.warn(`[ATEM Bridge] Upload failed for Still ${index + 1}:`, err.message || err);
                resolve();
            });
    });
    task.type = 'upload';
    task.index = index;
    transferQueue.push(task);
    processTransferQueue();
}

// Downscale raw RGBA buffer to a crisp 320x180 BMP data URI
function downscaleRgbaToThumbnailBmp(rgbaBuffer, srcWidth = 1920, srcHeight = 1080, targetWidth = 320, targetHeight = 180) {
    const scaleX = srcWidth / targetWidth;
    const scaleY = srcHeight / targetHeight;
    const thumbRgba = Buffer.alloc(targetWidth * targetHeight * 4);
    
    for (let y = 0; y < targetHeight; y++) {
        const srcY = Math.floor(y * scaleY);
        for (let x = 0; x < targetWidth; x++) {
            const srcX = Math.floor(x * scaleX);
            const srcIdx = (srcY * srcWidth + srcX) * 4;
            const dstIdx = (y * targetWidth + x) * 4;
            
            thumbRgba[dstIdx]     = rgbaBuffer[srcIdx + 2]; // B
            thumbRgba[dstIdx + 1] = rgbaBuffer[srcIdx + 1]; // G
            thumbRgba[dstIdx + 2] = rgbaBuffer[srcIdx];     // R
            thumbRgba[dstIdx + 3] = rgbaBuffer[srcIdx + 3]; // A
        }
    }
    
    const fileSize = 54 + thumbRgba.length;
    const bmp = Buffer.alloc(fileSize);
    bmp.write('BM', 0);
    bmp.writeUInt32LE(fileSize, 2);
    bmp.writeUInt32LE(54, 10);
    bmp.writeUInt32LE(40, 14);
    bmp.writeUInt32LE(targetWidth, 18);
    bmp.writeInt32LE(-targetHeight, 22); // Top-down negative height
    bmp.writeUInt16LE(1, 26);
    bmp.writeUInt16LE(32, 28);
    thumbRgba.copy(bmp, 54);
    
    return 'data:image/bmp;base64,' + bmp.toString('base64');
}

function setupAtemListeners() {
    atem.on('receivedCommand', (command) => {
        if (handleHardwareCommand(command)) broadcastState();
    });

    atem.on('receivedCommands', (commands) => {
        if (Array.isArray(commands)) {
            let changed = false;
            for (const cmd of commands) {
                if (handleHardwareCommand(cmd)) changed = true;
            }
            if (changed) broadcastState();
        }
    });

    atem.on('stateChanged', () => {
        broadcastState();
    });

    atem.on('connected', () => {
        isAtemConnected = true;
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        console.log(`[ATEM Bridge] >>> SUCCESS: Connected to physical ATEM at ${ATEM_IP} <<<`);
        broadcastState();
    });

    atem.on('disconnected', () => {
        isAtemConnected = false;
        console.log(`[ATEM Bridge] >>> DISCONNECTED: Lost UDP link to physical ATEM at ${ATEM_IP} <<<`);
        broadcastState();
        
        // Automatic reconnection loop
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                if (!isAtemConnected) {
                    console.log(`[ATEM Bridge] Attempting reconnection to ATEM at ${ATEM_IP}...`);
                    atem.connect(ATEM_IP).catch(() => {});
                }
            }, 3000);
        }
    });

    atem.on('error', (err) => {
        console.error(`[ATEM Bridge Error]:`, err.message || err);
    });
}

setupAtemListeners();

function connectToAtem(ip) {
    if (ip && ip !== ATEM_IP) {
        ATEM_IP = ip;
        console.log(`[ATEM Bridge] Re-targeting ATEM IP to: ${ATEM_IP}`);
        try {
            atem.disconnect();
        } catch(e) {}
        atem = new Atem();
        setupAtemListeners();
    }
    atem.connect(ATEM_IP).catch((err) => {
        console.log(`[ATEM Bridge] Connection attempt to ${ATEM_IP} deferred:`, err.message || err);
    });
}

connectToAtem(ATEM_IP);

function broadcastState(targetWs = null) {
    try {
        const hardwareConnected = (atem && atem.status === 2) || isAtemConnected;

        if (atem && atem.state && atem.state.video && atem.state.video.mixEffects) {
            const meObj = atem.state.video.mixEffects;
            const me = meObj[0] || (Array.isArray(meObj) ? meObj[0] : Object.values(meObj)[0]);
            if (me) {
                if (typeof me.programInput === 'number') currentPgm = me.programInput;
                if (typeof me.previewInput === 'number') currentPvw = me.previewInput;
                if (me.transitionPosition && typeof me.transitionPosition.inTransition === 'boolean') currentInTransition = me.transitionPosition.inTransition;
                else if (typeof me.inTransition === 'boolean') currentInTransition = me.inTransition;
                if (me.transitionProperties) {
                    if (typeof me.transitionProperties.rate === 'number') currentTransitionRate = me.transitionProperties.rate;
                    const sel = me.transitionProperties.nextSelection !== undefined ? me.transitionProperties.nextSelection : me.transitionProperties.selection;
                    if (typeof sel === 'number') currentTransitionSelection = sel;
                    else if (Array.isArray(sel)) currentTransitionSelection = sel.reduce((acc, v) => acc | (typeof v === 'number' ? v : 0), 0) || 1;
                }
                if (me.upstreamKeyers) currentUskOnAir = [0, 1, 2, 3].map(i => Boolean(me.upstreamKeyers[i] && me.upstreamKeyers[i].onAir));
                if (me.fadeToBlack) ftb = me.fadeToBlack;
            }
        }

        if (atem && atem.state && atem.state.video && atem.state.video.auxiliaries) {
            const auxObj = atem.state.video.auxiliaries;
            const keys = Object.keys(auxObj).map(Number).sort((a, b) => a - b);
            if (keys.length > 0) currentAux = [0, 1, 2, 3, 4, 5].map(idx => typeof auxObj[keys[idx]] === 'number' ? auxObj[keys[idx]] : (currentAux[idx] || 1));
        }

        if (atem && atem.state && atem.state.video && atem.state.video.downstreamKeyers) {
            const d = atem.state.video.downstreamKeyers[0];
            if (d) {
                dsk.onAir = d.onAir;
                dsk.inTransition = d.inTransition;
                dsk.autoOnAir = d.autoOnAir;
                if (d.properties) {
                    dsk.tie = d.properties.tie;
                    dsk.rate = d.properties.rate;
                }
            }
        }

        let macroPlayer = { isRunning: false, isWaiting: false, loop: false, macroIndex: -1 };
        let macroProperties = [];
        if (atem && atem.state && atem.state.macro) {
            if (atem.state.macro.macroPlayer) macroPlayer = atem.state.macro.macroPlayer;
            if (atem.state.macro.macroProperties) macroProperties = atem.state.macro.macroProperties;
        }

        if (atem && atem.state && atem.state.media) {
            if (atem.state.media.stillPool) mediaPool.stills = atem.state.media.stillPool.map(s => ({ isUsed: s.isUsed, name: s.fileName || '' }));
            if (atem.state.media.clipPool) mediaPool.clips = atem.state.media.clipPool.map(c => ({ isUsed: c.isUsed, name: c.name || '' }));
            if (atem.state.media.players) {
                mediaPlayers = [0, 1].map(i => {
                    const p = atem.state.media.players[i];
                    return p ? { sourceType: p.sourceType, stillIndex: p.stillIndex, clipIndex: p.clipIndex } : { sourceType: 1, stillIndex: i, clipIndex: 0 };
                });
            }
        }

        const payload = JSON.stringify({
            type: 'STATE', hardwareConnected, pgm: currentPgm, pvw: currentPvw, inTransition: currentInTransition, transitionRate: currentTransitionRate,
            transitionSelection: currentTransitionSelection, uskOnAir: currentUskOnAir, auxSources: currentAux, dsk, ftb, macroPlayer, macroProperties, mediaPool, mediaPlayers
        });

        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(payload); return;
        }
        wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
    } catch (err) {}
}

function handleHardwareCommand(cmd) {
    if (!cmd) return false;
    const raw = cmd.rawName || (cmd.constructor ? cmd.constructor.name : '');
    if (raw === 'PrgI' || raw.includes('ProgramInput') || raw === 'PrvI' || raw.includes('PreviewInput') || raw === 'TrPr' || raw === 'TrPs' || raw.includes('TransitionPosition') || raw === 'TMxr' || raw.includes('TransitionMix') || raw.includes('TransitionProperties') || raw === 'AuxS' || raw.includes('AuxSource') || raw.includes('Upstream') || raw === 'KeOn' || raw.includes('MixEffectKeyOnAir') || raw.includes('Downstream') || raw.includes('FadeToBlack') || raw.includes('Ftb') || raw === 'MRPr' || raw.includes('Macro') || raw.includes('MediaPool') || raw.includes('MediaPlayer')) {
        return true;
    }
    return false;
}

const wss = new WebSocket.Server({ port: BRIDGE_PORT }, () => console.log(`[ATEM Bridge] WebSocket server running on ws://localhost:${BRIDGE_PORT}`));

wss.on('connection', (ws) => {
    broadcastState(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.ip && data.ip !== ATEM_IP) connectToAtem(data.ip);

            if (data.action === 'CONNECT' || data.action === 'GET_STATE') {
                broadcastState(ws);
            } else if (data.action === 'SET_PGM' && data.input !== undefined) {
                atem.changeProgramInput(parseInt(data.input, 10), 0).catch(e => {});
            } else if (data.action === 'SET_PVW' && data.input !== undefined) {
                atem.changePreviewInput(parseInt(data.input, 10), 0).catch(e => {});
            } else if (data.action === 'CUT') {
                atem.cut(0).catch(e => {});
            } else if (data.action === 'AUTO') {
                atem.autoTransition(0).catch(e => {});
            } else if (data.action === 'SET_TRANSITION_RATE' && data.rate !== undefined) {
                atem.setMixTransitionSettings({ rate: parseInt(data.rate, 10) || 30 }, 0).catch(e => {});
            } else if (data.action === 'UPLOAD_STILL' && data.rgbaBase64) {
                const buffer = Buffer.from(data.rgbaBase64, 'base64');
                queueUploadStill(data.index, buffer, data.name);
            } else if (data.action === 'GET_STILL' && data.index !== undefined) {
                queueDownloadStill(data.index);
            } else if (data.action === 'SET_MEDIA_PLAYER_SOURCE' && data.player !== undefined) {
                const playerIdx = parseInt(data.player, 10);
                const props = {};
                if (data.sourceType !== undefined) props.sourceType = data.sourceType;
                if (data.stillIndex !== undefined) props.stillIndex = data.stillIndex;
                if (data.clipIndex !== undefined) props.clipIndex = data.clipIndex;
                
                if (typeof atem.setMediaPlayerSource === 'function') {
                    atem.setMediaPlayerSource(props, playerIdx)
                        .then(() => broadcastState())
                        .catch(e => console.error('[ATEM Bridge] setMediaPlayerSource error:', e.message || e));
                }
            }
        } catch (err) {}
    });
});

// Watchdog: Grace period of 30 seconds before terminating on Vite loss
setInterval(() => {
    const req = http.get(`http://localhost:${VITE_PORT}`, () => {});
    req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' && Date.now() - startTime > 30000) {
            console.log('[ATEM Bridge Watchdog] Vite server closed. Terminating bridge daemon...');
            process.exit(0);
        }
    });
    req.setTimeout(1500, () => req.destroy());
}, 5000);