// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v2.72)
// =========================================================================
// Bidirectional switcher bus, macro execution, aux router, DSK, FTB & keyers.

const { Atem } = require('atem-connection');
const WebSocket = require('ws');
const http = require('http');

const ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;
const VITE_PORT = 3000;
const startTime = Date.now();

console.log(`[ATEM Bridge v2.72] Starting bridge service...`);
console.log(`[ATEM Bridge v2.72] Target ATEM Switcher IP: ${ATEM_IP}`);

const atem = new Atem();
let isAtemConnected = false;

// Authoritative switcher state cache
let currentPgm = 1;
let currentPvw = 2;
let currentInTransition = false;
let currentTransitionRate = 30;
let currentTransitionSelection = 1; // Bit 1: BKGD, Bit 2: KEY1, Bit 4: KEY2, Bit 8: KEY3, Bit 16: KEY4
let currentUskOnAir = [false, false, false, false];
let currentAux = [1, 2, 3, 4, 5, 6];

let dsk = { onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: 30 };
let ftb = { inTransition: false, isFullyBlack: false, rate: 30 };

function broadcastState(targetWs = null) {
    try {
        const hardwareConnected = (atem && atem.status === 2) || isAtemConnected;

        // Extract PGM/PVW/Transitions/ME
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

                if (me.transitionProperties) {
                    if (typeof me.transitionProperties.rate === 'number') currentTransitionRate = me.transitionProperties.rate;
                    if (typeof me.transitionProperties.selection === 'number') currentTransitionSelection = me.transitionProperties.selection;
                }

                if (me.upstreamKeyers) {
                    currentUskOnAir = [0, 1, 2, 3].map(i => me.upstreamKeyers[i] ? me.upstreamKeyers[i].onAir : false);
                }

                if (me.fadeToBlack) ftb = me.fadeToBlack;
            }
        }

        // Extract Auxiliaries (Outputs 1 to 6)
        if (atem && atem.state && atem.state.video && atem.state.video.auxiliaries) {
            const auxObj = atem.state.video.auxiliaries;
            const keys = Object.keys(auxObj).map(Number).sort((a, b) => a - b);
            if (keys.length > 0) {
                currentAux = [0, 1, 2, 3, 4, 5].map(idx => {
                    const busKey = keys[idx] !== undefined ? keys[idx] : idx;
                    const val = auxObj[busKey];
                    return typeof val === 'number' ? val : (currentAux[idx] || 1);
                });
            }
        }

        // Extract DSK
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
            transitionSelection: currentTransitionSelection,
            uskOnAir: currentUskOnAir,
            auxSources: currentAux,
            dsk,
            ftb,
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
            console.log(`[ATEM Bridge ➔ Physical Switcher Event] Program changed to Input ${src}`);
        }
    } else if (raw === 'PrvI' || raw.includes('PreviewInput')) {
        const src = props.source !== undefined ? props.source : props.previewInput;
        if (typeof src === 'number') {
            currentPvw = src;
            changed = true;
            console.log(`[ATEM Bridge ➔ Physical Switcher Event] Preview changed to Input ${src}`);
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
        if (props.selection !== undefined) {
            currentTransitionSelection = props.selection;
            changed = true;
        }
    } else if (raw === 'AuxS' || raw.includes('AuxSource')) {
        const auxId = props.id !== undefined ? props.id : props.auxiliaryId;
        const src = props.source !== undefined ? props.source : props.input;
        if (typeof auxId === 'number' && typeof src === 'number') {
            console.log(`[ATEM Bridge ➔ Physical Switcher Event] Aux bus ${auxId} routed to Source ${src}`);
            changed = true;
        }
    } else if (raw.includes('Upstream') || raw === 'KeOn' || raw.includes('Downstream') || raw.includes('FadeToBlack') || raw.includes('Ftb')) {
        changed = true;
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
                console.log(`[ATEM Bridge ➔ Setting Mix Transition Rate] ${rateNum} frames`);
                if (typeof atem.setMixTransitionSettings === 'function') {
                    atem.setMixTransitionSettings({ rate: rateNum }, 0).catch(e => console.error('[ATEM Bridge] Rate Error:', e.message || e));
                }
                broadcastState();
            } else if (data.action === 'TOGGLE_USK_ONAIR' && data.usk !== undefined) {
                const uskIdx = parseInt(data.usk, 10);
                const newState = !currentUskOnAir[uskIdx];
                console.log(`[ATEM Bridge ➔ Toggling USK ${uskIdx + 1} On Air] -> ${newState}`);
                
                // Resilient fallback execution for changing typings
                if (typeof atem.setUpstreamKeyerOnAir === 'function') {
                    try {
                        atem.setUpstreamKeyerOnAir(newState, 0, uskIdx).catch(()=>{});
                    } catch (err) {
                        try {
                            atem.setUpstreamKeyerOnAir(newState, uskIdx, 0).catch(()=>{});
                        } catch (err2) {
                            console.error('[ATEM Bridge] USK Error:', err2.message || err2);
                        }
                    }
                }
            } else if (data.action === 'TOGGLE_TRANS_SELECTION' && data.bit !== undefined) {
                const bit = parseInt(data.bit, 10);
                let newSel = currentTransitionSelection ^ bit;
                if (newSel === 0) newSel = bit;
                console.log(`[ATEM Bridge ➔ Toggling Next Transition Selection] -> ${newSel}`);
                
                // Resilient fallback stack for atem-connection API changes
                if (typeof atem.setTransitionStyle === 'function') {
                    atem.setTransitionStyle({ selection: newSel }, 0).catch(e => console.error('[ATEM Bridge] Selection Error:', e.message || e));
                } else if (typeof atem.changeTransitionSelection === 'function') {
                    atem.changeTransitionSelection(newSel, 0).catch(e => console.error('[ATEM Bridge] Selection Error:', e.message || e));
                } else if (typeof atem.setTransitionSelection === 'function') {
                    atem.setTransitionSelection(newSel, 0).catch(e => console.error('[ATEM Bridge] Selection Error:', e.message || e));
                }
            } else if (data.action === 'SET_AUX' && data.aux !== undefined && data.source !== undefined) {
                const requestedAux = parseInt(data.aux, 10);
                const src = parseInt(data.source, 10);

                let targetBus = requestedAux;
                if (atem.state && atem.state.video && atem.state.video.auxiliaries) {
                    const keys = Object.keys(atem.state.video.auxiliaries).map(Number).sort((a, b) => a - b);
                    if (keys.length > 0 && keys[requestedAux] !== undefined) {
                        targetBus = keys[requestedAux];
                    }
                }

                console.log(`[ATEM Bridge ➔ Routing Aux Output] Target Bus: ${targetBus} (Selected OUT ${requestedAux + 1}) -> Source: ${src}`);

                if (typeof atem.setAuxSource === 'function') {
                    atem.setAuxSource(src, targetBus)
                        .then(() => {
                            console.log(`[ATEM Bridge] Successfully routed Source ${src} to Aux Bus ${targetBus}`);
                            currentAux[requestedAux] = src;
                            broadcastState();
                        })
                        .catch((err) => {
                            console.warn(`[ATEM Bridge] setAuxSource(${src}, ${targetBus}) failed: ${err.message}. Retrying permutation...`);
                            atem.setAuxSource(targetBus, src)
                                .then(() => {
                                    currentAux[requestedAux] = src;
                                    broadcastState();
                                })
                                .catch(e => console.error('[ATEM Bridge] Routing command rejected:', e.message || e));
                        });
                }
            } else if (data.action === 'SET_DSK_RATE' && data.rate !== undefined) {
                const rateNum = parseInt(data.rate, 10) || 30;
                if (typeof atem.setDownstreamKeyRate === 'function') {
                    atem.setDownstreamKeyRate(rateNum, 0).catch(e => console.error('[ATEM Bridge] DSK Rate Error:', e.message || e));
                }
            } else if (data.action === 'TOGGLE_DSK_TIE') {
                if (typeof atem.setDownstreamKeyTie === 'function') {
                    atem.setDownstreamKeyTie(data.tie, 0).catch(e => console.error('[ATEM Bridge] DSK Tie Error:', e.message || e));
                }
            } else if (data.action === 'TOGGLE_DSK_ONAIR') {
                if (typeof atem.setDownstreamKeyOnAir === 'function') {
                    atem.setDownstreamKeyOnAir(data.onAir, 0).catch(e => console.error('[ATEM Bridge] DSK OnAir Error:', e.message || e));
                }
            } else if (data.action === 'EXECUTE_DSK_AUTO') {
                if (typeof atem.autoDownstreamKey === 'function') {
                    atem.autoDownstreamKey(0).catch(e => console.error('[ATEM Bridge] DSK Auto Error:', e.message || e));
                }
            } else if (data.action === 'SET_FTB_RATE' && data.rate !== undefined) {
                const rateNum = parseInt(data.rate, 10) || 30;
                if (typeof atem.setFadeToBlackRate === 'function') {
                    atem.setFadeToBlackRate(rateNum, 0).catch(e => console.error('[ATEM Bridge] FTB Rate Error:', e.message || e));
                }
            } else if (data.action === 'EXECUTE_FTB') {
                if (typeof atem.fadeToBlack === 'function') {
                    atem.fadeToBlack(0).catch(e => console.error('[ATEM Bridge] FTB Error:', e.message || e));
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