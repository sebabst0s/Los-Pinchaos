-- =========================================================
-- Viaje a la Playa — Schema de Supabase
-- =========================================================
-- Cómo usarlo:
--   1. Crea un proyecto en https://supabase.com
--   2. Ve a SQL Editor > New query
--   3. Pega este archivo completo y ejecútalo (Run)
--   4. Repite con supabase/seed.sql para precargar participantes
--
-- Notas de diseño:
--   - No hay autenticación real (login por selección de nombre),
--     así que las políticas RLS son permisivas para el rol `anon`.
--     Esto es aceptable para un grupo cerrado de amigos que comparte
--     la URL, pero significa que cualquiera con el link puede
--     leer/escribir. No uses este esquema para datos sensibles.
--   - Todas las tablas usan uuid como PK (gen_random_uuid()).
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- participants
-- ---------------------------------------------------------
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Por si ya habías corrido este schema antes de que se agregara avatar_url.
alter table participants add column if not exists avatar_url text;

-- ---------------------------------------------------------
-- expenses
-- ---------------------------------------------------------
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(10, 2) not null check (amount > 0),
  category text not null check (
    category in ('comida', 'alojamiento', 'transporte', 'actividades', 'otros')
  ),
  paid_by uuid not null references participants (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- expense_splits
-- Cuánto le corresponde pagar a cada participante de un gasto.
-- Por defecto se divide en partes iguales entre los seleccionados,
-- pero se guarda el monto exacto por si se ajusta manualmente.
-- ---------------------------------------------------------
create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses (id) on delete cascade,
  participant_id uuid not null references participants (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (expense_id, participant_id)
);

-- ---------------------------------------------------------
-- shopping_items
-- ---------------------------------------------------------
create table if not exists shopping_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (
    category in ('comida', 'bebidas', 'insumos_playa', 'otros')
  ),
  is_purchased boolean not null default false,
  added_by uuid not null references participants (id) on delete cascade,
  purchased_by uuid references participants (id) on delete set null,
  -- Gasto creado automáticamente al marcar el ítem como comprado
  -- (ver expenses). Se limpia si se desmarca o si se borra el gasto.
  expense_id uuid references expenses (id) on delete set null,
  created_at timestamptz not null default now(),
  purchased_at timestamptz
);

-- Por si ya habías corrido este schema antes de que se agregara expense_id.
alter table shopping_items add column if not exists expense_id uuid references expenses (id) on delete set null;

-- ---------------------------------------------------------
-- itinerary_items
-- day: fecha del viaje (2026-07-17 / 18 / 19)
-- ---------------------------------------------------------
create table if not exists itinerary_items (
  id uuid primary key default gen_random_uuid(),
  day date not null,
  time time,
  title text not null,
  description text,
  created_by uuid references participants (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- activity_log
-- Feed genérico para el indicador de "actividad reciente" del header.
-- ---------------------------------------------------------
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants (id) on delete set null,
  action_type text not null check (
    action_type in (
      'expense_added', 'shopping_item_added', 'shopping_item_purchased',
      'itinerary_item_added', 'itinerary_item_updated',
      'participant_joined'
    )
  ),
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_expense_splits_expense on expense_splits (expense_id);
create index if not exists idx_expense_splits_participant on expense_splits (participant_id);
create index if not exists idx_shopping_items_category on shopping_items (category);
create index if not exists idx_shopping_items_expense on shopping_items (expense_id);
create index if not exists idx_itinerary_items_day on itinerary_items (day);
create index if not exists idx_activity_log_created_at on activity_log (created_at desc);

-- =========================================================
-- Row Level Security
-- Grupo cerrado sin auth real: permitimos todo al rol anon.
-- =========================================================
alter table participants enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;
alter table shopping_items enable row level security;
alter table itinerary_items enable row level security;
alter table activity_log enable row level security;

create policy "public read participants" on participants for select using (true);
create policy "public insert participants" on participants for insert with check (true);
create policy "public update participants" on participants for update using (true) with check (true);

create policy "public read expenses" on expenses for select using (true);
create policy "public insert expenses" on expenses for insert with check (true);
create policy "public update expenses" on expenses for update using (true);
create policy "public delete expenses" on expenses for delete using (true);

create policy "public read expense_splits" on expense_splits for select using (true);
create policy "public insert expense_splits" on expense_splits for insert with check (true);
create policy "public update expense_splits" on expense_splits for update using (true);
create policy "public delete expense_splits" on expense_splits for delete using (true);

create policy "public read shopping_items" on shopping_items for select using (true);
create policy "public insert shopping_items" on shopping_items for insert with check (true);
create policy "public update shopping_items" on shopping_items for update using (true);
create policy "public delete shopping_items" on shopping_items for delete using (true);

create policy "public read itinerary_items" on itinerary_items for select using (true);
create policy "public insert itinerary_items" on itinerary_items for insert with check (true);
create policy "public update itinerary_items" on itinerary_items for update using (true);
create policy "public delete itinerary_items" on itinerary_items for delete using (true);

create policy "public read activity_log" on activity_log for select using (true);
create policy "public insert activity_log" on activity_log for insert with check (true);

-- =========================================================
-- Realtime
-- Habilita replicación para que el cliente pueda suscribirse
-- a cambios (INSERT/UPDATE/DELETE) en estas tablas.
-- =========================================================
alter publication supabase_realtime add table activity_log;
alter publication supabase_realtime add table expenses;
alter publication supabase_realtime add table shopping_items;
alter publication supabase_realtime add table itinerary_items;

-- =========================================================
-- Storage bucket para avatares de participantes
-- =========================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read avatars bucket"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "public upload avatars bucket"
  on storage.objects for insert
  with check (bucket_id = 'avatars');

create policy "public update avatars bucket"
  on storage.objects for update
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

create policy "public delete avatars bucket"
  on storage.objects for delete
  using (bucket_id = 'avatars');
