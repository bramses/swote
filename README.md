# Swote

Swipe quotes from books into your collection.

## What it does

Swote displays a carousel of books at the bottom of your screen. Swipe up on any book cover to save a random quote from that book to your collection. Swipe left on a saved quote to delete it.

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Set up your Supabase database using the schema in `lib/db/schema.sql`
5. Run the dev server: `npm run dev`

## Tech

- Next.js 16
- Supabase (PostgreSQL)
- Tailwind CSS
