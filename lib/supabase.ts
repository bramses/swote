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

  const { data: quotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*');

  if (quotesError) {
    console.error('Error fetching quotes:', quotesError);
    throw quotesError;
  }

  const quotesByBookId = quotes.reduce((acc, quote) => {
    if (!acc[quote.book_id]) {
      acc[quote.book_id] = [];
    }
    acc[quote.book_id].push(quote.text);
    return acc;
  }, {} as Record<string, string[]>);

  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    cover: book.cover_url,
    quotes: quotesByBookId[book.id] || [],
  }));
}
