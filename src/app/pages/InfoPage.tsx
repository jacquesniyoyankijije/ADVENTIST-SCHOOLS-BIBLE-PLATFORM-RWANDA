import { Link } from "react-router"
import { Icon, PlatformLogo } from "../components/Icons"

const faqs: { question: string; answer: string }[] = [
  {
    question: "How do I create an account?",
    answer:
      "Choose Sign in on the top of the home page, then switch to Register and fill in your name, email and password. New accounts start with ordinary access; your school or field administrator can grant additional roles.",
  },
  {
    question: "I forgot my password. What do I do?",
    answer:
      "On the sign in page, use the forgotten password link and we will email you a secure reset link. The link expires after one hour for your safety.",
  },
  {
    question: "How do roles work?",
    answer:
      "Every account has one role, such as Student, Teacher, Bursar or School Administrator. The navigation, dashboards and data you can see adapt automatically. In this demo you can preview every role from the sidebar switcher.",
  },
  {
    question: "Who can see student records?",
    answer:
      "Student, results, discipline and fee records are protected by row-level security in the database. Only authorized staff at your own school, and union leadership, can access them.",
  },
  {
    question: "Can I read the Bible offline?",
    answer:
      "The Bible Reader needs a connection the first time you open a chapter, after which it loads quickly. A full offline reading mode is on our roadmap.",
  },
  {
    question: "How do I report a problem or suggest a feature?",
    answer:
      "Contact your school administrator first, or write to the union help desk below. Include what you were doing, your role and the page you were on.",
  },
]

const contacts: {
  icon: "message" | "bell" | "calendar" | "school"
  title: string
  detail: string
}[] = [
  {
    icon: "message",
    title: "Email the help desk",
    detail: "support@adventist-platform.rw · replies within one working day",
  },
  {
    icon: "school",
    title: "Rwanda Union Mission",
    detail: "KG 7 Ave, Kigali · Mon–Fri, 8:00–17:00",
  },
  {
    icon: "bell",
    title: "Urgent school matters",
    detail: "Contact your head of school or field office directly",
  },
]

function InfoShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="info-page">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand-link" to="/" aria-label="Return to home">
            <PlatformLogo />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link to="/">
              <Icon name="dashboard" />
              <span>Home</span>
            </Link>
            <Link to="/help">
              <Icon name="search" />
              <span>Help center</span>
            </Link>
            <Link to="/privacy">
              <Icon name="shield" />
              <span>Privacy</span>
            </Link>
          </nav>
          <div className="header-actions">
            <Link className="liquid-button liquid-gold info-signin" to="/signin">
              <span>Sign in</span>
            </Link>
          </div>
        </div>
      </header>
      <section className="info-hero">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <main className="info-body">{children}</main>
      <footer className="site-footer info-footer">
        <div className="footer-brand">
          <PlatformLogo />
          <p>Equipping a generation to learn, grow, and serve.</p>
        </div>
        <div className="footer-meta">
          <Link to="/">Home</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/signin">Sign in</Link>
        </div>
        <p className="footer-verse">“For God and for His people.”</p>
      </footer>
    </div>
  )
}

export function HelpPage() {
  return (
    <InfoShell
      eyebrow="Support · Guidance · Community"
      title="Help center"
      intro="Answers, contacts and quick starts for the Adventist Schools & Bible Platform."
    >
      <section className="info-card">
        <h2>Getting started</h2>
        <ol className="info-steps">
          <li>
            <b>Create your account</b>
            <span>
              Register with your school email, then confirm the link we send
              you.
            </span>
          </li>
          <li>
            <b>Explore your dashboard</b>
            <span>
              Your role shapes what you see — lessons and the Bible for
              students, school management for staff.
            </span>
          </li>
          <li>
            <b>Stay connected</b>
            <span>
              Check announcements, messages and notifications to keep up with
              your school community.
            </span>
          </li>
        </ol>
      </section>
      <section className="info-card">
        <h2>Frequent questions</h2>
        <div className="info-faq">
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>
                <span>{item.question}</span>
                <Icon name="arrow" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="info-contacts">
        {contacts.map((contact) => (
          <article className="info-card contact" key={contact.title}>
            <span className="contact-icon">
              <Icon name={contact.icon} />
            </span>
            <strong>{contact.title}</strong>
            <p>{contact.detail}</p>
          </article>
        ))}
      </section>
      <section className="info-cta">
        <h2>Still stuck?</h2>
        <p>Sign in and reach out to your school community through Messages.</p>
        <Link className="liquid-button liquid-gold" to="/signin">
          <span>Sign in</span>
        </Link>
        <Link className="liquid-button liquid-light" to="/">
          <span>Back to home</span>
        </Link>
      </section>
    </InfoShell>
  )
}

const privacySections: { title: string; body: string }[] = [
  {
    title: "What we collect",
    body: "Your name, email address and role when you create an account. If your school joins the platform, records such as class placement, results, attendance, discipline and fees may be linked to your account by authorized school staff.",
  },
  {
    title: "How we use your information",
    body: "To operate your learning and school management tools: showing your dashboard, tracking lesson progress, sharing announcements, and giving staff the records they need to support you. We never sell your information.",
  },
  {
    title: "Who can see your records",
    body: "Access is enforced in the database itself, not just hidden in the interface. Students see their own records; teachers, bursars and administrators see their own school; union leadership sees network-wide summaries. Discipline and finance records are restricted to authorized roles.",
  },
  {
    title: "How we protect your data",
    body: "All traffic is encrypted. Passwords are hashed by our authentication provider and never stored in plain text. Row-level security policies protect every table, and privileged actions are recorded in an audit log visible to administrators.",
  },
  {
    title: "Bible and Spirit of Prophecy content",
    body: "Bible texts are provided from the public domain King James Version. Ellen G. White writings are linked to the official source and are not copied onto this platform, respecting the rights of the Ellen G. White Estate.",
  },
  {
    title: "Your choices",
    body: "You may review and correct your profile details at any time from the Profile page. To request deletion of your account, contact your school administrator or the union help desk.",
  },
]

export function PrivacyPage() {
  return (
    <InfoShell
      eyebrow="Trust · Security · Respect"
      title="Privacy at a glance"
      intro="How the platform handles your account, school records and content — in plain language."
    >
      <section className="info-card">
        <h2>Our principles</h2>
        <p className="info-lede">
          We collect only what the platform needs, we protect it at the
          database level, and we share it only with the people your school
          entrusts with your care.
        </p>
      </section>
      <section className="info-privacy">
        {privacySections.map((section, index) => (
          <article className="info-card" key={section.title}>
            <span className="info-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
      <section className="info-cta">
        <h2>Questions about your data?</h2>
        <p>
          Write to the union help desk at support@adventist-platform.rw or talk
          to your school administrator.
        </p>
        <Link className="liquid-button liquid-light" to="/">
          <span>Back to home</span>
        </Link>
      </section>
    </InfoShell>
  )
}
