import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authenticatedSupabase = await createAuthenticatedSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await authenticatedSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const serverSupabase = createServerSupabaseClient();
    const { data: adminRecord, error: adminLookupError } = await serverSupabase
      .from("admins")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (adminLookupError || !adminRecord) {
      return NextResponse.json(
        { success: false, message: "Admin access is required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const formData = await request.formData();
    const action = formData.get("action")?.toString();
    const supabase = createServerSupabaseClient();

    if (action === "confirm") {
      const updateResult = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", id)
        .select("id");

      if (updateResult.error) {
        throw new Error(updateResult.error.message || "Unable to confirm booking.");
      }
    } else if (action === "cancel") {
      const updateResult = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", id)
        .select("id");

      if (updateResult.error) {
        throw new Error(updateResult.error.message || "Unable to cancel booking.");
      }
    } else {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }

    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update booking.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
