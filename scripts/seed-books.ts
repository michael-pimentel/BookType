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

  // More Charles Dickens
  { id: 564,   title: 'The Mystery of Edwin Drood',                   author: 'Charles Dickens' },
  { id: 967,   title: 'Nicholas Nickleby',                            author: 'Charles Dickens' },
  { id: 968,   title: 'Dombey and Son',                               author: 'Charles Dickens' },
  { id: 883,   title: 'Our Mutual Friend',                            author: 'Charles Dickens' },
  { id: 700,   title: 'The Old Curiosity Shop',                       author: 'Charles Dickens' },
  { id: 1023,  title: 'Martin Chuzzlewit',                            author: 'Charles Dickens' },
  { id: 917,   title: 'Barnaby Rudge',                                author: 'Charles Dickens' },

  // More Thomas Hardy
  { id: 12243, title: 'The Return of the Native',                     author: 'Thomas Hardy' },
  { id: 4059,  title: 'The Mayor of Casterbridge',                    author: 'Thomas Hardy' },
  { id: 4362,  title: 'Jude the Obscure',                             author: 'Thomas Hardy' },
  { id: 3328,  title: 'The Woodlanders',                              author: 'Thomas Hardy' },

  // More Anthony Trollope
  { id: 4368,  title: 'Doctor Thorne',                                author: 'Anthony Trollope' },
  { id: 18586, title: 'He Knew He Was Right',                         author: 'Anthony Trollope' },
  { id: 5140,  title: 'The Last Chronicle of Barset',                 author: 'Anthony Trollope' },
  { id: 4299,  title: 'Can You Forgive Her?',                         author: 'Anthony Trollope' },
  { id: 3293,  title: 'Phineas Finn',                                 author: 'Anthony Trollope' },
  { id: 1082,  title: 'The Eustace Diamonds',                         author: 'Anthony Trollope' },
  { id: 2432,  title: 'The Way We Live Now',                          author: 'Anthony Trollope' },

  // More Henry James
  { id: 2833,  title: 'The Ambassadors',                              author: 'Henry James' },
  { id: 7374,  title: 'The Wings of the Dove',                        author: 'Henry James' },
  { id: 3326,  title: 'What Maisie Knew',                             author: 'Henry James' },
  { id: 208,   title: 'Daisy Miller',                                 author: 'Henry James' },
  { id: 179,   title: 'Washington Square',                            author: 'Henry James' },

  // More Joseph Conrad
  { id: 974,   title: 'Nostromo',                                     author: 'Joseph Conrad' },
  { id: 8440,  title: 'The Secret Agent',                             author: 'Joseph Conrad' },
  { id: 2896,  title: 'The Secret Sharer',                            author: 'Joseph Conrad' },
  { id: 1845,  title: 'Chance',                                       author: 'Joseph Conrad' },

  // More H.G. Wells
  { id: 1743,  title: 'Tono-Bungay',                                  author: 'H.G. Wells' },
  { id: 3518,  title: 'Kipps',                                        author: 'H.G. Wells' },
  { id: 4526,  title: 'The History of Mr. Polly',                     author: 'H.G. Wells' },
  { id: 7332,  title: 'Ann Veronica',                                  author: 'H.G. Wells' },

  // More Arthur Conan Doyle
  { id: 3289,  title: 'The Valley of Fear',                           author: 'Arthur Conan Doyle' },
  { id: 290,   title: 'The White Company',                            author: 'Arthur Conan Doyle' },
  { id: 3087,  title: 'The Lost World',                               author: 'Arthur Conan Doyle' },
  { id: 2348,  title: 'The Casebook of Sherlock Holmes',              author: 'Arthur Conan Doyle' },

  // More Jack London
  { id: 1055,  title: 'The Iron Heel',                                author: 'Jack London' },
  { id: 2408,  title: 'Martin Eden',                                  author: 'Jack London' },
  { id: 318,   title: 'John Barleycorn',                              author: 'Jack London' },
  { id: 1056,  title: 'Burning Daylight',                             author: 'Jack London' },

  // Edgar Rice Burroughs
  { id: 78,    title: 'Tarzan of the Apes',                           author: 'Edgar Rice Burroughs' },
  { id: 364,   title: 'The Return of Tarzan',                         author: 'Edgar Rice Burroughs' },
  { id: 62,    title: 'A Princess of Mars',                           author: 'Edgar Rice Burroughs' },
  { id: 296,   title: 'The Gods of Mars',                             author: 'Edgar Rice Burroughs' },
  { id: 368,   title: 'The Warlord of Mars',                          author: 'Edgar Rice Burroughs' },

  // More Jules Verne
  { id: 3526,  title: 'The Mysterious Island',                        author: 'Jules Verne' },
  { id: 4070,  title: 'From the Earth to the Moon',                   author: 'Jules Verne' },
  { id: 3808,  title: 'Off on a Comet',                               author: 'Jules Verne' },
  { id: 1903,  title: 'The Master of the World',                      author: 'Jules Verne' },
  { id: 2091,  title: 'Robur the Conqueror',                          author: 'Jules Verne' },
  { id: 1130,  title: 'Five Weeks in a Balloon',                      author: 'Jules Verne' },


  // More Robert Louis Stevenson
  { id: 349,   title: 'The Black Arrow',                              author: 'Robert Louis Stevenson' },
  { id: 496,   title: 'Catriona',                                     author: 'Robert Louis Stevenson' },
  { id: 397,   title: 'Weir of Hermiston',                            author: 'Robert Louis Stevenson' },

  // More Mark Twain
  { id: 245,   title: 'Life on the Mississippi',                      author: 'Mark Twain' },
  { id: 102,   title: 'Roughing It',                                  author: 'Mark Twain' },
  { id: 3173,  title: "Pudd'nhead Wilson",                            author: 'Mark Twain' },
  { id: 1213,  title: 'Personal Recollections of Joan of Arc',        author: 'Mark Twain' },
  { id: 3177,  title: 'The Innocents Abroad',                         author: 'Mark Twain' },

  // More L.M. Montgomery
  { id: 51,    title: 'Anne of Avonlea',                              author: 'L.M. Montgomery' },
  { id: 392,   title: 'Anne of the Island',                           author: 'L.M. Montgomery' },

  // More Louisa May Alcott
  { id: 2787,  title: 'Little Men',                                   author: 'Louisa May Alcott' },
  { id: 2788,  title: "Jo's Boys",                                    author: 'Louisa May Alcott' },
  { id: 2800,  title: 'Eight Cousins',                                author: 'Louisa May Alcott' },

  // P.G. Wodehouse extras
  { id: 10554, title: 'The Inimitable Jeeves',                        author: 'P.G. Wodehouse' },
  { id: 6056,  title: 'Right Ho, Jeeves',                             author: 'P.G. Wodehouse' },
  { id: 7471,  title: 'Leave It to Psmith',                           author: 'P.G. Wodehouse' },
  { id: 6580,  title: 'Something New',                                author: 'P.G. Wodehouse' },

  // G.K. Chesterton
  { id: 223,   title: 'The Innocence of Father Brown',                author: 'G.K. Chesterton' },
  { id: 227,   title: 'The Wisdom of Father Brown',                   author: 'G.K. Chesterton' },
  { id: 69,    title: 'The Man Who Was Thursday',                     author: 'G.K. Chesterton' },
  { id: 470,   title: 'The Napoleon of Notting Hill',                 author: 'G.K. Chesterton' },

  // Gaston Leroux
  { id: 175,   title: 'The Phantom of the Opera',                     author: 'Gaston Leroux' },
  { id: 1929,  title: 'The Mystery of the Yellow Room',               author: 'Gaston Leroux' },

  // Baroness Orczy
  { id: 3154,  title: 'The Scarlet Pimpernel',                        author: 'Baroness Orczy' },
  { id: 3010,  title: 'I Will Repay',                                 author: 'Baroness Orczy' },

  // E.W. Hornung
  { id: 706,   title: 'The Amateur Cracksman',                        author: 'E.W. Hornung' },
  { id: 1553,  title: 'Mr. Justice Raffles',                          author: 'E.W. Hornung' },

  // E.M. Forster
  { id: 2641,  title: 'A Room with a View',                           author: 'E.M. Forster' },
  { id: 2623,  title: 'Howards End',                                  author: 'E.M. Forster' },

  // Arnold Bennett
  { id: 8864,  title: 'The Old Wives\' Tale',                         author: 'Arnold Bennett' },
  { id: 5659,  title: 'The Grand Babylon Hotel',                      author: 'Arnold Bennett' },

  // John Galsworthy
  { id: 2507,  title: 'The Man of Property',                          author: 'John Galsworthy' },
  { id: 4795,  title: 'In Chancery',                                  author: 'John Galsworthy' },

  // Sheridan Le Fanu
  { id: 2997,  title: 'Carmilla',                                     author: 'Sheridan Le Fanu' },
  { id: 2311,  title: 'Uncle Silas',                                  author: 'Sheridan Le Fanu' },
  { id: 2005,  title: 'The House by the Churchyard',                  author: 'Sheridan Le Fanu' },

  // H. Rider Haggard extras
  { id: 572,   title: 'Allan Quatermain',                             author: 'H. Rider Haggard' },
  { id: 3007,  title: 'Cleopatra',                                    author: 'H. Rider Haggard' },

  // Algernon Blackwood
  { id: 10377, title: 'The Willows',                                  author: 'Algernon Blackwood' },
  { id: 23218, title: 'John Silence',                                 author: 'Algernon Blackwood' },

  // M.R. James
  { id: 8486,  title: 'Ghost Stories of an Antiquary',                author: 'M.R. James' },
  { id: 20387, title: 'More Ghost Stories',                           author: 'M.R. James' },

  // Arthur Machen
  { id: 389,   title: 'The Great God Pan',                            author: 'Arthur Machen' },
  { id: 25016, title: 'The Hill of Dreams',                           author: 'Arthur Machen' },

  // Mary Elizabeth Braddon
  { id: 8384,  title: "Lady Audley's Secret",                         author: 'Mary Elizabeth Braddon' },
  { id: 3843,  title: 'Aurora Floyd',                                 author: 'Mary Elizabeth Braddon' },

  // Anthony Hope extras
  { id: 2485,  title: 'Rupert of Hentzau',                            author: 'Anthony Hope' },

  // Wilkie Collins extras
  { id: 11138, title: 'Armadale',                                     author: 'Wilkie Collins' },
  { id: 2821,  title: 'No Name',                                      author: 'Wilkie Collins' },
  { id: 3038,  title: 'Poor Miss Finch',                              author: 'Wilkie Collins' },

  // Samuel Butler
  { id: 1201,  title: 'Erewhon',                                      author: 'Samuel Butler' },
  { id: 5136,  title: 'The Way of All Flesh',                         author: 'Samuel Butler' },

  // E. Nesbit
  { id: 4513,  title: 'The Story of the Treasure Seekers',            author: 'E. Nesbit' },
  { id: 14837, title: 'Five Children and It',                         author: 'E. Nesbit' },
  { id: 23765, title: 'The Railway Children',                         author: 'E. Nesbit' },

  // J.M. Barrie
  { id: 16,    title: 'Peter Pan',                                    author: 'J.M. Barrie' },
  { id: 1211,  title: 'The Little Minister',                          author: 'J.M. Barrie' },

  // Kenneth Grahame
  { id: 289,   title: 'The Wind in the Willows',                      author: 'Kenneth Grahame' },

  // Willa Cather
  { id: 2101,  title: 'O Pioneers!',                                  author: 'Willa Cather' },
  { id: 19902, title: 'My Antonia',                                   author: 'Willa Cather' },
  { id: 21173, title: 'The Professor\'s House',                       author: 'Willa Cather' },

  // Sherwood Anderson
  { id: 4517,  title: 'Winesburg, Ohio',                              author: 'Sherwood Anderson' },

  // William Dean Howells
  { id: 2852,  title: 'The Rise of Silas Lapham',                     author: 'William Dean Howells' },
  { id: 3389,  title: 'A Modern Instance',                            author: 'William Dean Howells' },

  // Edward Bellamy
  { id: 624,   title: 'Looking Backward',                             author: 'Edward Bellamy' },

  // Thomas Love Peacock
  { id: 4079,  title: 'Headlong Hall',                                author: 'Thomas Love Peacock' },
  { id: 12480, title: 'Nightmare Abbey',                              author: 'Thomas Love Peacock' },
  { id: 2099,  title: 'Crotchet Castle',                              author: 'Thomas Love Peacock' },

  // Sarah Orne Jewett
  { id: 367,   title: 'The Country of the Pointed Firs',              author: 'Sarah Orne Jewett' },

  // Bret Harte
  { id: 2096,  title: 'The Luck of Roaring Camp',                     author: 'Bret Harte' },

  // Ambrose Bierce extras
  { id: 2566,  title: 'In the Midst of Life',                         author: 'Ambrose Bierce' },
  { id: 13334, title: 'The Devil\'s Dictionary',                      author: 'Ambrose Bierce' },

  // More Russian literature
  { id: 600,   title: 'Notes from Underground',                       author: 'Fyodor Dostoevsky' },
  { id: 2302,  title: 'The Gambler',                                  author: 'Fyodor Dostoevsky' },
  { id: 30734, title: 'Poor Folk',                                    author: 'Fyodor Dostoevsky' },
  { id: 985,   title: 'Rudin',                                        author: 'Ivan Turgenev' },
  { id: 6452,  title: 'On the Eve',                                   author: 'Ivan Turgenev' },
  { id: 3732,  title: 'The Inspector-General',                        author: 'Nikolai Gogol' },

  // More French literature
  { id: 4300,  title: 'Nana',                                         author: 'Emile Zola' },
  { id: 6808,  title: 'The Drunkard',                                 author: 'Emile Zola' },
  { id: 17025, title: 'Therese Raquin',                               author: 'Emile Zola' },
  { id: 2452,  title: "A Doll's House",                               author: 'Henrik Ibsen' },
  { id: 7025,  title: 'Hedda Gabler',                                 author: 'Henrik Ibsen' },
  { id: 4025,  title: 'Ghosts',                                       author: 'Henrik Ibsen' },
  { id: 4076,  title: 'The Wild Duck',                                author: 'Henrik Ibsen' },
  { id: 946,   title: 'Germinie Lacerteux',                           author: 'Edmond de Goncourt' },
  { id: 3832,  title: 'Bel Ami',                                      author: 'Guy de Maupassant' },
  { id: 3319,  title: 'Une Vie',                                      author: 'Guy de Maupassant' },
  { id: 3791,  title: 'Boule de Suif',                                author: 'Guy de Maupassant' },

  // More classics / ancient
  { id: 2680,  title: 'Medea',                                        author: 'Euripides' },
  { id: 981,   title: 'Antigone',                                     author: 'Sophocles' },
  { id: 31,    title: 'Oedipus Rex',                                   author: 'Sophocles' },
  { id: 2693,  title: 'The Birds',                                    author: 'Aristophanes' },
  { id: 3521,  title: 'The Clouds',                                   author: 'Aristophanes' },
  { id: 55201, title: 'The Republic',                                 author: 'Plato' },
  { id: 1635,  title: 'The Symposium',                                author: 'Plato' },
  { id: 1616,  title: 'The Apology',                                  author: 'Plato' },

  // Philosophy / essays
  { id: 1232,  title: 'The Prince',                                   author: 'Niccolo Machiavelli' },
  { id: 2851,  title: 'Meditations',                                  author: 'Marcus Aurelius' },
  { id: 4705,  title: 'The Art of War',                               author: 'Sun Tzu' },
  { id: 2009,  title: 'On the Origin of Species',                     author: 'Charles Darwin' },
  { id: 34901, title: 'On Liberty',                                   author: 'John Stuart Mill' },
  { id: 2995,  title: 'The Subjection of Women',                      author: 'John Stuart Mill' },
  { id: 3207,  title: 'Leviathan',                                    author: 'Thomas Hobbes' },
  { id: 2801,  title: 'Second Treatise of Government',                author: 'John Locke' },
  { id: 575,   title: 'Essays of Francis Bacon',                      author: 'Francis Bacon' },
  { id: 1051,  title: 'Sartor Resartus',                              author: 'Thomas Carlyle' },
  { id: 2945,  title: 'Essays: First Series',                         author: 'Ralph Waldo Emerson' },
  { id: 205,   title: 'Walden',                                       author: 'Henry David Thoreau' },
  { id: 363,   title: 'Civil Disobedience',                           author: 'Henry David Thoreau' },

  // More American classics
  { id: 323,   title: 'The Man Without a Country',                    author: 'Edward Everett Hale' },
  { id: 18,    title: 'The Sketch Book of Geoffrey Crayon',           author: 'Washington Irving' },
  { id: 5200,  title: 'The House of the Seven Gables',                author: 'Nathaniel Hawthorne' },
  { id: 25344, title: 'Twice Told Tales',                             author: 'Nathaniel Hawthorne' },
  { id: 9335,  title: 'The Marble Faun',                              author: 'Nathaniel Hawthorne' },
  { id: 30,    title: 'The Narrative of Arthur Gordon Pym',           author: 'Edgar Allan Poe' },
  { id: 2148,  title: 'The Works of Edgar Allan Poe, Volume 2',      author: 'Edgar Allan Poe' },
  { id: 2149,  title: 'The Works of Edgar Allan Poe, Volume 3',      author: 'Edgar Allan Poe' },
  { id: 9147,  title: 'Billy Budd',                                   author: 'Herman Melville' },
  { id: 8118,  title: 'The Confidence-Man',                           author: 'Herman Melville' },
  { id: 2694,  title: 'Pierre',                                       author: 'Herman Melville' },

  // More Gothic / horror
  { id: 696,   title: 'The Beetle',                                   author: 'Richard Marsh' },
  { id: 3268,  title: 'The Great God Pan',                            author: 'Arthur Machen' },
  { id: 4576,  title: 'Vathek',                                       author: 'William Beckford' },
  { id: 473,   title: 'The Mysteries of Udolpho',                     author: 'Ann Radcliffe' },
  { id: 4595,  title: 'The Italian',                                  author: 'Ann Radcliffe' },
  { id: 1396,  title: 'The Castle of Otranto',                        author: 'Horace Walpole' },
  { id: 10007, title: 'The Monk',                                     author: 'Matthew Lewis' },
  { id: 2756,  title: 'Melmoth the Wanderer',                         author: 'Charles Maturin' },

  // More children's classics
  { id: 8428,  title: 'The Water-Babies',                             author: 'Charles Kingsley' },
  { id: 524,   title: 'At the Back of the North Wind',                author: 'George MacDonald' },
  { id: 325,   title: 'The Princess and the Goblin',                  author: 'George MacDonald' },
  { id: 7863,  title: 'Lilith',                                       author: 'George MacDonald' },
  { id: 4551,  title: 'Swiss Family Robinson',                        author: 'Johann David Wyss' },
  { id: 11791, title: 'A Christmas Garland',                          author: 'Max Beerbohm' },

  // More adventure / historical
  { id: 6380,  title: 'The Adventures of Hajji Baba of Ispahan',      author: 'James Morier' },
  { id: 3797,  title: 'Lorna Doone',                                  author: 'R.D. Blackmore' },
  { id: 5817,  title: 'Under Two Flags',                              author: 'Ouida' },
  { id: 9025,  title: 'The Broad Highway',                            author: 'Jeffery Farnol' },
  { id: 4749,  title: 'Richard Carvel',                               author: 'Winston Churchill' },
  { id: 8102,  title: 'Monsieur Beaucaire',                           author: 'Booth Tarkington' },
  { id: 1064,  title: "The Gentleman from Indiana",                   author: 'Booth Tarkington' },
  { id: 1065,  title: 'Penrod',                                       author: 'Booth Tarkington' },

  // Émile Zola extras
  { id: 2741,  title: 'The Fortune of the Rougons',                   author: 'Emile Zola' },
  { id: 7677,  title: 'The Downfall',                                  author: 'Emile Zola' },

  // More Balzac
  { id: 1901,  title: 'Cousin Bette',                                  author: 'Honore de Balzac' },
  { id: 3747,  title: 'Eugenie Grandet',                              author: 'Honore de Balzac' },
  { id: 1413,  title: 'The Magic Skin',                               author: 'Honore de Balzac' },
  { id: 1466,  title: 'Lost Illusions',                               author: 'Honore de Balzac' },

  // More Dumas
  { id: 1258,  title: 'Twenty Years After',                           author: 'Alexandre Dumas' },
  { id: 2759,  title: 'The Vicomte de Bragelonne',                    author: 'Alexandre Dumas' },
  { id: 1254,  title: 'The Black Tulip',                              author: 'Alexandre Dumas' },

  // More Victor Hugo
  { id: 9066,  title: 'Ninety-Three',                                 author: 'Victor Hugo' },
  { id: 4091,  title: "The Man Who Laughs",                           author: 'Victor Hugo' },
  { id: 3283,  title: "Toilers of the Sea",                           author: 'Victor Hugo' },

  // Stendhal
  { id: 44747, title: 'The Red and the Black',                        author: 'Stendhal' },
  { id: 1953,  title: 'The Charterhouse of Parma',                    author: 'Stendhal' },

  // More Tolstoy
  { id: 986,   title: 'The Cossacks',                                 author: 'Leo Tolstoy' },
  { id: 2142,  title: 'Childhood',                                    author: 'Leo Tolstoy' },
  { id: 689,   title: 'Resurrection',                                 author: 'Leo Tolstoy' },

  // Alexander Pushkin
  { id: 55,    title: 'The Queen of Spades',                          author: 'Alexander Pushkin' },
  { id: 41310, title: "The Captain's Daughter",                       author: 'Alexander Pushkin' },

  // Ivan Goncharov
  { id: 1395,  title: 'Oblomov',                                      author: 'Ivan Goncharov' },

  // More Chekhov
  { id: 1754,  title: 'Ward No. 6',                                   author: 'Anton Chekhov' },
  { id: 6837,  title: 'The Three Sisters',                            author: 'Anton Chekhov' },
  { id: 1753,  title: 'Uncle Vanya',                                  author: 'Anton Chekhov' },

  // More Turgenev
  { id: 7021,  title: 'Smoke',                                        author: 'Ivan Turgenev' },
  { id: 3465,  title: 'A Sportsman\'s Sketches',                      author: 'Ivan Turgenev' },
  { id: 6462,  title: 'Virgin Soil',                                  author: 'Ivan Turgenev' },

  // Scandinavian
  { id: 2849,  title: 'Hunger',                                       author: 'Knut Hamsun' },
  { id: 4534,  title: 'Growth of the Soil',                           author: 'Knut Hamsun' },
  { id: 2843,  title: 'Brand',                                        author: 'Henrik Ibsen' },
  { id: 2845,  title: 'Peer Gynt',                                    author: 'Henrik Ibsen' },
  { id: 4535,  title: 'The Father',                                   author: 'August Strindberg' },
  { id: 4536,  title: 'Miss Julie',                                   author: 'August Strindberg' },

  // German literature
  { id: 5783,  title: 'Effi Briest',                                  author: 'Theodor Fontane' },
  { id: 2175,  title: 'Siddhartha',                                   author: 'Hermann Hesse' },
  { id: 22622, title: 'The Metamorphosis',                            author: 'Franz Kafka' },

  // Italian
  { id: 4028,  title: 'The Betrothed',                                author: 'Alessandro Manzoni' },

  // Spanish
  { id: 17013, title: 'Pepita Jimenez',                               author: 'Juan Valera' },

  // More philosophy / essays
  { id: 5827,  title: 'Thus Spoke Zarathustra',                       author: 'Friedrich Nietzsche' },
  { id: 4363,  title: 'Beyond Good and Evil',                         author: 'Friedrich Nietzsche' },
  { id: 1497,  title: 'The Social Contract',                          author: 'Jean-Jacques Rousseau' },
  { id: 2396,  title: 'Emile',                                        author: 'Jean-Jacques Rousseau' },
  { id: 5740,  title: 'The Wealth of Nations',                        author: 'Adam Smith' },
  { id: 2916,  title: 'A Vindication of the Rights of Woman',         author: 'Mary Wollstonecraft' },

  // Science classics
  { id: 2300,  title: 'The Descent of Man',                           author: 'Charles Darwin' },
  { id: 944,   title: 'The Voyage of the Beagle',                     author: 'Charles Darwin' },
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
