// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v3.90)
// =========================================================================

const { Atem } = require('atem-connection');
const WebSocket = require('ws');
const http = require('http');

let ATEM_IP = process.env.ATEM_IP || '192.168.10.240';
const BRIDGE_PORT = 8080;
const VITE_PORT = 3000;
const startTime = Date.now();

let atem = new Atem();
let isAtemConnected = false;
let reconnectTimer = null;
let broadcastTimeout = null;

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

function getFriendlySourceName(id) {
    const num = parseInt(id, 10);
    let customName = '';
    if (atem && atem.state && atem.state.inputs && atem.state.inputs[num]) {
        const inp = atem.state.inputs[num];
        customName = inp.longName || inp.shortName || '';
    }
    
    let base = '';
    if (num >= 1 && num <= 10) base = 'Input ' + num;
    else {
        switch (num) {
            case 0: base = 'Black (BLK)'; break;
            case 1000: base = 'Color Bars (BARS)'; break;
            case 2001: base = 'Color 1'; break;
            case 2002: base = 'Color 2'; break;
            case 3010: base = 'Media Player 1 (MP1)'; break;
            case 3020: base = 'Media Player 2 (MP2)'; break;
            case 10010: base = 'Program (PGM)'; break;
            case 10011: base = 'Preview (PVW)'; break;
            default: base = 'Source ' + id;
        }
    }
    
    if (customName && customName !== base && !base.includes(customName)) {
        return `${base} (${customName})`;
    }
    return base;
}

const wss = new WebSocket.Server({ port: BRIDGE_PORT }, () => {
    broadcastLog('info', 'BRIDGE', ['WebSocket server running on ws://localhost:' + BRIDGE_PORT]);
});

function broadcastLog(level, source, args, deviceIp = ATEM_IP) {
    try {
        const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        const payload = JSON.stringify({
            type: 'LOG',
            level,
            source,
            ip: source === 'SYSTEM' ? 'SYSTEM' : deviceIp,
            message: msg,
            timestamp: Date.now()
        });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(payload);
        });
    } catch (e) {}
}

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = function() { originalLog.apply(console, arguments); broadcastLog('info', 'BRIDGE', arguments); };
console.warn = function() { originalWarn.apply(console, arguments); broadcastLog('warn', 'BRIDGE', arguments); };
console.error = function() { originalError.apply(console, arguments); broadcastLog('error', 'BRIDGE', arguments); };

console.log('[ATEM Bridge v3.90] Starting bridge service...');
console.log('[ATEM Bridge v3.90] Target ATEM Switcher IP: ' + ATEM_IP);

function setupAtemListeners() {
    atem.on('receivedCommands', (commands) => {
        if (Array.isArray(commands)) {
            let changed = false;
            for (const cmd of commands) {
                if (handleHardwareCommand(cmd)) {
                    changed = true;
                }
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
        broadcastLog('info', 'BRIDGE', ['Connected to physical ATEM at ' + ATEM_IP]);
        broadcastState(null, true);
    });

    atem.on('disconnected', () => {
        isAtemConnected = false;
        broadcastLog('warn', 'BRIDGE', ['Lost UDP link to physical ATEM at ' + ATEM_IP]);
        broadcastState(null, true);
        
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                if (!isAtemConnected) {
                    broadcastLog('info', 'BRIDGE', ['Attempting reconnection to ATEM at ' + ATEM_IP + '...']);
                    atem.connect(ATEM_IP).catch(() => {});
                }
            }, 3000);
        }
    });

    atem.on('error', (err) => {
        broadcastLog('error', 'BRIDGE', ['ATEM Bridge Error: ' + (err.message || err)]);
    });
}

setupAtemListeners();

function connectToAtem(ip) {
    if (ip && ip !== ATEM_IP) {
        ATEM_IP = ip;
        broadcastLog('info', 'BRIDGE', ['Re-targeting ATEM IP to: ' + ATEM_IP]);
        try {
            atem.disconnect();
        } catch(e) {}
        atem = new Atem();
        setupAtemListeners();
    }
    atem.connect(ATEM_IP).catch((err) => {
        broadcastLog('warn', 'BRIDGE', ['Connection attempt to ' + ATEM_IP + ' deferred: ' + (err.message || err)]);
    });
}

connectToAtem(ATEM_IP);

function broadcastState(targetWs = null, immediate = false) {
    if (targetWs) {
        sendStatePayload(targetWs);
        return;
    }
    if (immediate) {
        sendStatePayload();
        return;
    }
    if (!broadcastTimeout) {
        broadcastTimeout = setTimeout(() => {
            sendStatePayload();
            broadcastTimeout = null;
        }, 20);
    }
}

