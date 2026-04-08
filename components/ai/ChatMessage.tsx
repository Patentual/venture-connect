'use client';

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3', isAssistant ? '' : 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isAssistant
            ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white'
            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
            : 'bg-blue-600 text-white'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <time className={cn(
          'mt-1 block text-xs',
          isAssistant ? 'text-zinc-400 dark:text-zinc-500' : 'text-blue-200'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </time>
      </div>
    </div>
  );
}
