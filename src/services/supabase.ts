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

/** Sign out of the current session (clears the demo session too). */
export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
  localStorage.removeItem(DEMO_SESSION_KEY)
}

/* ------------------------------------------------------------------ */
/* Session state, shared by live and demo mode                        */
/* ------------------------------------------------------------------ */

const DEMO_SESSION_KEY = "asbp_demo_session"

/** Whether a visitor has an active session (live or demo). */
export async function isSignedIn(): Promise<boolean> {
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    return Boolean(data.session)
  }
  return localStorage.getItem(DEMO_SESSION_KEY) === "active"
}

/** Marks a simulated session in demo mode (no Supabase configured). */
export function markDemoSession(): void {
  localStorage.setItem(DEMO_SESSION_KEY, "active")
}

/** Friendly names for pages that can be requested before signing in. */
export const pageNames: Record<string, string> = {
  "/app": "your dashboard",
  "/app/bible": "the Bible Reader",
  "/app/library": "the Ellen G. White Library",
  "/app/lessons": "Bible Lessons",
  "/app/messages": "Messages",
  "/app/announcements": "Announcements",
  "/app/notifications": "Notifications",
  "/app/schools": "the Schools Directory",
  "/app/students": "Students",
  "/app/results": "Results & Grades",
  "/app/discipline": "Discipline",
  "/app/fees": "Fees & Bursar",
  "/app/users": "Users & Roles",
  "/app/audit": "Audit Logs",
  "/app/settings": "Settings",
  "/app/profile": "your profile",
}

/** Human label for a requested path, for sign-in prompts. */
export function pageLabel(path?: string): string {
  if (!path) return "the platform"
  return pageNames[path] ?? "the platform"
}
