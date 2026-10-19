import { useEffect, useState, type ReactNode } from "react"
import { Link, useNavigate } from "react-router"
import { isSignedIn } from "../../services/supabase"

type IconName = "home" | "book" | "library" | "chat" | "school" | "chart" | "users" | "arrow" | "menu" | "close" | "bell" | "shield" | "pin"

const iconPaths: Record<IconName, ReactNode> = {
  home: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  book: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z" />
    </>
  ),
  library: (
    <>
      <path d="m4 19 14-3 1 4-14 3zM3 14l14-3 1 4-14 3zM4 8h14v4H4zM6 3h12v4H6z" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 14V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </>
  ),
  school: (
    <>
      <path d="M3 21h18M5 21V10h14v11M8 21v-5h3v5M14 21v-5h2v5M3 10l9-7 9 7z" />
      <path d="M10 11h4" />
    </>
  ),
  chart: <path d="M4 20V10h4v10zm6 0V4h4v16zm6 0v-8h4v8z" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  shield: (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zm-3-10 2 2 4-5" />
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
}

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
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
      {iconPaths[name]}
    </svg>
  )
}

function ChurchMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-mark" aria-label="Seventh-day Adventist Church">
      <svg aria-hidden="true" viewBox="0 0 52 58">
        <path d="M27 2c8 9-2 13 2 21 1-9 9-11 8-19 7 12-6 18-4 29-6-7-13-15-6-31Z" />
        <path d="M24 13c-8 8-9 15-2 24-2-11 10-16 7-26M18 23c-8 7-6 15 1 20-3-10 5-13 5-21" />
        <path d="M6 46c13-5 25-5 40 0-13-1-25 2-40 0Zm19-10h3v17h-3z" />
      </svg>
      {!compact && (
        <span>
          <strong>Seventh-day</strong>
          <strong>Adventist Church</strong>
        </span>
      )}
    </div>
  )
}

