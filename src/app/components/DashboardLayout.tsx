import { useEffect, useMemo, useRef, useState } from "react"
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router"
import { Icon, PlatformLogo } from "./Icons"
import { navigation, notifications, schools, students } from "../data"
import {
  APP_ROLES,
  normalizeRole,
  visibleNavigation,
  type AppRole,
} from "../permissions"
import {
  getSessionProfile,
  isSignedIn,
  signOut,
  supabaseConfigured,
  type SessionProfile,
} from "../../services/supabase"

export type AppContext = {
  /** Effective application role used for navigation and access checks. */
  role: AppRole
  /** Raw role name from the database, shown to the user. */
  displayRole: string
  /** True when the backend is not configured and demo data is shown. */
  demoMode: boolean
  notify: (message: string, tone?: "success" | "error") => void
}

const DEMO_ROLE_KEY = "asbp_demo_role"

export function DashboardLayout() {
  // In live mode the role always comes from the database. A local
  // demonstration role is only used when Supabase is not configured.
  const [displayRole, setDisplayRole] = useState("Super Administrator")
  const [effectiveRole, setEffectiveRole] = useState<AppRole>("Super Administrator")
  const [authState, setAuthState] = useState<"checking" | "guest" | "member">(
    "checking",
  )
  const [profileMissing, setProfileMissing] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profile, setProfile] = useState<SessionProfile>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", focusSearch)
    return () => window.removeEventListener("keydown", focusSearch)
  }, [])
  const [toast, setToast] = useState<{
    message: string
    tone: "success" | "error"
  } | null>(null)

  // Auth gate: every protected dashboard route requires a valid session.
  // Unauthenticated visitors are redirected to sign-in, preserving the
  // page they requested. In live mode the session must be a real Supabase
  // session and the role is loaded from the database by user id.
  useEffect(() => {
    let active = true
    isSignedIn().then(async (authenticated) => {
      if (!active) return
      if (!authenticated) {
        setAuthState("guest")
        return
      }
      setAuthState("member")
      if (supabaseConfigured) {
        const loaded = await getSessionProfile()
        if (!active) return
        if (!loaded) {
          // Signed in, but the profile row is missing or not readable.
          setProfileMissing(true)
          return
        }
        setProfileMissing(false)
        setProfile(loaded)
        setDisplayRole(loaded.role)
        setEffectiveRole(normalizeRole(loaded.role) ?? "Student")
      } else {
        // Demo mode (backend not configured): clearly-labelled preview role.
        setProfileMissing(false)
        const remembered = localStorage.getItem(DEMO_ROLE_KEY)
        const parsed = normalizeRole(remembered)
        setEffectiveRole(parsed ?? "Super Administrator")
        setDisplayRole(parsed ?? "Super Administrator")
      }
    })
    return () => {
      active = false
    }
  }, [location.pathname])

  const visibleGroups = useMemo(
    () => visibleNavigation(effectiveRole),
    [effectiveRole],
  )

  const normalizedQuery = query.trim().toLowerCase()
  const moduleResults = normalizedQuery
    ? visibleGroups
        .flatMap((group) => group.items)
        .filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    : []
  const studentResults = normalizedQuery
    ? students
        .filter((student) =>
          student.name.toLowerCase().includes(normalizedQuery),
        )
        .map((student) => ({
          label: `${student.name} · ${student.className}`,
          path: "/app/students",
          icon: "students" as const,
        }))
    : []
  const schoolResults = normalizedQuery
    ? schools
        .filter((school) => school.name.toLowerCase().includes(normalizedQuery))
        .map((school) => ({
          label: school.name,
          path: "/app/schools",
          icon: "school" as const,
        }))
    : []
  const searchResults = [
    ...moduleResults,
    ...studentResults,
    ...schoolResults,
  ].slice(0, 8)

  const pageTitle =
    navigation
      .flatMap((group) => group.items)
      .find((item) => item.path === location.pathname)?.label ?? "Dashboard"

  function notify(message: string, tone: "success" | "error" = "success") {
    setToast({ message, tone })
    window.setTimeout(() => setToast(null), 3200)
  }

  if (authState === "guest")
    return (
      <Navigate
        replace
        state={{ requested: `${location.pathname}${location.search}` }}
        to="/signin"
      />
    )
  if (authState === "checking")
    return (
      <div className="auth-checking">
        <span className="large-spinner" />
        <p>Checking your session…</p>
      </div>
    )
  if (profileMissing)
    return (
      <div className="app-shell">
        <main className="app-content">
          <div className="panel state-panel error" style={{ margin: "10vh auto", maxWidth: 520 }}>
            <span className="state-icon">
              <Icon name="shield" />
            </span>
            <h2>Your account is not set up yet</h2>
            <p>
              You are signed in, but your platform profile has not been created
              or is not readable. Please contact a platform administrator.
            </p>
            <button
              className="primary-action"
              onClick={async () => {
                await signOut()
                navigate("/")
              }}
              type="button"
            >
              Sign out
            </button>
          </div>
        </main>
      </div>
    )
  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Link to="/" aria-label="Return to public home">
            <PlatformLogo />
          </Link>
          <button
            className="sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        {!supabaseConfigured ? (
          <div className="role-switcher demo-only">
            <span>
              Demo preview role
              <em>Not connected to a real account</em>
            </span>
            <select
              value={effectiveRole}
              onChange={(event) => {
                const next = event.target.value as AppRole
                localStorage.setItem(DEMO_ROLE_KEY, next)
                setEffectiveRole(next)
                setDisplayRole(next)
                notify(`Demo preview switched to ${next}`)
              }}
              aria-label="Demo preview role"
            >
              {APP_ROLES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="role-switcher live-role">
            <span>
              Signed in as
              <em>{displayRole}</em>
            </span>
          </div>
        )}
        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {visibleGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map((item) => (
                <NavLink
                  end={item.path === "/app"}
                  key={item.path}
                  onClick={() => setMobileOpen(false)}
                  to={item.path}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                  {item.label === "Messages" && <b>5</b>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <Link to="/help" className="sidebar-help">
          <Icon name="shield" />
          <div>
            <strong>Need assistance?</strong>
            <span>Visit the help center</span>
          </div>
          <Icon name="arrow" />
        </Link>
      </aside>

      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
          type="button"
        />
      )}

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="topbar-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            type="button"
          >
            <Icon name="menu" />
          </button>
          <div className="topbar-title">
            <span>Rwanda Union Mission</span>
            <strong>{pageTitle}</strong>
          </div>
          <div className="global-search">
            <Icon name="search" />
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search modules, students, schools…"
              aria-label="Search platform"
            />
            <kbd>⌘ K</kbd>
            {searchResults.length > 0 && (
              <div className="search-results">
                <small>Quick results</small>
                {searchResults.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setQuery("")
                    }}
                    type="button"
                  >
                    <Icon name={item.icon} />
                    {item.label}
                    <Icon name="arrow" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="round-action"
              onClick={() => setNoticeOpen(!noticeOpen)}
              aria-label="Notifications"
              aria-expanded={noticeOpen}
              type="button"
            >
              <Icon name="bell" />
              <b>2</b>
            </button>
            <button
              className="user-action"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              type="button"
            >
              <span className="app-avatar">{profile?.initials ?? "?"}</span>
              <span>
                <strong>{profile?.fullName ?? "Signed-in user"}</strong>
                <small>{displayRole}</small>
              </span>
              <span>⌄</span>
            </button>
          </div>
          {noticeOpen && (
            <div className="topbar-popover notification-popover">
              <div className="popover-heading">
                <strong>Notifications</strong>
                <button
                  onClick={() => notify("All notifications marked as read")}
                  type="button"
                >
                  Mark all read
                </button>
              </div>
              {notifications.slice(0, 3).map((item) => (
                <div className="mini-notice" key={item.title}>
                  <i className={item.unread ? "unread" : ""} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                    <small>{item.time}</small>
                  </div>
                </div>
              ))}
              <Link
                to="/app/notifications"
                onClick={() => setNoticeOpen(false)}
              >
                View all notifications <Icon name="arrow" />
              </Link>
            </div>
          )}
          {profileOpen && (
            <div className="topbar-popover profile-menu">
              <Link to="/app/profile">
                <Icon name="profile" /> My profile
              </Link>
              <Link to="/app/settings">
                <Icon name="settings" /> Settings
              </Link>
              <button
                onClick={async () => {
                  await signOut()
                  navigate("/")
                }}
                type="button"
              >
                <Icon name="logout" /> Sign out
              </button>
            </div>
          )}
        </header>
        <main className="app-content">
          <Outlet
          context={{
            role: effectiveRole,
            displayRole,
            demoMode: !supabaseConfigured,
            notify,
          } satisfies AppContext}
        />
        </main>
        <footer className="app-footer">
          <span>Adventist Schools & Bible Platform · Rwanda</span>
          <span>Demo environment · No live backend connected</span>
        </footer>
      </div>

      {toast && (
        <div className={`app-toast ${toast.tone}`} role="status">
          <Icon name={toast.tone === "success" ? "check" : "alert"} />
          {toast.message}
        </div>
      )}
    </div>
  )
}
