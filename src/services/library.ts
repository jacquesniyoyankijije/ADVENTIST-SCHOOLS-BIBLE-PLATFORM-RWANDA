import egwManifest from "../data/egw-books.json"
import { supabase, supabaseConfigured } from "./supabase"

export type EgwBook = {
  title: string
  category: string
  /** Bundled PDF path, e.g. /books/Steps-to-Christ.pdf */
  file?: string
  /** External PDF address the book was added from */
  sourceUrl?: string
  pages: number
  sizeKb: number
  preview: string
  verified: boolean
  origin: "manifest" | "local"
}

type ManifestEntry = {
  file: string
  title: string
  category: string
  pages: number
  size_kb: number
  preview: string
  verified: boolean
}

const LOCAL_KEY = "asbp_egw_books"

/** Books shipped with the platform (verified at build time). */
export const manifestBooks: EgwBook[] = (
  egwManifest as ManifestEntry[]
).map((entry) => ({
  title: entry.title,
  category: entry.category,
  file: entry.file,
  pages: entry.pages,
  sizeKb: entry.size_kb,
  preview: entry.preview,
  verified: entry.verified,
  origin: "manifest",
}))

/** Books an administrator added from the Settings page. */
function readLocalBooks(): EgwBook[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? (JSON.parse(raw) as EgwBook[]) : []
  } catch {
    return []
  }
}

function writeLocalBooks(books: EgwBook[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(books))
}

/** Every book currently registered in the library. */
export function listEgwBooks(): EgwBook[] {
  return [...manifestBooks, ...readLocalBooks()]
}

export function removeEgwBook(title: string) {
  writeLocalBooks(readLocalBooks().filter((book) => book.title !== title))
}

export type VerificationResult = {
  verified: boolean
  pages: number
  sizeKb: number
  note?: string
}

/**
 * Automatic verification for a PDF address: the file must be reachable and
 * actually start with the PDF magic bytes (%PDF-). Also reports page count
 * and file size for the library record.
 */
export async function verifyPdf(
  address: string,
): Promise<VerificationResult> {
  const url = address.trim()
  if (!/^https?:\/\/|^\/(?!\/)/.test(url))
    return { verified: false, pages: 0, sizeKb: 0, note: "Enter a valid URL." }

  try {
    const response = await fetch(url, { method: "GET" })
    if (!response.ok)
      return {
        verified: false,
        pages: 0,
        sizeKb: 0,
        note: `The address returned ${response.status}.`,
      }
    const bytes = new Uint8Array(await response.arrayBuffer())
    const magic =
      bytes.length > 4 &&
      bytes[0] === 0x25 /* % */ &&
      bytes[1] === 0x50 /* P */ &&
      bytes[2] === 0x44 /* D */ &&
      bytes[3] === 0x46 /* F */
    if (!magic)
      return {
        verified: false,
        pages: 0,
        sizeKb: 0,
        note: "The file is not a readable PDF.",
      }
    // Count page objects in the raw file — good enough for a record badge.
    const text = new TextDecoder("latin1").decode(bytes)
    const pages = (text.match(/\/Type\s*\/Page[^s]/g) || []).length
    return {
      verified: true,
      pages,
      sizeKb: Math.round(bytes.length / 1024),
    }
  } catch {
    // Usually CORS: the file exists but the host does not allow reading it
    // from the browser, so it cannot be verified automatically yet.
    return {
      verified: false,
      pages: 0,
      sizeKb: 0,
      note: "Unreachable from the browser (network or CORS restriction).",
    }
  }
}

/**
 * Registers a book in the library: verifies the PDF automatically, stores
 * the record locally, and — when Supabase is connected — in the
 * public.egw_books table.
 */
export async function addEgwBook(
  title: string,
  address: string,
  category: string,
): Promise<{ ok: boolean; message: string }> {
  const name = title.trim()
  if (!name) return { ok: false, message: "Enter the book title." }

  const result = await verifyPdf(address)
  const url = address.trim()

  const book: EgwBook = {
    title: name,
    category: category.trim() || "Uncategorized",
    sourceUrl: url,
    pages: result.pages,
    sizeKb: result.sizeKb,
    preview: result.verified
      ? "Added and verified automatically. Open the preview to start reading."
      : `Added, but automatic verification failed: ${result.note ?? "unknown error"}`,
    verified: result.verified,
    origin: "local",
  }
  writeLocalBooks([...readLocalBooks(), book])

  if (supabaseConfigured && supabase) {
    const { error } = await supabase.from("egw_books").insert({
      title: name,
      category: book.category,
      source_url: url,
      cover_url: url,
    })
    if (error) console.warn("egw_books insert failed", error.message)
  }

  return {
    ok: true,
    message: result.verified
      ? `"${name}" verified and added to the library.`
      : `"${name}" added, pending verification: ${result.note}`,
  }
}
