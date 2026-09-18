// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v3.90) - CLEAN REWRITE
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

// Track last known state to detect changes and prevent double-logging
let lastState = {
    pgm: null, pvw: null, aux: {}, transRate: null, transSelection: null,
    dskTie: null, dskOnAir: null, dskRate: null, ftbRate: null
};

// Track recent user commands to attribute logs correctly
let recentUserCommands = {};

function markUserCommand(key, value) {
    recentUserCommands[key] = { value, time: Date.now() };
}

function wasTriggeredByUser(key, value) {
    const record = recentUserCommands[key];
    if (record && record.value === value && (Date.now() - record.time < 1500)) {
        delete recentUserCommands[key];
        return true;
    }
    return false;
}

function getFriendlyName(id) {
    const num = parseInt(id, 10);
    let custom = '';
    if (atem?.state?.inputs?.[num]) {
        custom = atem.state.inputs[num].longName || atem.state.inputs[num].shortName || '';
    }
    let base = '';
    if (num >= 1 && num <= 10) base = 'Input ' + num;
    else {
        switch (num) {
            case 0: base = 'Black'; break;
            case 1000: base = 'Color Bars'; break;
            case 2001: base = 'Color 1'; break;
            case 2002: base = 'Color 2'; break;
            case 3010: base = 'MP1'; break;
            case 3020: base = 'MP2'; break;
            case 10010: base = 'PGM'; break;
            case 10011: base = 'PVW'; break;
            default: base = 'Source ' + id;
        }
    }
    return (custom && custom !== base && !base.includes(custom)) ? `${base} (${custom})` : base;
}

const wss = new WebSocket.Server({ port: BRIDGE_PORT }, () => {
    broadcastLog('info', 'SYSTEM', ['WebSocket server running on port ' + BRIDGE_PORT]);
});

function broadcastLog(level, source, args) {
    try {
        const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        const payload = JSON.stringify({ type: 'LOG', level, source, ip: source === 'SYSTEM' ? 'SYSTEM' : ATEM_IP, message: msg, timestamp: Date.now() });
        wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
    } catch (e) {}
}

const originalLog = console.log;
console.log = function() { originalLog.apply(console, arguments); broadcastLog('info', 'SYSTEM', arguments); };
console.warn = function() { broadcastLog('warn', 'SYSTEM', arguments); };
console.error = function() { broadcastLog('error', 'SYSTEM', arguments); };

function broadcastState() {
    if (!broadcastTimeout) {
        broadcastTimeout = setTimeout(() => {
            extractAndBroadcast();
            broadcastTimeout = null;
        }, 15);
    }
}

function extractAndBroadcast() {
    if (!atem || !atem.state) return;

    try {
        const video = atem.state.video;
        const me = video.mixEffects?.[0];
        const dsk = video.downstreamKeyers?.[0];
        const aux = video.auxiliaries || {};
        
        let pgm = me?.programInput || 1;
        let pvw = me?.previewInput || 2;
        let inTrans = me?.transitionPosition?.inTransition || false;
        let transPos = me?.transitionPosition?.handlePosition || 0;
        let transRate = me?.transitionProperties?.rate || 25;
        let transSel = me?.transitionProperties?.selection || 1;
        let ftbRate = me?.fadeToBlack?.rate || 25;
        let ftbState = me?.fadeToBlack?.isFullyBlack || false;
        let ftbInTrans = me?.fadeToBlack?.inTransition || false;

        let uskAir = [false, false, false, false];
        if (me?.upstreamKeyers) {
            uskAir = [0, 1, 2, 3].map(i => Boolean(me.upstreamKeyers[i]?.onAir));
        }

        let auxSources = [1, 2, 3, 4, 5, 6].map((_, i) => aux[i] !== undefined ? aux[i] : 1);

        let dskState = { 
            onAir: dsk?.onAir || false, 
            inTransition: dsk?.inTransition || false,
            tie: dsk?.properties?.tie || false, 
            rate: dsk?.properties?.rate || 25 
        };

        // --- ATEM TELEMETRY LOGGING (Only if ATEM changed it, not USER) ---
        if (lastState.pgm !== pgm && lastState.pgm !== null) {
            if (!wasTriggeredByUser('pgm', pgm)) broadcastLog('info', 'ATEM', [`Program set to ${getFriendlyName(pgm)}`]);
        }
        if (lastState.pvw !== pvw && lastState.pvw !== null) {
            if (!wasTriggeredByUser('pvw', pvw)) broadcastLog('info', 'ATEM', [`Preview set to ${getFriendlyName(pvw)}`]);
        }
        auxSources.forEach((src, i) => {
            if (lastState.aux[i] !== src && lastState.aux[i] !== undefined) {
                if (!wasTriggeredByUser(`aux${i}`, src)) broadcastLog('info', 'ATEM', [`Aux ${i + 1} set to ${getFriendlyName(src)}`]);
            }
            lastState.aux[i] = src;
        });

        lastState.pgm = pgm;
        lastState.pvw = pvw;

        let mediaPool = { stills: [], clips: [] };
        if (atem.state.media) {
            mediaPool.stills = (atem.state.media.stillPool || []).map(s => ({ isUsed: Boolean(s?.isUsed), name: s?.fileName || '' }));
            mediaPool.clips = (atem.state.media.clipPool || []).map(c => ({ isUsed: Boolean(c?.isUsed), name: c?.name || '' }));
        }
        let mediaPlayers = [0, 1].map(i => atem.state.media?.players?.[i] || { sourceType: 1, stillIndex: i, clipIndex: 0 });

        const payload = JSON.stringify({
            type: 'STATE', hardwareConnected: isAtemConnected,
            pgm, pvw, inTransition: inTrans, transitionPosition: transPos, transitionRate: transRate,
            transitionSelection: transSel, uskOnAir: uskAir, auxSources, dsk: dskState, 
            ftb: { inTransition: ftbInTrans, isFullyBlack: ftbState, rate: ftbRate },
            mediaPool, mediaPlayers
        });

        wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(payload); });
    } catch (e) {}
}

