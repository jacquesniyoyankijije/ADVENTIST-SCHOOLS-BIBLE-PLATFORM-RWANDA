/**
 * Shared validation helpers used by authentication and data forms.
 * Kept free of React and side effects so they can be unit tested.
 */

export type Validation = { ok: boolean; message: string }

/** Accepts a normal email address: local@domain.tld (basic RFC-style check). */
export function validateEmail(email: string): Validation {
  const value = email.trim()
  if (!value) return { ok: false, message: "Enter your email address." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
    return { ok: false, message: "Enter a valid email address." }
  return { ok: true, message: "" }
}

/** Passwords need at least 8 characters. */
export function validatePassword(password: string): Validation {
  if (password.length < 8)
    return { ok: false, message: "Password must contain at least 8 characters." }
  return { ok: true, message: "" }
}

/** Full names need at least two characters and no control characters. */
export function validateFullName(name: string): Validation {
  const value = name.trim()
  if (value.length < 3)
    return { ok: false, message: "Please enter your full name." }
  if (/[\u0000-\u001f]/.test(value))
    return { ok: false, message: "Name contains invalid characters." }
  return { ok: true, message: "" }
}

/** Signed 32-bit integer check used for marks, pages and amounts. */
export function validateInteger(
  value: string | number,
  min: number,
  max: number,
  label = "Value",
): Validation {
  const number = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(number))
    return { ok: false, message: `${label} must be a whole number.` }
  if (number < min || number > max)
    return { ok: false, message: `${label} must be between ${min} and ${max}.` }
  return { ok: true, message: "" }
}

/** Guard against cross-site script attempts in free-text fields. */
export function sanitizeText(value: string, maxLength = 2000): string {
  return value.replace(/<[^>]*>/g, "").trim().slice(0, maxLength)
}
