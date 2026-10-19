import { useMemo, useState, type FormEvent } from "react"
import { useOutletContext, useParams } from "react-router"
import type { AppContext } from "../components/DashboardLayout"
import { Icon, type IconName } from "../components/Icons"
import {
  announcements,
  navigation,
  notifications,
  schools,
  students,
} from "../data"

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  actionIcon = "plus",
  onAction,
}: {
  eyebrow: string
  title: string
  description: string
  action?: string
  actionIcon?: IconName
  onAction?: () => void
}) {
  return (
    <header className="module-heading">
      <div>
        <span className="page-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && (
        <button className="primary-action" onClick={onAction} type="button">
          <Icon name={actionIcon} />
          {action}
        </button>
      )}
    </header>
  )
}

function StatePanel({
  state,
  retry,
}: {
  state: "loading" | "empty" | "error"
  retry: () => void
}) {
  if (state === "loading")
    return (
      <div className="panel state-panel">
        <span className="large-spinner" />
        <h2>Loading your data…</h2>
        <p>Connecting to the demo workspace.</p>
      </div>
    )
  if (state === "empty")
    return (
      <div className="panel state-panel">
        <span className="state-icon">
          <Icon name="search" />
        </span>
        <h2>No records found</h2>
        <p>Try changing your search or filters.</p>
        <button onClick={retry} type="button">
          Clear filters
        </button>
      </div>
    )
  return (
    <div className="panel state-panel error">
      <span className="state-icon">
        <Icon name="alert" />
      </span>
      <h2>We could not load this view</h2>
      <p>This is a demo error state. Your information is safe.</p>
      <button onClick={retry} type="button">
        Try again
      </button>
    </div>
  )
}

function DemoStateSelect({
  value,
  setValue,
}: {
  value: string
  setValue: (value: "ready" | "loading" | "empty" | "error") => void
}) {
  return (
    <label className="demo-state">
      Preview state
      <select
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value as "ready" | "loading" | "empty" | "error",
          )
        }
      >
        <option value="ready">Ready</option>
        <option value="loading">Loading</option>
        <option value="empty">Empty</option>
        <option value="error">Error</option>
      </select>
    </label>
  )
}

