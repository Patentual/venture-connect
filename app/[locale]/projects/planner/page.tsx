'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Bot, Loader2, Sparkles, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createProject } from '@/app/actions/projects';
import ChatMessage from '@/components/ai/ChatMessage';
import ProjectPlanView from '@/components/ai/ProjectPlanView';
import type { Message } from '@/components/ai/ChatMessage';

interface PlanData {
  title: string;
  summary: string;
  estimatedDuration: string;
  estimatedBudget: string;
  phases: {
    name: string;
    duration: string;
    description: string;
    milestones: { title: string; description: string }[];
    tools: string[];
    materials: string[];
  }[];
  personnel: {
    role: string;
    count: number;
    skills: string[];
    phase: string;
    estimatedRate: string;
  }[];
}

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Welcome to the AI Project Planner! 🚀\n\nDescribe your project idea and I\'ll generate a detailed plan with:\n\n• Timeline with phases and milestones\n• Tools and materials needed\n• Personnel requirements with skills\n• Budget estimation\n\nWhat would you like to build?',
  timestamp: new Date(),
};

export default function PlannerPage() {
  const t = useTranslations('ai');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [showTeamAssembly, setShowTeamAssembly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, plan]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);
    setError(null);

    const updatedHistory = [...conversationHistory, { role: 'user', content: userText }];
    setConversationHistory(updatedHistory);

    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.type === 'plan' && data.plan) {
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I\'ve generated a comprehensive project plan based on your requirements. Review it below — you can approve it to start assembling your team, or request changes.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setPlan(data.plan);
        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant', content: JSON.stringify(data) },
        ]);
      } else {
        const content = data.content || data.message || 'I need a bit more information to generate your plan.';
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant', content },
        ]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong';
      setError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!plan) return;
    setShowTeamAssembly(true);

    // Persist project to Firestore
    const allSkills = plan.personnel.flatMap((p) => p.skills);
    const result = await createProject({
      title: plan.title,
      synopsis: plan.summary,
      description: plan.summary,
      industry: 'Technology',
      requiredSkills: [...new Set(allSkills)],
      estimatedDuration: plan.estimatedDuration,
      estimatedBudget: parseFloat(plan.estimatedBudget.replace(/[^0-9.]/g, '')) || undefined,
      budgetCurrency: 'USD',
      timeline: {
        phases: plan.phases.map((phase, i) => ({
          id: `phase-${i}`,
          name: phase.name,
          description: phase.description,
          order: i,
          startDate: '',
          endDate: '',
          milestones: phase.milestones.map((m, j) => ({
            id: `ms-${i}-${j}`,
            phaseId: `phase-${i}`,
            title: m.title,
            description: m.description,
            status: 'pending' as const,
            dueDate: '',
            assigneeIds: [],
          })),
          personnelNeeds: [],
          toolsAndMaterials: [...phase.tools, ...phase.materials],
        })),
        totalDuration: plan.estimatedDuration,
        generatedByAI: true,
      },
    });

    const projectCreated = !('error' in result);
    const msg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: projectCreated
        ? 'Timeline approved and project created! \ud83c\udf89\n\nI\'m now searching the VentureNex directory for professionals matching your project requirements. I\'ll send confidential outreach with NDAs to qualified candidates.\n\nYou\'ll be notified as candidates respond.'
        : `Could not save project: ${'error' in result ? result.error : 'Unknown error'}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
  };

  const handleEdit = () => {
    const msg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        'No problem! What would you like to change about the plan? You can ask me to:\n\n• Adjust the timeline or budget\n• Add or remove phases\n• Change personnel requirements\n• Modify tools or technologies\n\nJust describe what you\'d like different.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, msg]);
    setConversationHistory((prev) => [...prev, { role: 'assistant', content: msg.content }]);
    setPlan(null);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {t('plannerTitle')}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('plannerSubtitle')}
          </p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isGenerating && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {t('generating')}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-1 text-xs text-red-600 underline hover:no-underline dark:text-red-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {plan && !showTeamAssembly && (
            <div className="mt-4">
              <ProjectPlanView plan={plan} onApprove={handleApprove} onEdit={handleEdit} />
            </div>
          )}

          {showTeamAssembly && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
                    {t('searchingDirectory')}
                  </h3>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {t('candidatesFound', { count: 14 })}
                  </p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                {t('sendOutreach')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('inputPlaceholder')}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isGenerating}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
