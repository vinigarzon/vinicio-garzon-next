-- Esquema del módulo de reservas de viniciogarzon.com (/book)
-- Correr una sola vez en: Supabase → proyecto viniciogarzon-book → SQL Editor → New query → Run.
-- Es idempotente: se puede volver a correr sin romper nada.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------- settings
create table if not exists public.book_settings (
  id                      smallint primary key default 1 check (id = 1),
  timezone                text        not null default 'America/Chicago',
  durations               jsonb       not null default '[30, 60]'::jsonb,
  slot_increment          integer     not null default 30,
  buffer_before           integer     not null default 0,
  buffer_after            integer     not null default 15,
  min_notice_minutes      integer     not null default 720,
  max_days_ahead          integer     not null default 45,
  daily_limit             integer     not null default 4,
  allow_cancel            boolean     not null default true,
  cancel_cutoff_hours     integer     not null default 12,
  allow_reschedule        boolean     not null default true,
  reschedule_cutoff_hours integer     not null default 12,
  zoom_link               text        not null default '',
  zoom_note               text        not null default '',
  host_name               text        not null default 'Vinicio Garzón',
  host_email              text        not null default 'yo@viniciogarzon.com',
  event_title             text        not null default '{name} ↔ {host}',
  event_description       text        not null default 'Virtual meeting booked through viniciogarzon.com/book.',
  page_title_en           text        not null default 'Let''s talk',
  page_title_es           text        not null default 'Hablemos',
  page_intro_en           text        not null default 'Pick a time that works for you. You will get a calendar invite with the Zoom link right away.',
  page_intro_es           text        not null default 'Elige el horario que mejor te sirva. Recibirás la invitación de calendario con el link de Zoom al instante.',
  calendar_id             text        not null default 'primary',
  active                  boolean     not null default true,
  updated_at              timestamptz not null default now()
);

insert into public.book_settings (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------- reglas de disponibilidad
create table if not exists public.book_availability_rules (
  id         uuid primary key default gen_random_uuid(),
  weekday    smallint not null check (weekday between 0 and 6),   -- 0 = domingo
  start_min  integer  not null check (start_min between 0 and 1440),
  end_min    integer  not null check (end_min between 0 and 1440),
  active     boolean  not null default true,
  created_at timestamptz not null default now(),
  check (end_min > start_min)
);

create index if not exists book_rules_weekday_idx on public.book_availability_rules (weekday);

-- Semana inicial de ejemplo (lunes a viernes, mañana y tarde). Se edita desde el admin.
insert into public.book_availability_rules (weekday, start_min, end_min)
select d, s, e
from (values (1),(2),(3),(4),(5)) as days(d),
     (values (540, 720), (840, 1020)) as blocks(s, e)
where not exists (select 1 from public.book_availability_rules);

-- --------------------------------------------------------------- blackouts
create table if not exists public.book_blackouts (
  id         uuid primary key default gen_random_uuid(),
  start_date date not null,
  end_date   date not null,
  reason     text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- ---------------------------------------------------------------- reservas
create table if not exists public.book_bookings (
  id              uuid primary key default gen_random_uuid(),
  manage_token    text        not null unique,
  name            text        not null,
  email           text        not null,
  notes           text,
  start_utc       timestamptz not null,
  end_utc         timestamptz not null,
  duration_min    integer     not null,
  guest_tz        text        not null default 'UTC',
  guest_lang      text        not null default 'en',
  status          text        not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  google_event_id text,
  ip              text,
  created_at      timestamptz not null default now(),
  cancelled_at    timestamptz,
  cancelled_by    text,
  check (end_utc > start_utc)
);

create index if not exists book_bookings_start_idx  on public.book_bookings (start_utc);
create index if not exists book_bookings_status_idx on public.book_bookings (status);
create index if not exists book_bookings_ip_idx     on public.book_bookings (ip, created_at);

-- El seguro de verdad contra doble reserva: Postgres rechaza cualquier solape
-- entre reuniones confirmadas, sin importar qué haga la aplicación.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'book_bookings_no_overlap') then
    alter table public.book_bookings
      add constraint book_bookings_no_overlap
      exclude using gist (tstzrange(start_utc, end_utc) with &&)
      where (status = 'confirmed');
  end if;
end $$;

-- -------------------------------------------------------- cuenta de Google
create table if not exists public.book_google_account (
  id            smallint primary key default 1 check (id = 1),
  email         text,
  refresh_token text        not null,
  access_token  text,
  expires_at    timestamptz,
  calendar_id   text        not null default 'primary',
  scope         text,
  connected_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------- RLS
-- Todas cerradas: no se crea ninguna policy, así que ni anon ni authenticated
-- pueden leer o escribir. El único acceso es con la service role key, que vive
-- solo en el servidor de Netlify.
alter table public.book_settings           enable row level security;
alter table public.book_availability_rules enable row level security;
alter table public.book_blackouts          enable row level security;
alter table public.book_bookings           enable row level security;
alter table public.book_google_account     enable row level security;
