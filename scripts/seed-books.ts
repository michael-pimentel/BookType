// Seed public-domain books from Project Gutenberg into the books table.
// Run with: npm run seed:books

import { createServiceRoleClient } from '../src/lib/supabase'

const BOOKS = [
  // Jane Austen
  { id: 1342,  title: 'Pride and Prejudice',                         author: 'Jane Austen' },
  { id: 105,   title: 'Persuasion',                                   author: 'Jane Austen' },
  { id: 161,   title: 'Sense and Sensibility',                        author: 'Jane Austen' },
  { id: 121,   title: 'Northanger Abbey',                             author: 'Jane Austen' },
  { id: 141,   title: 'Mansfield Park',                               author: 'Jane Austen' },
  { id: 158,   title: 'Emma',                                         author: 'Jane Austen' },
  // Lewis Carroll
  { id: 11,    title: "Alice's Adventures in Wonderland",             author: 'Lewis Carroll' },
  { id: 12,    title: 'Through the Looking-Glass',                    author: 'Lewis Carroll' },
  // Arthur Conan Doyle
  { id: 1661,  title: 'The Adventures of Sherlock Holmes',            author: 'Arthur Conan Doyle' },
  { id: 2097,  title: 'The Hound of the Baskervilles',                author: 'Arthur Conan Doyle' },
  { id: 108,   title: 'The Sign of the Four',                         author: 'Arthur Conan Doyle' },
  { id: 244,   title: 'A Study in Scarlet',                           author: 'Arthur Conan Doyle' },
  { id: 2343,  title: 'The Return of Sherlock Holmes',                author: 'Arthur Conan Doyle' },
  // Mary Shelley
  { id: 84,    title: 'Frankenstein',                                  author: 'Mary Shelley' },
  // F. Scott Fitzgerald
  { id: 64317, title: 'The Great Gatsby',                             author: 'F. Scott Fitzgerald' },
  // Charles Dickens
  { id: 98,    title: 'A Tale of Two Cities',                         author: 'Charles Dickens' },
  { id: 730,   title: 'Oliver Twist',                                  author: 'Charles Dickens' },
  { id: 1400,  title: 'Great Expectations',                           author: 'Charles Dickens' },
  { id: 766,   title: 'David Copperfield',                            author: 'Charles Dickens' },
  { id: 580,   title: 'The Pickwick Papers',                          author: 'Charles Dickens' },
  { id: 46,    title: 'A Christmas Carol',                            author: 'Charles Dickens' },
  { id: 786,   title: 'Hard Times',                                   author: 'Charles Dickens' },
  { id: 821,   title: 'Bleak House',                                  author: 'Charles Dickens' },
  // Mark Twain
  { id: 74,    title: 'The Adventures of Tom Sawyer',                 author: 'Mark Twain' },
  { id: 76,    title: 'Adventures of Huckleberry Finn',               author: 'Mark Twain' },
  { id: 86,    title: 'A Connecticut Yankee in King Arthur\'s Court', author: 'Mark Twain' },
  { id: 3176,  title: 'The Prince and the Pauper',                    author: 'Mark Twain' },
  // Leo Tolstoy
  { id: 2600,  title: 'War and Peace',                                author: 'Leo Tolstoy' },
  { id: 1399,  title: 'Anna Karenina',                                author: 'Leo Tolstoy' },
  { id: 243,   title: 'The Death of Ivan Ilyich',                     author: 'Leo Tolstoy' },
  // Fyodor Dostoevsky
  { id: 2554,  title: 'Crime and Punishment',                         author: 'Fyodor Dostoevsky' },
  { id: 28054, title: 'The Brothers Karamazov',                       author: 'Fyodor Dostoevsky' },
  { id: 97,    title: 'The Idiot',                                    author: 'Fyodor Dostoevsky' },
  // Herman Melville
  { id: 2701,  title: 'Moby-Dick',                                    author: 'Herman Melville' },
  { id: 15,    title: 'Bartleby, the Scrivener',                      author: 'Herman Melville' },
  // Edgar Allan Poe
  { id: 2147,  title: 'The Works of Edgar Allan Poe, Volume 1',       author: 'Edgar Allan Poe' },
  { id: 932,   title: 'The Cask of Amontillado',                      author: 'Edgar Allan Poe' },
  // Oscar Wilde
  { id: 174,   title: 'The Picture of Dorian Gray',                   author: 'Oscar Wilde' },
  { id: 790,   title: 'The Importance of Being Earnest',              author: 'Oscar Wilde' },
  { id: 14522, title: 'An Ideal Husband',                             author: 'Oscar Wilde' },
  // George Eliot
  { id: 145,   title: 'Middlemarch',                                  author: 'George Eliot' },
  { id: 550,   title: 'The Mill on the Floss',                        author: 'George Eliot' },
  { id: 236,   title: 'Silas Marner',                                 author: 'George Eliot' },
  // Thomas Hardy
  { id: 110,   title: 'Tess of the d\'Urbervilles',                   author: 'Thomas Hardy' },
  { id: 153,   title: 'Far from the Madding Crowd',                   author: 'Thomas Hardy' },
  // Bram Stoker
  { id: 345,   title: 'Dracula',                                      author: 'Bram Stoker' },
  // Robert Louis Stevenson
  { id: 43,    title: 'Treasure Island',                              author: 'Robert Louis Stevenson' },
  { id: 42,    title: 'Strange Case of Dr Jekyll and Mr Hyde',        author: 'Robert Louis Stevenson' },
  { id: 858,   title: 'Kidnapped',                                    author: 'Robert Louis Stevenson' },
  // H.G. Wells
  { id: 35,    title: 'The Time Machine',                             author: 'H.G. Wells' },
  { id: 36,    title: 'The War of the Worlds',                        author: 'H.G. Wells' },
  { id: 5230,  title: 'The Invisible Man',                            author: 'H.G. Wells' },
  { id: 159,   title: 'The Island of Doctor Moreau',                  author: 'H.G. Wells' },
  // Jules Verne
  { id: 103,   title: 'Around the World in Eighty Days',              author: 'Jules Verne' },
  { id: 164,   title: 'Twenty Thousand Leagues Under the Sea',        author: 'Jules Verne' },
  { id: 18857, title: 'Journey to the Center of the Earth',           author: 'Jules Verne' },
  { id: 1268,  title: 'Michael Strogoff',                             author: 'Jules Verne' },
  // Jack London
  { id: 910,   title: 'The Call of the Wild',                         author: 'Jack London' },
  { id: 1164,  title: 'White Fang',                                   author: 'Jack London' },
  { id: 2767,  title: 'The Sea-Wolf',                                 author: 'Jack London' },
  // Charlotte Bronte
  { id: 1260,  title: 'Jane Eyre',                                    author: 'Charlotte Bronte' },
  // Emily Bronte
  { id: 768,   title: 'Wuthering Heights',                            author: 'Emily Bronte' },
  // Anne Bronte
  { id: 969,   title: 'The Tenant of Wildfell Hall',                  author: 'Anne Bronte' },
  // William Makepeace Thackeray
  { id: 599,   title: 'Vanity Fair',                                  author: 'William Makepeace Thackeray' },
  // Anthony Trollope
  { id: 3729,  title: 'The Warden',                                   author: 'Anthony Trollope' },
  { id: 3849,  title: 'Barchester Towers',                            author: 'Anthony Trollope' },
  // Sir Walter Scott
  { id: 82,    title: 'Ivanhoe',                                      author: 'Sir Walter Scott' },
  { id: 84450, title: 'Waverley',                                     author: 'Sir Walter Scott' },
  // Nathaniel Hawthorne
  { id: 33,    title: 'The Scarlet Letter',                           author: 'Nathaniel Hawthorne' },
  { id: 512,   title: 'The House of the Seven Gables',                author: 'Nathaniel Hawthorne' },
  // Henry James
  { id: 209,   title: 'The Turn of the Screw',                        author: 'Henry James' },
  { id: 432,   title: 'The Portrait of a Lady',                       author: 'Henry James' },
  // Joseph Conrad
  { id: 219,   title: 'Heart of Darkness',                            author: 'Joseph Conrad' },
  { id: 526,   title: 'Lord Jim',                                     author: 'Joseph Conrad' },
  // Gustave Flaubert
  { id: 2413,  title: 'Madame Bovary',                                author: 'Gustave Flaubert' },
  // Victor Hugo
  { id: 135,   title: 'Les Miserables',                               author: 'Victor Hugo' },
  { id: 2610,  title: 'The Hunchback of Notre-Dame',                  author: 'Victor Hugo' },
  // Alexandre Dumas
  { id: 1184,  title: 'The Count of Monte Cristo',                    author: 'Alexandre Dumas' },
  { id: 1257,  title: 'The Three Musketeers',                         author: 'Alexandre Dumas' },
  // Honore de Balzac
  { id: 1237,  title: 'Father Goriot',                                author: 'Honore de Balzac' },
  // Emile Zola
  { id: 5765,  title: 'Germinal',                                     author: 'Emile Zola' },
  // Miguel de Cervantes
  { id: 996,   title: 'Don Quixote',                                  author: 'Miguel de Cervantes' },
  // Johann Wolfgang von Goethe
  { id: 2229,  title: 'Faust',                                        author: 'Johann Wolfgang von Goethe' },
  // Dante Alighieri
  { id: 8800,  title: 'The Divine Comedy',                            author: 'Dante Alighieri' },
  // Homer
  { id: 1727,  title: 'The Odyssey',                                  author: 'Homer' },
  { id: 6130,  title: 'The Iliad',                                    author: 'Homer' },
  // Virgil
  { id: 228,   title: 'The Aeneid',                                   author: 'Virgil' },
  // William Shakespeare (selected plays)
  { id: 1514,  title: 'Romeo and Juliet',                             author: 'William Shakespeare' },
  { id: 1524,  title: 'Hamlet',                                       author: 'William Shakespeare' },
  { id: 1533,  title: 'Macbeth',                                      author: 'William Shakespeare' },
  { id: 1513,  title: 'A Midsummer Night\'s Dream',                   author: 'William Shakespeare' },
  { id: 1522,  title: 'The Merchant of Venice',                       author: 'William Shakespeare' },
  { id: 1532,  title: 'King Lear',                                    author: 'William Shakespeare' },
  { id: 1504,  title: 'Othello',                                      author: 'William Shakespeare' },
  { id: 1531,  title: 'The Tempest',                                  author: 'William Shakespeare' },
  // Daniel Defoe
  { id: 521,   title: 'Robinson Crusoe',                              author: 'Daniel Defoe' },
  // Jonathan Swift
  { id: 829,   title: "Gulliver's Travels",                           author: 'Jonathan Swift' },
  // Henry Fielding
  { id: 185,   title: 'Tom Jones',                                    author: 'Henry Fielding' },
  // Laurence Sterne
  { id: 1079,  title: 'The Life and Opinions of Tristram Shandy',     author: 'Laurence Sterne' },
  // James Fenimore Cooper
  { id: 940,   title: 'The Last of the Mohicans',                     author: 'James Fenimore Cooper' },
  // Washington Irving
  { id: 2048,  title: 'The Legend of Sleepy Hollow',                  author: 'Washington Irving' },
  // Louisa May Alcott
  { id: 514,   title: 'Little Women',                                 author: 'Louisa May Alcott' },
  // Anna Sewell
  { id: 271,   title: 'Black Beauty',                                 author: 'Anna Sewell' },
  // Frances Hodgson Burnett
  { id: 113,   title: 'The Secret Garden',                            author: 'Frances Hodgson Burnett' },
  { id: 479,   title: 'Little Lord Fauntleroy',                       author: 'Frances Hodgson Burnett' },
  // L.M. Montgomery
  { id: 45,    title: 'Anne of Green Gables',                         author: 'L.M. Montgomery' },
  // Rudyard Kipling
  { id: 35997, title: 'The Jungle Book',                              author: 'Rudyard Kipling' },
  { id: 2226,  title: 'Kim',                                          author: 'Rudyard Kipling' },
  // Arthur Conan Doyle extras
  { id: 2350,  title: 'The Memoirs of Sherlock Holmes',               author: 'Arthur Conan Doyle' },
  // P.G. Wodehouse
  { id: 8164,  title: 'My Man Jeeves',                                author: 'P.G. Wodehouse' },
  // Upton Sinclair
  { id: 140,   title: 'The Jungle',                                   author: 'Upton Sinclair' },
  // Edith Wharton
  { id: 284,   title: 'The House of Mirth',                           author: 'Edith Wharton' },
  { id: 541,   title: 'The Age of Innocence',                         author: 'Edith Wharton' },
  // Sinclair Lewis
  { id: 543,   title: 'Main Street',                                  author: 'Sinclair Lewis' },
  // Theodore Dreiser
  { id: 1374,  title: 'Sister Carrie',                                author: 'Theodore Dreiser' },
  // Stephen Crane
  { id: 176,   title: 'The Red Badge of Courage',                     author: 'Stephen Crane' },
  // Frank Norris
  { id: 3282,  title: 'McTeague',                                     author: 'Frank Norris' },
  // Ambrose Bierce
  { id: 1974,  title: 'An Occurrence at Owl Creek Bridge',            author: 'Ambrose Bierce' },
  // O. Henry
  { id: 1993,  title: 'The Gift of the Magi and Other Stories',       author: 'O. Henry' },
  // Kate Chopin
  { id: 160,   title: 'The Awakening',                                author: 'Kate Chopin' },
  // Anton Chekhov
  { id: 13505, title: 'The Cherry Orchard',                           author: 'Anton Chekhov' },
  { id: 7986,  title: 'The Lady with the Dog and Other Stories',      author: 'Anton Chekhov' },
  // Ivan Turgenev
  { id: 978,   title: 'Fathers and Sons',                             author: 'Ivan Turgenev' },
  // Nikolai Gogol
  { id: 1148,  title: 'Dead Souls',                                   author: 'Nikolai Gogol' },
  // Charlotte Perkins Gilman
  { id: 1952,  title: 'The Yellow Wallpaper',                         author: 'Charlotte Perkins Gilman' },
  // Wilkie Collins
  { id: 583,   title: 'The Woman in White',                           author: 'Wilkie Collins' },
  { id: 1695,  title: 'The Moonstone',                                author: 'Wilkie Collins' },
  // Anthony Hope
  { id: 95,    title: 'The Prisoner of Zenda',                        author: 'Anthony Hope' },
  // H. Rider Haggard
  { id: 2166,  title: "King Solomon's Mines",                         author: 'H. Rider Haggard' },
  { id: 683,   title: 'She',                                          author: 'H. Rider Haggard' },
  // John Buchan
  { id: 558,   title: 'The Thirty-Nine Steps',                        author: 'John Buchan' },
  // Rafael Sabatini
  { id: 2722,  title: 'Scaramouche',                                  author: 'Rafael Sabatini' },
  { id: 4906,  title: 'Captain Blood',                                author: 'Rafael Sabatini' },
]

