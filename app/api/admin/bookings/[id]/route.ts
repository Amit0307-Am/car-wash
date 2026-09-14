import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

async function getAuthorizedAdmin() {
  const authenticatedSupabase = await createAuthenticatedSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await authenticatedSupabase.auth.getUser();

  if (userError || !user) {
    return {
      authorized: false,
      status: 401,
      message: "Unauthorized.",
    } as const;
  }

  const serverSupabase = createServerSupabaseClient();
  const { data: adminRecord, error: adminLookupError } = await serverSupabase
    .from("admins")
    .select("id, auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (adminLookupError || !adminRecord) {
    return {
      authorized: false,
      status: 403,
      message: "Admin access is required.",
    } as const;
  }

  return {
    authorized: true,
    adminRecord,
  } as const;
}

function isJsonRequest(request: Request) {
  const acceptHeader = request.headers.get("accept") ?? "";
  return acceptHeader.includes("application/json");
}

function getRedirectResponse(request: Request, targetPath: string, message?: string) {
  const targetUrl = new URL(targetPath, request.url);

  if (message) {
    targetUrl.searchParams.set("error", message);
  }

  return NextResponse.redirect(targetUrl);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const action = formData.get("action")?.toString();
  const returnTo = formData.get("returnTo")?.toString() || "/admin";

  if (!action) {
    if (isJsonRequest(request)) {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }

    return getRedirectResponse(request, returnTo, "Invalid action.");
  }

  const authorizedResult = await getAuthorizedAdmin();

  if (!authorizedResult.authorized) {
    if (isJsonRequest(request)) {
      return NextResponse.json(
        { success: false, message: authorizedResult.message },
        { status: authorizedResult.status }
      );
    }

    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const supabase = createServerSupabaseClient();
  const { data: booking, error: bookingFetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (bookingFetchError || !booking) {
    if (isJsonRequest(request)) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }

    return getRedirectResponse(request, returnTo, "Booking not found.");
  }

  const adminRecord = authorizedResult.adminRecord;

  try {
    if (action === "confirm") {
      if (booking.deleted_at) {
        throw new Error("This booking is currently in Trash and cannot be updated.");
      }

      if (booking.status !== "pending") {
        throw new Error("Only pending bookings can be confirmed.");
      }

      const updateResult = await supabase
        .from("bookings")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id");

      if (updateResult.error) {
        throw new Error(updateResult.error.message || "Unable to confirm booking.");
      }
    } else if (action === "complete") {
      if (booking.deleted_at) {
        throw new Error("This booking is currently in Trash and cannot be updated.");
      }

      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be completed.");
      }

      const updateResult = await supabase
        .from("bookings")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id");

      if (updateResult.error) {
        throw new Error(updateResult.error.message || "Unable to complete booking.");
      }
    } else if (action === "cancel") {
      if (booking.deleted_at) {
        throw new Error("This booking is currently in Trash and cannot be updated.");
      }

      if (booking.status !== "pending" && booking.status !== "confirmed") {
        throw new Error("Only pending or confirmed bookings can be cancelled.");
      }

      const updateResult = await supabase
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id");

      if (updateResult.error) {
        throw new Error(updateResult.error.message || "Unable to cancel booking.");
      }
    } else if (action === "trash") {
      if (booking.deleted_at) {
        throw new Error("This booking is already in Trash.");
      }

      const trashResult = await supabase
        .from("bookings")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: adminRecord.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id");

      if (trashResult.error) {
        throw new Error(trashResult.error.message || "Unable to move booking to Trash.");
      }
    } else if (action === "restore") {
      if (!booking.deleted_at) {
        throw new Error("This booking is not in Trash.");
      }

      const restoreResult = await supabase.rpc("restore_booking_slot", { p_booking_id: id });

      if (restoreResult.error) {
        throw new Error(
          restoreResult.error.message ||
            "Unable to restore booking because the original slot is now full."
        );
      }
    } else if (action === "permanent-delete") {
      if (!booking.deleted_at) {
        throw new Error("Only trashed bookings can be permanently deleted.");
      }

      const deleteResult = await supabase.from("bookings").delete().eq("id", id);

      if (deleteResult.error) {
        throw new Error(deleteResult.error.message || "Unable to permanently delete booking.");
      }
    } else {
      throw new Error("Invalid action.");
    }

    if (isJsonRequest(request)) {
      return NextResponse.json({ success: true, message: "Booking updated." }, { status: 200 });
    }

    return getRedirectResponse(request, returnTo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update booking.";

    console.error("Admin booking action failed", {
      id,
      action,
      message,
    });

    if (isJsonRequest(request)) {
      const status = message.toLowerCase().includes("can") || message.toLowerCase().includes("not") ? 409 : 400;
      return NextResponse.json({ success: false, message }, { status });
    }

    return getRedirectResponse(request, returnTo, message);
  }
}
