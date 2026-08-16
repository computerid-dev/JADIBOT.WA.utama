const { supabaseAdmin } = require('../lib/supabase');
const { getUserByToken } = require('../lib/auth');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Sesi habis, login ulang' });

  const { data: session } = await supabaseAdmin
    .from('bot_sessions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (session && session.status === 'active' && new Date(session.aktif_sampai) < new Date()) {
    await supabaseAdmin.from('bot_sessions').update({ status: 'expired' }).eq('user_id', user.id);
    session.status = 'expired';
  }

  return res.status(200).json({ nama: user.nama, session: session || null });
};
