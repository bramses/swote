'use client';

import { RefObject, useState } from 'react';
import { QuoteCard, type SavedQuote } from './QuoteCard';
import { ScrollToTop } from './ScrollToTop';

type CopyFormat = 'markdown' | 'json' | 'quiz' | 'deeper' | 'similarity';

function formatQuotesForCopy(quotes: SavedQuote[], format: CopyFormat): string {
  if (quotes.length === 0) return '';

  switch (format) {
    case 'markdown':
      return quotes
        .map((q) => `> "${q.quote}"\n> — ${q.book.author}, *${q.book.title}*`)
        .join('\n\n');

    case 'json':
      return JSON.stringify(
        quotes.map((q) => ({
          quote: q.quote,
          author: q.book.author,
          title: q.book.title,
        })),
        null,
        2
      );

    case 'quiz':
      const quizQuotes = quotes
        .map((q) => `> "${q.quote}"\n> — ${q.book.author}, *${q.book.title}*`)
        .join('\n\n');
      return `# Quiz Me

Based on the following quotes, create a quiz to test my understanding of the key concepts, themes, and ideas presented. Include questions about:
- Main arguments or insights
- Connections between ideas
- Practical applications
- Author's perspective

## Quotes

${quizQuotes}`;

    case 'deeper':
      const deeperQuotes = quotes
        .map((q) => `> "${q.quote}"\n> — ${q.book.author}, *${q.book.title}*`)
        .join('\n\n');
      return `# Dive Deeper

Analyze the following quotes and suggest topics I should explore further. For each topic:
- Explain why it's worth exploring
- Suggest related books, articles, or resources
- Pose thought-provoking questions to consider
- Suggest topics that can be web researched

## Quotes

${deeperQuotes}`;

    case 'similarity':
      const simQuotes = quotes
        .map((q) => `> "${q.quote}"\n> — ${q.book.author}, *${q.book.title}*`)
        .join('\n\n');
      return `# Find Connections

Analyze the following quotes and identify:
- Common themes and patterns
- Contrasting viewpoints
- Unexpected connections between different authors
- Overarching narrative or philosophy that emerges

## Quotes

${simQuotes}`;

    default:
      return '';
  }
}

function CopyDropdown({ quotes }: { quotes: SavedQuote[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (format: CopyFormat) => {
    const text = formatQuotesForCopy(quotes, format);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setIsOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const options: { format: CopyFormat; label: string }[] = [
    { format: 'markdown', label: 'Copy as Markdown' },
    { format: 'json', label: 'Copy as JSON' },
    { format: 'quiz', label: 'Quiz Prompt' },
    { format: 'deeper', label: 'Dive Deeper Prompt' },
    { format: 'similarity', label: 'Find Similarities Prompt' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-white transition-colors p-1"
        aria-label="Copy quotes"
      >
        {copied ? (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-gray-800 rounded-lg shadow-lg py-1 min-w-[200px] border border-gray-700">
            {options.map((opt) => (
              <button
                key={opt.format}
                onClick={() => handleCopy(opt.format)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface QuoteListProps {
  quotes: SavedQuote[];
  onDeleteQuote: (id: string) => void;
  onClearAll: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export function QuoteList({ quotes, onDeleteQuote, onClearAll, scrollRef, fontSize, onFontSizeChange }: QuoteListProps) {

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className="text-lg font-semibold text-white">Your Quotes</h1>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/bramses/swote"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Fork on GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
          {quotes.length > 0 && <CopyDropdown quotes={quotes} />}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">A</span>
            <input
              type="range"
              min="12"
              max="20"
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10))}
              className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="text-sm text-gray-400">A</span>
          </div>
          {quotes.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Quote list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {quotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-end pb-8 text-gray-400">
            <p className="text-center text-sm mb-2">
              Swipe (or drag and drop on desktop) up on a book from the carousel to save a quote
            </p>
            <svg
              className="w-8 h-8 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                savedQuote={quote}
                onDelete={() => onDeleteQuote(quote.id)}
                fontSize={fontSize}
              />
            ))}
          </div>
        )}
      </div>

      <ScrollToTop scrollRef={scrollRef} />
    </div>
  );
}
