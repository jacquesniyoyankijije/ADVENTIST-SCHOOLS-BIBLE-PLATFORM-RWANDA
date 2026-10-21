/**
 * Role-based access control for the dashboard.
 *
 * Roles are NEVER trusted from the client in live mode: the signed-in
 * user's role is loaded from public.profiles / public.roles by the exact
 * authenticated user ID. This module only decides what a given role may
 * see, so the interface matches the permissions enforced by PostgreSQL
 * Row Level Security (see supabase/migrations).
 */
import { navigation, roles, type NavItem, type Role } from "./data"

export type AppRole = Role

export const APP_ROLES: readonly AppRole[] = roles

export const LEADERSHIP: readonly AppRole[] = [
  "Super Administrator",
  "Head of Union",
  "Head of Field",
]

/**
 * Database role names that map onto the canonical frontend roles. The
 * 0005 migration renames these in the database; the mapping stays so an
 * older database still renders correctly.
 */
const ROLE_ALIASES: Record<string, AppRole> = {
  "School Leader": "School Administrator",
  "Bursar Officer": "Bursar",
  "DOS Officer": "School Administrator",
  "Discipline Officer": "School Administrator",
  // Learner-level roles share the Student experience.
  "Ordinary User": "Student",
  "Parent/Guardian": "Student",
}

/**
 * Normalizes a role name coming from the database (or demo state) to a
 * known application role. Returns null for unknown roles so callers can
 * deny access instead of guessing.
 */
export function normalizeRole(raw: string | null | undefined): AppRole | null {
  if (!raw) return null
  const value = raw.trim()
  if ((APP_ROLES as readonly string[]).includes(value)) return value as AppRole
  const alias = ROLE_ALIASES[value]
  return alias ?? null
}

/** Roles that carry administrative duties beyond learner access. */
export function isStaffRole(role: AppRole): boolean {
  return role !== "Student"
}

/** True when the role may open the given dashboard path. */
export function canAccess(path: string, role: AppRole): boolean {
  const item = navigation
    .flatMap((group) => group.items)
    .find((entry) => entry.path === path)
  if (!item) return true // unknown paths are handled by their pages
  return !item.roles || item.roles.includes(role)
}

/** Navigation visible to a role, preserving the group structure. */
export function visibleNavigation(role: AppRole): {
  label: string
  items: NavItem[]
}[] {
  return navigation
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(role),
      ),
    }))
    .filter((group) => group.items.length > 0)
}
