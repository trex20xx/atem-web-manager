// =========================================================================
// ATEM LOCAL HARDWARE BRIDGE SERVER (v3.89) - DIAGNOSTIC & DIRECT ENGINE
// =========================================================================

const AtemLib = require('atem-connection');
const { Atem } = AtemLib;
const WebSocket = require('ws');
const http = require('http');

let ATEM_IP = process.env.ATEM_IP || '192.168.10.240';
const BRIDGE_PORT = 8080;
const VITE_PORT = 3000;
const startTime = Date.now();

let atem = new Atem();
let isAtemConnected = false;
let reconnectTimer = null;

// Suppression map: prevents double-logging when USER triggers a change
const logSuppression = {
    pgm: 0, pvw: 0, trans: 0, dsk: {}, ftb: 0, aux: {}
};

function getFriendlySourceName(id) {
    const num = parseInt(id, 10);
    let customName = '';
    if (atem && atem.state && atem.state.inputs && atem.state.inputs[num]) {
        customName = atem.state.inputs[num].longName || atem.state.inputs[num].shortName || '';
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
    return (customName && customName !== base && !base.includes(customName)) ? `${base} (${customName})` : base;
}

const wss = new WebSocket.Server({ port: BRIDGE_PORT }, () => {
    broadcastLog('info', 'BRIDGE', `WebSocket server running on ws://localhost:${BRIDGE_PORT}`);
});

function broadcastLog(level, source, message, deviceIp = ATEM_IP) {
    try {
        const payload = JSON.stringify({
            type: 'LOG',
            level,
            source,
            ip: source === 'SYSTEM' || source === 'DEBUG' ? 'SYSTEM' : deviceIp,
            message: message,
            timestamp: Date.now()
        });
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) client.send(payload);
        });
    } catch (e) {}
}

const originalLog = console.log;
console.log = function() { originalLog.apply(console, arguments); broadcastLog('info', 'BRIDGE', Array.from(arguments).join(' ')); };
console.warn = function() { originalWarn.apply(console, arguments); broadcastLog('warn', 'BRIDGE', Array.from(arguments).join(' ')); };
console.error = function() { originalError.apply(console, arguments); broadcastLog('error', 'BRIDGE', Array.from(arguments).join(' ')); };

console.log('[ATEM Bridge v3.89] Diagnostic Bridge Engine Starting...');
console.log(`[ATEM Bridge v3.89] Target Switcher IP: ${ATEM_IP}`);

function logDiagnosticAtemMethods() {
    try {
        const proto = Object.getPrototypeOf(atem);
        const allMethods = Object.getOwnPropertyNames(proto).filter(m => typeof atem[m] === 'function');
        const transMethods = allMethods.filter(m => m.toLowerCase().includes('trans') || m.toLowerCase().includes('select') || m.toLowerCase().includes('key') || m.toLowerCase().includes('aux'));
        broadcastLog('debug', 'DEBUG', `[ATEM Methods] Available related methods: ${transMethods.join(', ')}`);
    } catch (e) {}
}

