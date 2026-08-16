const { createClient } = require('@supabase/supabase-js');

// Secret key dipakai di sini karena file ini cuma jalan di server (Vercel functions),
// gak pernah dikirim ke browser.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

module.exports = { supabaseAdmin };
