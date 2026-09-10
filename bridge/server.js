// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v2.62)
// =========================================================================
// Bidirectional switcher bus, macro execution, aux router, DSK & FTB sync over WebSocket.

const { Atem } = require('atem-connection');
const WebSocket = require('ws');

const ATEM_IP = '192.168.10.240';
const BRIDGE_PORT = 8080;

console.log(`[ATEM Bridge v2.62] Starting bridge service...`);
console.log(`[ATEM Bridge v2.62] Target ATEM Switcher IP: ${ATEM_IP}`);

const atem = new Atem();
let isAtemConnected = false;

// Authoritative switcher state cache
let currentPgm = 1;
let currentPvw = 2;
let currentInTransition = false;
let currentAux = [1, 2, 3, 4, 5, 6];

let transitionRate = 30;
let transitionStyle = 0; // 0=MIX, 1=DIP, 2=WIPE, 3=DVE, 4=STING
let transitionSelection = 1; // Bitmask (1=BKGD, 2=KEY1, 4=KEY2, 8=KEY3, 16=KEY4)
let previewTransition = false;
let uskOnAir = [false, false, false, false];

let ftb = { inTransition: false, isFullyBlack: false, rate: 30 };
let dsk = { onAir: false, inTransition: false, autoOnAir: false, tie: false, rate: 30 };

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

                if (me.transitionProperties) {
                    transitionRate = me.transitionProperties.rate !== undefined ? me.transitionProperties.rate : transitionRate;
                    transitionStyle = me.transitionProperties.style !== undefined ? me.transitionProperties.style : transitionStyle;
                    transitionSelection = me.transitionProperties.selection !== undefined ? me.transitionProperties.selection : transitionSelection;
                }
                
                if (me.transitionPreview !== undefined) {
                    previewTransition = me.transitionPreview;
                }

                if (me.upstreamKeyers) {
                    uskOnAir = [0, 1, 2, 3].map(i => me.upstreamKeyers[i] ? me.upstreamKeyers[i].onAir : false);
                }

                if (me.fadeToBlack) ftb = me.fadeToBlack;
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
            auxSources: currentAux,
            transitionRate,
            transitionStyle,
            transitionSelection,
            previewTransition,
            uskOnAir,
            ftb,
            dsk,
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
    } else if (raw === 'AuxS' || raw.includes('AuxSource')) {
        const auxId = props.id !== undefined ? props.id : props.auxiliaryId;
        const src = props.source !== undefined ? props.source : props.input;
        if (typeof auxId === 'number' && typeof src === 'number' && auxId >= 0 && auxId < 6) {
            currentAux[auxId] = src;
            changed = true;
            console.log(`[ATEM Bridge ⬅ Physical Switcher Event] Aux ${auxId + 1} routed to Source ${src}`);
        }
    } else if (raw.includes('FadeToBlack') || raw.includes('Ftb') || raw.includes('Downstream') || raw.includes('Dsk') || raw.includes('TransitionRate') || raw.includes('TransitionStyle') || raw.includes('TransitionSelection') || raw.includes('PreviewTransition') || raw.includes('Upstream')) {
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
            } else if (data.action === 'SET_AUX' && data.aux !== undefined && data.source !== undefined) {
                const auxIdx = parseInt(data.aux, 10);
                const src = parseInt(data.source, 10);
                if (typeof atem.setAuxSource === 'function') {
                    atem.setAuxSource(src, auxIdx).catch(e => console.error('[ATEM Bridge] Aux Error:', e.message || e));
                }
            } else if (data.action === 'SET_TRANSITION_RATE') {
                atem.setTransitionRate(parseInt(data.rate, 10) || 30, 0).catch(()=>{});
            } else if (data.action === 'SET_TRANS_STYLE' && data.style !== undefined) {
                atem.setTransitionStyle({ style: parseInt(data.style, 10) }, 0).catch(()=>{});
            } else if (data.action === 'TOGGLE_TRANS_SELECTION' && data.bit !== undefined) {
                const bit = parseInt(data.bit, 10);
                let newSelection = transitionSelection ^ bit;
                if (newSelection === 0) newSelection = bit; // ATEM usually requires at least one bit set
                atem.setTransitionSelection(newSelection, 0).catch(()=>{});
            } else if (data.action === 'TOGGLE_PREV_TRANS') {
                atem.setPreviewTransition(!previewTransition, 0).catch(()=>{});
            } else if (data.action === 'TOGGLE_USK_ONAIR' && data.usk !== undefined) {
                const idx = parseInt(data.usk, 10);
                atem.setUpstreamKeyerOnAir(!uskOnAir[idx], 0, idx).catch(()=>{});
            } else if (data.action === 'SET_FTB_RATE') {
                atem.setFadeToBlackRate(parseInt(data.rate, 10) || 30, 0).catch(()=>{});
            } else if (data.action === 'EXECUTE_FTB') {
                atem.fadeToBlack(0).catch(()=>{});
            } else if (data.action === 'SET_DSK_RATE') {
                atem.setDownstreamKeyRate(parseInt(data.rate, 10) || 30, 0).catch(()=>{});
            } else if (data.action === 'TOGGLE_DSK_TIE') {
                atem.setDownstreamKeyTie(data.tie, 0).catch(()=>{});
            } else if (data.action === 'TOGGLE_DSK_ONAIR') {
                atem.setDownstreamKeyOnAir(data.onAir, 0).catch(()=>{});
            } else if (data.action === 'EXECUTE_DSK_AUTO') {
                atem.autoDownstreamKey(0).catch(()=>{});
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