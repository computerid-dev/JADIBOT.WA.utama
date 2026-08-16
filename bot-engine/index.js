const express = require('express');
const { startSession } = require('./sessions');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BOT_SECRET = process.env.BOT_SECRET;

function checkSecret(req, res, next) {
  if (req.headers['x-bot-secret'] !== BOT_SECRET) {
    return res.status(401).json({ error: 'Secret salah' });
  }
  next();
}

app.get('/', (req, res) => res.json({ status: 'jadibotwa engine hidup' }));

// Dipanggil dari backend Vercel tiap ada user connect nomor baru
app.post('/pair', checkSecret, async (req, res) => {
  const { nomor_wa, pairing_code } = req.body || {};
  if (!nomor_wa) return res.status(400).json({ error: 'nomor_wa wajib diisi' });

  try {
    const result = await startSession(nomor_wa, pairing_code || 'NUGROHO2');
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Gagal mulai sesi pairing' });
  }
});

app.listen(PORT, () => console.log(`Bot engine jalan di port ${PORT}`));
