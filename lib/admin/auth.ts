import { redirect } from "next/navigation";

import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";

export async function isAdminAuthenticated() {
  const admin = await getAuthenticatedAdmin();
  return admin !== null;
}

export async function requireAdminAccess() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

async function getAuthenticatedAdmin() {
  const supabase = await createAuthenticatedSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const serviceSupabase = createServerSupabaseClient();
  const { data: adminRecord, error: adminRecordError } = await serviceSupabase
    .from("admins")
    .select("id, auth_user_id, full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (adminRecordError || !adminRecord) {
    return null;
  }

  return {
    user,
    adminRecord,
  };
}
