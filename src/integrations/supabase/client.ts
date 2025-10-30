import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rsqwjoloqwtrujdhhjmi.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzcXdqb2xvcXd0cnVqZGhoam1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MjY2MzEsImV4cCI6MjA3NzQwMjYzMX0.E8sLdvpVYwCeEzpYBvmEYBbDBLtGeqd-nVjghYZMvAI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)