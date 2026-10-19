import type { IconName } from "./components/Icons"

export const roles = [
  "Super Administrator",
  "Head of Union",
  "Head of Field",
  "Pastor",
  "Church Leader",
  "School Administrator",
  "Teacher",
  "Bursar",
  "Student",
] as const
export type Role = typeof roles[number]

export type NavItem = {
  label: string
  path: string
  icon: IconName
  roles?: Role[]
}
const leadership: Role[] = [
  "Super Administrator",
  "Head of Union",
  "Head of Field",
]
const schoolTeam: Role[] = [
  ...leadership,
  "Pastor",
  "Church Leader",
  "School Administrator",
  "Teacher",
  "Bursar",
]

export const navigation: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: "/app", icon: "dashboard" }],
  },
  {
    label: "Faith & learning",
    items: [
      { label: "Bible Reader", path: "/app/bible", icon: "bible" },
      { label: "Ellen G. White", path: "/app/library", icon: "library" },
      { label: "Bible Lessons", path: "/app/lessons", icon: "lesson" },
    ],
  },
  {
    label: "School management",
    items: [
      { label: "Schools Directory", path: "/app/schools", icon: "school" },
      {
        label: "Students",
        path: "/app/students",
        icon: "students",
        roles: schoolTeam,
      },
      { label: "Results & Grades", path: "/app/results", icon: "grades" },
      {
        label: "Discipline",
        path: "/app/discipline",
        icon: "discipline",
        roles: schoolTeam,
      },
      {
        label: "Fees & Bursar",
        path: "/app/fees",
        icon: "fees",
        roles: [...leadership, "School Administrator", "Bursar", "Student"],
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        label: "Announcements",
        path: "/app/announcements",
        icon: "announcement",
      },
      { label: "Messages", path: "/app/messages", icon: "message" },
      { label: "Notifications", path: "/app/notifications", icon: "bell" },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Users & Roles",
        path: "/app/users",
        icon: "users",
        roles: leadership,
      },
      {
        label: "Audit Logs",
        path: "/app/audit",
        icon: "audit",
        roles: ["Super Administrator"],
      },
      { label: "Settings", path: "/app/settings", icon: "settings" },
    ],
  },
]

export const schools = [
  {
    name: "Gitwe Adventist College",
    field: "South Rwanda Field",
    students: 842,
    head: "Alice Mukamana",
    status: "Active",
  },
  {
    name: "Kigali Adventist Secondary",
    field: "Central Rwanda Field",
    students: 1204,
    head: "Emmanuel Habimana",
    status: "Active",
  },
  {
    name: "Gisenyi Adventist School",
    field: "North-West Rwanda Field",
    students: 618,
    head: "Claudine Uwase",
    status: "Active",
  },
  {
    name: "Mugonero Adventist School",
    field: "West Rwanda Field",
    students: 496,
    head: "Jean Bosco Nkurunziza",
    status: "Review",
  },
  {
    name: "Rwamagana Adventist School",
    field: "East Rwanda Field",
    students: 735,
    head: "Diane Uwamahoro",
    status: "Active",
  },
]

export const students = [
  {
    id: "ASB-2025-0148",
    name: "Aline Uwase",
    school: "Kigali Adventist Secondary",
    className: "Senior 5",
    average: 88,
    status: "Active",
  },
  {
    id: "ASB-2025-0152",
    name: "Patrick Niyonzima",
    school: "Gitwe Adventist College",
    className: "Senior 4",
    average: 81,
    status: "Active",
  },
  {
    id: "ASB-2025-0166",
    name: "Grace Mukamana",
    school: "Gisenyi Adventist School",
    className: "Senior 6",
    average: 93,
    status: "Active",
  },
  {
    id: "ASB-2025-0171",
    name: "Eric Mugisha",
    school: "Mugonero Adventist School",
    className: "Senior 3",
    average: 67,
    status: "Support",
  },
  {
    id: "ASB-2025-0189",
    name: "Divine Ingabire",
    school: "Rwamagana Adventist School",
    className: "Senior 5",
    average: 86,
    status: "Active",
  },
]

export const announcements = [
  {
    title: "National Education Sabbath",
    body: "All schools will join the union-wide Education Sabbath program on 18 October.",
    date: "Today, 09:30",
    audience: "All schools",
    tone: "gold",
  },
  {
    title: "Term II results submission",
    body: "School administrators should complete grade validation before Friday at 17:00.",
    date: "Yesterday",
    audience: "Administrators",
    tone: "blue",
  },
  {
    title: "New Bible lesson available",
    body: "Lesson 8, Faith in Action, is now ready for teachers and students.",
    date: "12 Oct",
    audience: "Teachers & students",
    tone: "green",
  },
]

export const notifications = [
  {
    title: "Results approved",
    detail: "Senior 6 results from Kigali Adventist Secondary were approved.",
    time: "8 min ago",
    unread: true,
  },
  {
    title: "New message",
    detail: "Pastor Mugabo sent you a message about Education Sabbath.",
    time: "24 min ago",
    unread: true,
  },
  {
    title: "Fee report ready",
    detail: "September bursar report is available to download.",
    time: "2 hours ago",
    unread: false,
  },
  {
    title: "Security notice",
    detail: "A new administrator was added to West Rwanda Field.",
    time: "Yesterday",
    unread: false,
  },
]
