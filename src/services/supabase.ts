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

export type RegisterResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; error: string }

/**
 * Register a new account. When the project requires email confirmation
 * (the default), no session is created yet and needsConfirmation is true
 * so the interface can ask the user to check their email.
 */
export async function register(
  email: string,
  password: string,
  fullName: string,
): Promise<RegisterResult | null> {
  if (!supabase) return null // demo mode: caller handles the simulated flow
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true, needsConfirmation: !data.session }
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

/**
 * Whether a visitor has an active session. In live mode only a real
 * Supabase session counts - a leftover demo flag is ignored and cleared,
 * so demo authentication can never be confused with real authentication.
 */
export async function isSignedIn(): Promise<boolean> {
  if (supabase) {
    if (localStorage.getItem(DEMO_SESSION_KEY) === "active")
      localStorage.removeItem(DEMO_SESSION_KEY)
    const { data } = await supabase.auth.getSession()
    return Boolean(data.session)
  }
  return localStorage.getItem(DEMO_SESSION_KEY) === "active"
}

/** The signed-in Supabase user id, or null. */
export async function getSessionUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user?.id ?? null
}

/** Marks a simulated session in demo mode (no Supabase configured). */
export function markDemoSession(): void {
  localStorage.setItem(DEMO_SESSION_KEY, "active")
}

/* ------------------------------------------------------------------ */
/* Provider sign-in: Google OAuth and SAML SSO                         */
/* ------------------------------------------------------------------ */

/**
 * Remembers where a visitor wanted to go, so provider redirects can
 * continue to that page once the session is restored.
 */
const AUTH_NEXT_KEY = "asbp_auth_next"

export function rememberNext(path?: string): void {
  if (path) localStorage.setItem(AUTH_NEXT_KEY, path)
}

/** Returns (and clears) the page remembered before a provider sign-in. */
export function takeNext(): string | null {
  const next = localStorage.getItem(AUTH_NEXT_KEY)
  if (next) localStorage.removeItem(AUTH_NEXT_KEY)
  return next
}

/** Sign in with Google OAuth. Returns an error message or null. */
export async function signInWithGoogle(
  nextPath?: string,
): Promise<string | null> {
  if (!supabase) return null // demo mode: caller simulates the flow
  rememberNext(nextPath)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  })
  return error ? error.message : null
}

/**
 * Sign in with SAML single sign-on. Supabase resolves the identity
 * provider from the registered domain (email addresses work too — the
 * part after @ is used). Returns an error message or null.
 */
export async function signInWithSso(
  domainOrEmail: string,
  nextPath?: string,
): Promise<string | null> {
  if (!supabase) return null
  const domain = domainOrEmail.includes("@")
    ? domainOrEmail.split("@").pop()!.toLowerCase()
    : domainOrEmail.trim().toLowerCase()
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain))
    return "Enter your work email address (e.g. name@adventist.rw)."
  rememberNext(nextPath)
  const { error } = await supabase.auth.signInWithSSO({
    domain,
    options: { redirectTo: window.location.origin },
  })
  return error ? error.message : null
}

/* ------------------------------------------------------------------ */
/* Profile storage (public.profiles) for signed-in users                */
/* ------------------------------------------------------------------ */

export type SessionProfile = {
  fullName: string
  /** Raw role name exactly as stored in public.roles. */
  role: string
  avatarUrl: string | null
  initials: string
} | null

/**
 * Loads the signed-in user's profile and role from the database, queried
 * by the exact authenticated user id. Returns null when Supabase is not
 * configured, nobody is signed in, or the profile row is missing.
 */
export async function getSessionProfile(): Promise<SessionProfile> {
  if (!supabase) return null
  const userId = await getSessionUserId()
  if (!userId) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, roles(name)")
    .eq("id", userId)
    .maybeSingle()
  if (error) return null
  if (!data) return null
  const row = data as unknown as {
    full_name: string | null
    avatar_url: string | null
    roles: { name: string }[] | { name: string } | null
  }
  const roleRow = Array.isArray(row.roles)
    ? row.roles[0]
    : (row.roles as { name: string } | null)
  const fullName: string = row.full_name ?? "New user"
  const initials: string = fullName
    .split(/\s+/)
    .filter((part: string) => Boolean(part))
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("")
  return {
    fullName,
    role: roleRow?.name ?? "Ordinary User",
    avatarUrl: row.avatar_url ?? null,
    initials: initials || "U",
  }
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
