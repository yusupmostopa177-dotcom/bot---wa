const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    // KODE 8 DIGIT MUNCUL OTOMATIS
    if (!sock.authState.creds.registered) {
        const phoneNumber = '6283187501180'
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(`\n=== KODE PAIRING KAMU ===`);
            console.log(code);
            console.log(`=========================\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        if (update.connection === 'open') console.log('\n✅ BOT SUDAH TERHUBUNG');
    });
}
startBot();
