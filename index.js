const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false });
    sock.ev.on('creds.update', saveCreds);

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\nMasukkan nomor WA 628xxx:\n> ');
        rl.close();
        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber.trim());
            console.log('\n=== KODE PAIRING KAMU ===');
            console.log(code);
            console.log('===========================\n');
        }, 3000);
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('\n✅ BOT SUDAH TERHUBUNG!');
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || '';
        if (text.toLowerCase() === 'ping') {
            await sock.sendMessage(from, { text: 'pong 🏓' });
        }
    });
}
startBot();