function LiquidButton({
  children,
  variant = "gold",
  onClick,
}: {
  children: ReactNode
  variant?: "gold" | "light" | "green"
  onClick?: () => void
}) {
  return (
    <button
      className={`liquid-button liquid-${variant}`}
      onClick={onClick}
      type="button"
    >
      <span>{children}</span>
      <Icon name="arrow" className="button-arrow" />
    </button>
  )
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

const navItems: {
  label: string
  icon: IconName
  section: string
  path?: string
}[] = [
  { label: "Home", icon: "home", section: "home" },
  { label: "Bible", icon: "book", section: "modules", path: "/app/bible" },
  {
    label: "Ellen G. White",
    icon: "library",
    section: "modules",
    path: "/app/library",
  },
  {
    label: "Communication",
    icon: "chat",
    section: "community",
    path: "/app/messages",
  },
  {
    label: "Schools",
    icon: "school",
    section: "modules",
    path: "/app/schools",
  },
]

/** Landing nav items go to their page; the sign-in gate takes over from there. */
function openNavItem(
  item: { section: string; path?: string },
  navigate: (path: string) => void,
) {
  if (item.path) navigate(item.path)
  else document.getElementById(item.section)?.scrollIntoView({ behavior: "smooth" })
}

const modules: {
  title: string
  copy: string
  icon: IconName
  tone: string
  image: string
  alt: string
  path: string
}[] = [
  {
    title: "Bible",
    copy: "Read and study the Bible from Genesis to Revelation.",
    icon: "book",
    tone: "blue",
    image:
      "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=900&q=85",
    alt: "An open Bible",
    path: "/app/bible",
  },
  {
    title: "Ellen G. White Library",
    copy: "Explore timeless writings, devotionals, and life-changing messages.",
    icon: "library",
    tone: "green",
    image:
      "https://images.unsplash.com/photo-1592188657297-c6473609e988?auto=format&fit=crop&w=900&q=85",
    alt: "A reader surrounded by books",
    path: "/app/library",
  },
  {
    title: "Communication",
    copy: "Stay connected with leaders, teachers, and your school community.",
    icon: "chat",
    tone: "purple",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85",
    alt: "Friends in conversation outdoors",
    path: "/app/messages",
  },
  {
    title: "Schools",
    copy: "Manage students, learning, results, fees, and more.",
    icon: "school",
    tone: "teal",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=85",
    alt: "A bright school classroom",
    path: "/app/schools",
  },
  {
    title: "Results & Management",
    copy: "See performance insights and make informed decisions.",
    icon: "chart",
    tone: "gold",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=85",
    alt: "Performance charts on a computer screen",
    path: "/app/results",
  },
]

const stats: { value: string; label: string; icon: IconName }[] = [
  { value: "1,250", label: "Total users", icon: "users" },
  { value: "35", label: "Schools", icon: "school" },
  { value: "18,500", label: "Students", icon: "users" },
  { value: "1,200", label: "Teachers", icon: "users" },
  { value: "245", label: "New messages", icon: "chat" },
]

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    isSignedIn().then(setSignedIn)
  }, [])

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <button
            className="brand-link"
            onClick={() => scrollToSection("home")}
            aria-label="Go to home"
            type="button"
          >
            <ChurchMark />
            <span className="brand-divider" />
            <span className="platform-name">
              <strong>Adventist Schools &</strong>
              <strong>Bible Platform</strong>
              <small>Learn · Grow · Serve</small>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="Main navigation">
            {navItems.map((item, index) => (
              <button
                className={index === 0 ? "active" : ""}
                onClick={() => openNavItem(item, navigate)}
                key={item.label}
                type="button"
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="sign-in-button"
              onClick={() => navigate(signedIn ? "/app" : "/signin")}
              type="button"
            >
              {signedIn ? "Dashboard" : "Sign in"}
            </button>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="menu-button"
              onClick={() => setMenuOpen((current) => !current)}
              type="button"
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>

        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setMenuOpen(false)
                  openNavItem(item, navigate)
                }}
                type="button"
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false)
                navigate(signedIn ? "/app" : "/signin")
              }}
              type="button"
              className="mobile-highlight"
            >
              <Icon name="arrow" />
              {signedIn ? "Dashboard" : "Sign in"}
            </button>
            <button
              onClick={() => {
                setMenuOpen(false)
                navigate("/help")
              }}
              type="button"
            >
              <Icon name="shield" />
              Help center
            </button>
          </nav>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">Faith · Education · Mission</span>
              <p className="welcome-script">Murakaza neza</p>
              <h1>
                Learn with purpose.
                <span>Lead with faith.</span>
              </h1>
              <p className="hero-summary">
                One connected platform for Bible study, inspired learning,
                school communication, and better decisions.
              </p>
              <div className="hero-buttons">
                <LiquidButton onClick={() => navigate("/app")}>
                  Explore the platform
                </LiquidButton>
                <LiquidButton
                  variant="light"
                  onClick={() =>
                    document.querySelector("#community")?.scrollIntoView()
                  }
                >
                  Our mission
                </LiquidButton>
              </div>
              <div className="trust-row">
                <span>
                  <Icon name="shield" /> Secure by design
                </span>
                <span>One account</span>
                <span>Built for Rwanda</span>
              </div>
            </div>

            <div
              className="learning-orbit"
              aria-label="The four-part learning journey"
            >
              <div className="orbit-ring orbit-one" />
              <div className="orbit-ring orbit-two" />
              <div className="orbit-photo photo-family">
                <img
                  alt="A green Rwandan mountain landscape"
                  src="https://images.unsplash.com/photo-1682773083915-5375145f99e5?auto=format&fit=crop&w=700&q=85"
                />
                <span>Community</span>
              </div>
              <div className="orbit-photo photo-library">
                <img
                  alt="Woman reading in a library"
                  src="https://images.unsplash.com/photo-1532294220147-279399e4e00f?auto=format&fit=crop&w=700&q=85"
                />
                <span>Wisdom</span>
              </div>
              <div className="orbit-photo photo-prayer">
                <img
                  alt="A quiet mountain landscape at sunset"
                  src="https://images.unsplash.com/photo-1642082104081-a647a7429dfe?auto=format&fit=crop&w=700&q=85"
                />
                <span>Faith</span>
              </div>
              <div className="orbit-center">
                <img
                  alt="Open Bible"
                  src="https://images.unsplash.com/photo-1497621122273-f5cfb6065c56?auto=format&fit=crop&w=700&q=85"
                />
                <div>
                  <Icon name="book" />
                  <strong>Study · Share · Grow</strong>
                </div>
              </div>
              <span className="orbit-label label-top">
                MARAKI <small>Malachi</small>
              </span>
              <span className="orbit-label label-right">
                IBYAHISHUWE <small>Revelation</small>
              </span>
              <span className="orbit-label label-bottom">
                ITANGIRIRO <small>Genesis</small>
              </span>
              <span className="orbit-label label-left">
                MATAYO <small>Matthew</small>
              </span>
            </div>
          </div>
          <div className="hero-note">
            <span />
            <p>“Train up a child in the way they should go.”</p>
            <small>Proverbs 22:6</small>
          </div>
        </section>

        <section className="module-section" id="modules">
          <div className="section-heading">
            <div>
              <span className="eyebrow dark">Your learning ecosystem</span>
              <h2>Everything your community needs</h2>
            </div>
            <p>
              Move seamlessly from personal study to school-wide insight, all in
              one thoughtfully connected experience.
            </p>
          </div>
          <div className="module-grid">
            {modules.map((module) => (
              <article
                className={`module-card tone-${module.tone}`}
                key={module.title}
              >
                <div className="module-icon">
                  <Icon name={module.icon} />
                </div>
                <h3>{module.title}</h3>
                <p>{module.copy}</p>
                <div className="module-image">
                  <img alt={module.alt} src={module.image} />
                  <div className="image-scrim" />
                  <LiquidButton
                    variant={module.tone === "green" ? "green" : "light"}
                    onClick={() => navigate(module.path)}
                  >
                    Open
                  </LiquidButton>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stats-section" aria-label="Platform statistics">
          <div className="stats-inner">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <Icon name={stat.icon} />
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mission-section" id="community">
          <div className="mission-photo">
            <img
              alt="Lush green hills in Rwanda"
              src="https://images.unsplash.com/photo-1727797716658-469836019c90?auto=format&fit=crop&w=1400&q=85"
            />
          </div>
          <div className="mission-copy">
            <span className="eyebrow dark">Rooted in Christ</span>
            <h2>Stronger schools. Brighter futures.</h2>
            <p>
              We bring faith, learning, and community together so every student
              can grow in knowledge, character, and service.
            </p>
            <div className="principles">
              <span>
                <b>01</b> Education
              </span>
              <span>
                <b>02</b> Faith
              </span>
              <span>
                <b>03</b> Service
              </span>
            </div>
            <LiquidButton variant="green" onClick={() => navigate("/app")}>Discover our mission</LiquidButton>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <ChurchMark />
          <p>Equipping a generation to learn, grow, and serve.</p>
        </div>
        <div className="footer-meta">
          <span>
            <Icon name="pin" /> Rwanda
          </span>
          <Link to="/privacy">Privacy</Link>
          <Link to="/help">Help center</Link>
        </div>
        <p className="footer-verse">“For God and for His people.”</p>
      </footer>
    </div>
  )
}