function sendStatePayload(targetWs = null) {
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
                if (me.upstreamKeyers) {
                    const uskObj = me.upstreamKeyers;
                    currentUskOnAir = [0, 1, 2, 3].map(i => {
                        const k = uskObj[i] || Object.values(uskObj)[i];
                        return Boolean(k && k.onAir);
                    });
                }
                if (me.fadeToBlack) ftb = me.fadeToBlack;
            }
        }

        if (atem && atem.state && atem.state.video && atem.state.video.auxiliaries) {
            const auxObj = atem.state.video.auxiliaries;
            for (let i = 0; i < 6; i++) {
                if (auxObj[i] !== undefined && auxObj[i] !== null) {
                    currentAux[i] = typeof auxObj[i] === 'object' ? (auxObj[i].source !== undefined ? auxObj[i].source : 1) : Number(auxObj[i]);
                }
            }
        }

        if (atem && atem.state && atem.state.video && atem.state.video.downstreamKeyers) {
            const dskObj = atem.state.video.downstreamKeyers;
            const d = dskObj[0] || (Array.isArray(dskObj) ? dskObj[0] : Object.values(dskObj)[0]);
            if (d) {
                if (typeof d.onAir === 'boolean') dsk.onAir = d.onAir;
                if (typeof d.inTransition === 'boolean') dsk.inTransition = d.inTransition;
                if (typeof d.autoOnAir === 'boolean') dsk.autoOnAir = d.autoOnAir;
                if (d.properties) {
                    if (typeof d.properties.tie === 'boolean') dsk.tie = d.properties.tie;
                    if (typeof d.properties.rate === 'number') dsk.rate = d.properties.rate;
                }
                if (typeof d.tie === 'boolean') dsk.tie = d.tie;
                if (typeof d.rate === 'number') dsk.rate = d.rate;
            }
        }

        let macroPlayer = { isRunning: false, isWaiting: false, loop: false, macroIndex: -1 };
        let macroProperties = [];
        if (atem && atem.state && atem.state.macro) {
            if (atem.state.macro.macroPlayer) macroPlayer = atem.state.macro.macroPlayer;
            if (atem.state.macro.macroProperties) macroProperties = atem.state.macro.macroProperties;
        }

        if (atem && atem.state && atem.state.media) {
            if (atem.state.media.stillPool) {
                mediaPool.stills = atem.state.media.stillPool.map((s) => ({
                    isUsed: Boolean(s && s.isUsed),
                    name: s ? (s.fileName || s.name || '') : ''
                }));
            }
            if (atem.state.media.clipPool) {
                mediaPool.clips = atem.state.media.clipPool.map((c) => ({
                    isUsed: Boolean(c && c.isUsed),
                    name: c ? (c.name || '') : ''
                }));
            }
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
    const props = cmd.properties || cmd;

    if (raw === 'PrgI' || raw.includes('ProgramInput')) {
        if (props.source !== undefined && props.source !== currentPgm) {
            currentPgm = props.source;
            broadcastLog('info', 'ATEM', ['Program set to ' + getFriendlySourceName(props.source)]);
        }
        return true;
    }
    if (raw === 'PrvI' || raw.includes('PreviewInput')) {
        if (props.source !== undefined && props.source !== currentPvw) {
            currentPvw = props.source;
            broadcastLog('info', 'ATEM', ['Preview set to ' + getFriendlySourceName(props.source)]);
        }
        return true;
    }
    if (raw === 'AuxS' || raw.includes('AuxSource')) {
        const auxIdx = props.id !== undefined ? props.id : (props.auxBus !== undefined ? props.auxBus : props.auxBusId);
        const auxSrc = props.source !== undefined ? props.source : props.input;
        if (auxIdx !== undefined && auxSrc !== undefined) {
            currentAux[auxIdx] = auxSrc;
            broadcastLog('info', 'ATEM', ['Aux ' + (Number(auxIdx) + 1) + ' set to ' + getFriendlySourceName(auxSrc)]);
        }
        return true;
    }

    if (raw === 'TrPr' || raw === 'TrPs' || raw.includes('TransitionPosition') || raw === 'TMxr' || raw.includes('TransitionMix') || raw.includes('TransitionProperties') || raw.includes('Upstream') || raw === 'KeOn' || raw.includes('MixEffectKeyOnAir') || raw.includes('Downstream') || raw.includes('FadeToBlack') || raw.includes('Ftb') || raw === 'MRPr' || raw.includes('Macro') || raw.includes('MediaPool') || raw.includes('MediaPlayer')) {
        return true;
    }
    return false;
}

