// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (Bundled inside project)
// =========================================================================
const { Atem } = require('atem-connection');
const WebSocket = require('ws');

const ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

console.log(`[ATEM Bridge] Initializing connection to physical switcher at ${ATEM_IP}...`);
const atem = new Atem();

atem.on('connected', () => {
    console.log(`[ATEM Bridge] SUCCESS: Connected to physical ATEM switcher at ${ATEM_IP}`);
});

atem.on('error', (err) => {
    console.error(`[ATEM Bridge Error]:`, err);
});

try {
    atem.connect(ATEM_IP);
} catch (e) {
    console.log('[ATEM Bridge] Running in simulation mode (Hardware not detected).');
}

const wss = new WebSocket.Server({ port: BRIDGE_PORT }, () => {
    console.log(`[ATEM Bridge] WebSocket server running on ws://localhost:${BRIDGE_PORT}`);
});

wss.on('connection', (ws) => {
    console.log('[ATEM Bridge] React Frontend UI connected via WebSocket.');
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[ATEM Bridge] Command:`, data.action, data.input || '');
            if (data.action === 'SET_PGM') atem.changeProgramInput(data.input, 0);
            if (data.action === 'SET_PVW') atem.changePreviewInput(data.input, 0);
            if (data.action === 'CUT') atem.cut(0);
            if (data.action === 'AUTO') atem.autoTransition(0);
        } catch (err) {
            console.error('[ATEM Bridge] Message error:', err);
        }
    });
});