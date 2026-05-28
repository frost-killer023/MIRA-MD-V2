const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const logger = pino({ level: 'silent' });
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        logger: logger,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        browser: ["Mira-MD-V2", "Chrome", "1.0.0"],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Reconnexion en cours...");
                startBot();
            }
        } else if (connection === 'open') {
            console.log("✅ Mira-MD-V2 connecté !");
            await sock.sendMessage(sock.user.id, { text: "✅ Mira-MD-V2 connecté avec succès !" });
        }
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = "257XXXXXXXX"; // <--- MET TON NUMÉRO ICI
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("-----------------------------------------");
                console.log("TON CODE D'ASSOCIATION : " + code);
                console.log("-----------------------------------------");
            } catch (err) {
                console.error("Erreur Pairing Code :", err);
            }
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async m => {
        try {
            const msg = m.messages[0];
            if (!msg.message || msg.key.fromMe) return;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            
            if (text === ".ping") {
                await sock.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓" });
            }
        } catch (err) { console.log(err); }
    });
}

startBot();
