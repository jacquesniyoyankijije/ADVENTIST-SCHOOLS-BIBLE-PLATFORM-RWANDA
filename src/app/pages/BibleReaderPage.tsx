import { useEffect, useMemo, useState } from "react"
import { Icon } from "../components/Icons"
import {
  KJV_INDEX,
  CHAPTER_COUNTS,
  BOOK_COUNT,
  loadBookChapters,
} from "../../data/kjv-index"

const FONT_STORAGE_KEY = "asbp_reader_font"
const PROGRESS_STORAGE_KEY = "asbp_reader_progress"

type LoadedBooks = Record<string, string[][]>

export function BibleReader() {
  // Book texts load on demand, one small chunk per book, so the reader
  // opens instantly even on slow connections.
  const [bookChapters, setBookChapters] = useState<LoadedBooks>({})
  const [loadingBook, setLoadingBook] = useState<string | null>(null)
  const [failedBook, setFailedBook] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState<number>(0)

  const [bookQuery, setBookQuery] = useState<string>("")
  const [verseQuery, setVerseQuery] = useState<string>("")

  const [activeBookName, setActiveBookName] = useState<string>("Genesis")
  const [activeChapter, setActiveChapter] = useState<number>(1)

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(FONT_STORAGE_KEY)
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed) && parsed >= 15 && parsed <= 24) return parsed
      }
    } catch {
      // localStorage read error fallback
    }
    return 18
  })

  const [progress, setProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // localStorage read error fallback
    }
    return {}
  })

  // Load the selected book's chapters when they are not in memory yet.
  useEffect(() => {
    let isMounted = true
    if (bookChapters[activeBookName]) {
      setLoadingBook(null)
      setFailedBook(null)
      return
    }
    setLoadingBook(activeBookName)
    setFailedBook(null)
    loadBookChapters(activeBookName)
      .then((chapters) => {
        if (!isMounted) return
        setBookChapters((prev) => ({ ...prev, [activeBookName]: chapters }))
        setLoadingBook(null)
      })
      .catch((err) => {
        console.error(`Failed to load ${activeBookName}:`, err)
        if (!isMounted) return
        setFailedBook(activeBookName)
        setLoadingBook(null)
      })
    return () => {
      isMounted = false
    }
  }, [activeBookName, retryToken, bookChapters])

  // Verse search works across loaded books; when the visitor searches,
  // load every remaining book in the background so results are complete.
  useEffect(() => {
    const q = verseQuery.trim().length
    if (q < 2) return
    const missing = KJV_INDEX.filter((book) => !bookChapters[book.name])
    if (missing.length === 0) return
    let isMounted = true
    missing.forEach((book) => {
      loadBookChapters(book.name)
        .then((chapters) => {
          if (!isMounted) return
          setBookChapters((prev) => ({ ...prev, [book.name]: chapters }))
        })
        .catch(() => {
          // One missing book should not break the whole search.
        })
    })
    return () => {
      isMounted = false
    }
  }, [verseQuery, bookChapters])

  useEffect(() => {
    try {
      localStorage.setItem(FONT_STORAGE_KEY, fontSize.toString())
    } catch {
      // ignore write errors
    }
  }, [fontSize])

  const handleSelectBook = (bookName: string) => {
    setActiveBookName(bookName)
    const remembered = progress[bookName] || 1
    setActiveChapter(remembered)
  }

  const handleSelectBookAndChapter = (bookName: string, chapter: number) => {
    setActiveBookName(bookName)
    setActiveChapter(chapter)
    setVerseQuery("")
  }

  const handleChapterChange = (newChapter: number) => {
    setActiveChapter(newChapter)
    const updatedProgress = { ...progress, [activeBookName]: newChapter }
    setProgress(updatedProgress)
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updatedProgress))
    } catch {
      // ignore write errors
    }
  }

  const activeBookIndex = useMemo(
    () => KJV_INDEX.findIndex((b) => b.name === activeBookName),
    [activeBookName],
  )

  const activeChapterCount = CHAPTER_COUNTS[activeBookName] || 1

  const filteredBooks = useMemo(() => {
    const q = bookQuery.trim().toLowerCase()
    if (!q) return KJV_INDEX
    return KJV_INDEX.filter((b) => b.name.toLowerCase().includes(q))
  }, [bookQuery])

  const loadedCount = Object.keys(bookChapters).length

  const verseSearchResults = useMemo(() => {
    const q = verseQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []
    const results: { book: string; chapter: number; verse: number; text: string }[] = []
    for (const book of KJV_INDEX) {
      const chapters = bookChapters[book.name]
      if (!chapters) continue
      for (let cIdx = 0; cIdx < chapters.length; cIdx++) {
        const chapterVerses = chapters[cIdx]
        for (let vIdx = 0; vIdx < chapterVerses.length; vIdx++) {
          const text = chapterVerses[vIdx]
          if (text.toLowerCase().includes(q)) {
            results.push({
              book: book.name,
              chapter: cIdx + 1,
              verse: vIdx + 1,
              text,
            })
            if (results.length >= 20) return results
          }
        }
      }
    }
    return results
  }, [verseQuery, bookChapters])

  const handlePrevChapter = () => {
    if (activeChapter > 1) {
      handleChapterChange(activeChapter - 1)
    } else if (activeBookIndex > 0) {
      const prevBook = KJV_INDEX[activeBookIndex - 1]
      setActiveBookName(prevBook.name)
      handleChapterChange(prevBook.chapters)
    }
  }

  const handleNextChapter = () => {
    if (activeChapter < activeChapterCount) {
      handleChapterChange(activeChapter + 1)
    } else if (activeBookIndex < KJV_INDEX.length - 1) {
      const nextBook = KJV_INDEX[activeBookIndex + 1]
      setActiveBookName(nextBook.name)
      handleChapterChange(1)
    }
  }

  const isPrevDisabled = activeBookIndex === 0 && activeChapter === 1
  const isNextDisabled =
    activeBookIndex === KJV_INDEX.length - 1 && activeChapter === activeChapterCount

  const currentVerses = bookChapters[activeBookName]?.[activeChapter - 1] || []

  return (
    <div className="page-stack">
      <header className="module-heading">
        <div>
          <span className="page-eyebrow">Scripture</span>
          <h1>Bible Reader</h1>
          <p>Read, search, and continue your study across every device.</p>
        </div>
      </header>

      <div className="reader-layout">
        <aside className="panel reader-books">
          <div className="inline-search">
            <Icon name="search" />
            <input
              placeholder="Find a book"
              value={bookQuery}
              onChange={(e) => setBookQuery(e.target.value)}
            />
          </div>

          <div className="inline-search" style={{ marginTop: "8px" }}>
            <Icon name="search" />
            <input
              placeholder="Search verses..."
              value={verseQuery}
              onChange={(e) => setVerseQuery(e.target.value)}
            />
          </div>

          {verseQuery.trim().length >= 2 ? (
            <div style={{ marginTop: "12px" }}>
              <h3 style={{ margin: "8px 0 6px", fontSize: "11px", color: "var(--muted)" }}>
                Verses ({verseSearchResults.length})
              </h3>
              {loadedCount < BOOK_COUNT && (
                <p style={{ padding: "4px 8px", fontSize: "10px", color: "var(--muted)" }}>
                  Preparing full-text search… {loadedCount}/{BOOK_COUNT} books loaded
                </p>
              )}
              {verseSearchResults.map((res) => (
                <button
                  key={`${res.book}-${res.chapter}-${res.verse}`}
                  type="button"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                    padding: "6px 8px",
                    width: "100%",
                    border: "0",
                    borderRadius: "8px",
                    background: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "var(--ink)",
                    marginBottom: "4px",
                  }}
                  onClick={() => handleSelectBookAndChapter(res.book, res.chapter)}
                >
                  <span style={{ fontWeight: 600, color: "var(--blue-700)" }}>
                    {res.book} {res.chapter}:{res.verse}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      display: "block",
                    }}
                  >
                    {res.text}
                  </span>
                </button>
              ))}
              {verseSearchResults.length === 0 && loadedCount === BOOK_COUNT && (
                <p style={{ padding: "8px", fontSize: "11px", color: "var(--muted)" }}>
                  No matching verses
                </p>
              )}
            </div>
          ) : (
            <>
              <h3>Books</h3>
              {filteredBooks.map((item) => (
                <button
                  className={item.name === activeBookName ? "active" : ""}
                  onClick={() => handleSelectBook(item.name)}
                  key={item.name}
                  type="button"
                >
                  <Icon name="bible" />
                  {item.name}
                  <span>›</span>
                </button>
              ))}
              {filteredBooks.length === 0 && (
                <p style={{ padding: "8px", fontSize: "11px", color: "var(--muted)" }}>
                  No books found
                </p>
              )}
            </>
          )}
        </aside>

        <article className="panel scripture-card">
          <div className="reader-toolbar">
            <div>
              <select
                value={activeBookName}
                onChange={(event) => handleSelectBook(event.target.value)}
              >
                {KJV_INDEX.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                value={activeChapter}
                onChange={(event) => handleChapterChange(Number(event.target.value))}
              >
                {Array.from({ length: activeChapterCount }, (_, index) => (
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
                aria-label="Decrease font size"
              >
                A−
              </button>
              <button
                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                type="button"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {failedBook === activeBookName ? (
            <div className="state-panel error" style={{ padding: "24px", textAlign: "center" }}>
              <span className="state-icon">
                <Icon name="alert" />
              </span>
              <h2 style={{ fontSize: "16px" }}>{activeBookName} could not load</h2>
              <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                Check your network connection and try again.
              </p>
              <button onClick={() => setRetryToken((token) => token + 1)} type="button">
                Try again
              </button>
            </div>
          ) : loadingBook === activeBookName && currentVerses.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center" }}>
              <span className="large-spinner" />
              <p style={{ marginTop: "12px", fontSize: "12px", color: "var(--muted)" }}>
                Loading {activeBookName}…
              </p>
            </div>
          ) : (
            <div className="scripture" style={{ fontSize }}>
              <span className="page-eyebrow">King James Version (public domain)</span>
              <h1>
                {activeBookName} {activeChapter}
              </h1>
              {currentVerses.map((verseText, index) => (
                <p key={index + 1}>
                  <sup>{index + 1}</sup>
                  {verseText}
                </p>
              ))}
            </div>
          )}

          <footer className="reader-footer">
            <button
              disabled={isPrevDisabled}
              onClick={handlePrevChapter}
              type="button"
            >
              ← Previous
            </button>
            <span>
              {activeBookName} {activeChapter}
            </span>
            <button
              disabled={isNextDisabled}
              onClick={handleNextChapter}
              type="button"
            >
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
