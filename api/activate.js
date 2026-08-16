const { supabaseAdmin } = require('../lib/supabase');
const { getUserByToken } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await getUserByToken(token);
  if (!user) return res.status(401).json({ error: 'Sesi habis, login ulang' });

  const { data: session } = await supabaseAdmin
    .from('bot_sessions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!session) {
    return res.status(400).json({ error: 'Belum ada nomor yang di-connect' });
  }

  const aktif_sampai = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await supabaseAdmin
    .from('bot_sessions')
    .update({ status: 'active', aktif_sampai })
    .eq('user_id', user.id);

  return res.status(200).json({ status: 'active', aktif_sampai });
};