function broadcastState() {
    if (!atem || !atem.state || !atem.state.video) return;
    
    try {
        const video = atem.state.video;
        const me = video.mixEffects && video.mixEffects[0] ? video.mixEffects[0] : {};
        const dskObj = video.downstreamKeyers && video.downstreamKeyers[0] ? video.downstreamKeyers[0] : {};
        
        let auxSources = [1, 2, 3, 4, 5, 6];
        if (video.auxiliaries) {
            for (let i = 0; i < 6; i++) {
                if (video.auxiliaries[i] !== undefined && video.auxiliaries[i] !== null) {
                    auxSources[i] = typeof video.auxiliaries[i] === 'object' ? video.auxiliaries[i].source : Number(video.auxiliaries[i]);
                } else if (video.auxiliaries[i + 1] !== undefined && video.auxiliaries[i + 1] !== null) {
                    // Fallback in case 1-indexed
                    auxSources[i] = typeof video.auxiliaries[i + 1] === 'object' ? video.auxiliaries[i + 1].source : Number(video.auxiliaries[i + 1]);
                }
            }
        }

        const uskOnAir = [0, 1, 2, 3].map(i => me.upstreamKeyers && me.upstreamKeyers[i] ? Boolean(me.upstreamKeyers[i].onAir) : false);

        let transSel = 1;
        if (me.transitionProperties) {
            if (Array.isArray(me.transitionProperties.selection)) {
                transSel = me.transitionProperties.selection.reduce((a, b) => a | b, 0);
            } else if (Array.isArray(me.transitionProperties.nextSelection)) {
                transSel = me.transitionProperties.nextSelection.reduce((a, b) => a | b, 0);
            } else {
                transSel = me.transitionProperties.selection || me.transitionProperties.nextSelection || 1;
            }
        }

        const payload = JSON.stringify({
            type: 'STATE',
            hardwareConnected: isAtemConnected,
            pgm: me.programInput || 1,
            pvw: me.previewInput || 2,
            inTransition: me.transitionPosition ? me.transitionPosition.inTransition : false,
            transitionPosition: me.transitionPosition ? me.transitionPosition.handlePosition : 0,
            transitionRate: me.transitionProperties ? me.transitionProperties.rate : 25,
            transitionSelection: transSel,
            uskOnAir: uskOnAir,
            auxSources: auxSources,
            dsk: {
                onAir: Boolean(dskObj.onAir),
                inTransition: Boolean(dskObj.inTransition),
                autoOnAir: Boolean(dskObj.autoOnAir),
                tie: dskObj.properties ? Boolean(dskObj.properties.tie) : (typeof dskObj.tie === 'boolean' ? dskObj.tie : false),
                rate: dskObj.properties ? dskObj.properties.rate : (dskObj.rate || 25)
            },
            ftb: me.fadeToBlack || { inTransition: false, isFullyBlack: false, rate: 25 }
        });

        wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(payload); });
    } catch (e) {}
}

atem.on('stateChanged', () => {
    broadcastState();
});

atem.on('receivedCommands', (commands) => {
    const now = Date.now();
    for (const cmd of commands) {
        const raw = cmd.rawName || cmd.constructor.name;
        const props = cmd.properties || cmd;

        // Skip high-frequency timecode ticks to prevent console flood
        if (raw === 'Time' || raw === 'TimeCommand' || raw.includes('Time')) {
            continue;
        }

        // Stream raw ATEM packets to DEBUG filter
        broadcastLog('debug', 'DEBUG', `[ATEM -> Bridge] ${raw}: ${JSON.stringify(props)}`);

        // Selective human-readable logs (only if not recently triggered by user)
        if (raw === 'PrgI' || raw.includes('ProgramInput')) {
            if (now > logSuppression.pgm) broadcastLog('info', 'ATEM', `Program set to ${getFriendlySourceName(props.source)}`);
        } else if (raw === 'PrvI' || raw.includes('PreviewInput')) {
            if (now > logSuppression.pvw) broadcastLog('info', 'ATEM', `Preview set to ${getFriendlySourceName(props.source)}`);
        } else if (raw === 'AuxS' || raw.includes('AuxSource')) {
            const bus = props.id !== undefined ? props.id : props.auxBus;
            const src = props.source !== undefined ? props.source : props.input;
            if (bus !== undefined && now > (logSuppression.aux[bus] || 0)) {
                broadcastLog('info', 'ATEM', `Aux ${Number(bus) + 1} set to ${getFriendlySourceName(src)}`);
            }
        }
    }
});

atem.on('connected', () => {
    isAtemConnected = true;
    broadcastLog('info', 'BRIDGE', `Connected to physical ATEM at ${ATEM_IP}`);
    logDiagnosticAtemMethods();
    
    // Dump actual state structure for auxiliaries
    setTimeout(() => {
        if (atem && atem.state && atem.state.video) {
            broadcastLog('debug', 'DEBUG', `[ATEM Boot State] Auxiliaries raw: ${JSON.stringify(atem.state.video.auxiliaries)}`);
            broadcastLog('debug', 'DEBUG', `[ATEM Boot State] ME0 TransitionProps: ${JSON.stringify(atem.state.video.mixEffects?.[0]?.transitionProperties)}`);
        }
        broadcastState();
    }, 400);
});

atem.on('disconnected', () => {
    isAtemConnected = false;
    broadcastLog('warn', 'BRIDGE', `Lost UDP link to physical ATEM at ${ATEM_IP}`);
    broadcastState();
    if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            if (!isAtemConnected) atem.connect(ATEM_IP).catch(() => {});
        }, 3000);
    }
});

atem.connect(ATEM_IP).catch(() => {});

