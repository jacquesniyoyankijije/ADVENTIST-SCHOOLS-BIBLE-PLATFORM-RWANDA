import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { Icon, PlatformLogo } from "../components/Icons"
import {
  markDemoSession,
  pageLabel,
  register,
  signIn,
  signInWithGoogle,
  signInWithSso,
  supabaseConfigured,
} from "../../services/supabase"

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.3 3.8l-.1.1 3.4 2.6.2.1c2.1-2 3.3-4.9 3.3-8.5z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.6-2.8c-1 .7-2.3 1.2-4 1.2-3.1 0-5.8-2-6.7-4.9l-.2.1-3.5 2.7-.1.2C3.4 21.3 7.4 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.3 14.7c-.3-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3l-.1-.2-3.6-2.7-.1.1C.5 8.6 0 10.2 0 12s.5 3.4 1.5 4.9l3.8-2.2z"
    />
    <path
      fill="#EA4335"
      d="M12 4.6c2.2 0 3.7.9 4.6 1.8l3.3-3.2C17.9 1.2 15.1 0 12 0 7.4 0 3.4 2.7 1.5 7l3.8 3c.9-2.9 3.6-5.4 6.7-5.4z"
    />
  </svg>
)

export function AuthPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin")
  const [email, setEmail] = useState("admin@adventist.rw")
  const [password, setPassword] = useState("demo1234")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const requested = (location.state as { requested?: string } | null)
    ?.requested
  const [ssoOpen, setSsoOpen] = useState(false)
  const [ssoEmail, setSsoEmail] = useState("")
  const [info, setInfo] = useState("")

  async function continueWithGoogle() {
    setError("")
    setInfo("")
    if (!supabaseConfigured) {
      // Demo mode: simulate the provider flow so the experience is testable.
      setInfo("Demo mode: Google sign-in is simulated until Supabase is connected.")
      markDemoSession()
      setLoading(true)
      window.setTimeout(() => navigate(requested ?? "/app"), 650)
      return
    }
    setLoading(true)
    const failure = await signInWithGoogle(requested ?? "/app")
    if (failure) {
      setLoading(false)
      setError(failure)
    }
  }

  async function continueWithSso(event: FormEvent) {
    event.preventDefault()
    setError("")
    setInfo("")
    if (!ssoEmail.trim()) return setError("Enter your work email address.")
    if (!supabaseConfigured) {
      // Demo mode: simulate the SSO flow so the experience is testable.
      setInfo("Demo mode: SSO is simulated until Supabase is connected.")
      markDemoSession()
      setLoading(true)
      window.setTimeout(() => navigate(requested ?? "/app"), 650)
      return
    }
    setLoading(true)
    const failure = await signInWithSso(ssoEmail, requested ?? "/app")
    if (failure) {
      setLoading(false)
      setError(failure)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (mode === "register" && name.trim().length < 3)
      return setError("Please enter your full name.")
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.")
    if (password.length < 8)
      return setError("Password must contain at least 8 characters.")
    setError("")
    setLoading(true)
    if (supabaseConfigured) {
      // Live mode: authenticate against Supabase Auth.
      const failure =
        mode === "signin"
          ? await signIn(email, password)
          : await register(email, password, name)
      if (failure) {
        setLoading(false)
        return setError(failure)
      }
    } else {
      // Demo mode (no Supabase configured): simulated session.
      markDemoSession()
    }
    // Continue to the page the visitor asked for, or the dashboard.
    window.setTimeout(() => navigate(requested ?? "/app"), 650)
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Link to="/">
          <PlatformLogo />
        </Link>
        <div className="auth-message">
          <span>Faith · Education · Service</span>
          <h1>
            Growing in faith.
            <br />
            Learning for life.
          </h1>
          <p>
            One secure platform for Adventist schools, Bible study,
            communication, and administration across Rwanda.
          </p>
          <blockquote>
            “The fear of the Lord is the beginning of wisdom.”{" "}
            <small>Proverbs 9:10</small>
          </blockquote>
        </div>
        <div className="auth-trust">
          <span>
            <Icon name="shield" /> Secure access
          </span>
          <span>35 schools connected</span>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <PlatformLogo />
          </div>
          <span className="auth-eyebrow">
            {mode === "signin" ? "Welcome back" : "Join the platform"}
          </span>
          <h2>
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </h2>
          <p>
            {mode === "signin"
              ? "Access your dashboard and learning resources."
              : "Your account will be reviewed by an administrator."}
          </p>
          {requested && (
            <p className="auth-notice">
              <Icon name="shield" />
              Please sign in to continue to {pageLabel(requested)}.
            </p>
          )}
          <div className="auth-tabs">
            <button
              className={mode === "signin" ? "active" : ""}
              onClick={() => {
                setMode("signin")
                setError("")
                setInfo("")
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register")
                setError("")
                setInfo("")
              }}
              type="button"
            >
              Register
            </button>
          </div>
          <form onSubmit={submit} noValidate>
            {mode === "register" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Aline Uwase"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@school.rw"
                type="email"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  type="password"
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                />
                <Icon name="eye" />
              </div>
            </label>
            {error && (
              <div className="form-alert error" role="alert">
                <Icon name="alert" />
                {error}
              </div>
            )}
            {info && (
              <div className="form-alert info" role="status">
                <Icon name="shield" />
                {info}
              </div>
            )}
            <button className="auth-submit" disabled={loading} type="submit">
              {loading ? (
                <>
                  <span className="spinner" /> Preparing dashboard…
                </>
              ) : (
                <>
                  {mode === "signin" ? "Sign in securely" : "Request account"}
                  <Icon name="arrow" />
                </>
              )}
            </button>
          </form>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          <div className="social-buttons">
            <button
              className="social-button"
              disabled={loading}
              onClick={continueWithGoogle}
              type="button"
            >
              <GoogleLogo />
              Google
            </button>
            <button
              className="social-button"
              disabled={loading}
              onClick={() => setSsoOpen((open) => !open)}
              type="button"
            >
              <Icon name="shield" />
              Single sign-on
            </button>
          </div>
          {ssoOpen && (
            <form className="sso-form" onSubmit={continueWithSso} noValidate>
              <label>
                Work email
                <input
                  value={ssoEmail}
                  onChange={(event) => setSsoEmail(event.target.value)}
                  placeholder="name@adventist.rw"
                  type="email"
                  autoComplete="email"
                />
              </label>
              <button
                className="auth-submit"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <span className="spinner" /> Contacting your provider…
                  </>
                ) : (
                  <>
                    Continue with SSO
                    <Icon name="arrow" />
                  </>
                )}
              </button>
            </form>
          )}
          <div className="demo-note">
            <strong>{supabaseConfigured ? "Live mode" : "Demo access"}</strong>
            <span>
              {supabaseConfigured
                ? "Supabase is connected. Sign in with email, Google or SSO."
                : "Demo mode: email, Google and SSO sign-ins are simulated until Supabase is connected."}
            </span>
          </div>
          <Link className="back-home" to="/">
            ← Return to public home
          </Link>
        </div>
      </div>
    </div>
  )
}
