import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  created_at: string;
  updated_at: string;
};

export type DbQuote = {
  id: string;
  book_id: string;
  text: string;
  readwise_id: string | null;
  created_at: string;
};

export type BookWithQuotes = {
  id: string;
  title: string;
  author: string;
  cover: string;
  quotes: string[];
};

export async function getBooksWithQuotes(): Promise<BookWithQuotes[]> {
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('*');

  if (booksError) {
    console.error('Error fetching books:', booksError);
    throw booksError;
  }

  // Fetch all quotes (Supabase defaults to 1000 limit)
  let allQuotes: DbQuote[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data: quotesPage, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .neq('text', '')
      .not('text', 'is', null)
      .range(from, from + pageSize - 1);

    if (quotesError) {
      console.error('Error fetching quotes:', quotesError);
      throw quotesError;
    }

    allQuotes = allQuotes.concat(quotesPage);

    if (quotesPage.length < pageSize) {
      break; // No more pages
    }
    from += pageSize;
  }

  const quotes = allQuotes;

  console.log('[Supabase] Books fetched:', books.length);
  console.log('[Supabase] Book IDs:', books.map(b => ({ id: b.id, title: b.title })));
  console.log('[Supabase] Quotes fetched:', quotes.length);
  console.log('[Supabase] Unique book_ids in quotes:', [...new Set(quotes.map(q => q.book_id))]);

  const quotesByBookId = quotes.reduce((acc, quote) => {
    if (!acc[quote.book_id]) {
      acc[quote.book_id] = [];
    }
    if (quote.text && quote.text.trim()) {
      acc[quote.book_id].push(quote.text.trim());
    }
    return acc;
  }, {} as Record<string, string[]>);

  console.log('[Supabase] Quotes grouped by book_id:', Object.keys(quotesByBookId).map(id => ({ id, count: quotesByBookId[id].length })));

  const result = books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    cover: book.cover_url,
    quotes: quotesByBookId[book.id] || [],
  }));

  console.log('[Supabase] Final books with quote counts:', result.map(b => ({ title: b.title, quoteCount: b.quotes.length })));

  return result;
}
