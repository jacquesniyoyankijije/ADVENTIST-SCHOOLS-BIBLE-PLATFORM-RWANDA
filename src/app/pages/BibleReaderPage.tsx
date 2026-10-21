import { useEffect, useMemo, useState } from "react"
import { Icon } from "../components/Icons"
import type { BibleBook } from "../../data/kjv"

const FONT_STORAGE_KEY = "asbp_reader_font"
const PROGRESS_STORAGE_KEY = "asbp_reader_progress"

export function BibleReader() {
  const [kjvData, setKjvData] = useState<BibleBook[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

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

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(false)

    import("../../data/kjv")
      .then((mod) => {
        if (isMounted) {
          setKjvData(mod.KJV)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error("Failed to load KJV data:", err)
        if (isMounted) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

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

  const activeBookIndex = useMemo(() => {
    if (!kjvData) return -1
    return kjvData.findIndex((b) => b.name === activeBookName)
  }, [kjvData, activeBookName])

  const activeBook = useMemo(() => {
    if (!kjvData || activeBookIndex === -1) return null
    return kjvData[activeBookIndex]
  }, [kjvData, activeBookIndex])

  const filteredBooks = useMemo(() => {
    if (!kjvData) return []
    const q = bookQuery.trim().toLowerCase()
    if (!q) return kjvData
    return kjvData.filter((b) => b.name.toLowerCase().includes(q))
  }, [kjvData, bookQuery])

  const verseSearchResults = useMemo(() => {
    const q = verseQuery.trim().toLowerCase()
    if (!q || q.length < 2 || !kjvData) return []
    const results: { book: string; chapter: number; verse: number; text: string }[] = []
    for (const book of kjvData) {
      for (let cIdx = 0; cIdx < book.chapters.length; cIdx++) {
        const chapterVerses = book.chapters[cIdx]
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
  }, [verseQuery, kjvData])

  const handlePrevChapter = () => {
    if (!kjvData || activeBookIndex === -1) return
    if (activeChapter > 1) {
      handleChapterChange(activeChapter - 1)
    } else if (activeBookIndex > 0) {
      const prevBook = kjvData[activeBookIndex - 1]
      const prevBookLastChapter = prevBook.chapters.length
      setActiveBookName(prevBook.name)
      handleChapterChange(prevBookLastChapter)
    }
  }

  const handleNextChapter = () => {
    if (!kjvData || !activeBook || activeBookIndex === -1) return
    if (activeChapter < activeBook.chapters.length) {
      handleChapterChange(activeChapter + 1)
    } else if (activeBookIndex < kjvData.length - 1) {
      const nextBook = kjvData[activeBookIndex + 1]
      setActiveBookName(nextBook.name)
      handleChapterChange(1)
    }
  }

  const isPrevDisabled = activeBookIndex === 0 && activeChapter === 1
  const isNextDisabled =
    !!kjvData &&
    !!activeBook &&
    activeBookIndex === kjvData.length - 1 &&
    activeChapter === activeBook.chapters.length

  if (loading) {
    return (
      <div className="page-stack">
        <header className="module-heading">
          <div>
            <span className="page-eyebrow">Scripture</span>
            <h1>Bible Reader</h1>
            <p>Read, search, and continue your study across every device.</p>
          </div>
        </header>
        <div className="panel state-panel">
          <span className="large-spinner" />
          <h2>Loading Bible content…</h2>
          <p>Preparing the King James Version text.</p>
        </div>
      </div>
    )
  }

  if (error || !kjvData || !activeBook) {
    return (
      <div className="page-stack">
        <header className="module-heading">
          <div>
            <span className="page-eyebrow">Scripture</span>
            <h1>Bible Reader</h1>
            <p>Read, search, and continue your study across every device.</p>
          </div>
        </header>
        <div className="panel state-panel error">
          <span className="state-icon">
            <Icon name="alert" />
          </span>
          <h2>Bible content unavailable</h2>
          <p>The Bible content could not be loaded. Please check your network connection and try again.</p>
          <button
            onClick={() => {
              setLoading(true)
              setError(false)
              import("../../data/kjv")
                .then((mod) => {
                  setKjvData(mod.KJV)
                  setLoading(false)
                })
                .catch(() => {
                  setError(true)
                  setLoading(false)
                })
            }}
            type="button"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const currentVerses = activeBook.chapters[activeChapter - 1] || []

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
              {verseSearchResults.length === 0 && (
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
                {kjvData.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>

              <select
                value={activeChapter}
                onChange={(event) => handleChapterChange(Number(event.target.value))}
              >
                {Array.from({ length: activeBook.chapters.length }, (_, index) => (
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

          <div className="scripture" style={{ fontSize }}>
            <span className="page-eyebrow">King James Version (public domain)</span>
            <h1>
              {activeBook.name} {activeChapter}
            </h1>
            {currentVerses.map((verseText, index) => (
              <p key={index + 1}>
                <sup>{index + 1}</sup>
                {verseText}
              </p>
            ))}
          </div>

          <footer className="reader-footer">
            <button
              disabled={isPrevDisabled}
              onClick={handlePrevChapter}
              type="button"
            >
              ← Previous
            </button>
            <span>
              {activeBook.name} {activeChapter}
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
