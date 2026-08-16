const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { nama, email, password } = req.body || {};
  if (!nama || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabaseAdmin
    .from('users')
    .insert([{ nama, email, password_hash, status: 'pending' }]);

  if (error) return res.status(500).json({ error: 'Gagal daftar, coba lagi' });

  return res.status(200).json({
    message: 'Pendaftaran berhasil, tunggu akun lo di-approve admin ya.'
  });
};
