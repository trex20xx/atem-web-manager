// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v3.22)
// =========================================================================
// Bidirectional switcher bus, macro execution, aux router, DSK, FTB, and Media Pool.

const { Atem } = require('atem-connection');
const WebSocket = require('ws');
const http = require('http');

let ATEM_IP = process.env.ATEM_IP || '192.168.10.240';
const BRIDGE_PORT = 8080;
const VITE_PORT = 3000;
const startTime = Date.now();

console.log(`[ATEM Bridge v3.22] Starting bridge service...`);
console.log(`[ATEM Bridge v3.22] Target ATEM Switcher IP: ${ATEM_IP}`);

let atem = new Atem();
let isAtemConnected = false;

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
        console.log(`[ATEM Bridge] >>> SUCCESS: Connected to physical ATEM at ${ATEM_IP} <<<`);
        broadcastState();
    });

    atem.on('disconnected', () => {
        isAtemConnected = false;
        console.log(`[ATEM Bridge] >>> DISCONNECTED: Lost UDP link to physical ATEM at ${ATEM_IP} <<<`);
        broadcastState();
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
        }

        const payload = JSON.stringify({
            type: 'STATE', hardwareConnected, pgm: currentPgm, pvw: currentPvw, inTransition: currentInTransition, transitionRate: currentTransitionRate,
            transitionSelection: currentTransitionSelection, uskOnAir: currentUskOnAir, auxSources: currentAux, dsk, ftb, macroPlayer, macroProperties, mediaPool
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
    if (raw === 'PrgI' || raw.includes('ProgramInput') || raw === 'PrvI' || raw.includes('PreviewInput') || raw === 'TrPr' || raw === 'TrPs' || raw.includes('TransitionPosition') || raw === 'TMxr' || raw.includes('TransitionMix') || raw.includes('TransitionProperties') || raw === 'AuxS' || raw.includes('AuxSource') || raw.includes('Upstream') || raw === 'KeOn' || raw.includes('MixEffectKeyOnAir') || raw.includes('Downstream') || raw.includes('FadeToBlack') || raw.includes('Ftb') || raw === 'MRPr' || raw.includes('Macro') || raw.includes('MediaPool')) {
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
                // Upload logic: Decode base64 RGBA back to Buffer and push to ATEM
                const buffer = Buffer.from(data.rgbaBase64, 'base64');
                console.log(`[ATEM Bridge] Uploading image to ATEM Still Slot ${data.index + 1}...`);
                atem.dataTransferManager.uploadStill(data.index, buffer, data.name, '').then(() => {
                    console.log(`[ATEM Bridge] Upload complete for Slot ${data.index + 1}`);
                    broadcastState();
                }).catch(e => console.error('[ATEM Bridge] Still upload failed:', e.message));
                
            } else if (data.action === 'GET_STILL' && data.index !== undefined) {
                // Download logic: Fetch from ATEM, wrap in BMP header, encode base64, send to UI
                if (atem.dataTransferManager && typeof atem.dataTransferManager.downloadStill === 'function') {
                    atem.dataTransferManager.downloadStill(data.index).then(buffer => {
                        if (buffer && buffer.length > 0) {
                            const width = 1920; const height = 1080;
                            const fileSize = 54 + buffer.length;
                            const bmp = Buffer.alloc(fileSize);
                            bmp.write('BM', 0);
                            bmp.writeUInt32LE(fileSize, 2);
                            bmp.writeUInt32LE(54, 10);
                            bmp.writeUInt32LE(40, 14);
                            bmp.writeUInt32LE(width, 18);
                            bmp.writeInt32LE(-height, 22);
                            bmp.writeUInt16LE(1, 26);
                            bmp.writeUInt16LE(32, 28);
                            for(let i=0; i<buffer.length; i+=4) {
                                bmp[54+i] = buffer[i+2]; // B
                                bmp[54+i+1] = buffer[i+1]; // G
                                bmp[54+i+2] = buffer[i]; // R
                                bmp[54+i+3] = buffer[i+3]; // A
                            }
                            ws.send(JSON.stringify({ type: 'STILL_DATA', index: data.index, data: 'data:image/bmp;base64,' + bmp.toString('base64') }));
                        }
                    }).catch(e => {});
                }
            }
        } catch (err) {}
    });
});

setInterval(() => {
    const req = http.get(`http://localhost:${VITE_PORT}`, () => {});
    req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' && Date.now() - startTime > 10000) process.exit(0);
    });
    req.setTimeout(1500, () => req.destroy());
}, 3000);