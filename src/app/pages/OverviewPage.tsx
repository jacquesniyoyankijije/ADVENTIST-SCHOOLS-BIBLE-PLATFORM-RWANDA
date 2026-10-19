import { useOutletContext } from "react-router"
import { Icon, type IconName } from "../components/Icons"
import type { AppContext } from "../components/DashboardLayout"
import { announcements } from "../data"

const metrics: {
  label: string
  value: string
  trend: string
  icon: IconName
  tone: string
}[] = [
  {
    label: "Active students",
    value: "18,500",
    trend: "+6.8% this term",
    icon: "students",
    tone: "blue",
  },
  {
    label: "Connected schools",
    value: "35",
    trend: "Across 5 fields",
    icon: "school",
    tone: "green",
  },
  {
    label: "Teaching staff",
    value: "1,200",
    trend: "96% active",
    icon: "users",
    tone: "purple",
  },
  {
    label: "Fee collection",
    value: "84.2%",
    trend: "+4.1% vs last term",
    icon: "fees",
    tone: "gold",
  },
]

const performance = [68, 76, 72, 84, 79, 89, 86, 93]

export function OverviewPage() {
  const { role } = useOutletContext<AppContext>()
  const isStudent = role === "Student"
  const currentMetrics = isStudent
    ? [
        {
          label: "Average grade",
          value: "86.4%",
          trend: "Top 12% of class",
          icon: "grades" as IconName,
          tone: "blue",
        },
        {
          label: "Lessons complete",
          value: "18/24",
          trend: "3 due this week",
          icon: "lesson" as IconName,
          tone: "green",
        },
        {
          label: "Attendance",
          value: "96%",
          trend: "Excellent standing",
          icon: "calendar" as IconName,
          tone: "purple",
        },
        {
          label: "Fee balance",
          value: "RWF 0",
          trend: "Fully paid",
          icon: "fees" as IconName,
          tone: "gold",
        },
      ]
    : metrics

  return (
    <div className="page-stack">
      <section className="dashboard-welcome">
        <div>
          <span className="page-eyebrow">Monday, 20 October 2025</span>
          <h1>Muraho, Jacques</h1>
          <p>
            Here is what is happening across your {role.toLowerCase()} workspace
            today.
          </p>
        </div>
        <div className="daily-verse">
          <Icon name="bible" />
          <div>
            <span>Verse of the day</span>
            <blockquote>“Let all that you do be done in love.”</blockquote>
            <small>1 Corinthians 16:14</small>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        {currentMetrics.map((metric) => (
          <article className={`metric-card ${metric.tone}`} key={metric.label}>
            <div className="metric-icon">
              <Icon name={metric.icon} />
            </div>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.trend}</small>
          </article>
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="panel performance-panel">
          <div className="panel-heading">
            <div>
              <span className="page-eyebrow">Academic insight</span>
              <h2>Student performance</h2>
            </div>
            <select aria-label="Performance period">
              <option>Term II, 2025</option>
              <option>Term I, 2025</option>
            </select>
          </div>
          <div className="chart-summary">
            <div>
              <strong>84.6%</strong>
              <span>Network average</span>
            </div>
            <span className="positive">+3.2% from Term I</span>
          </div>
          <div className="bar-chart" aria-label="Performance by subject">
            {performance.map((value, index) => (
              <div className="chart-column" key={index}>
                <div className="bar-track">
                  <span style={{ height: `${value}%` }}>
                    <b>{value}</b>
                  </span>
                </div>
                <small>
                  {
                    [
                      "Rel.",
                      "Math",
                      "Eng.",
                      "Sci.",
                      "ICT",
                      "Hist.",
                      "Geo.",
                      "Bus.",
                    ][index]
                  }
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="page-eyebrow">Live updates</span>
              <h2>Recent activity</h2>
            </div>
            <button type="button">View all</button>
          </div>
          <div className="activity-list">
            <div>
              <span className="activity-icon green">
                <Icon name="check" />
              </span>
              <p>
                <strong>Results approved</strong>
                <span>Senior 6 · Kigali Adventist Secondary</span>
                <small>12 minutes ago</small>
              </p>
            </div>
            <div>
              <span className="activity-icon blue">
                <Icon name="users" />
              </span>
              <p>
                <strong>New student cohort added</strong>
                <span>48 students · Gitwe Adventist College</span>
                <small>45 minutes ago</small>
              </p>
            </div>
            <div>
              <span className="activity-icon gold">
                <Icon name="fees" />
              </span>
              <p>
                <strong>Bursar report submitted</strong>
                <span>West Rwanda Field · September</span>
                <small>2 hours ago</small>
              </p>
            </div>
            <div>
              <span className="activity-icon purple">
                <Icon name="announcement" />
              </span>
              <p>
                <strong>Announcement published</strong>
                <span>National Education Sabbath</span>
                <small>Yesterday</small>
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower">
        <section className="panel announcements-panel">
          <div className="panel-heading">
            <div>
              <span className="page-eyebrow">Community</span>
              <h2>Latest announcements</h2>
            </div>
            <button type="button">See all</button>
          </div>
          {announcements.slice(0, 2).map((item) => (
            <article className="announcement-row" key={item.title}>
              <i className={item.tone} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>
                  {item.audience} · {item.date}
                </small>
              </div>
              <Icon name="arrow" />
            </article>
          ))}
        </section>
        <section className="panel completion-panel">
          <div className="panel-heading">
            <div>
              <span className="page-eyebrow">Term readiness</span>
              <h2>Required actions</h2>
            </div>
            <span>68% complete</span>
          </div>
          <div className="progress-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48" />
              <circle className="filled" cx="60" cy="60" r="48" />
            </svg>
            <strong>
              68<small>%</small>
            </strong>
          </div>
          <ul>
            <li>
              <Icon name="check" /> 27 schools submitted results
            </li>
            <li>
              <Icon name="alert" /> 8 schools require follow-up
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
