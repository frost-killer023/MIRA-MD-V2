const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
    });

    // Gestion du pairing code
    if (!sock.authState.creds.registered) {
        const phoneNumber = "25766486303"; // Remplace bien par ton numéro ici
        
        console.log("Attente de connexion...");
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("-----------------------------------------");
                console.log("TON CODE D'ASSOCIATION EST : " + code);
                console.log("-----------------------------------------");
            } catch (err) {
                console.error("Erreur lors de la génération du code :", err);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);
    
    // Gestion des messages et commandes
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Récupération sécurisée du texte
        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        console.log("Nouveau message reçu :", messageContent);

        // Système de commandes
        if (messageContent.startsWith(".")) {
            const args = messageContent.slice(1).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === "ping") {
                await sock.sendMessage(msg.key.remoteJid, { text: "Pong! 🏓" });
            }
        }
    });
}

startBot();
