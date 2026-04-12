'use client';

import { useState } from 'react';
import { ChevronDown, ShieldAlert, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAQ_SECTIONS } from '@/lib/faq-data';

export default function FaqPage() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (k: string) => setOpen((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <div className="min-h-screen bg-white py-20 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Frequently Asked Questions</h1>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">Everything you need to know about using VentureNex.</p>

        {FAQ_SECTIONS.map((s, si) => (
          <div key={si} className="mt-10">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{s.title}</h2>
            <div className="mt-4 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {s.items.map((item, qi) => {
                const k = `${si}-${qi}`;
                return (
                  <div key={k}>
                    <button onClick={() => toggle(k)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:text-zinc-50 dark:hover:bg-zinc-800/50">
                      {item.q}
                      <ChevronDown className={cn('ml-3 h-4 w-4 shrink-0 text-zinc-400 transition-transform', open.has(k) && 'rotate-180')} />
                    </button>
                    {open.has(k) && <div className="px-5 pb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-12 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/50 dark:bg-amber-950/30">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold">Important Reminder</p>
            <p className="mt-1 leading-relaxed">VentureNex is a collaboration platform only. All contractual arrangements — employment, compensation, benefits — must be handled outside the platform. VentureNex bears no liability for arrangements or disputes between users.</p>
            <a href="/legal/terms" className="mt-2 inline-flex items-center gap-1 font-medium underline hover:no-underline">Read Terms of Service <ExternalLink className="h-3 w-3" /></a>
          </div>
        </div>
      </div>
    </div>
  );
}
