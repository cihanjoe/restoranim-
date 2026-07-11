-- ============================================================
-- Migration 0006: Kullanıcı tablosuna fotoğraf URL'si ekle
-- ============================================================

alter table public.users
add column if not exists photo_url text;