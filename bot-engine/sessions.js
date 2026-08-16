const path = require('path');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const { handleMessage } = require('./commands');

// Nyimpen socket aktif per nomor WA. Tiap nomor = 1 akun bot terpisah.
const activeSessions = new Map();

async function startSession(nomor_wa, customPairingCode) {
  if (activeSessions.has(nomor_wa)) {
    return { alreadyRunning: true };
  }

  const sessionDir = path.join(__dirname, 'sessions', nomor_wa);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' })
  });

  activeSessions.set(nomor_wa, sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;
    try {
      await handleMessage(sock, msg);
    } catch (e) {
      console.error('Gagal handle pesan:', e.message);
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      activeSessions.delete(nomor_wa);
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startSession(nomor_wa, customPairingCode);
    }
  });

  let pairingCode = null;
  if (!sock.authState.creds.registered) {
    pairingCode = await sock.requestPairingCode(nomor_wa, customPairingCode);
  }

  return { pairingCode, alreadyRunning: false };
}

module.exports = { startSession, activeSessions };
