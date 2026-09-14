import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const supabase = await createAuthenticatedSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        {
          success: false,
          message: authError?.message || "Unable to sign in with the provided credentials.",
        },
        { status: 401 }
      );
    }

    const serviceSupabase = createServerSupabaseClient();
    const { data: adminRecord, error: adminLookupError } = await serviceSupabase
      .from("admins")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();

    if (adminLookupError || !adminRecord) {
      await supabase.auth.signOut();

      return NextResponse.json(
        {
          success: false,
          message: "This account is not authorized for the admin dashboard.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, user: { email: authData.user.email } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in.";

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
