import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rsqwjoloqwtrujdhhjmi.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcXdqb2xvcXd0cnVqZGhoam1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjY2MzEsImV4cCI6MjA3NzQwMjYzMX0.E8sLdvpVYwCeEzpYBvmEYBbDBLtGeqd-nVjghYZMvAI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});