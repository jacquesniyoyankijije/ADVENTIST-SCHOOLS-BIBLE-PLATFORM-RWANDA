/**
 * Index of the complete public-domain King James Version.
 * Book texts live in ./kjv-books/*.ts, one small lazily-loaded chunk
 * per book, so opening the reader never downloads the whole Bible.
 */
export type BibleBookMeta = {
  name: string
  chapters: number
  file: string
}

export const KJV_INDEX: BibleBookMeta[] = [
  { name: "Genesis", chapters: 50, file: "01-genesis.ts" },
  { name: "Exodus", chapters: 40, file: "02-exodus.ts" },
  { name: "Leviticus", chapters: 27, file: "03-leviticus.ts" },
  { name: "Numbers", chapters: 36, file: "04-numbers.ts" },
  { name: "Deuteronomy", chapters: 34, file: "05-deuteronomy.ts" },
  { name: "Joshua", chapters: 24, file: "06-joshua.ts" },
  { name: "Judges", chapters: 21, file: "07-judges.ts" },
  { name: "Ruth", chapters: 4, file: "08-ruth.ts" },
  { name: "1 Samuel", chapters: 31, file: "09-1-samuel.ts" },
  { name: "2 Samuel", chapters: 24, file: "10-2-samuel.ts" },
  { name: "1 Kings", chapters: 22, file: "11-1-kings.ts" },
  { name: "2 Kings", chapters: 25, file: "12-2-kings.ts" },
  { name: "1 Chronicles", chapters: 29, file: "13-1-chronicles.ts" },
  { name: "2 Chronicles", chapters: 36, file: "14-2-chronicles.ts" },
  { name: "Ezra", chapters: 10, file: "15-ezra.ts" },
  { name: "Nehemiah", chapters: 13, file: "16-nehemiah.ts" },
  { name: "Esther", chapters: 10, file: "17-esther.ts" },
  { name: "Job", chapters: 42, file: "18-job.ts" },
  { name: "Psalms", chapters: 150, file: "19-psalms.ts" },
  { name: "Proverbs", chapters: 31, file: "20-proverbs.ts" },
  { name: "Ecclesiastes", chapters: 12, file: "21-ecclesiastes.ts" },
  { name: "Song of Solomon", chapters: 8, file: "22-song-of-solomon.ts" },
  { name: "Isaiah", chapters: 66, file: "23-isaiah.ts" },
  { name: "Jeremiah", chapters: 52, file: "24-jeremiah.ts" },
  { name: "Lamentations", chapters: 5, file: "25-lamentations.ts" },
  { name: "Ezekiel", chapters: 48, file: "26-ezekiel.ts" },
  { name: "Daniel", chapters: 12, file: "27-daniel.ts" },
  { name: "Hosea", chapters: 14, file: "28-hosea.ts" },
  { name: "Joel", chapters: 3, file: "29-joel.ts" },
  { name: "Amos", chapters: 9, file: "30-amos.ts" },
  { name: "Obadiah", chapters: 1, file: "31-obadiah.ts" },
  { name: "Jonah", chapters: 4, file: "32-jonah.ts" },
  { name: "Micah", chapters: 7, file: "33-micah.ts" },
  { name: "Nahum", chapters: 3, file: "34-nahum.ts" },
  { name: "Habakkuk", chapters: 3, file: "35-habakkuk.ts" },
  { name: "Zephaniah", chapters: 3, file: "36-zephaniah.ts" },
  { name: "Haggai", chapters: 2, file: "37-haggai.ts" },
  { name: "Zechariah", chapters: 14, file: "38-zechariah.ts" },
  { name: "Malachi", chapters: 4, file: "39-malachi.ts" },
  { name: "Matthew", chapters: 28, file: "40-matthew.ts" },
  { name: "Mark", chapters: 16, file: "41-mark.ts" },
  { name: "Luke", chapters: 24, file: "42-luke.ts" },
  { name: "John", chapters: 21, file: "43-john.ts" },
  { name: "Acts", chapters: 28, file: "44-acts.ts" },
  { name: "Romans", chapters: 16, file: "45-romans.ts" },
  { name: "1 Corinthians", chapters: 16, file: "46-1-corinthians.ts" },
  { name: "2 Corinthians", chapters: 13, file: "47-2-corinthians.ts" },
  { name: "Galatians", chapters: 6, file: "48-galatians.ts" },
  { name: "Ephesians", chapters: 6, file: "49-ephesians.ts" },
  { name: "Philippians", chapters: 4, file: "50-philippians.ts" },
  { name: "Colossians", chapters: 4, file: "51-colossians.ts" },
  { name: "1 Thessalonians", chapters: 5, file: "52-1-thessalonians.ts" },
  { name: "2 Thessalonians", chapters: 3, file: "53-2-thessalonians.ts" },
  { name: "1 Timothy", chapters: 6, file: "54-1-timothy.ts" },
  { name: "2 Timothy", chapters: 4, file: "55-2-timothy.ts" },
  { name: "Titus", chapters: 3, file: "56-titus.ts" },
  { name: "Philemon", chapters: 1, file: "57-philemon.ts" },
  { name: "Hebrews", chapters: 13, file: "58-hebrews.ts" },
  { name: "James", chapters: 5, file: "59-james.ts" },
  { name: "1 Peter", chapters: 5, file: "60-1-peter.ts" },
  { name: "2 Peter", chapters: 3, file: "61-2-peter.ts" },
  { name: "1 John", chapters: 5, file: "62-1-john.ts" },
  { name: "2 John", chapters: 1, file: "63-2-john.ts" },
  { name: "3 John", chapters: 1, file: "64-3-john.ts" },
  { name: "Jude", chapters: 1, file: "65-jude.ts" },
  { name: "Revelation", chapters: 22, file: "66-revelation.ts" },
]

/** Book name -> chapter-count map for fast lookups. */
export const CHAPTER_COUNTS: Record<string, number> = Object.fromEntries(
  KJV_INDEX.map((book) => [book.name, book.chapters]),
)

/** Lazy loaders for every book chunk, generated at build time. */
const BOOK_LOADERS: Record<string, () => Promise<{ chapters: string[][] }> > =
  import.meta.glob<{ chapters: string[][] }>("./kjv-books/*.ts", {
    eager: false,
  })

const loadedCache: Record<string, string[][]> = {}

/**
 * Loads one book's chapters (cached after the first call).
 * Throws if the book name is unknown or its chunk cannot be imported.
 */
export async function loadBookChapters(name: string): Promise<string[][]> {
  if (loadedCache[name]) return loadedCache[name]
  const meta = KJV_INDEX.find((book) => book.name === name)
  if (!meta) throw new Error(`Unknown book: ${name}`)
  const loader = BOOK_LOADERS[`./kjv-books/${meta.file}`]
  if (!loader) throw new Error(`No data file for ${name}`)
  const mod = await loader()
  loadedCache[name] = mod.chapters
  return mod.chapters
}

/** How many distinct book chunks are available. */
export const BOOK_COUNT = KJV_INDEX.length
