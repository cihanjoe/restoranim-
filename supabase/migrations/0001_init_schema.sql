-- ============================================================
-- ODZ Platform — İlk Migration (v1)
-- DATABASE_SCHEMA.md dosyasındaki tasarımın SQL karşılığıdır.
-- Supabase SQL Editor'de çalıştırılmak üzere hazırlanmıştır.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. ÇEKİRDEK: FİRMA / KULLANICI
-- ============================================================

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subdomain text unique not null,
  logo_url text,
  pdf_theme jsonb,
  status text not null default 'trial' check (status in ('active','suspended','trial')),
  subscription_plan_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  role text not null check (role in ('super_admin','firma_admin','bolge_muduru','restoran_muduru')),
  full_name text,
  email text,
  phone text,
  status text not null default 'active' check (status in ('active','passive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Yardımcı fonksiyonlar (RLS politikalarında kullanılacak)
create or replace function current_tenant_id()
returns uuid
language sql stable
as $$
  select tenant_id from users where id = auth.uid()
$$;

create or replace function current_user_role()
returns text
language sql stable
as $$
  select role from users where id = auth.uid()
$$;

create or replace function is_super_admin()
returns boolean
language sql stable
as $$
  select coalesce((select role = 'super_admin' from users where id = auth.uid()), false)
$$;

-- ============================================================
-- 2. RESTORAN VE ATAMA
-- ============================================================

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  address text,
  email text,
  manager_name text,
  assistant_manager_name text,
  manager_user_id uuid references users(id),
  total_staff_count int default 0,
  -- Scores for various platforms (0-100 scale)
  google_score int default 0,
  yemeksepeti_score int default 0,
  getir_score int default 0,
  trendyol_yemek_score int default 0,
  status text not null default 'active' check (status in ('active','passive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table restaurant_regional_managers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  regional_manager_user_id uuid not null references users(id) on delete cascade,
  -- Store the name of the regional manager for quick display in person views
  regional_manager_name text,
  created_at timestamptz not null default now(),
  unique (restaurant_id, regional_manager_user_id)
);

-- ============================================================
-- 3. DİNAMİK PERSONEL MODÜLÜ
-- ============================================================

create table staff_field_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null check (field_type in ('text','date','number','file','select')),
  is_required boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active','passive')),
  created_at timestamptz not null default now()
);

create table staff_members (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  full_name text not null,
  position text,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('active','passive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_field_values (
  id uuid primary key default gen_random_uuid(),
  staff_member_id uuid not null references staff_members(id) on delete cascade,
  field_definition_id uuid not null references staff_field_definitions(id) on delete cascade,
  value_text text,
  value_date date,
  value_number numeric,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 4. ODZ FORM BUILDER
-- ============================================================

create table odz_form_sections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active','passive')),
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now()
);

create table odz_form_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references odz_form_sections(id) on delete cascade,
  question_text text not null,
  question_type text not null check (question_type in ('choice_3','text','number','photo_only')),
  is_required boolean not null default false,
  photo_required boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'active' check (status in ('active','passive')),
  created_at timestamptz not null default now()
);

create table odz_form_question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references odz_form_questions(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

-- ============================================================
-- 5. ZİYARET (ODZ) AKIŞI
-- ============================================================

create table odz_visits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  regional_manager_user_id uuid not null references users(id),
  visit_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft','completed','notified')),
  notified_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table odz_visit_photos (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references odz_visits(id) on delete cascade,
  photo_url text not null,
  taken_at timestamptz,
  gps_lat numeric,
  gps_lng numeric,
  uploaded_from text check (uploaded_from in ('mobile','web')),
  created_at timestamptz not null default now()
);

create table odz_visit_answers (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references odz_visits(id) on delete cascade,
  question_id uuid not null references odz_form_questions(id),
  answer_value text,
  notes text,
  add_to_action boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table odz_visit_answer_photos (
  id uuid primary key default gen_random_uuid(),
  visit_answer_id uuid not null references odz_visit_answers(id) on delete cascade,
  visit_photo_id uuid not null references odz_visit_photos(id) on delete cascade,
  unique (visit_answer_id, visit_photo_id)
);

-- ============================================================
-- 6. AKSİYON TAKİP
-- ============================================================

create table actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  source_visit_answer_id uuid references odz_visit_answers(id),
  title text not null,
  due_date date,
  status text not null default 'open' check (status in ('open','pending_approval','approved','rejected')),
  opened_at timestamptz not null default now(),
  approved_at timestamptz,
  repeat_count int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table action_updates (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references actions(id) on delete cascade,
  created_by_user_id uuid references users(id),
  description text,
  photo_url text,
  reviewed_by_user_id uuid references users(id),
  review_status text not null default 'pending' check (review_status in ('pending','approved','rejected')),
  review_note text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. DİNAMİK METRİKLER (Ciro, Tabak Sayısı, Hijyen Skoru vb.)
-- ============================================================

create table metric_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  key text not null,
  label text not null,
  unit text,
  frequency text not null check (frequency in ('daily','monthly')),
  input_mode text not null default 'manual' check (input_mode in ('manual','api')),
  status text not null default 'active' check (status in ('active','passive')),
  created_at timestamptz not null default now()
);

create table metric_values (
  id uuid primary key default gen_random_uuid(),
  metric_definition_id uuid not null references metric_definitions(id) on delete cascade,
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  period_date date not null,
  value numeric,
  entered_by_user_id uuid references users(id),
  source text not null default 'manual' check (source in ('manual','pos_api')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. BİLDİRİMLER
-- ============================================================

create table notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  recipient_user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  related_entity_type text,
  related_entity_id uuid,
  read_at timestamptz,
  channel text not null default 'push' check (channel in ('push','email','sms')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 9. SÜPER ADMİN / ABONELİK
-- ============================================================

create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_monthly numeric,
  pricing_model text check (pricing_model in ('per_restaurant','tiered','flat')),
  created_at timestamptz not null default now()
);

alter table tenants
  add constraint tenants_subscription_plan_fk
  foreign key (subscription_plan_id) references subscription_plans(id);

create table billing_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  amount numeric,
  period text,
  status text not null default 'pending' check (status in ('paid','pending','overdue')),
  created_at timestamptz not null default now()
);

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open','closed')),
  created_by_user_id uuid references users(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — Tenant izolasyonu
-- ============================================================
-- NOT: Bu ilk sürümde her tenant_id'li tabloya "kendi firmanı gör +
-- super_admin her şeyi görür" temel politikası uygulanıyor.
-- Rol bazlı ince ayrımlar (örn. bölge müdürü sadece atandığı restoranı
-- görsün) ilgili modül geliştirilirken (Faz 2+) eklenecek.

alter table tenants enable row level security;
alter table users enable row level security;
alter table restaurants enable row level security;
alter table restaurant_regional_managers enable row level security;
alter table staff_field_definitions enable row level security;
alter table staff_members enable row level security;
alter table staff_field_values enable row level security;
alter table odz_form_sections enable row level security;
alter table odz_form_questions enable row level security;
alter table odz_form_question_options enable row level security;
alter table odz_visits enable row level security;
alter table odz_visit_photos enable row level security;
alter table odz_visit_answers enable row level security;
alter table odz_visit_answer_photos enable row level security;
alter table actions enable row level security;
alter table action_updates enable row level security;
alter table metric_definitions enable row level security;
alter table metric_values enable row level security;
alter table notifications enable row level security;
alter table billing_records enable row level security;
alter table support_tickets enable row level security;

-- tenants
create policy "tenant_select" on tenants for select
  using (id = current_tenant_id() or is_super_admin());
create policy "tenant_modify" on tenants for all
  using (is_super_admin());

-- users
create policy "users_select" on users for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "users_modify" on users for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- restaurants
create policy "restaurants_select" on restaurants for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "restaurants_modify" on restaurants for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- restaurant_regional_managers (tenant_id yok, restaurant üzerinden kontrol)
create policy "rrm_select" on restaurant_regional_managers for select
  using (
    is_super_admin() or
    restaurant_id in (select id from restaurants where tenant_id = current_tenant_id())
  );
create policy "rrm_modify" on restaurant_regional_managers for all
  using (
    is_super_admin() or
    restaurant_id in (select id from restaurants where tenant_id = current_tenant_id())
  );

-- staff_field_definitions
create policy "sfd_select" on staff_field_definitions for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "sfd_modify" on staff_field_definitions for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- staff_members
create policy "staff_select" on staff_members for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "staff_modify" on staff_members for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- staff_field_values (tenant_id yok, staff_member üzerinden kontrol)
create policy "sfv_select" on staff_field_values for select
  using (
    is_super_admin() or
    staff_member_id in (select id from staff_members where tenant_id = current_tenant_id())
  );
create policy "sfv_modify" on staff_field_values for all
  using (
    is_super_admin() or
    staff_member_id in (select id from staff_members where tenant_id = current_tenant_id())
  );

-- odz_form_sections
create policy "sections_select" on odz_form_sections for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "sections_modify" on odz_form_sections for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- odz_form_questions (tenant_id yok, section üzerinden kontrol)
create policy "questions_select" on odz_form_questions for select
  using (
    is_super_admin() or
    section_id in (select id from odz_form_sections where tenant_id = current_tenant_id())
  );
create policy "questions_modify" on odz_form_questions for all
  using (
    is_super_admin() or
    section_id in (select id from odz_form_sections where tenant_id = current_tenant_id())
  );

-- odz_form_question_options
create policy "options_select" on odz_form_question_options for select
  using (
    is_super_admin() or
    question_id in (
      select q.id from odz_form_questions q
      join odz_form_sections s on s.id = q.section_id
      where s.tenant_id = current_tenant_id()
    )
  );
create policy "options_modify" on odz_form_question_options for all
  using (
    is_super_admin() or
    question_id in (
      select q.id from odz_form_questions q
      join odz_form_sections s on s.id = q.section_id
      where s.tenant_id = current_tenant_id()
    )
  );

-- odz_visits
create policy "visits_select" on odz_visits for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "visits_modify" on odz_visits for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- odz_visit_photos (tenant_id yok, visit üzerinden kontrol)
create policy "photos_select" on odz_visit_photos for select
  using (
    is_super_admin() or
    visit_id in (select id from odz_visits where tenant_id = current_tenant_id())
  );
create policy "photos_modify" on odz_visit_photos for all
  using (
    is_super_admin() or
    visit_id in (select id from odz_visits where tenant_id = current_tenant_id())
  );

-- odz_visit_answers
create policy "answers_select" on odz_visit_answers for select
  using (
    is_super_admin() or
    visit_id in (select id from odz_visits where tenant_id = current_tenant_id())
  );
create policy "answers_modify" on odz_visit_answers for all
  using (
    is_super_admin() or
    visit_id in (select id from odz_visits where tenant_id = current_tenant_id())
  );

-- odz_visit_answer_photos
create policy "answer_photos_select" on odz_visit_answer_photos for select
  using (
    is_super_admin() or
    visit_answer_id in (
      select a.id from odz_visit_answers a
      join odz_visits v on v.id = a.visit_id
      where v.tenant_id = current_tenant_id()
    )
  );
create policy "answer_photos_modify" on odz_visit_answer_photos for all
  using (
    is_super_admin() or
    visit_answer_id in (
      select a.id from odz_visit_answers a
      join odz_visits v on v.id = a.visit_id
      where v.tenant_id = current_tenant_id()
    )
  );

-- actions
create policy "actions_select" on actions for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "actions_modify" on actions for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- action_updates (tenant_id yok, action üzerinden kontrol)
create policy "action_updates_select" on action_updates for select
  using (
    is_super_admin() or
    action_id in (select id from actions where tenant_id = current_tenant_id())
  );
create policy "action_updates_modify" on action_updates for all
  using (
    is_super_admin() or
    action_id in (select id from actions where tenant_id = current_tenant_id())
  );

-- metric_definitions
create policy "metric_defs_select" on metric_definitions for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "metric_defs_modify" on metric_definitions for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- metric_values (tenant_id yok, definition üzerinden kontrol)
create policy "metric_values_select" on metric_values for select
  using (
    is_super_admin() or
    metric_definition_id in (select id from metric_definitions where tenant_id = current_tenant_id())
  );
create policy "metric_values_modify" on metric_values for all
  using (
    is_super_admin() or
    metric_definition_id in (select id from metric_definitions where tenant_id = current_tenant_id())
  );

-- notifications
create policy "notifications_select" on notifications for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "notifications_modify" on notifications for all
  using (tenant_id = current_tenant_id() or is_super_admin());

-- billing_records — sadece süper admin
create policy "billing_select" on billing_records for select
  using (is_super_admin());
create policy "billing_modify" on billing_records for all
  using (is_super_admin());

-- support_tickets
create policy "tickets_select" on support_tickets for select
  using (tenant_id = current_tenant_id() or is_super_admin());
create policy "tickets_modify" on support_tickets for all
  using (tenant_id = current_tenant_id() or is_super_admin());
