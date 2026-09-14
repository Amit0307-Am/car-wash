import Link from "next/link";

import { AdminActionForms } from "@/components/admin/admin-action-forms";
import { requireAdminAccess } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { bookingSlots } from "@/config/business";

type AdminPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type DateFilter = "today" | "tomorrow" | "this-week" | "upcoming" | "past" | "all";
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

type BookingRow = {
  id: string;
  booking_code: string;
  customer_name: string;
  mobile_number: string;
  vehicle_model: string;
  vehicle_number: string | null;
  service_id: string;
  booking_date: string;
  booking_time: string;
  price_snapshot: number;
  status: string;
  deleted_at: string | null;
  notes: string | null;
  created_at: string;
  serviceName: string;
  vehicleTypeName: string;
};

const BUSINESS_TIMEZONE = "Asia/Kolkata";
const DEFAULT_DATE_FILTER: DateFilter = "today";
const DEFAULT_STATUS_FILTER: StatusFilter = "all";

function getStatusClasses(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-500/10 text-amber-200 ring-1 ring-inset ring-amber-400/40";
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-200 ring-1 ring-inset ring-emerald-400/40";
    case "completed":
      return "bg-sky-500/10 text-sky-200 ring-1 ring-inset ring-sky-400/40";
    case "cancelled":
      return "bg-red-500/10 text-red-200 ring-1 ring-inset ring-red-400/40";
    default:
      return "bg-slate-500/10 text-slate-200 ring-1 ring-inset ring-slate-400/40";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function getDateFilterValue(value: string | string[] | undefined): DateFilter {
  return value === "tomorrow" || value === "this-week" || value === "upcoming" || value === "past" || value === "all"
    ? value
    : DEFAULT_DATE_FILTER;
}

function getStatusFilterValue(value: string | string[] | undefined): StatusFilter {
  return value === "pending" || value === "confirmed" || value === "completed" || value === "cancelled"
    ? value
    : DEFAULT_STATUS_FILTER;
}

function getSearchValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function parseBusinessDate(dateString: string) {
  return new Date(`${dateString}T00:00:00+05:30`);
}

function getBusinessDateString(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string) {
  const date = parseBusinessDate(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDisplayDateHeading(dateString: string) {
  return `${formatDisplayDate(dateString)}`;
}

function getTodayString() {
  return getBusinessDateString(new Date());
}

function addDays(dateString: string, days: number) {
  const date = parseBusinessDate(dateString);
  date.setDate(date.getDate() + days);
  return getBusinessDateString(date);
}

function getStartOfWeek(dateString: string) {
  const date = parseBusinessDate(dateString);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diff);

  return getBusinessDateString(date);
}

function getEndOfWeek(dateString: string) {
  const start = parseBusinessDate(getStartOfWeek(dateString));
  start.setDate(start.getDate() + 6);
  return getBusinessDateString(start);
}

function buildAdminHref(
  filters: { dateFilter?: DateFilter; status?: StatusFilter; search?: string; path?: string },
  currentSearchParams?: Record<string, string | string[] | undefined>
) {
  const query = new URLSearchParams();

  if (filters.dateFilter) {
    query.set("dateFilter", filters.dateFilter);
  }

  if (filters.status && filters.status !== "all") {
    query.set("status", filters.status);
  }

  if (filters.search) {
    query.set("search", filters.search);
  }

  const defaultPath = filters.path ?? "/admin";
  const existing = currentSearchParams ?? {};

  if (filters.dateFilter === undefined && existing.dateFilter) {
    query.set("dateFilter", existing.dateFilter as string);
  }

  if (filters.status === undefined && existing.status && existing.status !== "all") {
    query.set("status", existing.status as string);
  }

  if (filters.search === undefined && existing.search) {
    query.set("search", existing.search as string);
  }

  const queryString = query.toString();
  return queryString ? `${defaultPath}?${queryString}` : defaultPath;
}

function getDateFilterLabel(filter: DateFilter) {
  switch (filter) {
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "this-week":
      return "This Week";
    case "upcoming":
      return "Upcoming";
    case "past":
      return "Past";
    case "all":
      return "All";
    default:
      return "Today";
  }
}

async function getBookings() {
  const supabase = createServerSupabaseClient();

  const [bookingsResult, servicesResult, vehicleTypesResult, settingsResult, slotOverridesResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("services").select("id, name"),
    supabase.from("vehicle_types").select("id, name"),
    supabase
      .from("business_settings")
      .select("default_capacity_per_slot")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase.from("slot_overrides").select("date, slot_time, capacity, is_disabled"),
  ]);

  if (bookingsResult.error) {
    throw new Error(bookingsResult.error.message || "Unable to load bookings.");
  }

  if (servicesResult.error) {
    throw new Error(servicesResult.error.message || "Unable to load services.");
  }

  if (vehicleTypesResult.error) {
    throw new Error(vehicleTypesResult.error.message || "Unable to load vehicle types.");
  }

  if (settingsResult.error) {
    throw new Error(settingsResult.error.message || "Unable to load business settings.");
  }

  if (slotOverridesResult.error) {
    throw new Error(slotOverridesResult.error.message || "Unable to load slot overrides.");
  }

  const services = new Map((servicesResult.data ?? []).map((item) => [item.id, item.name]));
  const vehicleTypes = new Map((vehicleTypesResult.data ?? []).map((item) => [item.id, item.name]));
  const defaultCapacity = settingsResult.data?.[0]?.default_capacity_per_slot ?? 2;
  const slotOverrides = new Map(
    (slotOverridesResult.data ?? []).map((item) => [`${item.date}|${item.slot_time}`, item])
  );

  return {
    bookings: (bookingsResult.data ?? []).map((booking) => ({
      ...booking,
      serviceName: services.get(booking.service_id) ?? "Unknown service",
      vehicleTypeName: vehicleTypes.get(booking.vehicle_type_id) ?? "Unknown vehicle type",
    })),
    defaultCapacity,
    slotOverrides,
  };
}

function matchesBookingSearch(search: string, booking: BookingRow) {
  if (!search) {
    return true;
  }

  const normalized = search.toLowerCase();
  const searchable = [
    booking.customer_name,
    booking.mobile_number,
    booking.booking_code,
    booking.vehicle_model,
    booking.vehicle_number,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(normalized);
}

function getSlotSummary(
  dateString: string,
  slot: string,
  bookings: BookingRow[],
  defaultCapacity: number,
  slotOverrides: Map<string, { capacity: number | null; is_disabled: boolean; date: string; slot_time: string }>
) {
  const override = slotOverrides.get(`${dateString}|${slot}`);
  const currentCapacity = override?.capacity ?? defaultCapacity;
  const disabled = Boolean(override?.is_disabled);

  const bookedCount = bookings.filter(
    (booking) =>
      booking.booking_date === dateString &&
      booking.booking_time === slot &&
      booking.status !== "completed" &&
      booking.status !== "cancelled" &&
      booking.deleted_at === null
  ).length;

  if (disabled) {
    return {
      slot,
      text: "Disabled",
      style: "border-rose-500/40 bg-rose-500/10 text-rose-100",
    };
  }

  if (bookedCount >= currentCapacity) {
    return {
      slot,
      text: "Full",
      style: "border-red-500/40 bg-red-500/10 text-red-100",
    };
  }

  return {
    slot,
    text: `${bookedCount} / ${currentCapacity} booked`,
    style: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  };
}

function getPhoneHref(mobileNumber: string) {
  return `tel:${mobileNumber}`;
}

function getWhatsappHref(booking: BookingRow) {
  const sanitized = booking.mobile_number.replace(/\D/g, "");
  const message = `Hello ${booking.customer_name}, this is AutoGlow Car Wash regarding your booking ${booking.booking_code} for ${booking.serviceName} on ${booking.booking_date} at ${booking.booking_time}.`;

  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}

function getActionButtons(booking: BookingRow, currentPath: string) {
  const returnTo = currentPath;

  if (booking.deleted_at) {
    return null;
  }

  const buttons: Array<{
    key: string;
    label: string;
    action: string;
    variant: "emerald" | "sky" | "red" | "slate";
    confirmText?: string;
  }> = [];

  if (booking.status === "pending") {
    buttons.push({ key: "confirm", label: "Confirm", action: "confirm", variant: "emerald" });
  }

  if (booking.status === "pending" || booking.status === "confirmed") {
    buttons.push({ key: "cancel", label: "Cancel", action: "cancel", variant: "red", confirmText: "Cancel this booking?" });
  }

  if (booking.status === "confirmed") {
    buttons.push({ key: "complete", label: "Complete", action: "complete", variant: "sky" });
  }

  buttons.push({
    key: "trash",
    label: "Move to Trash",
    action: "trash",
    variant: "slate",
    confirmText: "Move this booking to Trash? You can restore it later.",
  });

  return <AdminActionForms bookingId={booking.id} returnTo={returnTo} actions={buttons} />;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdminAccess();

  const params = (searchParams ? await searchParams : {}) as Record<string, string | string[] | undefined>;
  const dateFilter = getDateFilterValue(params.dateFilter);
  const statusFilter = getStatusFilterValue(params.status);
  const search = getSearchValue(params.search);

  const { bookings, defaultCapacity, slotOverrides } = await getBookings();

  const activeBookings = bookings.filter((booking) => booking.deleted_at === null);

  const today = getTodayString();
  const tomorrow = addDays(today, 1);

  const filteredBookings = activeBookings.filter((booking) => {
    let matchesDate = true;

    switch (dateFilter) {
      case "today":
        matchesDate = booking.booking_date === today;
        break;
      case "tomorrow":
        matchesDate = booking.booking_date === tomorrow;
        break;
      case "this-week": {
        const startOfWeek = getStartOfWeek(today);
        const endOfWeek = getEndOfWeek(today);
        matchesDate = booking.booking_date >= startOfWeek && booking.booking_date <= endOfWeek;
        break;
      }
      case "upcoming":
        matchesDate = booking.booking_date > today;
        break;
      case "past":
        matchesDate = booking.booking_date < today;
        break;
      case "all":
      default:
        matchesDate = true;
    }

    const matchesStatus = statusFilter === "all" ? true : booking.status === statusFilter;
    const matchesSearchQuery = matchesBookingSearch(search, booking);

    return matchesDate && matchesStatus && matchesSearchQuery;
  });

  const groupedBookings = filteredBookings.reduce<Record<string, BookingRow[]>>((groups, booking) => {
    (groups[booking.booking_date] ||= []).push(booking);
    return groups;
  }, {});

  const groupedDates = Object.keys(groupedBookings).sort((left, right) => left.localeCompare(right));

  const pendingToday = activeBookings.filter(
    (booking) => booking.booking_date === today && booking.status === "pending"
  ).length;
  const confirmedToday = activeBookings.filter(
    (booking) => booking.booking_date === today && booking.status === "confirmed"
  ).length;
  const completedToday = activeBookings.filter(
    (booking) => booking.booking_date === today && booking.status === "completed"
  ).length;

  const currentPath = "/admin";

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 mb-4 rounded-2xl border border-white/10 bg-slate-950/85 px-3 py-2 backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-amber-300">
              AutoGlow Admin
            </p>
            <h1 className="text-base font-bold text-white sm:text-lg">Dashboard</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <Link
              href="/admin"
              className="rounded-full border border-amber-400/50 bg-amber-500/10 px-2.5 py-1.5 text-amber-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/trash"
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10"
            >
              Trash
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10"
            >
              View Website
            </Link>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Today&apos;s bookings</p>
          <p className="mt-2 text-2xl font-bold text-white">{activeBookings.filter((booking) => booking.booking_date === today).length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-300">{pendingToday}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Confirmed</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{confirmedToday}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Completed</p>
          <p className="mt-2 text-2xl font-bold text-sky-300">{completedToday}</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-lg shadow-slate-950/30">
        <div className="flex flex-col gap-3">
          <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              {(["today", "tomorrow", "this-week", "upcoming", "past", "all"] as DateFilter[]).map((filter) => (
                <Link
                  key={filter}
                  href={buildAdminHref({ dateFilter: filter, status: statusFilter, search }, params)}
                  className={
                    dateFilter === filter
                      ? "rounded-full border border-amber-400/60 bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-100"
                      : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10"
                  }
                >
                  {getDateFilterLabel(filter)}
                </Link>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((filter) => (
                <Link
                  key={filter}
                  href={buildAdminHref({ dateFilter, status: filter, search }, params)}
                  className={
                    statusFilter === filter
                      ? "rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-100"
                      : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/40 hover:bg-white/10"
                  }
                >
                  {filter === "all" ? "All statuses" : getStatusLabel(filter)}
                </Link>
              ))}
            </div>
          </div>

          <form method="get" action="/admin" className="flex w-full gap-2">
            <input type="hidden" name="dateFilter" value={dateFilter} />
            <input type="hidden" name="status" value={statusFilter} />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search customer, mobile, booking ID, vehicle..."
              className="w-full rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-amber-400/60"
            />
            <button
              type="submit"
              className="rounded-full border border-amber-400/60 bg-amber-500/20 px-3 py-2 text-xs font-medium text-amber-100"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {search || statusFilter !== "all" || dateFilter !== "today" ? (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            {getDateFilterLabel(dateFilter)}
          </span>
          {statusFilter !== "all" ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              {getStatusLabel(statusFilter)}
            </span>
          ) : null}
          {search ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              Search: {search}
            </span>
          ) : null}
          <Link href="/admin" className="text-amber-300 underline-offset-4 hover:underline">
            Clear filters
          </Link>
        </div>
      ) : null}

      {groupedDates.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-10 text-center">
          <p className="text-xl font-semibold text-white">No bookings match this view.</p>
          <p className="mt-2 text-slate-400">
            {search
              ? `No results match “${search}”.`
              : `No bookings ${dateFilter === "today" ? "today" : getDateFilterLabel(dateFilter).toLowerCase()}.`}
          </p>
          <Link href="/admin" className="mt-4 inline-block text-amber-300 underline-offset-4 hover:underline">
            View today
          </Link>
        </div>
      ) : null}

      <div className="space-y-8">
        {groupedDates.map((dateString) => {
          const bookingsForDate = [...groupedBookings[dateString]].sort((left, right) =>
            left.booking_time.localeCompare(right.booking_time)
          );

          const slotSummaries = bookingSlots.map((slot) =>
            getSlotSummary(dateString, slot, bookingsForDate, defaultCapacity, slotOverrides)
          );

          return (
            <section
              key={dateString}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40"
            >
              <div className="border-b border-white/10 bg-slate-950/40 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                      {dateString === today ? "Today" : dateString === tomorrow ? "Tomorrow" : "Date"}
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white">
                      {formatDisplayDateHeading(dateString)}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-300">
                    {bookingsForDate.length} booking{bookingsForDate.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {slotSummaries.map((slotSummary) => (
                    <span
                      key={`${dateString}-${slotSummary.slot}`}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${slotSummary.style}`}
                    >
                      {slotSummary.slot} • {slotSummary.text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left">
                    <thead className="bg-slate-950/50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Time
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Service
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Vehicle
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {bookingsForDate.map((booking) => (
                        <tr key={booking.id} className="align-top">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">{booking.booking_time}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-white">{booking.booking_code}</div>
                            <div className="mt-1 text-white">{booking.customer_name}</div>
                            <div className="mt-1 text-sm text-slate-400">{booking.mobile_number}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-200">{booking.serviceName}</td>
                          <td className="px-4 py-4 text-slate-200">
                            <div>{booking.vehicleTypeName}</div>
                            <div className="mt-1 text-sm text-slate-400">{booking.vehicle_model}</div>
                            {booking.vehicle_number ? (
                              <div className="mt-1 text-xs text-slate-500">{booking.vehicle_number}</div>
                            ) : null}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(booking.status)}`}
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2">
                              <a
                                href={getPhoneHref(booking.mobile_number)}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-center text-xs font-medium text-white transition hover:bg-white/10"
                              >
                                Call
                              </a>
                              <a
                                href={getWhatsappHref(booking)}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-center text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-2">
                              {getActionButtons(booking, currentPath)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {bookingsForDate.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/45 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                          {booking.booking_time}
                        </div>
                        <div className="mt-1 text-base font-semibold text-white">{booking.customer_name}</div>
                        <div className="mt-0.5 text-[11px] text-slate-300">{booking.serviceName}</div>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClasses(booking.status)}`}
                      >
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-2 text-[10px] text-slate-400">
                      <span>Code: {booking.booking_code}</span>
                      <span>{booking.vehicleTypeName}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <a
                        href={getPhoneHref(booking.mobile_number)}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-center text-xs font-medium text-white"
                      >
                        Call
                      </a>
                      <a
                        href={getWhatsappHref(booking)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-2 text-center text-xs font-medium text-emerald-200"
                      >
                        WhatsApp
                      </a>
                    </div>

                    <details className="mt-3 rounded-xl border border-white/10 bg-slate-900/60 p-2">
                      <summary className="cursor-pointer list-none text-[11px] font-medium text-amber-200">
                        View details
                      </summary>
                      <div className="mt-2 space-y-1.5 text-[10px] text-slate-300">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Booking code</span>
                          <span className="text-right text-white">{booking.booking_code}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Vehicle</span>
                          <span className="text-right text-white">{booking.vehicle_model}</span>
                        </div>
                        {booking.vehicle_number ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-400">Reg</span>
                            <span className="text-right text-white">{booking.vehicle_number}</span>
                          </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Price</span>
                          <span className="text-right text-white">₹{booking.price_snapshot}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Phone</span>
                          <span className="text-right text-white">{booking.mobile_number}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400">Date</span>
                          <span className="text-right text-white">{booking.booking_date}</span>
                        </div>
                        {booking.notes ? (
                          <div className="pt-1">
                            <span className="text-slate-400">Notes</span>
                            <p className="mt-1 text-white">{booking.notes}</p>
                          </div>
                        ) : null}
                      </div>
                    </details>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {getActionButtons(booking, currentPath)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
