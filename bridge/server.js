// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v2.66)
// =========================================================================
// Bidirectional switcher bus, macro execution & aux router sync with auto-watchdog.

const { Atem } = require('atem-connection');
const WebSocket = require('ws');
const http = require('http');

const ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;
const VITE_PORT = 3000;
const startTime = Date.now();

console.log(`[ATEM Bridge v2.66] Starting bridge service...`);
console.log(`[ATEM Bridge v2.66] Target ATEM Switcher IP: ${ATEM_IP}`);

const atem = new Atem();
let isAtemConnected = false;

// Authoritative switcher state cache
let currentPgm = 1;
let currentPvw = 2;
let currentInTransition = false;
let currentTransitionRate = 30;
let currentAux = [1, 2, 3, 4, 5, 6];

function broadcastState(targetWs = null) {
    try {
        const hardwareConnected = (atem && atem.status === 2) || isAtemConnected;

        // Extract PGM/PVW/Transitions
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

                if (me.transitionProperties && typeof me.transitionProperties.rate === 'number') {
                    currentTransitionRate = me.transitionProperties.rate;
                }
            }
        }

        // Extract Auxiliaries (Outputs 1 to 6)
        if (atem && atem.state && atem.state.video && atem.state.video.auxiliaries) {
            const auxObj = atem.state.video.auxiliaries;
            currentAux = [0, 1, 2, 3, 4, 5].map(idx => {
                const val = auxObj[idx];
                return typeof val === 'number' ? val : (currentAux[idx] || 1);
            });
        }

        // Extract Macros
        let macroPlayer = { isRunning: false, isWaiting: false, loop: false, macroIndex: -1 };
        let macroProperties = [];
        if (atem && atem.state && atem.state.macro) {
            if (atem.state.macro.macroPlayer) macroPlayer = atem.state.macro.macroPlayer;
            if (atem.state.macro.macroProperties) macroProperties = atem.state.macro.macroProperties;
        }

        const payload = JSON.stringify({
            type: 'STATE',
            hardwareConnected,
            pgm: currentPgm,
            pvw: currentPvw,
            inTransition: currentInTransition,
            transitionRate: currentTransitionRate,
            auxSources: currentAux,
            macroPlayer,
            macroProperties
        });

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

