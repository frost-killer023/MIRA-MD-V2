const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    // 1. Notification de connexion réussie
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log("Connexion établie avec succès !");
            // Remplace par ton numéro complet pour recevoir le message
            await sock.sendMessage(sock.user.id, { text: "✅ Mira-MD-V2 connecté avec succès !" });
        } else if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startBot(); // Reconnexion automatique si déconnecté
            }
        }
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = "25766486303"; // Ton numéro ici
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("-----------------------------------------");
            console.log("NOUVEAU CODE : " + code);
            console.log("-----------------------------------------");
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if (messageContent === ".ping") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓" });
        }
    });
}

startBot();
