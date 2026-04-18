import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const missingSupabaseAdminEnvMessage =
  "Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY";

export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : new Proxy(
      {},
      {
        get() {
          throw new Error(missingSupabaseAdminEnvMessage);
        }
      }
    ) as ReturnType<typeof createClient>;