wss.on('connection', (ws) => {
    broadcastLog('info', 'BRIDGE', ['Client connected to WebSocket daemon']);
    broadcastState(ws, true);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const targetIp = data.ip || ATEM_IP;
            if (data.ip && data.ip !== ATEM_IP) connectToAtem(data.ip);

            if (data.action === 'SYSTEM_LOG') {
                broadcastLog('info', 'SYSTEM', [data.message], 'SYSTEM');
                return;
            }

            if (data.action === 'CONNECT' || data.action === 'GET_STATE') {
                broadcastState(ws, true);
            } else if (data.action === 'SET_PGM' && data.input !== undefined) {
                currentPgm = parseInt(data.input, 10);
                broadcastLog('info', 'USER', ['Program set to ' + getFriendlySourceName(data.input)], targetIp);
                atem.changeProgramInput(parseInt(data.input, 10), 0).catch(e => {});
                broadcastState(null, true);
            } else if (data.action === 'SET_PVW' && data.input !== undefined) {
                currentPvw = parseInt(data.input, 10);
                broadcastLog('info', 'USER', ['Preview set to ' + getFriendlySourceName(data.input)], targetIp);
                atem.changePreviewInput(parseInt(data.input, 10), 0).catch(e => {});
                broadcastState(null, true);
            } else if (data.action === 'SET_AUX' && data.aux !== undefined && data.source !== undefined) {
                const auxIdx = parseInt(data.aux, 10);
                const srcId = parseInt(data.source, 10);
                currentAux[auxIdx] = srcId;
                broadcastLog('info', 'USER', ['Aux ' + (auxIdx + 1) + ' set to ' + getFriendlySourceName(srcId)], targetIp);
                if (typeof atem.setAuxSource === 'function') {
                    atem.setAuxSource(srcId, auxIdx).catch(e => {});
                }
                broadcastState(null, true);
            } else if (data.action === 'CUT') {
                broadcastLog('info', 'USER', ['Executed CUT transition'], targetIp);
                atem.cut(0).catch(e => {});
            } else if (data.action === 'AUTO') {
                broadcastLog('info', 'USER', ['Executed AUTO transition (Rate: ' + currentTransitionRate + ' frames)'], targetIp);
                atem.autoTransition(0).catch(e => {});
            } else if (data.action === 'SET_TRANSITION_RATE' && data.rate !== undefined) {
                currentTransitionRate = parseInt(data.rate, 10) || 30;
                broadcastLog('info', 'USER', ['Set Transition Rate to ' + currentTransitionRate + ' frames'], targetIp);
                atem.setMixTransitionSettings({ rate: currentTransitionRate }, 0).catch(e => {});
                broadcastState(null, true);
            } else if (data.action === 'SET_TRANS_POSITION' && data.position !== undefined) {
                if (typeof atem.setTransitionPosition === 'function') {
                    atem.setTransitionPosition(data.position, 0).catch(e => {});
                }
            } else if (data.action === 'TOGGLE_USK_ONAIR' && data.usk !== undefined) {
                const uskIdx = parseInt(data.usk, 10);
                const targetState = !currentUskOnAir[uskIdx];
                currentUskOnAir[uskIdx] = targetState;
                broadcastLog('info', 'USER', ['Toggled Upstream Keyer ' + (uskIdx + 1) + ' On Air: ' + targetState], targetIp);
                if (typeof atem.setUpstreamKeyOnAir === 'function') {
                    atem.setUpstreamKeyOnAir(targetState, 0, uskIdx).catch(e => {});
                }
                broadcastState(null, true);
            } else if (data.action === 'SET_TRANS_SELECTION' && data.selection !== undefined) {
                currentTransitionSelection = parseInt(data.selection, 10);
                broadcastLog('info', 'USER', ['Toggled Next Transition Selection mask: ' + currentTransitionSelection], targetIp);
                try {
                    if (typeof atem.changeTransitionSelection === 'function') {
                        atem.changeTransitionSelection(currentTransitionSelection, 0).catch(e => {
                            broadcastLog('error', 'BRIDGE', ['changeTransitionSelection failed: ' + (e.message || e)]);
                        });
                    }
                } catch(e) {}
                broadcastState(null, true);
            } else if (data.action === 'TOGGLE_DSK_TIE') {
                dsk.tie = Boolean(data.tie);
                broadcastLog('info', 'USER', ['Toggled DSK Tie: ' + dsk.tie], targetIp);
                try {
                    if (typeof atem.setDownstreamKeyTie === 'function') {
                        atem.setDownstreamKeyTie(Boolean(data.tie), 0).catch(e => {
                            broadcastLog('error', 'BRIDGE', ['setDownstreamKeyTie failed: ' + (e.message || e)]);
                        });
                    }
                } catch(e) {}
                broadcastState(null, true);
            } else if (data.action === 'TOGGLE_DSK_ONAIR') {
                dsk.onAir = Boolean(data.onAir);
                broadcastLog('info', 'USER', ['Toggled DSK On Air: ' + dsk.onAir], targetIp);
                try {
                    if (typeof atem.setDownstreamKeyOnAir === 'function') {
                        atem.setDownstreamKeyOnAir(Boolean(data.onAir), 0).catch(e => {
                            broadcastLog('error', 'BRIDGE', ['setDownstreamKeyOnAir failed: ' + (e.message || e)]);
                        });
                    }
                } catch(e) {}
                broadcastState(null, true);
            } else if (data.action === 'EXECUTE_DSK_AUTO') {
                broadcastLog('info', 'USER', ['Executed DSK AUTO transition (Rate: ' + dsk.rate + ' frames)'], targetIp);
                try {
                    if (typeof atem.autoDownstreamKey === 'function') {
                        atem.autoDownstreamKey(0).catch(e => {});
                    }
                } catch(e) {}
            } else if (data.action === 'SET_DSK_RATE' && data.rate !== undefined) {
                dsk.rate = parseInt(data.rate, 10) || 30;
                broadcastLog('info', 'USER', ['Set DSK Rate to ' + dsk.rate + ' frames'], targetIp);
                try {
                    if (typeof atem.setDownstreamKeyRate === 'function') {
                        atem.setDownstreamKeyRate(dsk.rate, 0).catch(e => {});
                    }
                } catch(e) {}
                broadcastState(null, true);
            } else if (data.action === 'EXECUTE_FTB') {
                broadcastLog('info', 'USER', ['Executed Fade to Black (FTB) (Rate: ' + ftb.rate + ' frames)'], targetIp);
                if (typeof atem.fadeToBlack === 'function') {
                    atem.fadeToBlack(0).catch(e => {});
                }
            } else if (data.action === 'SET_FTB_RATE' && data.rate !== undefined) {
                ftb.rate = parseInt(data.rate, 10) || 30;
                broadcastLog('info', 'USER', ['Set FTB Rate to ' + ftb.rate + ' frames'], targetIp);
                if (typeof atem.setFadeToBlackRate === 'function') {
                    atem.setFadeToBlackRate(ftb.rate, 0).catch(e => {});
                }
                broadcastState(null, true);
            } else if (data.action === 'CLEAR_STILL' && data.index !== undefined) {
                broadcastLog('info', 'USER', ['Cleared Media Pool Still ' + (parseInt(data.index, 10) + 1)], targetIp);
                if (typeof atem.clearMediaPoolStill === 'function') {
                    atem.clearMediaPoolStill(data.index).catch(e => {});
                }
            } else if (data.action === 'SET_MEDIA_PLAYER_SOURCE' && data.player !== undefined) {
                const playerIdx = parseInt(data.player, 10);
                const props = {};
                if (data.sourceType !== undefined) props.sourceType = data.sourceType;
                if (data.stillIndex !== undefined) props.stillIndex = data.stillIndex;
                if (data.clipIndex !== undefined) props.clipIndex = data.clipIndex;

                if (typeof atem.setMediaPlayerSource === 'function') {
                    atem.setMediaPlayerSource(props, playerIdx)
                        .then(() => broadcastState(null, true))
                        .catch(e => {});
                }
            } else if (data.action === 'MACRO_LOOP' && data.loop !== undefined) {
                broadcastLog('info', 'USER', ['Toggled Macro Loop: ' + Boolean(data.loop)], targetIp);
                try {
                    if (typeof atem.setMacroLoop === 'function') atem.setMacroLoop(data.loop);
                    else if (typeof atem.macroSetLoop === 'function') atem.macroSetLoop(data.loop);
                } catch(e) {}
            } else if (data.action === 'MACRO_RUN' && data.index !== undefined) {
                broadcastLog('info', 'USER', ['Ran Macro index ' + data.index], targetIp);
                if (typeof atem.macroRun === 'function') atem.macroRun(parseInt(data.index, 10)).catch(()=>{});
            } else if (data.action === 'MACRO_STOP') {
                broadcastLog('info', 'USER', ['Stopped Macro execution'], targetIp);
                if (typeof atem.macroStop === 'function') atem.macroStop().catch(()=>{});
            }
        } catch (err) {}
    });

    ws.on('close', () => {
        broadcastLog('info', 'BRIDGE', ['Client disconnected from WebSocket daemon']);
    });
});

setInterval(() => {
    const req = http.get('http://localhost:' + VITE_PORT, () => {});
    req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' && Date.now() - startTime > 30000) {
            console.log('[ATEM Bridge Watchdog] Vite server closed. Terminating bridge daemon...');
            process.exit(0);
        }
    });
    req.setTimeout(1500, () => req.destroy());
}, 5000);