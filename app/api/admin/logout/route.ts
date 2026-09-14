import { NextResponse } from "next/server";

import { createAuthenticatedSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createAuthenticatedSupabaseClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
