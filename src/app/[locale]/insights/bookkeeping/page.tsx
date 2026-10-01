import { Metadata } from 'next';
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { locales } from '@/lib/i18n-config';
import BookkeepingContent from './BookkeepingContent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Best Bookkeeping Software for Malta Businesses in 2026 | A4',
  description: "Xero, QuickBooks, Sage, FreshBooks, or Wave? We review the best bookkeeping software for Malta businesses — and explain why software alone isn't enough.",
  openGraph: {
    title: 'Best Bookkeeping Software for Malta Businesses in 2026 | A4',
    description: "Xero, QuickBooks, Sage, FreshBooks, or Wave? We review the best bookkeeping software for Malta businesses — and explain why software alone isn't enough.",
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Bookkeeping Software for Malta Businesses in 2026 | A4',
    description: "Xero, QuickBooks, Sage, FreshBooks, or Wave? We review the best bookkeeping software for Malta businesses — and explain why software alone isn't enough.",
  },
};

import { getRelatedBlogs } from '@/utils/blog';

export default function BookkeepingPage() {
  const relatedBlogs = getRelatedBlogs('bookkeeping', 3);
  return <BookkeepingContent relatedBlogs={relatedBlogs} />;
}
