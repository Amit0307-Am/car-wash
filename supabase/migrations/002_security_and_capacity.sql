begin;

alter table public.services enable row level security;
alter table public.business_settings enable row level security;
alter table public.vehicle_types enable row level security;
alter table public.service_prices enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.slot_overrides enable row level security;
alter table public.bookings enable row level security;
alter table public.gallery enable row level security;
alter table public.reviews enable row level security;
alter table public.admins enable row level security;

revoke all on table public.services, public.business_settings, public.vehicle_types, public.service_prices, public.blocked_dates, public.slot_overrides, public.bookings, public.gallery, public.reviews, public.admins from public;
revoke all on table public.services, public.business_settings, public.vehicle_types, public.service_prices, public.blocked_dates, public.slot_overrides, public.bookings, public.gallery, public.reviews, public.admins from anon, authenticated;

grant select on table public.services to anon, authenticated;
grant select on table public.business_settings to anon, authenticated;
grant select on table public.vehicle_types to anon, authenticated;
grant select on table public.gallery to anon, authenticated;
grant select on table public.reviews to anon, authenticated;

create policy services_select_public
on public.services
for select
to anon, authenticated
using (is_active = true);

create policy business_settings_select_public
on public.business_settings
for select
to anon, authenticated
using (true);

create policy vehicle_types_select_public
on public.vehicle_types
for select
to anon, authenticated
using (is_active = true);

create policy gallery_select_public
on public.gallery
for select
to anon, authenticated
using (true);

create policy reviews_select_public
on public.reviews
for select
to anon, authenticated
using (true);

create policy bookings_no_public_access
on public.bookings
for all
to anon, authenticated
using (false)
with check (false);

create policy admins_no_public_access
on public.admins
for all
to anon, authenticated
using (false)
with check (false);

create policy service_prices_no_public_access
on public.service_prices
for all
to anon, authenticated
using (false)
with check (false);

create policy blocked_dates_no_public_access
on public.blocked_dates
for all
to anon, authenticated
using (false)
with check (false);

create policy slot_overrides_no_public_access
on public.slot_overrides
for all
to anon, authenticated
using (false)
with check (false);

create index if not exists bookings_slot_capacity_idx
on public.bookings (booking_date, booking_time, status);

create or replace function public.reserve_booking_slot(
  p_booking_code text,
  p_customer_name text,
  p_mobile_number text,
  p_vehicle_type_id uuid,
  p_vehicle_model text,
  p_vehicle_number text,
  p_service_id uuid,
  p_booking_date date,
  p_booking_time text,
  p_price_snapshot numeric(10,2),
  p_notes text,
  p_status text default 'pending'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_override_capacity integer;
  v_override_disabled boolean;
  v_default_capacity integer;
  v_slot_capacity integer;
  v_active_bookings integer;
  v_booking_id uuid;
begin
  select
    capacity,
    is_disabled
  into v_override_capacity, v_override_disabled
  from public.slot_overrides
  where date = p_booking_date
    and slot_time = p_booking_time
  limit 1;

  if v_override_disabled is true then
    raise exception 'That time slot is currently unavailable. Please choose another time.';
  end if;

  select default_capacity_per_slot
  into v_default_capacity
  from public.business_settings
  order by created_at desc
  limit 1;

  v_slot_capacity := coalesce(v_override_capacity, v_default_capacity, 1);

  if v_slot_capacity is null or v_slot_capacity < 1 then
    v_slot_capacity := 1;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_booking_date::text || '|' || p_booking_time));

  select count(*)
  into v_active_bookings
  from public.bookings
  where booking_date = p_booking_date
    and booking_time = p_booking_time
    and status in ('pending', 'confirmed');

  if v_active_bookings >= v_slot_capacity then
    raise exception 'That time slot is currently unavailable. Please choose another time.';
  end if;

  v_booking_id := gen_random_uuid();

  insert into public.bookings (
    id,
    booking_code,
    customer_name,
    mobile_number,
    vehicle_type_id,
    vehicle_model,
    vehicle_number,
    service_id,
    booking_date,
    booking_time,
    price_snapshot,
    notes,
    status,
    created_at,
    updated_at
  )
  values (
    v_booking_id,
    p_booking_code,
    p_customer_name,
    p_mobile_number,
    p_vehicle_type_id,
    p_vehicle_model,
    p_vehicle_number,
    p_service_id,
    p_booking_date,
    p_booking_time,
    p_price_snapshot,
    p_notes,
    coalesce(p_status, 'pending'),
    now(),
    now()
  );

  return v_booking_id;
end;
$$;

commit;