function BibleReader() {
  const books = [
    "Genesis",
    "Exodus",
    "Psalms",
    "Proverbs",
    "Matthew",
    "John",
    "Romans",
    "Revelation",
  ]
  const [book, setBook] = useState("John")
  const [chapter, setChapter] = useState(3)
  const [fontSize, setFontSize] = useState(18)
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Scripture"
        title="Bible Reader"
        description="Read, search, highlight, and continue your study across every device."
        action="My highlights"
        actionIcon="library"
      />
      <div className="reader-layout">
        <aside className="panel reader-books">
          <div className="inline-search">
            <Icon name="search" />
            <input placeholder="Find a book" />
          </div>
          <h3>Books</h3>
          {books.map((item) => (
            <button
              className={item === book ? "active" : ""}
              onClick={() => {
                setBook(item)
                setChapter(1)
              }}
              key={item}
              type="button"
            >
              <Icon name="bible" />
              {item}
              <span>›</span>
            </button>
          ))}
        </aside>
        <article className="panel scripture-card">
          <div className="reader-toolbar">
            <div>
              <select
                value={book}
                onChange={(event) => setBook(event.target.value)}
              >
                {books.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                value={chapter}
                onChange={(event) => setChapter(Number(event.target.value))}
              >
                {Array.from({ length: 21 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Chapter {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="font-controls">
              <button
                onClick={() => setFontSize(Math.max(15, fontSize - 1))}
                type="button"
              >
                A−
              </button>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                type="button"
              >
                A+
              </button>
            </div>
          </div>
          <div className="scripture" style={{ fontSize }}>
            <span className="page-eyebrow">King James Version</span>
            <h1>
              {book} {chapter}
            </h1>
            <p>
              <sup>1</sup> There was a man of the Pharisees, named Nicodemus, a
              ruler of the Jews:
            </p>
            <p>
              <sup>2</sup> The same came to Jesus by night, and said unto him,
              Rabbi, we know that thou art a teacher come from God.
            </p>
            <p className="highlighted">
              <sup>16</sup> For God so loved the world, that he gave his only
              begotten Son, that whosoever believeth in him should not perish,
              but have everlasting life.
            </p>
            <p>
              <sup>17</sup> For God sent not his Son into the world to condemn
              the world; but that the world through him might be saved.
            </p>
          </div>
          <footer className="reader-footer">
            <button
              disabled={chapter === 1}
              onClick={() => setChapter(chapter - 1)}
              type="button"
            >
              ← Previous
            </button>
            <span>
              {book} {chapter}
            </span>
            <button onClick={() => setChapter(chapter + 1)} type="button">
              Next →
            </button>
          </footer>
        </article>
        <aside className="panel study-note">
          <span className="note-icon">
            <Icon name="lesson" />
          </span>
          <h3>Study note</h3>
          <p>
            God’s love is active and sacrificial. Reflect on how this truth
            shapes your service today.
          </p>
          <button type="button">Add personal note</button>
        </aside>
      </div>
    </div>
  )
}

const libraryBooks = [
  {
    title: "The Desire of Ages",
    category: "Life of Christ",
    progress: 68,
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Education",
    category: "Christian education",
    progress: 42,
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Steps to Christ",
    category: "Spiritual growth",
    progress: 91,
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "The Great Controversy",
    category: "Church history",
    progress: 17,
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=500&q=80",
  },
]

function LibraryPage() {
  const [query, setQuery] = useState("")
  const filtered = libraryBooks.filter((book) =>
    book.title.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Inspired writings"
        title="Ellen G. White Library"
        description="Discover trusted books, devotionals, and counsel for Christian education."
        action="Reading list"
        actionIcon="library"
      />
      <div className="catalog-toolbar panel">
        <div className="inline-search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the library"
          />
        </div>
        <div className="filter-pills">
          <button className="active" type="button">
            All books
          </button>
          <button type="button">Education</button>
          <button type="button">Devotionals</button>
          <button type="button">History</button>
        </div>
      </div>
      {filtered.length ? (
        <div className="book-grid">
          {filtered.map((book) => (
            <article className="book-card panel" key={book.title}>
              <img src={book.image} alt="" />
              <div>
                <span>{book.category}</span>
                <h2>{book.title}</h2>
                <p>
                  Timeless counsel and inspired insight for faith, learning, and
                  everyday life.
                </p>
                <div className="book-progress">
                  <span style={{ width: `${book.progress}%` }} />
                </div>
                <small>{book.progress}% complete</small>
                <button type="button">
                  Continue reading <Icon name="arrow" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <StatePanel state="empty" retry={() => setQuery("")} />
      )}
    </div>
  )
}

function LessonsPage() {
  const [tab, setTab] = useState("Current")
  const lessons = [
    "Faith in Action",
    "The Gift of Scripture",
    "Living with Purpose",
    "Called to Serve",
  ]
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Bible learning"
        title="Bible Lessons"
        description="Structured, age-appropriate learning paths for students and communities."
        action="Create lesson"
      />
      <div className="catalog-toolbar panel">
        <div className="filter-pills">
          {["Current", "Completed", "Saved"].map((item) => (
            <button
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
              key={item}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <span className="toolbar-caption">Term II · 2025</span>
      </div>
      <div className="lesson-grid">
        {lessons.map((title, index) => (
          <article className="lesson-card panel" key={title}>
            <div className="lesson-number">0{index + 5}</div>
            <span>Week {index + 5} · 20 min</span>
            <h2>{title}</h2>
            <p>
              Explore key biblical principles through reflection, discussion,
              and a practical challenge.
            </p>
            <div className="lesson-meta">
              <span>
                <Icon name="lesson" /> 4 sections
              </span>
              <span>
                <Icon name="students" /> 1,248 learners
              </span>
            </div>
            <div className="book-progress">
              <span style={{ width: `${[82, 55, 20, 0][index]}%` }} />
            </div>
            <button type="button">
              {index === 3 ? "Start lesson" : "Continue"} <Icon name="arrow" />
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

type TableConfig = {
  eyebrow: string
  title: string
  description: string
  action: string
  columns: string[]
  rows: (string | number)[][]
}
const configs: Record<string, TableConfig> = {
  schools: {
    eyebrow: "Rwanda network",
    title: "Schools Directory",
    description: "View and manage Adventist schools across every field.",
    action: "Add school",
    columns: ["School", "Field", "Students", "Head of school", "Status"],
    rows: schools.map((s) => [s.name, s.field, s.students, s.head, s.status]),
  },
  students: {
    eyebrow: "Learner management",
    title: "Students",
    description: "Manage enrollment, classes, and student records.",
    action: "Add student",
    columns: ["Student", "Student ID", "School", "Class", "Average", "Status"],
    rows: students.map((s) => [
      s.name,
      s.id,
      s.school,
      s.className,
      `${s.average}%`,
      s.status,
    ]),
  },
  results: {
    eyebrow: "Academic performance",
    title: "Results & Grades",
    description: "Review, validate, and publish academic results.",
    action: "Upload results",
    columns: [
      "Student",
      "Bible",
      "Mathematics",
      "English",
      "Science",
      "Average",
      "Status",
    ],
    rows: students.map((s, i) => [
      s.name,
      85 + i,
      78 + i * 2,
      82 + i,
      80 + i * 2,
      `${s.average}%`,
      i === 3 ? "Review" : "Approved",
    ]),
  },
  discipline: {
    eyebrow: "Student wellbeing",
    title: "Discipline",
    description: "Track incidents fairly and coordinate restorative follow-up.",
    action: "Record incident",
    columns: ["Student", "Category", "School", "Date", "Assigned to", "Status"],
    rows: [
      [
        "Eric Mugisha",
        "Attendance",
        "Mugonero Adventist School",
        "18 Oct 2025",
        "M. Uwimana",
        "Open",
      ],
      [
        "Aime Ndayisaba",
        "Conduct",
        "Gitwe Adventist College",
        "16 Oct 2025",
        "Pastor Mugabo",
        "Follow-up",
      ],
      [
        "Sarah Uwera",
        "Uniform",
        "Kigali Adventist Secondary",
        "14 Oct 2025",
        "D. Kayitesi",
        "Resolved",
      ],
    ],
  },
  fees: {
    eyebrow: "Bursar",
    title: "School Fees",
    description: "Monitor invoicing, payments, balances, and bursar reports.",
    action: "Record payment",
    columns: ["Student", "Invoice", "Total due", "Paid", "Balance", "Status"],
    rows: students.map((s, i) => [
      s.name,
      `INV-10${82 + i}`,
      "RWF 285,000",
      `RWF ${[285, 240, 285, 180, 260][i]},000`,
      i === 0 || i === 2 ? "RWF 0" : `RWF ${[0, 45, 0, 105, 25][i]},000`,
      i === 0 || i === 2 ? "Paid" : "Partial",
    ]),
  },
  users: {
    eyebrow: "Access control",
    title: "Users & Roles",
    description: "Manage platform access and role-based permissions.",
    action: "Invite user",
    columns: ["User", "Role", "Organization", "Last active", "MFA", "Status"],
    rows: [
      [
        "Alice Mukamana",
        "School Administrator",
        "Gitwe Adventist College",
        "2 min ago",
        "Enabled",
        "Active",
      ],
      [
        "Pastor Jean Mugabo",
        "Pastor",
        "Kigali Central Church",
        "18 min ago",
        "Enabled",
        "Active",
      ],
      [
        "Diane Uwamahoro",
        "Head of Field",
        "East Rwanda Field",
        "1 hour ago",
        "Enabled",
        "Active",
      ],
      [
        "Claudine Uwase",
        "Teacher",
        "Gisenyi Adventist School",
        "Yesterday",
        "Not set",
        "Active",
      ],
    ],
  },
  audit: {
    eyebrow: "System governance",
    title: "Audit Logs",
    description:
      "Review security-sensitive actions and administrative changes.",
    action: "Export logs",
    columns: [
      "Action",
      "User",
      "Resource",
      "IP address",
      "Timestamp",
      "Result",
    ],
    rows: [
      [
        "Published results",
        "Alice Mukamana",
        "Senior 6 · Term II",
        "197.243.18.42",
        "20 Oct, 10:42",
        "Success",
      ],
      [
        "Changed role",
        "Niyoyankijije Jacques",
        "User · CU-1042",
        "41.186.12.9",
        "20 Oct, 09:16",
        "Success",
      ],
      [
        "Login attempt",
        "Unknown",
        "Admin portal",
        "102.22.3.14",
        "20 Oct, 08:51",
        "Blocked",
      ],
      [
        "Exported report",
        "Diane Uwamahoro",
        "Field performance",
        "197.243.7.22",
        "19 Oct, 16:38",
        "Success",
      ],
    ],
  },
}

function DataModule({
  config,
  module,
}: {
  config: TableConfig
  module: string
}) {
  const { notify } = useOutletContext<AppContext>()
  const [query, setQuery] = useState("")
  const [state, setState] = useState<"ready" | "loading" | "empty" | "error">(
    "ready",
  )
  const [modal, setModal] = useState(false)
  const [formName, setFormName] = useState("")
  const filteredRows = config.rows.filter((row) =>
    row.some((cell) =>
      String(cell).toLowerCase().includes(query.toLowerCase()),
    ),
  )
  const visibleRows = state === "empty" ? [] : filteredRows
  function submit(event: FormEvent) {
    event.preventDefault()
    if (formName.trim().length < 3)
      return notify("Please enter a complete name or reference.", "error")
    setModal(false)
    setFormName("")
    notify(
      `${config.action.replace(/^(Add|Record|Invite|Upload) /, "")} saved successfully.`,
    )
  }
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        action={config.action}
        actionIcon={module === "audit" ? "download" : "plus"}
        onAction={() => setModal(true)}
      />
      <section className="table-toolbar panel">
        <div className="inline-search">
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}…`}
          />
        </div>
        <button className="secondary-action" type="button">
          <Icon name="filter" /> Filters
        </button>
        <button
          className="secondary-action"
          onClick={() => notify("Demo report prepared for download")}
          type="button"
        >
          <Icon name="download" /> Export
        </button>
        <DemoStateSelect value={state} setValue={setState} />
      </section>
      {state === "loading" || state === "error" ? (
        <StatePanel state={state} retry={() => setState("ready")} />
      ) : visibleRows.length === 0 ? (
        <StatePanel
          state="empty"
          retry={() => {
            setQuery("")
            setState("ready")
          }}
        />
      ) : (
        <section className="panel data-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {cellIndex === 0 ? (
                          <span className="name-cell">
                            <i>
                              {String(cell)
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </i>
                            <strong>{cell}</strong>
                          </span>
                        ) : cellIndex === row.length - 1 ? (
                          <span
                            className={`status-chip ${String(cell).toLowerCase().replace(" ", "-")}`}
                          >
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                    <td>
                      <button
                        className="row-action"
                        onClick={() => notify(`Opened ${row[0]}`)}
                        aria-label={`View ${row[0]}`}
                        type="button"
                      >
                        •••
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>
              Showing {visibleRows.length} of {config.rows.length} records
            </span>
            <div>
              <button disabled type="button">
                Previous
              </button>
              <button className="active" type="button">
                1
              </button>
              <button type="button">2</button>
              <button type="button">Next</button>
            </div>
          </footer>
        </section>
      )}
      {modal && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setModal(false)}
        >
          <div
            className="app-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="page-eyebrow">{config.eyebrow}</span>
                <h2 id="modal-title">{config.action}</h2>
              </div>
              <button
                onClick={() => setModal(false)}
                aria-label="Close dialog"
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={submit}>
              <label>
                Name or reference
                <input
                  autoFocus
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="Enter a full name"
                />
              </label>
              <label>
                Organization
                <select>
                  <option>Rwanda Union Mission</option>
                  <option>Central Rwanda Field</option>
                  <option>South Rwanda Field</option>
                </select>
              </label>
              <label>
                Notes
                <textarea placeholder="Add optional context" />
              </label>
              <div className="modal-actions">
                <button onClick={() => setModal(false)} type="button">
                  Cancel
                </button>
                <button className="primary-action" type="submit">
                  Save record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function AnnouncementsPage() {
  const { notify } = useOutletContext<AppContext>()
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Community updates"
        title="Announcements"
        description="Publish clear, timely updates to schools and communities."
        action="New announcement"
        onAction={() => notify("Announcement composer opened")}
      />
      <div className="announcement-feed">
        {announcements.map((item) => (
          <article className="panel feed-card" key={item.title}>
            <i className={item.tone} />
            <div>
              <span>
                {item.audience} · {item.date}
              </span>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <div>
                <button type="button">Read full announcement</button>
                <small>842 views</small>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function MessagesPage() {
  const [selected, setSelected] = useState(0)
  const [message, setMessage] = useState("")
  const { notify } = useOutletContext<AppContext>()
  const conversations = [
    "Pastor Jean Mugabo",
    "Alice Mukamana",
    "Education Department",
    "Claudine Uwase",
  ]
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Communication"
        title="Messages"
        description="Secure conversations across your Adventist education network."
        action="New message"
      />
      <section className="panel messaging-layout">
        <aside className="conversation-list">
          <div className="inline-search">
            <Icon name="search" />
            <input placeholder="Search conversations" />
          </div>
          {conversations.map((name, index) => (
            <button
              className={selected === index ? "active" : ""}
              onClick={() => setSelected(index)}
              key={name}
              type="button"
            >
              <span className="app-avatar">
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span>
                <strong>{name}</strong>
                <small>
                  {index === 0
                    ? "Education Sabbath planning…"
                    : "Thank you for the update."}
                </small>
              </span>
              <time>{index === 0 ? "09:42" : "Mon"}</time>
            </button>
          ))}
        </aside>
        <div className="chat-panel">
          <header>
            <span className="app-avatar">PJ</span>
            <div>
              <strong>{conversations[selected]}</strong>
              <small>Online · Rwanda Union Mission</small>
            </div>
          </header>
          <div className="chat-messages">
            <p className="received">
              Good morning. Can we confirm the final program for Education
              Sabbath?<small>09:38</small>
            </p>
            <p className="sent">
              Yes, the updated program was shared with all field leaders this
              morning.<small>09:40</small>
            </p>
            <p className="received">
              Wonderful. I will brief the pastors this afternoon.
              <small>09:42</small>
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!message.trim()) return
              setMessage("")
              notify("Message sent")
            }}
          >
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message…"
            />
            <button aria-label="Send message" type="submit">
              <Icon name="arrow" />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

function NotificationsPage() {
  const [items, setItems] = useState(notifications)
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Stay informed about results, messages, security, and school activity."
        action="Mark all as read"
        actionIcon="check"
        onAction={() =>
          setItems(items.map((item) => ({ ...item, unread: false })))
        }
      />
      <section className="panel full-notifications">
        {items.map((item, index) => (
          <button
            className={item.unread ? "unread" : ""}
            onClick={() =>
              setItems(
                items.map((notice, i) =>
                  i === index ? { ...notice, unread: false } : notice,
                ),
              )
            }
            key={item.title}
            type="button"
          >
            <span className="notification-symbol">
              <Icon
                name={index === 1 ? "message" : index === 2 ? "fees" : "bell"}
              />
            </span>
            <span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <small>{item.time}</small>
            </span>
            {item.unread && <i />}
          </button>
        ))}
      </section>
    </div>
  )
}

function SettingsPage({ profile = false }: { profile?: boolean }) {
  const { notify, role } = useOutletContext<AppContext>()
  const [emailNotices, setEmailNotices] = useState(true)
  const [weekly, setWeekly] = useState(true)
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={profile ? "Personal account" : "Platform preferences"}
        title={profile ? "My Profile" : "Settings"}
        description={
          profile
            ? "Keep your identity and contact information up to date."
            : "Configure your workspace, notifications, and security preferences."
        }
      />
      <div className="settings-grid">
        <aside className="panel settings-nav">
          <button className="active" type="button">
            <Icon name={profile ? "profile" : "settings"} />
            {profile ? "Profile details" : "General"}
          </button>
          <button type="button">
            <Icon name="bell" />
            Notifications
          </button>
          <button type="button">
            <Icon name="shield" />
            Security
          </button>
        </aside>
        <form
          className="panel settings-form"
          onSubmit={(event) => {
            event.preventDefault()
            notify("Settings saved successfully")
          }}
        >
          <div className="form-section">
            <h2>{profile ? "Profile details" : "Organization details"}</h2>
            <p>These details are visible across your permitted workspace.</p>
            <div className="form-grid">
              <label>
                {profile ? "Full name" : "Organization name"}
                <input
                  defaultValue={
                    profile ? "Niyoyankijije Jacques" : "Rwanda Union Mission"
                  }
                />
              </label>
              <label>
                {profile ? "Role" : "Country"}
                <input
                  defaultValue={profile ? role : "Rwanda"}
                  readOnly={profile}
                />
              </label>
              <label>
                Email address
                <input defaultValue="admin@adventist.rw" type="email" />
              </label>
              <label>
                Phone number
                <input defaultValue="+250 788 123 456" />
              </label>
            </div>
          </div>
          <div className="form-section">
            <h2>Notifications</h2>
            <label className="switch-row">
              <span>
                <strong>Email notifications</strong>
                <small>Receive important activity by email</small>
              </span>
              <input
                checked={emailNotices}
                onChange={() => setEmailNotices(!emailNotices)}
                type="checkbox"
              />
            </label>
            <label className="switch-row">
              <span>
                <strong>Weekly digest</strong>
                <small>A summary every Monday morning</small>
              </span>
              <input
                checked={weekly}
                onChange={() => setWeekly(!weekly)}
                type="checkbox"
              />
            </label>
          </div>
          <button className="primary-action" type="submit">
            Save changes
          </button>
        </form>
      </div>
    </div>
  )
}

export function ModulePage() {
  const { module = "" } = useParams()
  const { role } = useOutletContext<AppContext>()
  const config = useMemo(() => configs[module], [module])
  const activeNavigationItem = navigation
    .flatMap((group) => group.items)
    .find((item) => item.path === `/app/${module}`)
  if (
    activeNavigationItem?.roles &&
    !activeNavigationItem.roles.includes(role)
  ) {
    return (
      <div className="panel state-panel error">
        <span className="state-icon">
          <Icon name="shield" />
        </span>
        <h2>Access restricted</h2>
        <p>Your current role does not have permission to view this module.</p>
      </div>
    )
  }
  if (module === "bible") return <BibleReader />
  if (module === "library") return <LibraryPage />
  if (module === "lessons") return <LessonsPage />
  if (config) return <DataModule config={config} module={module} />
  if (module === "announcements") return <AnnouncementsPage />
  if (module === "messages") return <MessagesPage />
  if (module === "notifications") return <NotificationsPage />
  if (module === "settings") return <SettingsPage />
  if (module === "profile") return <SettingsPage profile />
  return <StatePanel state="error" retry={() => window.history.back()} />
}
