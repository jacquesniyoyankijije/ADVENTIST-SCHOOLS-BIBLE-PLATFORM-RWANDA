import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Supabase connection for authentication and (future) PostgreSQL data access.
 *
 * Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example or
 * your Render environment variables) to switch the platform from demo mode to
 * live mode. Only the public anon/publishable key belongs in frontend code —
 * never a service_role key.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(
  url && key && !url.includes("YOUR_PROJECT"),
)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, key!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Sign in with email + password. Returns an error message or null on success. */
export async function signIn(
  email: string,
  password: string,
): Promise<string | null> {
  if (!supabase) return null // demo mode: caller handles the simulated flow
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? error.message : null
}

/** Register a new account. Returns an error message or null on success. */
export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<string | null> {
  if (!supabase) return null
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  return error ? error.message : null
}

/** Sign out of the current session (no-op in demo mode). */
export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
}
