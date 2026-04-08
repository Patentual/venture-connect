'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Bot, Loader2, Sparkles, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatMessage from '@/components/ai/ChatMessage';
import ProjectPlanView from '@/components/ai/ProjectPlanView';
import type { Message } from '@/components/ai/ChatMessage';

const MOCK_PLAN = {
  title: 'E-Commerce Platform for Sustainable Fashion',
  summary:
    'A full-stack e-commerce platform with AI-powered recommendations, sustainable supply-chain tracking, and integrated payment processing. The platform targets eco-conscious consumers and features a carbon footprint calculator for each product.',
  estimatedDuration: '16 weeks',
  estimatedBudget: '$85,000 – $120,000',
  phases: [
    {
      name: 'Discovery & Architecture',
      duration: '2 weeks',
      description:
        'Define technical architecture, create wireframes, set up CI/CD pipeline, and establish design system. Conduct stakeholder interviews and competitive analysis.',
      milestones: [
        { title: 'Technical spec approved', description: 'Architecture document signed off by all stakeholders' },
        { title: 'Design system created', description: 'Component library in Figma with brand guidelines' },
        { title: 'CI/CD pipeline live', description: 'Automated testing and deployment configured' },
      ],
      tools: ['Figma', 'GitHub', 'Vercel', 'Notion'],
      materials: ['Brand guidelines', 'Competitor analysis doc'],
    },
    {
      name: 'Core Platform Development',
      duration: '6 weeks',
      description:
        'Build the core e-commerce engine: product catalog, shopping cart, checkout flow, user accounts, and admin dashboard. Implement payment processing with Stripe.',
      milestones: [
        { title: 'Product catalog live', description: 'CRUD operations for products with image uploads' },
        { title: 'Checkout flow complete', description: 'Cart → shipping → payment → confirmation' },
        { title: 'Admin dashboard', description: 'Order management, inventory, and analytics' },
      ],
      tools: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
      materials: ['Product data schema', 'Payment processor credentials'],
    },
    {
      name: 'AI & Sustainability Features',
      duration: '4 weeks',
      description:
        'Integrate AI recommendation engine, build carbon footprint calculator, and implement supply-chain transparency dashboard.',
      milestones: [
        { title: 'AI recommendations', description: 'Personalised product suggestions based on browsing and purchase history' },
        { title: 'Carbon calculator', description: 'Per-product environmental impact score with methodology' },
        { title: 'Supply chain tracker', description: 'Visual journey from raw material to delivery' },
      ],
      tools: ['OpenAI API', 'Python', 'Redis', 'D3.js'],
      materials: ['Sustainability data sources', 'ML training dataset'],
    },
    {
      name: 'Testing, QA & Launch',
      duration: '4 weeks',
      description:
        'End-to-end testing, performance optimisation, security audit, accessibility review, soft launch with beta testers, and production deployment.',
      milestones: [
        { title: 'QA complete', description: 'All critical and major bugs resolved' },
        { title: 'Security audit passed', description: 'Penetration testing and OWASP compliance' },
        { title: 'Production launch', description: 'Go-live with monitoring and alerting' },
      ],
      tools: ['Playwright', 'Lighthouse', 'Sentry', 'Datadog'],
      materials: ['Test plan document', 'Launch checklist'],
    },
  ],
  personnel: [
    {
      role: 'Full-Stack Engineer',
      count: 2,
      skills: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe'],
      phase: 'Core Platform',
      estimatedRate: '$120–160/hr',
    },
    {
      role: 'UI/UX Designer',
      count: 1,
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
      phase: 'Discovery',
      estimatedRate: '$100–140/hr',
    },
    {
      role: 'ML Engineer',
      count: 1,
      skills: ['Python', 'OpenAI API', 'Recommendation Systems', 'Data Pipelines'],
      phase: 'AI Features',
      estimatedRate: '$140–180/hr',
    },
    {
      role: 'QA Engineer',
      count: 1,
      skills: ['Playwright', 'API Testing', 'Accessibility', 'Performance'],
      phase: 'Testing & Launch',
      estimatedRate: '$90–120/hr',
    },
    {
      role: 'DevOps Engineer',
      count: 1,
      skills: ['Vercel', 'Docker', 'CI/CD', 'Monitoring'],
      phase: 'All phases',
      estimatedRate: '$130–160/hr',
    },
  ],
};

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
  const [plan, setPlan] = useState<typeof MOCK_PLAN | null>(null);
  const [showTeamAssembly, setShowTeamAssembly] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, plan]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 2000));

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content:
        'Great project idea! I\'ve analysed your requirements and generated a comprehensive project plan. Here\'s what I\'ve put together:\n\nReview the plan below. You can approve it to start assembling your team, or request changes.',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setPlan(MOCK_PLAN);
    setIsGenerating(false);
  };

  const handleApprove = () => {
    setShowTeamAssembly(true);
    const msg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content:
        'Timeline approved! 🎉\n\nI\'m now searching the Venture Connect directory for professionals matching your project requirements. I\'ll send confidential outreach with NDAs to qualified candidates.\n\nYou\'ll be notified as candidates respond.',
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
