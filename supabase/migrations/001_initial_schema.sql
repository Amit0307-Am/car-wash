-- Phase 2 foundation schema for the car wash booking system

create extension if not exists pgcrypto;

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  phone text not null,
  whatsapp_number text not null,
  address text not null,
  maps_link text not null,
  opening_time text not null,
  closing_time text not null,
  slot_duration_minutes integer not null default 60,
  default_capacity_per_slot integer not null default 2,
  booking_advance_days integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  duration_minutes integer not null,
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  vehicle_type_id uuid not null references public.vehicle_types(id) on delete cascade,
  price numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(service_id, vehicle_type_id)
);

create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.slot_overrides (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  slot_time text not null,
  capacity integer,
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  unique(date, slot_time)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  customer_name text not null,
  mobile_number text not null,
  vehicle_type_id uuid not null references public.vehicle_types(id),
  vehicle_model text not null,
  vehicle_number text,
  service_id uuid not null references public.services(id),
  booking_date date not null,
  booking_time text not null,
  price_snapshot numeric(10,2) not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  service text not null,
  review text not null,
  review_date text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  full_name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists bookings_date_time_slot_idx
  on public.bookings (booking_date, booking_time);

create index if not exists bookings_booking_date_idx on public.bookings (booking_date);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_service_idx on public.bookings (service_id);
create index if not exists services_active_idx on public.services (is_active);
create index if not exists service_prices_active_idx on public.service_prices (is_active);

-- Placeholder seed data for local development only.
insert into public.vehicle_types (name, is_active)
values ('Hatchback', true), ('Sedan', true), ('SUV', true)
on conflict (name) do nothing;

insert into public.services (id, name, description, duration_minutes, is_active, image_url)
values
  (gen_random_uuid(), 'Basic Car Wash', 'Fast exterior wash with tyre shine and a dry finish for everyday freshness.', 45, true, null),
  (gen_random_uuid(), 'Premium Car Wash', 'Deep clean and finishing package for a brighter, more polished look.', 75, true, null),
  (gen_random_uuid(), 'Interior Cleaning', 'Refresh the cabin with dust removal, dashboard care, and a clean finish.', 60, true, null),
  (gen_random_uuid(), 'Exterior Detailing', 'Enhanced paint care and surface finishing for added shine and protection.', 90, true, null),
  (gen_random_uuid(), 'Full Car Detailing', 'A complete cleanup and finish for customers who want their vehicle showroom-ready.', 150, true, null)
on conflict do nothing;

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger services_updated_at
before update on public.services
for each row
execute function public.update_updated_at();

create trigger bookings_updated_at
before update on public.bookings
for each row
execute function public.update_updated_at();

create trigger business_settings_updated_at
before update on public.business_settings
for each row
execute function public.update_updated_at();
