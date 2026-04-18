import { redirect } from "next/navigation";
import { getDashboardUserState } from "../lib/dashboardAuth";
import { DashboardClient } from "../components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getDashboardUserState();

  if ("error" in auth) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  return (
    <DashboardClient
      user={{ email: auth.user.email ?? null }}
      entitlement={auth.entitlement}
      isAdmin={auth.isAdmin}
    />
  );
}
