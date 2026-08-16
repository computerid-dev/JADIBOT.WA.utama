const { supabaseAdmin } = require('./supabase');

async function getUserByToken(token) {
  if (!token) return null;
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('session_token', token)
    .maybeSingle();
  return user || null;
}

module.exports = { getUserByToken };
