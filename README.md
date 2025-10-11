# BookType

Type out your favorite books! A full-stack web application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📚 Browse and manage a library of books
- ⌨️ Real-time typing practice with live metrics (WPM, accuracy, progress)
- 📊 Track your typing progress across multiple books
- ✅ Mark books as completed when you finish typing them
- 👤 User authentication with email/password and Google OAuth
- 📱 Responsive design with modern UI components
- 🎯 Auto-save progress as you type

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Real-time)
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/BookType.git
cd BookType
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase-setup.sql`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Books Table
- `id` (UUID, Primary Key)
- `title` (Text)
- `author` (Text) 
- `content` (Text)
- `created_by` (UUID, Foreign Key to users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Progress Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `book_id` (UUID, Foreign Key to books)
- `chars_typed` (Integer)
- `completed` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Features in Detail

### Typing Interface
- Real-time WPM calculation
- Accuracy tracking with error highlighting
- Progress bar showing completion percentage
- Auto-save functionality
- Character-by-character text comparison

### Library Management
- Add custom books to your collection
- View progress for each book
- Mark books as completed
- Search and filter functionality (coming soon)

### User Authentication
- Email/password signup and login
- Google OAuth integration
- Secure session management
- User-specific progress tracking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Leaderboard system
- [ ] Text highlighting for errors
- [ ] Export stats as CSV
- [ ] Book recommendations
- [ ] Social features (sharing progress)
- [ ] Mobile app
- [ ] Advanced typing analytics