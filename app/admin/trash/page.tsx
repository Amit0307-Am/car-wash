import Link from "next/link";

import { AdminActionForms } from "@/components/admin/admin-action-forms";
import { requireAdminAccess } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getTrashBookings() {
  const supabase = createServerSupabaseClient();

  const [bookingsResult, servicesResult, vehicleTypesResult] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase.from("services").select("id, name"),
    supabase.from("vehicle_types").select("id, name"),
  ]);

  if (bookingsResult.error) {
    throw new Error(bookingsResult.error.message || "Unable to load trash items.");
  }

  if (servicesResult.error) {
    throw new Error(servicesResult.error.message || "Unable to load services.");
  }

  if (vehicleTypesResult.error) {
    throw new Error(vehicleTypesResult.error.message || "Unable to load vehicle types.");
  }

  const services = new Map((servicesResult.data ?? []).map((item) => [item.id, item.name]));
  const vehicleTypes = new Map((vehicleTypesResult.data ?? []).map((item) => [item.id, item.name]));

  return (bookingsResult.data ?? []).map((booking) => ({
    ...booking,
    serviceName: services.get(booking.service_id) ?? "Unknown service",
    vehicleTypeName: vehicleTypes.get(booking.vehicle_type_id) ?? "Unknown vehicle type",
  }));
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

export default async function AdminTrashPage() {
  await requireAdminAccess();

  const bookings = await getTrashBookings();

  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 mb-4 rounded-2xl border border-white/10 bg-slate-950/85 px-3 py-2 backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-amber-300">
              AutoGlow Admin
            </p>
            <h1 className="text-base font-bold text-white sm:text-lg">Trash</h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
            <Link
              href="/admin"
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-slate-200 transition hover:border-amber-400/40 hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/trash"
              className="rounded-full border border-amber-400/50 bg-amber-500/10 px-2.5 py-1.5 text-amber-100"
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

      {bookings.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-10 text-center">
          <p className="text-xl font-semibold text-white">Trash is empty.</p>
          <p className="mt-2 text-slate-400">Moved bookings will appear here so they can be restored or permanently deleted.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 shadow-lg shadow-slate-950/30">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Booking code</div>
                  <div className="mt-1 text-sm font-semibold text-white">{booking.booking_code}</div>
                </div>

                <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${getStatusClasses(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Customer:</span>{" "}
                  <span className="text-white">{booking.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Service:</span>{" "}
                  <span className="text-white">{booking.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Schedule:</span>{" "}
                  <span className="text-white">{booking.booking_date} • {booking.booking_time}</span>
                </div>
                <div>
                  <span className="text-slate-400">Deleted:</span>{" "}
                  <span className="text-white">
                    {booking.deleted_at ? new Date(booking.deleted_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <AdminActionForms
                  bookingId={booking.id}
                  returnTo="/admin/trash"
                  actions={[
                    {
                      key: "restore",
                      label: "Restore",
                      action: "restore",
                      variant: "emerald",
                      confirmText: "Restore this booking?",
                    },
                    {
                      key: "permanent-delete",
                      label: "Delete Permanently",
                      action: "permanent-delete",
                      variant: "red",
                      confirmText: "Permanently delete this booking? This action cannot be undone.",
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
