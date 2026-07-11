-- ============================================================
-- Migration 0005 — Firma Admin iletişim bilgileri
-- tenants tablosuna yetkili iletişim kolonları eklenir
-- ============================================================

alter table tenants
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;