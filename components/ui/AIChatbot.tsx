'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const KNOWLEDGE_BASE = [
  {
    keywords: ['pricing', 'cost', 'price', 'plan', 'subscription', 'free', 'professional', 'creator', 'enterprise', 'pay', 'charge'],
    answer: 'VentureNex offers 4 plans:\n\n• **Free** ($0) — Basic profile listing, up to 2 active projects\n• **Professional** ($39/mo) — Priority ranking, verified badge, unlimited projects\n• **Creator** ($99/mo) — AI Project Planning, automated team assembly, NDA generation\n• **Enterprise** (Custom) — Unlimited projects, API access, SSO, dedicated account manager\n\nYearly billing saves 20%. Visit the Pricing page for full details.',
  },
  {
    keywords: ['project', 'create project', 'start project', 'new project', 'planner', 'ai planner'],
    answer: 'To create a project:\n\n1. Go to **Dashboard → Projects**\n2. Click **"New Project"**\n3. Use the **AI Project Planner** to scope your idea — it generates timelines, milestones, and team requirements automatically\n4. Once planned, use **Automated Team Assembly** to find and invite the right people\n\nThe AI Planner is available on Creator and Enterprise plans.',
  },
  {
    keywords: ['nda', 'non-disclosure', 'confidential', 'sign', 'agreement'],
    answer: 'VentureNex has built-in NDA management:\n\n• **Generate NDAs** directly from your project workspace\n• **Send NDA invitations** to team members or collaborators\n• **E-sign** — recipients can review and sign digitally\n• **Track status** — see who has signed and who hasn\'t\n\nThis feature is available on Creator and Enterprise plans.',
  },
  {
    keywords: ['profile', 'edit profile', 'account', 'settings', 'photo', 'skills'],
    answer: 'To edit your profile:\n\n1. Go to **Dashboard → Profile**\n2. Fill in your professional details, skills, availability, and rates\n3. Upload a profile photo and portfolio links\n4. Click **Save Profile**\n\nA complete profile increases your visibility in the directory and helps the AI match you with relevant projects.',
  },
  {
    keywords: ['directory', 'search', 'find', 'talent', 'people', 'discover'],
    answer: 'The **Global Directory** lets you search professionals by:\n\n• Skills & expertise\n• Industry\n• Location & timezone\n• Availability status\n• Rate range\n\nUse the search bar and filters on the Directory page to find the right people for your project.',
  },
  {
    keywords: ['recruiter', 'block', 'recruitment', 'headhunter', 'spam'],
    answer: 'VentureNex is designed for direct collaboration, not recruitment.\n\n• **Block Recruiter Contact** — Enable this toggle in your Profile → Availability & Rates to prevent recruiter accounts from contacting you\n• Recruiter accounts are on a premium subscription tier with restricted access\n• Our Terms of Service prohibit unsolicited recruitment activity\n\nIf you receive unwanted recruitment messages, please report them.',
  },
  {
    keywords: ['investor', 'pitch', 'fundraise', 'funding', 'invest', 'pitch deck'],
    answer: '**Investor Connect** is a premium feature that lets you:\n\n• Generate **AI-powered pitch decks** from your project data\n• Create a **Data Room** with verified execution metrics\n• Connect with **verified investors** on the platform\n\nAvailable on Professional and Enterprise plans. Visit Investor Connect from your dashboard.',
  },
  {
    keywords: ['feed', 'post', 'network', 'social', 'update'],
    answer: 'The **Feed** shows posts from your project network — people you collaborate with on projects.\n\n• Share updates, milestones, and insights\n• Your posts are visible to teammates across all your projects\n• It\'s a private network feed, not a public timeline\n\nGo to Dashboard → Feed to start posting.',
  },
  {
    keywords: ['verify', 'verification', 'identity', 'badge', 'verified', '18', 'age'],
    answer: 'VentureNex uses identity verification to ensure trust:\n\n• **Age verification** (18+) is required for all accounts\n• **Verified badge** — Complete your profile to get verified within 24 hours\n• Verified members get **3x more project invitations**\n\nVerification is processed securely through our payment provider.',
  },
  {
    keywords: ['help', 'support', 'contact', 'issue', 'problem', 'bug'],
    answer: 'Need help?\n\n• **Email**: support@venturenex.com\n• **Contact page**: Visit /contact to send us a message\n• **Support hours**: Monday–Friday, 9 AM – 6 PM AEST\n\nWe typically respond within 1–2 business days.',
  },
];

function findBestAnswer(input: string): string {
  const lower = input.toLowerCase();
  let bestMatch = { score: 0, answer: '' };

  for (const entry of KNOWLEDGE_BASE) {
    const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestMatch.score) {
      bestMatch = { score, answer: entry.answer };
    }
  }

  if (bestMatch.score > 0) return bestMatch.answer;

  return "I'm not sure about that. You can reach our support team at **support@venturenex.com** or visit the **Contact** page for help. Is there anything else I can help with?";
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

export default function AIChatbot() {
  const t = useTranslations('chatbot');
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const answer = findBestAnswer(userMsg.content);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* Chat bubble trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40"
          aria-label={t('open')}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
            AI
          </span>
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
                <p className="text-[10px] text-white/70">{t('subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { setOpen(false); setMessages([]); }}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">{t('welcomeTitle')}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-[260px]">{t('welcomeMessage')}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['pricing', 'projects', 'directory', 'support'].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => { setInput(t(`quickTopics.${topic}`)); }}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
                    >
                      {t(`quickTopics.${topic}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2',
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs',
                    msg.role === 'user'
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  )}
                >
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-md'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-bl-md'
                  )}
                >
                  <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  <div
                    className={cn(
                      'mt-1 text-[10px]',
                      msg.role === 'user' ? 'text-white/60' : 'text-zinc-400 dark:text-zinc-500'
                    )}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
