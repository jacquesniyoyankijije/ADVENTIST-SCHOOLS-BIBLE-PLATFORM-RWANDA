import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { Icon, PlatformLogo } from "../components/Icons"
import {
  markDemoSession,
  pageLabel,
  register,
  signIn,
  supabaseConfigured,
} from "../../services/supabase"

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
          <div className="demo-note">
            <strong>{supabaseConfigured ? "Live mode" : "Demo access"}</strong>
            <span>
              {supabaseConfigured
                ? "Supabase is connected. Sign in with your real account."
                : "Use the pre-filled credentials to explore every role."}
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
