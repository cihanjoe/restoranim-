-- ============================================================
-- Migration 0004 — Restoran tablosuna ek kolonlar
-- Firma Admin restoran yönetimi için gerekli alanlar
-- ============================================================

-- Mevcut restaurants tablosuna yeni kolonlar ekle
alter table restaurants
  add column if not exists city text,
  add column if not exists district text,
  add column if not exists opening_date date,
  add column if not exists franchise boolean not null default false,
  add column if not exists phone text,
  add column if not exists yemeksepeti_score numeric(3,1) default 0,
  add column if not exists getir_score numeric(3,1) default 0,
  add column if not exists trendyol_yemek_score numeric(3,1) default 0,
  add column if not exists google_score numeric(3,1) default 0,
  add column if not exists franchise_owner text,
  add column if not exists franchise_owner_phone text,
  add column if not exists franchise_owner_email text,
  add column if not exists invoice_address text,
  add column if not exists email text;

-- restaurants tablosu için RLS'yi etkinleştir (zaten aktifse tekrar aktifleştirmez)
alter table restaurants enable row level security;

-- restaurants tablosu için temel RLS politikası (tenant bazlı)
-- Not: Daha önce migration 0001'de policy oluşturulduysa bu satır hata vermez
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'restaurants' and policyname = 'restaurants_tenant_isolation'
  ) then
    create policy restaurants_tenant_isolation on restaurants
      for all
      using (tenant_id = current_tenant_id())
      with check (tenant_id = current_tenant_id());
  end if;
end
$$;

-- restaurant_regional_managers tablosu yoksa oluştur
create table if not exists restaurant_regional_managers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  regional_manager_user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(restaurant_id, regional_manager_user_id)
);

-- restaurant_regional_managers tablosu için RLS
alter table restaurant_regional_managers enable row level security;

-- restaurant_regional_managers için RLS politikaları
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'restaurant_regional_managers' and policyname = 'rrm_tenant_isolation'
  ) then
    create policy rrm_tenant_isolation on restaurant_regional_managers
      for all
      using (
        exists (
          select 1 from restaurants
          where restaurants.id = restaurant_regional_managers.restaurant_id
          and restaurants.tenant_id = current_tenant_id()
        )
      )
      with check (
        exists (
          select 1 from restaurants
          where restaurants.id = restaurant_regional_managers.restaurant_id
          and restaurants.tenant_id = current_tenant_id()
        )
      );
  end if;
end
$$;

-- Gelecekteki tablolar için varsayılan yetkiler
alter default privileges for role authenticated in schema public
  grant select, insert, update, delete on tables to authenticated;