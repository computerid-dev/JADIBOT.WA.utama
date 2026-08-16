-- Jalankan ini di Supabase SQL Editor sebelum deploy

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  email text unique not null,
  password_hash text not null,
  status text default 'pending', -- pending | approved | rejected
  session_token text,
  created_at timestamp default now()
);

create table if not exists bot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  nomor_wa text not null,
  pairing_code text default 'NUGR-OHO2',
  status text default 'inactive', -- inactive | active | expired
  aktif_sampai timestamp,
  created_at timestamp default now(),
  unique(user_id)
);
