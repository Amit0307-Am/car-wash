import Link from "next/link";

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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">Admin trash</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Deleted bookings
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-400/60 hover:bg-white/10"
          >
            Back to dashboard
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-400/60 hover:bg-white/10"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/60 p-10 text-center">
          <p className="text-xl font-semibold text-white">Trash is empty.</p>
          <p className="mt-2 text-slate-400">Moved bookings will appear here so they can be restored or permanently deleted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Booking code</div>
                  <div className="mt-1 text-xl font-semibold text-white">{booking.booking_code}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Customer</p>
                  <p className="mt-1 text-white">{booking.customer_name}</p>
                  <p className="text-slate-400">{booking.mobile_number}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Service</p>
                  <p className="mt-1 text-white">{booking.serviceName}</p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Vehicle</p>
                  <p className="mt-1 text-white">{booking.vehicleTypeName}</p>
                  <p className="text-slate-400">{booking.vehicle_model}</p>
                  {booking.vehicle_number ? <p className="text-slate-500">{booking.vehicle_number}</p> : null}
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Schedule</p>
                  <p className="mt-1 text-white">{booking.booking_date}</p>
                  <p className="text-slate-400">{booking.booking_time}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-400">
                  Deleted: {booking.deleted_at ? new Date(booking.deleted_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "Unknown"}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <form
                    action={`/api/admin/bookings/${booking.id}`}
                    method="post"
                    onSubmit={(event) => {
                      if (!window.confirm("Restore this booking?")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="action" value="restore" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                    >
                      Restore
                    </button>
                  </form>

                  <form
                    action={`/api/admin/bookings/${booking.id}`}
                    method="post"
                    onSubmit={(event) => {
                      if (!window.confirm("Permanently delete this booking? This action cannot be undone.")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="action" value="permanent-delete" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
                    >
                      Delete Permanently
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
