const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { createServer } = require('http');
const WebSocket = require('ws');
const qrcode = require('qrcode');

const server = createServer();
const wss = new WebSocket.Server({ server });

let lastQR = null;
let sock = null;

async function getContactInfo(jid) {
  let name = null;
  let avatar = null;
  try {
    // Tenta buscar info de contato
    const [contact] = await sock.onWhatsApp(jid);
    if (contact) {
      name = contact.notify || contact.name || contact.jid || "";
      avatar = await sock.profilePictureUrl(jid, 'image').catch(() => "");
    }
  } catch (e) {
    // fallback para número
    name = jid.replace(/@.+/, "");
    avatar = "";
  }
  return { name, avatar };
}

wss.on('connection', ws => {
  if (lastQR) ws.send(JSON.stringify({ qr: lastQR }));
});

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  sock = makeWASocket({
    auth: state,
    // printQRInTerminal: true, // deprecated
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
    if (qr) {
      const qrImageUrl = await qrcode.toDataURL(qr);
      lastQR = qrImageUrl;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ qr: qrImageUrl }));
        }
      });
      console.log('QR code enviado ao frontend!');
    }
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 'error', message: 'Erro ao conectar QR Code' }));
          }
        });
        start();
      } else {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ status: 'error', message: 'Sessão encerrada pelo usuário.' }));
          }
        });
        console.log('Sessão encerrada pelo usuário.');
      }
    }
    if (connection === 'open') {
      lastQR = null;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ status: 'connected', message: 'Whatsapp conectado com sucesso' }));
        }
      });
      console.log('Conectado ao WhatsApp!');
    }
  });

  // Mensagens recebidas
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify' && messages && messages.length > 0) {
      for (const msg of messages) {
        const remoteJid = msg.key.remoteJid;
        const info = await getContactInfo(remoteJid);

        const text = msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text ||
                    msg.message?.imageMessage?.caption ||
                    null;
        const id = msg.key.id;
        const sender = msg.pushName || info.name || null;
        const timestamp = msg.messageTimestamp;

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'message',
              message: {
                id,
                from: remoteJid,
                sender,
                text,
                timestamp,
                name: info.name,
                avatar: info.avatar,
                status: 'received',
              }
            }));
          }
        });
        console.log('Mensagem recebida:', { id, remoteJid, sender, text, timestamp, name: info.name, avatar: info.avatar });
      }
    }
  });

  // Mensagens enviadas pelo frontend
  wss.on('connection', ws => {
    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.type === 'send-message' && msg.to && msg.text) {
          const sendResult = await sock.sendMessage(msg.to, { text: msg.text });
          const info = await getContactInfo(msg.to);

          // Confirmação para frontend
          ws.send(JSON.stringify({
            type: 'sent-message',
            message: {
              id: sendResult.key.id,
              from: msg.to,
              sender: 'Eu',
              text: msg.text,
              timestamp: Date.now() / 1000,
              name: info.name,
              avatar: info.avatar,
              status: 'sent'
            }
          }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: 'Erro ao enviar mensagem' }));
      }
    });
  });

  // Status de visualização
  sock.ev.on('messages.read', (events) => {
    for (const event of events) {
      const { remoteJid, id } = event.key;
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'seen',
            id,
            from: remoteJid
          }));
        }
      });
    }
  });
}

server.listen(3001, () => console.log('Backend WhatsApp rodando na porta 3001'));
start();