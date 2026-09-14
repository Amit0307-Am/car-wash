import { requireAdminAccess } from "@/lib/admin/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

      <div className="hidden overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40 md:block">
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
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                    No bookings have been created yet.
                  </td>
                </tr>
              ) : null}

              {bookings.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-white">{booking.booking_code}</div>
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
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-200">₹{booking.price_snapshot}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {booking.status === "pending" ? (
                        <>
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
                              className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                            >
                              Cancel
                            </button>
                          </form>
                        </>
                      ) : booking.status === "confirmed" ? (
                        <>
                          <form action={`/api/admin/bookings/${booking.id}`} method="post">
                            <input type="hidden" name="action" value="complete" />
                            <button
                              type="submit"
                              className="rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 transition hover:bg-sky-500/20"
                            >
                              Complete
                            </button>
                          </form>

                          <form action={`/api/admin/bookings/${booking.id}`} method="post">
                            <input type="hidden" name="action" value="cancel" />
                            <button
                              type="submit"
                              className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
                            >
                              Cancel
                            </button>
                          </form>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          {booking.status === "completed" ? "Completed" : "Cancelled"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-center text-slate-400">
            No bookings have been created yet.
          </div>
        ) : null}

        {bookings.map((booking) => (
          <div key={booking.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/30">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
                  Booking
                </p>
                <p className="mt-1 text-lg font-semibold text-white">{booking.booking_code}</p>
              </div>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Customer</span>
                <p className="mt-1 font-medium text-white">{booking.customer_name}</p>
                <p className="text-slate-400">{booking.mobile_number}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Service</span>
                <p className="mt-1 text-white">{booking.serviceName}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Vehicle</span>
                <p className="mt-1 text-white">{booking.vehicleTypeName}</p>
                <p className="text-slate-400">{booking.vehicle_model}</p>
                {booking.vehicle_number ? <p className="text-slate-500">{booking.vehicle_number}</p> : null}
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">When</span>
                  <p className="mt-1 text-white">{booking.booking_date}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Time</span>
                  <p className="mt-1 text-white">{booking.booking_time}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Price</span>
                <p className="font-medium text-white">₹{booking.price_snapshot}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {booking.status === "pending" ? (
                <>
                  <form action={`/api/admin/bookings/${booking.id}`} method="post" className="flex-1">
                    <input type="hidden" name="action" value="confirm" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-200"
                    >
                      Confirm
                    </button>
                  </form>

                  <form action={`/api/admin/bookings/${booking.id}`} method="post" className="flex-1">
                    <input type="hidden" name="action" value="cancel" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
                    >
                      Cancel
                    </button>
                  </form>
                </>
              ) : booking.status === "confirmed" ? (
                <>
                  <form action={`/api/admin/bookings/${booking.id}`} method="post" className="flex-1">
                    <input type="hidden" name="action" value="complete" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-200"
                    >
                      Complete
                    </button>
                  </form>

                  <form action={`/api/admin/bookings/${booking.id}`} method="post" className="flex-1">
                    <input type="hidden" name="action" value="cancel" />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
                    >
                      Cancel
                    </button>
                  </form>
                </>
              ) : (
                <div className="w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-sm font-medium text-slate-300">
                  {booking.status === "completed" ? "Completed" : "Cancelled"}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
