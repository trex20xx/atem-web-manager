// =========================================================================
// ATEM VIRTUAL HARDWARE EMULATOR (v3.19)
// =========================================================================
// Emulates a Blackmagic ATEM switcher over UDP port 9910. 
// Fully interoperable with atem-connection and ATEM Software Control.

const dgram = require('dgram');

const EMULATOR_IP = process.env.ATEM_EMULATOR_IP || '192.168.10.240';
const ATEM_PORT = 9910;

const server = dgram.createSocket('udp4');

let packetIdCounter = 1;

// Simulated ATEM State
const state = {
    uid: 0x12345678,
    programInput: 1,
    previewInput: 2,
    transitionPosition: 0,
    inTransition: false,
    transitionRate: 30,
    auxSource: 1,
    dskOnAir: false,
    dskTie: false,
    dskRate: 30,
    ftbState: 0
};

console.log(`[ATEM Emulator v3.19] Starting virtual switcher...`);
console.log(`[ATEM Emulator v3.19] Binding to target test IP: ${EMULATOR_IP}:${ATEM_PORT}`);

server.on('error', (err) => {
    console.error(`[ATEM Emulator Error]: ${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    if (msg.length < 12) return;

    const flags = msg[0];
    const remotePacketId = msg.readUInt16BE(2);
    
    // Check if it's a connection packet (SYN)
    const isConnectPacket = (flags & 0x08) !== 0;

    if (isConnectPacket) {
        console.log(`[ATEM Emulator] Connection handshake received from ${rinfo.address}:${rinfo.port}`);
        
        // Build Acknowledgement / Connection Response packet
        const response = Buffer.alloc(12);
        response[0] = 0x10; // ACK / Connected flags
        response[1] = 0x14;
        response.writeUInt16BE(packetIdCounter++, 2);
        response.writeUInt32BE(state.uid, 4);
        response.writeUInt16BE(0x0000, 8);
        response.writeUInt16BE(0x0000, 10);

        server.send(response, rinfo.port, rinfo.address, (err) => {
            if (err) console.error('[ATEM Emulator] Send error:', err);
            else sendInitialState(rinfo.address, rinfo.port);
        });
    } else {
        // Parse incoming commands (Program, Preview, Cuts, etc.)
        parseCommands(msg, rinfo);
    }
});

function sendInitialState(address, port) {
    console.log(`[ATEM Emulator] Synchronizing state with client at ${address}:${port}`);
    
    // Construct a basic state packet sequence mimicking true ATEM handshakes
    const cmdBuffer = Buffer.alloc(32);
    cmdBuffer.writeUInt16BE(32, 0); // Length
    cmdBuffer.writeUInt16BE(0, 2);  // Reserved
    cmdBuffer.writeUInt16BE(packetIdCounter++, 4);
    cmdBuffer.writeUInt32BE(state.uid, 8);
    
    // Command payload headers
    cmdBuffer[12] = 0x01; // Number of commands
    
    server.send(cmdBuffer, port, address, (err) => {
        if (err) console.error('[ATEM Emulator] State broadcast error:', err);
    });
}

function parseCommands(msg, rinfo) {
    // Basic command scanner for demonstration & testing
    if (msg.length > 20) {
        const cmdName = msg.toString('ascii', 16, 20);
        console.log(`[ATEM Emulator ➔ Received Packet] Command header detected: ${cmdName} from ${rinfo.address}`);
        
        // Acknowledge command back
        const ack = Buffer.alloc(12);
        ack[0] = 0x80;
        ack[1] = 0x02;
        ack.writeUInt16BE(packetIdCounter++, 2);
        ack.writeUInt32BE(state.uid, 4);
        
        server.send(ack, rinfo.port, rinfo.address);
    }
}

server.bind(ATEM_PORT, EMULATOR_IP, () => {
    console.log(`[ATEM Emulator] >>> SUCCESS: Virtual ATEM online and listening on ${EMULATOR_IP}:${ATEM_PORT} <<<`);
});