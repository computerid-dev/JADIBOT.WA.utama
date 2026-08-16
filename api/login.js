const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabaseAdmin } = require('../lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi' });
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (!user) return res.status(401).json({ error: 'Email atau password salah' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Email atau password salah' });

  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Akun lo masih nunggu di-approve admin' });
  }
  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'Akun lo ditolak admin' });
  }

  const session_token = crypto.randomBytes(24).toString('hex');
  await supabaseAdmin.from('users').update({ session_token }).eq('id', user.id);

  return res.status(200).json({
    token: session_token,
    nama: user.nama
  });
};
