const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } =
  require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  // QR Scan / Session Save
  sock.ev.on('creds.update', saveState);

  // Auto-reconnect
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const code = (lastDisconnect?.error = Boom)?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot connected');
    }
  });

  // Message listener
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      '';

    if (text.trim().toLowerCase() === '.ashan bot') {
      const reply =
        '*අශාන් Aviator බොට් ක්‍රියාත්මකයි*\n\n' +
        '*ඊළඟ වට 3:*\n' +
        '- වටය 1: 10.7x\n' +
        '- වටය 2: 7.3x\n' +
        '- වටය 3: 50.1x [ඉතා ඉහළ ජයග්‍රහණය - ඉක්මනින් Cash-out කරන්න!]\n\n' +
        '*ඉඟිය:*\n' +
        '➡️ 1.85x - 2.20x අතරින් Cash-out කරන්න.\n' +
        '➡️ අධික අවදානම් තත්ත්වයක්!\n\n' +
        '*Powered by Ashan AI Bot*';

      await sock.sendMessage(chatId, { text: reply });
    }
  });
}

startBot();
