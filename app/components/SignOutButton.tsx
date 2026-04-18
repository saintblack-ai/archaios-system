"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabaseBrowser";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      className="sb-button-secondary"
      type="button"
      onClick={async () => {
        const supabase = getSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
