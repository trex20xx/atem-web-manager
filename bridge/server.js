// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v2.13.0)
// =========================================================================
// Full bidirectional synchronization between physical ATEM hardware 
// (UDP 9910) and React frontend (WebSocket 8080).

const { Atem } = require('atem-connection');
const WebSocket = require('ws');

const ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

console.log(`[ATEM Bridge v2.13.0] Starting bridge service...`);
console.log(`[ATEM Bridge v2.13.0] Target ATEM Switcher IP: ${ATEM_IP}`);

const atem = new Atem();
let isAtemConnected = false;

// Authoritative switcher state cache
let currentPgm = 1;
let currentPvw = 2;
let currentInTransition = false;

function broadcastState(targetWs = null) {
    try {
        const hardwareConnected = (atem && atem.status === 2) || isAtemConnected;

        // Synchronize with atem-connection state tree if populated
        if (atem && atem.state && atem.state.video && atem.state.video.mixEffects) {
            const meObj = atem.state.video.mixEffects;
            const me = meObj[0] || (Array.isArray(meObj) ? meObj[0] : Object.values(meObj)[0]);
            if (me) {
                if (typeof me.programInput === 'number') currentPgm = me.programInput;
                if (typeof me.previewInput === 'number') currentPvw = me.previewInput;
                if (me.transitionPosition && typeof me.transitionPosition.inTransition === 'boolean') {
                    currentInTransition = me.transitionPosition.inTransition;
                } else if (typeof me.inTransition === 'boolean') {
                    currentInTransition = me.inTransition;
                }
            }
        }

        const payload = JSON.stringify({
            type: 'STATE',
            hardwareConnected,
            pgm: currentPgm,
            pvw: currentPvw,
            inTransition: currentInTransition
        });

        console.log(`[ATEM Bridge ➔ UI Broadcast] PGM=${currentPgm} | PVW=${currentPvw} | InTrans=${currentInTransition} | Hardware=${hardwareConnected ? 'ONLINE' : 'OFFLINE'}`);

        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(payload);
            return;
        }

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    } catch (err) {
        console.error('[ATEM Bridge] Error broadcasting state:', err);
    }
}

// 1. Direct hardware packet listener: catches physical button presses instantly
atem.on('receivedCommands', (commands) => {
    let stateChanged = false;
    for (const cmd of commands) {
        const raw = cmd.rawName || (cmd.constructor ? cmd.constructor.name : '');
        const props = cmd.properties || {};

        // Physical ATEM Program Input change
        if (raw === 'PrgI' || raw.includes('ProgramInput')) {
            const src = props.source !== undefined ? props.source : props.programInput;
            if (typeof src === 'number') {
                currentPgm = src;
                stateChanged = true;
                console.log(`[ATEM Bridge ⬅ Physical ATEM Event] Hardware changed Program to Input ${src}`);
            }
        }

        // Physical ATEM Preview Input change
        else if (raw === 'PrvI' || raw.includes('PreviewInput')) {
            const src = props.source !== undefined ? props.source : props.previewInput;
            if (typeof src === 'number') {
                currentPvw = src;
                stateChanged = true;
                console.log(`[ATEM Bridge ⬅ Physical ATEM Event] Hardware changed Preview to Input ${src}`);
            }
        }

        // Physical ATEM Transition change
        else if (raw === 'TrPr' || raw === 'TrPs' || raw.includes('TransitionPosition')) {
            if (props.inTransition !== undefined) {
                currentInTransition = !!props.inTransition;
                stateChanged = true;
            }
        }
    }

    if (stateChanged) {
        broadcastState();
    }
});

// 2. High-level state changed listener
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

// Connect to physical ATEM switcher
atem.connect(ATEM_IP).catch((err) => {
    console.log(`[ATEM Bridge] Initial connection attempt deferred:`, err.message || err);
});

// Setup WebSocket Server for UI clients
const wss = new WebSocket.Server({ port: BRIDGE_PORT }, () => {
    console.log(`[ATEM Bridge] WebSocket server running on ws://localhost:${BRIDGE_PORT}`);
});

wss.on('connection', (ws) => {
    console.log('[ATEM Bridge] React Frontend UI connected via WebSocket.');
    broadcastState(ws);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[ATEM Bridge ⬅ UI Command] Action: ${data.action}`, data.input !== undefined ? `| Input: ${data.input}` : '');

            if (data.action === 'CONNECT' || data.action === 'GET_STATE') {
                broadcastState(ws);
            } else if (data.action === 'SET_PGM' && data.input !== undefined) {
                const inputNum = parseInt(data.input, 10);
                currentPgm = inputNum;
                atem.changeProgramInput(inputNum, 0).catch((e) => {
                    console.error('[ATEM Bridge] PGM Change Error:', e.message || e);
                });
                broadcastState();
            } else if (data.action === 'SET_PVW' && data.input !== undefined) {
                const inputNum = parseInt(data.input, 10);
                currentPvw = inputNum;
                atem.changePreviewInput(inputNum, 0).catch((e) => {
                    console.error('[ATEM Bridge] PVW Change Error:', e.message || e);
                });
                broadcastState();
            } else if (data.action === 'CUT') {
                const temp = currentPgm;
                currentPgm = currentPvw;
                currentPvw = temp;
                atem.cut(0).catch((e) => {
                    console.error('[ATEM Bridge] CUT Error:', e.message || e);
                });
                broadcastState();
            } else if (data.action === 'AUTO') {
                atem.autoTransition(0).catch((e) => {
                    console.error('[ATEM Bridge] AUTO Error:', e.message || e);
                });
            }
        } catch (err) {
            console.error('[ATEM Bridge] Failed to process message:', err);
        }
    });

    ws.on('close', () => {
        console.log('[ATEM Bridge] React Frontend UI disconnected.');
    });
});