function setupAtem() {
    atem.on('stateChanged', () => broadcastState());
    atem.on('connected', () => {
        isAtemConnected = true;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        broadcastLog('info', 'SYSTEM', [`Connected to ATEM at ${ATEM_IP}`]);
        broadcastState();
    });
    atem.on('disconnected', () => {
        isAtemConnected = false;
        broadcastLog('warn', 'SYSTEM', [`Lost connection to ATEM at ${ATEM_IP}`]);
        broadcastState();
        reconnectTimer = setTimeout(() => { if (!isAtemConnected) atem.connect(ATEM_IP).catch(()=>{}); }, 3000);
    });
}
setupAtem();
atem.connect(ATEM_IP).catch(()=>{});

wss.on('connection', (ws) => {
    broadcastState();

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.action === 'CONNECT' || data.action === 'GET_STATE') {
                if (data.ip && data.ip !== ATEM_IP) {
                    ATEM_IP = data.ip;
                    atem.disconnect();
                    atem.connect(ATEM_IP).catch(()=>{});
                }
                broadcastState();
                return;
            }

            if (!isAtemConnected) return;

            // --- COMMAND ROUTER ---
            if (data.action === 'SET_PGM') {
                markUserCommand('pgm', data.input);
                broadcastLog('info', 'USER', [`Program set to ${getFriendlyName(data.input)}`]);
                atem.changeProgramInput(data.input).catch(()=>{});
            } 
            else if (data.action === 'SET_PVW') {
                markUserCommand('pvw', data.input);
                broadcastLog('info', 'USER', [`Preview set to ${getFriendlyName(data.input)}`]);
                atem.changePreviewInput(data.input).catch(()=>{});
            } 
            else if (data.action === 'SET_AUX') {
                markUserCommand(`aux${data.aux}`, data.source);
                broadcastLog('info', 'USER', [`Aux ${data.aux + 1} set to ${getFriendlyName(data.source)}`]);
                atem.setAuxSource(data.source, data.aux).catch(()=>{});
            } 
            else if (data.action === 'CUT') {
                broadcastLog('info', 'USER', ['Executed CUT transition']);
                atem.cut().catch(()=>{});
            } 
            else if (data.action === 'AUTO') {
                broadcastLog('info', 'USER', ['Executed AUTO transition']);
                atem.autoTransition().catch(()=>{});
            } 
            else if (data.action === 'SET_TRANSITION_RATE') {
                broadcastLog('info', 'USER', [`Transition Rate set to ${data.rate} frames`]);
                atem.setMixTransitionSettings({ rate: data.rate }).catch(()=>{});
            } 
            else if (data.action === 'SET_TRANS_POSITION') {
                atem.setTransitionPosition(data.position).catch(()=>{});
            } 
            else if (data.action === 'TOGGLE_TRANS_SELECTION') {
                broadcastLog('info', 'USER', [`Toggled Transition Selection Bitmask: ${data.bit}`]);
                atem.setTransitionSelection(data.bit).catch(err => {
                    broadcastLog('error', 'DEBUG', [`TransitionSelection Error: ${err.message}`]);
                });
            } 
            else if (data.action === 'TOGGLE_USK_ONAIR') {
                broadcastLog('info', 'USER', [`Toggled Key ${data.usk + 1} On Air`]);
                atem.setUpstreamKeyerOnAir(!atem.state.video.mixEffects[0].upstreamKeyers[data.usk].onAir, 0, data.usk).catch(()=>{});
            } 
            else if (data.action === 'TOGGLE_DSK_TIE') {
                broadcastLog('info', 'USER', ['Toggled DSK 1 TIE']);
                atem.setDownstreamKeyTie(!atem.state.video.downstreamKeyers[0].properties.tie, 0).catch(err => {
                    broadcastLog('error', 'DEBUG', [`DSKTie Error: ${err.message}`]);
                });
            } 
            else if (data.action === 'TOGGLE_DSK_ONAIR') {
                broadcastLog('info', 'USER', ['Toggled DSK 1 ON AIR']);
                atem.setDownstreamKeyOnAir(!atem.state.video.downstreamKeyers[0].onAir, 0).catch(err => {
                    broadcastLog('error', 'DEBUG', [`DSKOnAir Error: ${err.message}`]);
                });
            } 
            else if (data.action === 'EXECUTE_DSK_AUTO') {
                broadcastLog('info', 'USER', ['Executed DSK 1 AUTO']);
                atem.autoDownstreamKey(0).catch(()=>{});
            } 
            else if (data.action === 'SET_DSK_RATE') {
                broadcastLog('info', 'USER', [`DSK 1 Rate set to ${data.rate} frames`]);
                atem.setDownstreamKeyRate(data.rate, 0).catch(()=>{});
            } 
            else if (data.action === 'EXECUTE_FTB') {
                broadcastLog('info', 'USER', ['Executed Fade to Black']);
                atem.fadeToBlack().catch(()=>{});
            } 
            else if (data.action === 'SET_FTB_RATE') {
                broadcastLog('info', 'USER', [`FTB Rate set to ${data.rate} frames`]);
                atem.setFadeToBlackRate(data.rate).catch(()=>{});
            }
        } catch (err) {}
    });
});

setInterval(() => {
    const req = http.get('http://localhost:' + VITE_PORT, () => {});
    req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' && Date.now() - startTime > 30000) {
            process.exit(0);
        }
    });
    req.setTimeout(1500, () => req.destroy());
}, 5000);