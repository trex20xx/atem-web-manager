// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v2.12.0)
// =========================================================================
// Full bidirectional synchronization between physical ATEM hardware 
// (UDP 9910) and React frontend (WebSocket 8080).

const { Atem } = require('atem-connection');
const WebSocket = require('ws');

const ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

console.log(`[ATEM Bridge v2.12.0] Starting bridge service...`);
console.log(`[ATEM Bridge v2.12.0] Target ATEM Switcher IP: ${ATEM_IP}`);

const atem = new Atem();
let isAtemConnected = false;
let lastBroadcastState = { pgm: null, pvw: null, inTransition: null, hardwareConnected: null };

// State broadcaster: only broadcasts actual valid state from ATEM without fallbacks
function broadcastState(targetWs = null) {
    try {
        const hardwareConnected = (atem && atem.status === 2) || isAtemConnected;

        if (!atem || !atem.state || !atem.state.video || !atem.state.video.mixEffects) {
            // If ATEM state is not yet ready, send connection status only
            const fallbackMsg = JSON.stringify({
                type: 'STATE',
                hardwareConnected
            });
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(fallbackMsg);
            }
            return;
        }

        const meObj = atem.state.video.mixEffects;
        const me = meObj[0] || (Array.isArray(meObj) ? meObj[0] : Object.values(meObj)[0]);

        if (!me || typeof me.programInput !== 'number' || typeof me.previewInput !== 'number') {
            return;
        }

        const pgm = me.programInput;
        const pvw = me.previewInput;
        let inTransition = false;
        if (me.transitionPosition && typeof me.transitionPosition.inTransition === 'boolean') {
            inTransition = me.transitionPosition.inTransition;
        } else if (typeof me.inTransition === 'boolean') {
            inTransition = me.inTransition;
        }

        // Deduplication check: do not flood clients if switcher state has not changed
        if (!targetWs) {
            if (
                lastBroadcastState.pgm === pgm &&
                lastBroadcastState.pvw === pvw &&
                lastBroadcastState.inTransition === inTransition &&
                lastBroadcastState.hardwareConnected === hardwareConnected
            ) {
                return;
            }
        }

        lastBroadcastState = { pgm, pvw, inTransition, hardwareConnected };

        const payload = JSON.stringify({
            type: 'STATE',
            hardwareConnected,
            pgm,
            pvw,
            inTransition
        });

        console.log(`[ATEM Bridge ➔ UI Broadcast] PGM=${pgm} | PVW=${pvw} | InTrans=${inTransition} | Hardware=${hardwareConnected ? 'ONLINE' : 'OFFLINE'}`);

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

atem.on('stateChanged', () => {
    broadcastState();
});

atem.on('error', (err) => {
    console.error(`[ATEM Bridge Error]:`, err.message || err);
});

// Connect to ATEM switcher
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
                atem.changeProgramInput(inputNum, 0).catch((e) => {
                    console.error('[ATEM Bridge] PGM Change Error:', e.message || e);
                });
            } else if (data.action === 'SET_PVW' && data.input !== undefined) {
                const inputNum = parseInt(data.input, 10);
                atem.changePreviewInput(inputNum, 0).catch((e) => {
                    console.error('[ATEM Bridge] PVW Change Error:', e.message || e);
                });
            } else if (data.action === 'CUT') {
                atem.cut(0).catch((e) => {
                    console.error('[ATEM Bridge] CUT Error:', e.message || e);
                });
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