'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock } from 'lucide-react';

const POSTS = [
  {
    slug: 'ai-project-planning',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop',
    category: 'AI & Automation',
    readTime: '5 min read',
  },
  {
    slug: 'remote-team-management',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=340&fit=crop',
    category: 'Team Building',
    readTime: '7 min read',
  },
  {
    slug: 'nda-best-practices',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=340&fit=crop',
    category: 'Legal',
    readTime: '4 min read',
  },
  {
    slug: 'global-talent-trends',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=340&fit=crop',
    category: 'Industry Insights',
    readTime: '6 min read',
  },
  {
    slug: 'startup-fundraising-guide',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop',
    category: 'Fundraising',
    readTime: '8 min read',
  },
  {
    slug: 'collaboration-tools-2026',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=340&fit=crop',
    category: 'Productivity',
    readTime: '5 min read',
  },
];

export default function BlogPage() {
  const t = useTranslations('blog');

  return (
    <div className="min-h-screen bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Posts grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {POSTS.map((post, i) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <Image
                  src={post.image}
                  alt={t(`posts.${i}.title`)}
                  width={600}
                  height={340}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-white">
                  {t(`posts.${i}.title`)}
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {t(`posts.${i}.excerpt`)}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {t('readMore')} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-10 text-center">
          <h2 className="text-2xl font-bold text-white">{t('newsletterTitle')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80">{t('newsletterSubtitle')}</p>
          <div className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-50">
              {t('subscribe')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
