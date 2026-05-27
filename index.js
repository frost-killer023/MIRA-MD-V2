const { default: makeWASocket, useMultiFileAuthState, useSingleFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // On veut le code d'association
    });

    // Demander le pairing code si non connecté
    if (!sock.authState.creds.registered) {
        const phoneNumber = "VOTRE_NUMERO_ICI"; // Format international sans '+'
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("Votre code d'association est : " + code);
    }

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async m => {
        console.log(JSON.stringify(m, undefined, 2));
        // Logique pour répondre aux messages ici
    });
}

startBot();

