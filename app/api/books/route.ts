import { NextResponse } from 'next/server';
import { getBooksWithQuotes, BookWithQuotes } from '@/lib/supabase';

export type Book = BookWithQuotes;

export type BooksResponse = {
  books: Book[];
};

export async function GET() {
  try {
    const books = await getBooksWithQuotes();
    return NextResponse.json({ books } as BooksResponse);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
