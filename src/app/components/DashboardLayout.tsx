import { useEffect, useMemo, useRef, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { Icon, PlatformLogo } from "./Icons"
import {
  navigation,
  notifications,
  roles,
  schools,
  students,
  type Role,
} from "../data"
import { isSignedIn, signOut } from "../../services/supabase"

export type AppContext = {
  role: Role
  notify: (message: string, tone?: "success" | "error") => void
}

export function DashboardLayout() {
  const [role, setRole] = useState<Role>("Super Administrator")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

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
  const location = useLocation()
  const navigate = useNavigate()

  // Auth gate: unauthenticated visitors are asked to sign in and then
  // return to the page they tried to open.
  useEffect(() => {
    let active = true
    isSignedIn().then((signedIn) => {
      if (!active || signedIn) return
      navigate("/signin", {
        replace: true,
        state: { requested: location.pathname },
      })
    })
    return () => {
      active = false
    }
  }, [location.pathname, navigate])

  const visibleGroups = useMemo(
    () =>
      navigation
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.roles || item.roles.includes(role),
          ),
        }))
        .filter((group) => group.items.length),
    [role],
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
        <div className="role-switcher">
          <span>Viewing platform as</span>
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as Role)
              notify(`Dashboard updated for ${event.target.value}`)
            }}
            aria-label="Current role"
          >
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
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
              <span className="app-avatar">NJ</span>
              <span>
                <strong>Niyoyankijije Jacques</strong>
                <small>{role}</small>
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
          <Outlet context={{ role, notify } satisfies AppContext} />
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
