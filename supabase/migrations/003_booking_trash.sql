begin;

alter table public.bookings
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.admins(id) on delete set null,
  add column if not exists deleted_reason text;

create index if not exists bookings_deleted_at_idx
  on public.bookings (deleted_at);

create index if not exists bookings_date_deleted_status_idx
  on public.bookings (booking_date, deleted_at, status);

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
    and status in ('pending', 'confirmed')
    and deleted_at is null;

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

create or replace function public.restore_booking_slot(p_booking_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_override_capacity integer;
  v_override_disabled boolean;
  v_default_capacity integer;
  v_slot_capacity integer;
  v_active_bookings integer;
begin
  select *
  into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found.';
  end if;

  if v_booking.deleted_at is null then
    raise exception 'Booking is not in Trash.';
  end if;

  if v_booking.status in ('pending', 'confirmed') then
    select
      capacity,
      is_disabled
    into v_override_capacity, v_override_disabled
    from public.slot_overrides
    where date = v_booking.booking_date
      and slot_time = v_booking.booking_time
    limit 1;

    if v_override_disabled is true then
      raise exception 'This booking cannot be restored because the original slot is now full.';
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

    perform pg_advisory_xact_lock(hashtext(v_booking.booking_date::text || '|' || v_booking.booking_time));

    select count(*)
    into v_active_bookings
    from public.bookings
    where booking_date = v_booking.booking_date
      and booking_time = v_booking.booking_time
      and status in ('pending', 'confirmed')
      and deleted_at is null
      and id <> p_booking_id;

    if v_active_bookings >= v_slot_capacity then
      raise exception 'This booking cannot be restored because the original slot is now full.';
    end if;
  end if;

  update public.bookings
  set deleted_at = null,
      deleted_by = null,
      deleted_reason = null,
      updated_at = now()
  where id = p_booking_id;

  return p_booking_id;
end;
$$;

commit;
