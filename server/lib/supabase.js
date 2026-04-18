import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export const supabaseAuth =
  config.supabaseUrl && config.supabaseAnonKey
    ? createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

export const supabaseAdmin =
  config.supabaseUrl && config.supabaseServiceRoleKey
    ? createClient(config.supabaseUrl, config.supabaseServiceRoleKey)
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabaseAuth && supabaseAdmin);
}