wss.on('connection', (ws) => {
    broadcastState();
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const now = Date.now();

            if (data.action === 'CONNECT' || data.action === 'GET_STATE') {
                broadcastState();
                return;
            }

            if (data.action === 'SYSTEM_LOG') {
                broadcastLog('info', 'SYSTEM', data.message);
                return;
            }

            if (data.action === 'SET_PGM') {
                logSuppression.pgm = now + 1000;
                broadcastLog('info', 'USER', `Program set to ${getFriendlySourceName(data.input)}`);
                atem.changeProgramInput(parseInt(data.input, 10), 0).catch(()=>{});
            } 
            else if (data.action === 'SET_PVW') {
                logSuppression.pvw = now + 1000;
                broadcastLog('info', 'USER', `Preview set to ${getFriendlySourceName(data.input)}`);
                atem.changePreviewInput(parseInt(data.input, 10), 0).catch(()=>{});
            } 
            else if (data.action === 'SET_AUX') {
                const auxIdx = parseInt(data.aux, 10);
                const srcId = parseInt(data.source, 10);
                logSuppression.aux[auxIdx] = now + 1000;
                broadcastLog('info', 'USER', `Aux ${auxIdx + 1} set to ${getFriendlySourceName(srcId)}`);
                broadcastLog('debug', 'DEBUG', `[SET_AUX] Calling setAuxSource. Try 1: (source: ${srcId}, aux: ${auxIdx}) | Try 2: (aux: ${auxIdx}, source: ${srcId})`);

                if (typeof atem.setAuxSource === 'function') {
                    // Test signature (source, aux)
                    atem.setAuxSource(srcId, auxIdx).catch(err1 => {
                        broadcastLog('debug', 'DEBUG', `[SET_AUX] Try 1 (src, aux) rejected: ${err1.message}. Attempting Try 2 (aux, src)...`);
                        // Test alternate signature (aux, source)
                        atem.setAuxSource(auxIdx, srcId).catch(err2 => {
                            broadcastLog('error', 'BRIDGE', `setAuxSource failed both signatures: ${err2.message}`);
                        });
                    });
                }
            } 
            else if (data.action === 'CUT') {
                broadcastLog('info', 'USER', 'Executed CUT transition');
                atem.cut(0).catch(()=>{});
            } 
            else if (data.action === 'AUTO') {
                broadcastLog('info', 'USER', 'Executed AUTO transition');
                atem.autoTransition(0).catch(()=>{});
            } 
            else if (data.action === 'TOGGLE_TRANS_SELECTION') {
                const bit = parseInt(data.bit, 10);
                const me = atem.state?.video?.mixEffects?.[0];
                let currentSel = 1;
                if (me?.transitionProperties) {
                    const raw = me.transitionProperties.nextSelection ?? me.transitionProperties.selection;
                    if (Array.isArray(raw)) currentSel = raw.reduce((a, b) => a | b, 0);
                    else if (typeof raw === 'number') currentSel = raw;
                }
                const newSel = (currentSel ^ bit) || 1;
                logSuppression.trans = now + 1000;
                broadcastLog('info', 'USER', `Toggled Next Transition Selection (Bit: ${bit}, Current: ${currentSel}, Target: ${newSel})`);

                const selArray = [];
                if (newSel & 1) selArray.push(1);
                if (newSel & 2) selArray.push(2);
                if (newSel & 4) selArray.push(4);
                if (newSel & 8) selArray.push(8);
                if (newSel & 16) selArray.push(16);

                broadcastLog('debug', 'DEBUG', `[TRANS_SEL] Executing fallback chain. Bitmask: ${newSel}, EnumArray: [${selArray.join(', ')}]`);

                // Exhaustive method testing pipeline
                let executed = false;
                if (typeof atem.changeTransitionSelection === 'function') {
                    executed = true;
                    atem.changeTransitionSelection(newSel, 0).catch(err => {
                        broadcastLog('debug', 'DEBUG', `[TRANS_SEL] changeTransitionSelection(${newSel}, 0) rejected: ${err.message}`);
                    });
                }
                if (typeof atem.setTransitionSelection === 'function') {
                    executed = true;
                    atem.setTransitionSelection(newSel, 0).catch(err => {
                        broadcastLog('debug', 'DEBUG', `[TRANS_SEL] setTransitionSelection(${newSel}, 0) rejected: ${err.message}`);
                    });
                }
                if (typeof atem.setTransitionProperties === 'function') {
                    executed = true;
                    atem.setTransitionProperties({ nextSelection: selArray }, 0).catch(err1 => {
                        atem.setTransitionProperties({ nextSelection: newSel }, 0).catch(err2 => {
                            atem.setTransitionProperties({ selection: selArray }, 0).catch(err3 => {
                                atem.setTransitionProperties({ selection: newSel }, 0).catch(err4 => {
                                    broadcastLog('debug', 'DEBUG', `[TRANS_SEL] All setTransitionProperties variants rejected: ${err4.message}`);
                                });
                            });
                        });
                    });
                }
                if (!executed) {
                    broadcastLog('error', 'BRIDGE', 'No transition selection method found on atem instance!');
                }
            } 
            else if (data.action === 'TOGGLE_USK_ONAIR') {
                const uskIdx = parseInt(data.usk, 10);
                const targetState = Boolean(data.state);
                broadcastLog('info', 'USER', `Toggled Upstream Keyer ${uskIdx + 1} On Air: ${targetState}`);
                if (typeof atem.setUpstreamKeyerOnAir === 'function') {
                    atem.setUpstreamKeyerOnAir(targetState, 0, uskIdx).catch(err => {
                        broadcastLog('error', 'BRIDGE', `setUpstreamKeyerOnAir error: ${err.message}`);
                    });
                }
            } 
            else if (data.action === 'TOGGLE_DSK_TIE') {
                const targetTie = Boolean(data.tie);
                logSuppression.dsk.general = now + 1000;
                broadcastLog('info', 'USER', `Toggled DSK Tie: ${targetTie}`);
                if (typeof atem.setDownstreamKeyTie === 'function') {
                    atem.setDownstreamKeyTie(targetTie, 0).catch(err => {
                        broadcastLog('error', 'BRIDGE', `setDownstreamKeyTie error: ${err.message}`);
                    });
                }
            } 
            else if (data.action === 'TOGGLE_DSK_ONAIR') {
                const targetOnAir = Boolean(data.onAir);
                logSuppression.dsk.general = now + 1000;
                broadcastLog('info', 'USER', `Toggled DSK On Air: ${targetOnAir}`);
                if (typeof atem.setDownstreamKeyOnAir === 'function') {
                    atem.setDownstreamKeyOnAir(targetOnAir, 0).catch(err => {
                        broadcastLog('error', 'BRIDGE', `setDownstreamKeyOnAir error: ${err.message}`);
                    });
                }
            } 
            else if (data.action === 'EXECUTE_DSK_AUTO') {
                broadcastLog('info', 'USER', 'Executed DSK AUTO transition');
                if (typeof atem.autoDownstreamKey === 'function') {
                    atem.autoDownstreamKey(0).catch(err => {
                        broadcastLog('error', 'BRIDGE', `autoDownstreamKey error: ${err.message}`);
                    });
                }
            } 
            else if (data.action === 'SET_DSK_RATE') {
                const rate = parseInt(data.rate, 10) || 25;
                broadcastLog('info', 'USER', `Set DSK Rate to ${rate} frames`);
                if (typeof atem.setDownstreamKeyRate === 'function') {
                    atem.setDownstreamKeyRate(rate, 0).catch(()=>{});
                }
            } 
            else if (data.action === 'SET_TRANSITION_RATE') {
                const rate = parseInt(data.rate, 10) || 25;
                broadcastLog('info', 'USER', `Set Transition Rate to ${rate} frames`);
                atem.setMixTransitionSettings({ rate }, 0).catch(()=>{});
            } 
            else if (data.action === 'EXECUTE_FTB') {
                broadcastLog('info', 'USER', 'Executed Fade to Black');
                atem.fadeToBlack(0).catch(()=>{});
            } 
            else if (data.action === 'SET_FTB_RATE') {
                const rate = parseInt(data.rate, 10) || 25;
                broadcastLog('info', 'USER', `Set FTB Rate to ${rate} frames`);
                if (typeof atem.setFadeToBlackRate === 'function') {
                    atem.setFadeToBlackRate(rate, 0).catch(()=>{});
                }
            }

            setTimeout(broadcastState, 15);
        } catch (err) {}
    });
});

setInterval(() => {
    const req = http.get('http://localhost:' + VITE_PORT, () => {});
    req.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' && Date.now() - startTime > 10000) {
            process.exit(0);
        }
    });
    req.setTimeout(1500, () => req.destroy());
}, 5000);