// Universal command parser for physical ATEM hardware packets
function handleHardwareCommand(cmd) {
    if (!cmd) return false;
    const raw = cmd.rawName || (cmd.constructor ? cmd.constructor.name : '');
    const props = cmd.properties || {};
    let changed = false;

    if (raw === 'PrgI' || raw.includes('ProgramInput')) {
        const src = props.source !== undefined ? props.source : props.programInput;
        if (typeof src === 'number') {
            currentPgm = src;
            changed = true;
            console.log(`[ATEM Bridge ⬅ Physical Switcher Event] Program changed to Input ${src}`);
        }
    } else if (raw === 'PrvI' || raw.includes('PreviewInput')) {
        const src = props.source !== undefined ? props.source : props.previewInput;
        if (typeof src === 'number') {
            currentPvw = src;
            changed = true;
            console.log(`[ATEM Bridge ⬅ Physical Switcher Event] Preview changed to Input ${src}`);
        }
    } else if (raw === 'TrPr' || raw === 'TrPs' || raw.includes('TransitionPosition')) {
        if (props.inTransition !== undefined) {
            currentInTransition = !!props.inTransition;
            changed = true;
        }
    } else if (raw === 'TMxr' || raw.includes('TransitionMix') || raw.includes('TransitionProperties')) {
        if (props.rate !== undefined) {
            currentTransitionRate = props.rate;
            changed = true;
        }
    } else if (raw === 'AuxS' || raw.includes('AuxSource')) {
        const auxId = props.id !== undefined ? props.id : props.auxiliaryId;
        const src = props.source !== undefined ? props.source : props.input;
        if (typeof auxId === 'number' && typeof src === 'number' && auxId >= 0 && auxId < 6) {
            currentAux[auxId] = src;
            changed = true;
            console.log(`[ATEM Bridge ⬅ Physical Switcher Event] Output ${auxId + 1} routed to Source ${src}`);
        }
    } else if (raw === 'MRPr' || raw.includes('Macro')) {
        changed = true;
    }

    return changed;
}

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

            if (data.action === 'CONNECT' || data.action === 'GET_STATE') {
                broadcastState(ws);
            } else if (data.action === 'SET_PGM' && data.input !== undefined) {
                const inputNum = parseInt(data.input, 10);
                currentPgm = inputNum;
                atem.changeProgramInput(inputNum, 0).catch((e) => console.error('[ATEM Bridge] PGM Error:', e.message || e));
                broadcastState();
            } else if (data.action === 'SET_PVW' && data.input !== undefined) {
                const inputNum = parseInt(data.input, 10);
                currentPvw = inputNum;
                atem.changePreviewInput(inputNum, 0).catch((e) => console.error('[ATEM Bridge] PVW Error:', e.message || e));
                broadcastState();
            } else if (data.action === 'CUT') {
                atem.cut(0).catch((e) => console.error('[ATEM Bridge] CUT Error:', e.message || e));
            } else if (data.action === 'AUTO') {
                atem.autoTransition(0).catch((e) => console.error('[ATEM Bridge] AUTO Error:', e.message || e));
            } else if (data.action === 'SET_TRANSITION_RATE' && data.rate !== undefined) {
                const rateNum = parseInt(data.rate, 10) || 30;
                currentTransitionRate = rateNum;
                atem.setTransitionRate(rateNum, 0).catch((e) => console.error('[ATEM Bridge] Rate Error:', e.message || e));
                broadcastState();
            } else if (data.action === 'SET_AUX' && data.aux !== undefined && data.source !== undefined) {
                const auxIdx = parseInt(data.aux, 10);
                const src = parseInt(data.source, 10);
                console.log(`[ATEM Bridge ➔ Routing Aux Output] Output ${auxIdx + 1} (Bus index ${auxIdx}) to Source ${src}`);
                
                // Direct call to Sofie atem-connection: setAuxSource(source, bus = 0)
                if (typeof atem.setAuxSource === 'function') {
                    atem.setAuxSource(src, auxIdx)
                        .then(() => {
                            console.log(`[ATEM Bridge] Aux ${auxIdx + 1} successfully routed to Source ${src}`);
                            currentAux[auxIdx] = src;
                            broadcastState();
                        })
                        .catch((errPrimary) => {
                            console.warn(`[ATEM Bridge] Primary setAuxSource(${src}, ${auxIdx}) failed (${errPrimary.message}). Attempting (bus, source) permutation...`);
                            atem.setAuxSource(auxIdx, src)
                                .then(() => {
                                    console.log(`[ATEM Bridge] Aux ${auxIdx + 1} successfully routed via inverted parameters`);
                                    currentAux[auxIdx] = src;
                                    broadcastState();
                                })
                                .catch((errSecondary) => {
                                    console.error(`[ATEM Bridge] Both aux routing signatures failed:`, errSecondary.message || errSecondary);
                                });
                        });
                }
            } else if (data.action === 'MACRO_RUN' && data.index !== undefined) {
                if (typeof atem.macroRun === 'function') atem.macroRun(parseInt(data.index, 10)).catch(()=>{});
            } else if (data.action === 'MACRO_STOP') {
                if (typeof atem.macroStop === 'function') atem.macroStop().catch(()=>{});
            } else if (data.action === 'MACRO_LOOP' && data.loop !== undefined) {
                if (typeof atem.macroSetLoop === 'function') atem.macroSetLoop(data.loop).catch(()=>{});
            }
        } catch (err) {
            console.error('[ATEM Bridge] Message processing error:', err);
        }
    });

    ws.on('close', () => {
        console.log('[ATEM Bridge] React Frontend UI disconnected.');
    });
});

// Automated Watchdog: Terminates bridge daemon if Vite frontend on Port 3000 stops
setInterval(() => {
    const req = http.get(`http://localhost:${VITE_PORT}`, () => {});
    req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' && Date.now() - startTime > 10000) {
            console.log('[ATEM Bridge Watchdog] Vite server closed on port 3000. Terminating bridge daemon...');
            process.exit(0);
        }
    });
    req.setTimeout(1500, () => req.destroy());
}, 3000);