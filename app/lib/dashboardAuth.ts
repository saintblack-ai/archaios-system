import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabaseServer";
import { getUserEntitlement, type Tier } from "./entitlements";

type UnauthorizedState = {
  error: "Unauthorized";
};

type DashboardUserState = {
  user: User;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  entitlement: {
    tier: Tier;
    dailyUsage: number;
    dailyLimit: number;
    canGenerate: boolean;
  };
  isAdmin: boolean;
};

type AdminForbiddenState = {
  error: "Forbidden";
};

export async function requireDashboardUser(): Promise<
  UnauthorizedState | { user: User; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> }
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Unauthorized" as const };
  }

  return { user, supabase };
}

export async function getDashboardUserState(): Promise<UnauthorizedState | DashboardUserState> {
  const auth = await requireDashboardUser();

  if ("error" in auth) {
    return auth;
  }

  const entitlement = await getUserEntitlement(auth.supabase, auth.user.id);
  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

  return {
    ...auth,
    entitlement,
    isAdmin: Boolean(
      adminEmail &&
      auth.user.email &&
      auth.user.email.toLowerCase() === adminEmail
    )
  };
}

export async function requireAdminUser(): Promise<UnauthorizedState | AdminForbiddenState | DashboardUserState> {
  const auth = await getDashboardUserState();

  if ("error" in auth) {
    return auth;
  }

  if (!auth.isAdmin) {
    return { error: "Forbidden" as const };
  }

  return auth;
}
