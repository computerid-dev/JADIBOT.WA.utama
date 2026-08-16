const { supabaseAdmin } = require('../lib/supabase');
const { getUserByToken } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Sesi habis, login ulang' });

  const { nomor_wa } = req.body || {};
  if (!nomor_wa || !/^62\d{8,13}$/.test(nomor_wa)) {
    return res.status(400).json({ error: 'Format nomor harus 62xxxxxxxxxx' });
  }

  // Minta bot-engine (Fly.io) buat mulai proses pairing ke nomor ini
  let engineResp;
  try {
    const r = await fetch(`${process.env.BOT_ENGINE_URL}/pair`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-secret': process.env.BOT_ENGINE_SECRET
      },
      body: JSON.stringify({ nomor_wa, pairing_code: 'NUGROHO2' })
    });
    engineResp = await r.json();
    if (!r.ok) throw new Error(engineResp.error || 'Bot engine error');
  } catch (e) {
    return res.status(502).json({ error: 'Bot engine belum bisa dihubungi. Coba lagi sebentar.' });
  }

  await supabaseAdmin
    .from('bot_sessions')
    .upsert(
      { user_id: user.id, nomor_wa, pairing_code: 'NUGR-OHO2', status: 'inactive' },
      { onConflict: 'user_id' }
    );

  return res.status(200).json({
    pairing_code: 'NUGR-OHO2',
    instruksi: [
      'Buka WhatsApp di HP lo',
      'Masuk ke Pengaturan > Perangkat Tertaut',
      'Tap "Tautkan dengan nomor telepon"',
      'Masukkan kode: NUGR-OHO2'
    ]
  });
};
