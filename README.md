# JADI BOT WA — Proyek Utama

Landing page + daftar + login + dashboard + bot engine. Ini yang diakses publik/user.

Proyek admin (approve akun) **terpisah**, ada di zip `jadibotwa-admin.zip` — deploy sebagai project Vercel sendiri, jangan digabung ke sini.

## Deploy

1. Jalankan `schema.sql` di Supabase SQL Editor (kalau belum)
2. Push folder ini ke GitHub (repo terpisah dari admin)
3. Import ke Vercel → New Project
4. Isi Environment Variables sesuai `.env.example` (value udah keisi, tinggal copy)
5. Deploy

## Bot Engine (Render)

Folder `bot-engine/` di-deploy TERPISAH ke **Render**, bukan ke Vercel (karena butuh koneksi nyala 24/7, beda dari serverless).

### A. Deploy ke Render (gratis, gak perlu kartu, gak perlu command line)

1. Push folder `bot-engine/` ke GitHub (repo sendiri, terpisah dari proyek utama)
2. Buka render.com → daftar (bisa pakai akun GitHub langsung)
3. Klik **New +** → **Web Service** → connect ke repo `bot-engine` lo
4. Isi:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
5. Di bagian **Environment Variables**, tambahin:
   - `BOT_SECRET` = `jbw9x2Kp7mQeR4vLdN8t` (harus sama persis dengan `BOT_ENGINE_SECRET` di Vercel)
6. Klik **Create Web Service**, tunggu proses deploy selesai
7. Copy URL yang muncul (misal `https://jadibotwa-engine.onrender.com`) → isi ke `BOT_ENGINE_URL` di Vercel (proyek utama) → redeploy Vercel-nya

### B. Setup Keep-Alive (WAJIB, biar server gak sempet tidur & sesi WA gak ke-reset)

Render free tier bakal "tidur" kalau nganggur 15 menit — dan pas tidur/restart, folder sesi WhatsApp-nya ke-hapus (soalnya free tier gak punya persistent disk). Solusinya: pancing server-nya biar dianggap "aktif terus" pakai layanan gratis ini:

1. Buka **cron-job.org** → daftar akun gratis
2. Klik **Create cronjob**
3. Isi:
   - **Title**: Keep Alive Bot Engine
   - **URL**: `https://jadibotwa-engine.onrender.com` (URL Render lo)
   - **Schedule**: Every 10 minutes
4. Save

Selesai — sistemnya bakal otomatis "ketuk" server Render lo tiap 10 menit, jadi dia gak pernah nganggur sampe 15 menit dan gak sempet tidur.

⚠️ **Catatan jujur**: ini bikin server nyala terus **selama gak ada gangguan dari sisi Render** (maintenance, redeploy manual, dll) — kalau itu kejadian, sesi WA bakal ke-reset dan user perlu tautkan ulang. Buat proyek personal/skala kecil ini udah cukup oke. Kalau nanti mau lebih aman (sesi WA gak ilang meskipun server restart), bisa ditingkatkan supaya sesi disimpen di Supabase bukan di file lokal — tinggal bilang kalau lo mau upgrade ke situ.

## Alur pemakaian

1. User daftar di `/daftar` → status pending
2. Admin approve lewat proyek admin (zip terpisah)
3. User login → `/dashboard` → connect nomor WA → tautkan di WhatsApp → klik Aktifkan
4. Command bot: `.menu`, `.stiker`, `.stikertext`, `.pdf`, `.kalkulasi`
