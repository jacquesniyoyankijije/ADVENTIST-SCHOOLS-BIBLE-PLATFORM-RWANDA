import type { ReactNode } from "react"

export type IconName = "dashboard" | "bible" | "library" | "lesson" | "school" | "students" | "grades" | "discipline" | "fees" | "announcement" | "message" | "bell" | "users" | "settings" | "audit" | "search" | "menu" | "close" | "plus" | "filter" | "download" | "arrow" | "calendar" | "shield" | "eye" | "check" | "alert" | "logout" | "profile"

const paths: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  bible: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22zM20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z" />
      <path d="M8 6h1M16 6h1" />
    </>
  ),
  library: (
    <>
      <path d="m4 19 14-3 1 4-14 3zM3 14l14-3 1 4-14 3zM4 8h14v4H4zM6 3h12v4H6z" />
    </>
  ),
  lesson: (
    <>
      <path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" />
    </>
  ),
  school: (
    <>
      <path d="M3 21h18M5 21V10h14v11M8 21v-5h3v5M14 21v-5h2v5M3 10l9-7 9 7z" />
    </>
  ),
  students: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  grades: (
    <>
      <path d="M4 20V10h4v10zm6 0V4h4v16zm6 0v-8h4v8z" />
    </>
  ),
  discipline: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-5" />
    </>
  ),
  fees: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  announcement: (
    <>
      <path d="m3 11 14-5v12L3 13zM17 10a4 4 0 0 1 0 4M6 14l1 5h4l-2-6" />
    </>
  ),
  message: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 14V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4zM8 11h.01M12 11h.01M16 11h.01" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M16 4a4 4 0 0 1 0 7M22 21v-2a5 5 0 0 0-3-4.58" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 8.94 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.57 15 1.7 1.7 0 0 0 3 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.94a1.7 1.7 0 0 0-.34-1.88L4.2 7l2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.57 1.7 1.7 0 0 0 10 3V3h4v.08A1.7 1.7 0 0 0 15.06 4.6a1.7 1.7 0 0 0 1.88-.34L17 4.2 19.83 7l-.06.06A1.7 1.7 0 0 0 19.43 9 1.7 1.7 0 0 0 21 10h.08v4H21a1.7 1.7 0 0 0-1.6 1z" />
    </>
  ),
  audit: (
    <>
      <path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M4 5h16l-6 7v5l-4 2v-7z" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M5 21h14" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  alert: (
    <>
      <path d="M12 3 2 21h20zM12 9v4M12 17h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3M14 3h7v18h-7" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
}

export function Icon({
  name,
  className = "",
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  )
}

export function PlatformLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`platform-logo ${compact ? "compact" : ""}`}>
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <path
          className="logo-tile"
          d="M14 7h36a7 7 0 0 1 7 7v36a7 7 0 0 1-7 7H14a7 7 0 0 1-7-7V14a7 7 0 0 1 7-7Z"
        />
        <path
          className="logo-book"
          d="M15 40c7-2 12-1 17 3V24c-5-4-10-5-17-3v19Zm34 0c-7-2-12-1-17 3V24c5-4 10-5 17-3v19Z"
        />
        <path className="logo-cross" d="M32 11v15m-6-9h12" />
      </svg>
      {!compact && (
        <span>
          <strong>Adventist Schools</strong>
          <small>& Bible Platform · Rwanda</small>
        </span>
      )}
    </span>
  )
}
