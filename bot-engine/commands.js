const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    ''
  ).trim();
}

const MENU = `*JADI BOT WA — MENU*

.menu — lihat daftar command ini
.stiker — kirim/reply gambar pake caption ini buat jadi stiker
.stikertext <teks> — bikin stiker dari teks
.pdf — reply gambar pake caption ini buat diubah jadi PDF
.kalkulasi <ekspresi> — hitung angka, contoh: .kalkulasi 20*5

_by Nugroho Y.R._`;

async function handleMessage(sock, msg) {
  const from = msg.key.remoteJid;
  const text = getText(msg);
  if (!text.startsWith('.')) return;

  const [cmd, ...rest] = text.split(' ');
  const args = rest.join(' ');

  if (cmd === '.menu') {
    return sock.sendMessage(from, { text: MENU });
  }

  if (cmd === '.stiker') {
    const target = msg.message?.imageMessage
      ? msg
      : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ? { message: msg.message.extendedTextMessage.contextInfo.quotedMessage, key: msg.key }
      : null;

    if (!target) {
      return sock.sendMessage(from, { text: 'Kirim gambar dengan caption .stiker, atau reply gambar pake .stiker' });
    }

    const buffer = await downloadMediaMessage(target, 'buffer', {});
    const sticker = new Sticker(buffer, {
      pack: 'JADI BOT WA',
      author: 'Nugroho Y.R.',
      type: StickerTypes.FULL,
      quality: 70
    });
    const stickerBuffer = await sticker.toBuffer();
    return sock.sendMessage(from, { sticker: stickerBuffer });
  }

  if (cmd === '.stikertext') {
    if (!args) return sock.sendMessage(from, { text: 'Contoh: .stikertext Halo Dunia' });

    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#16130f"/>
        <text x="50%" y="50%" font-size="42" fill="#ff5a1f" font-family="sans-serif"
          text-anchor="middle" dominant-baseline="middle">${args.slice(0, 40)}</text>
      </svg>`;
    const imgBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

    const sticker = new Sticker(imgBuffer, {
      pack: 'JADI BOT WA',
      author: 'Nugroho Y.R.',
      type: StickerTypes.FULL
    });
    const stickerBuffer = await sticker.toBuffer();
    return sock.sendMessage(from, { sticker: stickerBuffer });
  }

  if (cmd === '.pdf') {
    const target = msg.message?.imageMessage
      ? msg
      : msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ? { message: msg.message.extendedTextMessage.contextInfo.quotedMessage, key: msg.key }
      : null;

    if (!target) {
      return sock.sendMessage(from, { text: 'Kirim gambar dengan caption .pdf, atau reply gambar pake .pdf' });
    }

    const buffer = await downloadMediaMessage(target, 'buffer', {});
    const jpgBuffer = await sharp(buffer).jpeg().toBuffer();

    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(jpgBuffer);
    const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
    page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
    const pdfBytes = await pdfDoc.save();

    return sock.sendMessage(from, {
      document: Buffer.from(pdfBytes),
      mimetype: 'application/pdf',
      fileName: 'hasil.pdf'
    });
  }

  if (cmd === '.kalkulasi') {
    if (!/^[0-9+\-*/().\s]+$/.test(args)) {
      return sock.sendMessage(from, { text: 'Cuma boleh angka dan operator +-*/(), contoh: .kalkulasi 20*5' });
    }
    try {
      const result = Function(`"use strict"; return (${args})`)();
      return sock.sendMessage(from, { text: `Hasil: ${result}` });
    } catch {
      return sock.sendMessage(from, { text: 'Ekspresi gak valid' });
    }
  }
}

module.exports = { handleMessage };
