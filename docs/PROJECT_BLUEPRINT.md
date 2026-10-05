# Adventist Schools & Bible Platform — Rwanda

## Vision
A secure, scalable SDA platform combining school administration, academic/discipline/finance management, leadership communication, Bible study, authorized Ellen G. White resources, and personal Bible lessons.

## Core principle
**Super Administrator (Niyoyankijije Jacques)** has full system authority. Other users receive role-based permissions. Full access is enforced server-side with Supabase PostgreSQL Row Level Security; the browser never receives a service-role secret.

## Technology
- Vite + JavaScript (ES modules)
- HTML5 + CSS3 + Canvas API
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage where required
- Responsive, accessible UI

## Modules
1. Home / landing experience
2. Authentication and profiles
3. Super Admin
4. Union / Field / Pastor communication
5. School management
6. Students / teachers / parents
7. DOS academic results
8. Discipline office
9. Bursar / fees / expenses
10. Messaging and notifications
11. Bible: Genesis → Revelation
12. Bible chapters / verses / search
13. Personal key lessons
14. Authorized Ellen G. White library
15. Reports / dashboards
16. Audit logs / security

## UI direction
Preserve the approved home-page concept. Use premium glassmorphism, liquid buttons, subtle 3D depth, Canvas motion, responsive layouts, keyboard accessibility, reduced-motion support, and fast loading. Do not redesign the approved home page without explicit approval.

## Build order
Foundation → Auth → Roles/RLS → School data → Academic → Discipline → Bursar → Communication → Bible → EGW → Reports → Testing → Deployment.

## Data separation
School records remain scoped by school/organization. Cross-school comparisons are available only to authorized roles. Sensitive student and financial data must be protected by RLS.

## Content rights
Bible and Ellen G. White content must be sourced from material that the project is legally authorized to store/display. Do not bulk-copy copyrighted books without permission/licensing.