const GUTENBERG_URLS = (id: number) => [
  `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
  `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
  `https://www.gutenberg.org/files/${id}/${id}.txt`,
]

const START_MARKER = /\*{3}\s*START OF THE PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i
const END_MARKER   = /\*{3}\s*END OF THE PROJECT GUTENBERG EBOOK[^\n]*\*{3}/i

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchBookText(id: number): Promise<string | null> {
  for (const url of GUTENBERG_URLS(id)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (!res.ok) continue
      const text = await res.text()
      if (text.length < 1000) continue // sanity check — real books are much larger
      return text
    } catch {
      // try next URL
    }
  }
  return null
}

function stripBoilerplate(raw: string): string {
  const startMatch = raw.match(START_MARKER)
  const endMatch   = raw.match(END_MARKER)

  if (!startMatch || startMatch.index === undefined) return raw.trim()

  const bodyStart = startMatch.index + startMatch[0].length
  const bodyEnd   = endMatch?.index ?? raw.length

  return raw.slice(bodyStart, bodyEnd).trim()
}

async function seedBooks() {
  const supabase = createServiceRoleClient()

  console.log('📚 Seeding books from Project Gutenberg...\n')

  for (const book of BOOKS) {
    // Idempotency: skip if title already exists
    const { data: existing } = await supabase
      .from('books')
      .select('id')
      .eq('title', book.title)
      .maybeSingle()

    if (existing) {
      console.log(`⏭  Skipping "${book.title}" — already in DB`)
      continue
    }

    console.log(`⬇️  Fetching "${book.title}" (Gutenberg ID ${book.id})...`)
    const raw = await fetchBookText(book.id)

    if (!raw) {
      console.error(`❌ Could not download "${book.title}" — all URLs failed`)
      continue
    }

    const content = stripBoilerplate(raw)
    console.log(`   Stripped to ${content.length.toLocaleString()} characters`)

    const { error } = await supabase
      .from('books')
      .insert({ title: book.title, author: book.author, content, created_by: null })

    if (error) {
      console.error(`❌ Insert failed for "${book.title}": ${error.message}`)
    } else {
      console.log(`✅ Inserted "${book.title}" by ${book.author}`)
    }

    // Be polite to Gutenberg's servers
    await sleep(1000)
  }

  console.log('\nDone.')
}

seedBooks().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
