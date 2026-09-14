import { requireAdminAccess } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getBookings() {
  const supabase = createServerSupabaseClient();

  const [bookingsResult, servicesResult, vehicleTypesResult] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("services").select("id, name"),
    supabase.from("vehicle_types").select("id, name"),
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

  const services = new Map((servicesResult.data ?? []).map((item) => [item.id, item.name]));
  const vehicleTypes = new Map((vehicleTypesResult.data ?? []).map((item) => [item.id, item.name]));

  return (bookingsResult.data ?? []).map((booking) => ({
    ...booking,
    serviceName: services.get(booking.service_id) ?? "Unknown service",
    vehicleTypeName: vehicleTypes.get(booking.vehicle_type_id) ?? "Unknown vehicle type",
  }));
}

export default async function AdminPage() {
  await requireAdminAccess();

  const bookings = await getBookings();

  const confirmedCount = bookings.filter((booking) => booking.status === "confirmed").length;
  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const completedCount = bookings.filter((booking) => booking.status === "completed").length;
  const cancelledCount = bookings.filter((booking) => booking.status === "cancelled").length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-300">
            Admin overview
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white">
            Booking dashboard
          </h1>
        </div>

        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-amber-400/60 hover:bg-white/10"
          >
            Logout
          </button>
        </form>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Total bookings</p>
          <p className="mt-3 text-3xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-bold text-amber-300">{pendingCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Confirmed</p>
          <p className="mt-3 text-3xl font-bold text-emerald-300">{confirmedCount}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Completed / Cancelled</p>
          <p className="mt-3 text-3xl font-bold text-slate-200">
            {completedCount} / {cancelledCount}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-slate-950/60">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Booking
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
                  Date / Time
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No bookings have been created yet.
                  </td>
                </tr>
              ) : null}

              {bookings.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-white">{booking.booking_code}</div>
                    <div className="mt-1 text-xs text-slate-400">{booking.id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{booking.customer_name}</div>
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
                  <td className="px-4 py-4 text-slate-200">
                    <div>{booking.booking_date}</div>
                    <div className="mt-1 text-sm text-slate-400">{booking.booking_time}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : booking.status === "pending"
                            ? "bg-amber-500/10 text-amber-300"
                            : "bg-slate-500/10 text-slate-300"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-200">₹{booking.price_snapshot}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <form action={`/api/admin/bookings/${booking.id}`} method="post">
                        <input type="hidden" name="action" value="confirm" />
                        <button
                          type="submit"
                          className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                        >
                          Confirm
                        </button>
                      </form>

                      <form action={`/api/admin/bookings/${booking.id}`} method="post">
                        <input type="hidden" name="action" value="cancel" />
                        <button
                          type="submit"
                          className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
                        >
                          Cancel
                        </button>
                      </form>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
