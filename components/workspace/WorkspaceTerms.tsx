'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Banknote,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { loadCompensationTerms, saveCompensationTerms } from '@/app/actions/compensation';

interface WorkspaceTermsProps {
  projectId: string;
  isLeader: boolean;
}

const TEMPLATE = `## Compensation Terms

**Payment structure:** [e.g. Fixed fee / Hourly rate / Revenue share / Equity / Voluntary]

**Rate / amount:** [e.g. $50/hr, $5,000 fixed, 5% equity]

**Payment schedule:** [e.g. Monthly, upon milestone completion, at project end]

**Payment method:** [e.g. Bank transfer, PayPal, Wise, crypto — arranged directly between parties]

**Currency:** [e.g. USD, EUR, AUD]

**Tax obligations:** Each participant is responsible for their own tax obligations in their jurisdiction.

**Additional terms:**
- 

---

*These terms are documented for reference only. VentureNex does not process, facilitate, or guarantee any payments between users. All arrangements are solely between the project leader and team members. See our [Terms of Service](/legal/terms) for full details.*`;

export default function WorkspaceTerms({ projectId, isLeader }: WorkspaceTermsProps) {
  const t = useTranslations('projects');
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCompensationTerms(projectId).then((data) => {
      if (data) {
        setContent(data);
        setSavedContent(data);
      }
    }).finally(() => setLoading(false));
  }, [projectId]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveCompensationTerms(projectId, content);
      setSavedContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }, [projectId, content]);

  const handleUseTemplate = () => {
    setContent(TEMPLATE);
  };

  const hasChanges = content !== savedContent;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Disclaimer banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="text-sm text-amber-800 dark:text-amber-300">
          <p className="font-semibold">Platform Disclaimer</p>
          <p className="mt-1 leading-relaxed">
            VentureNex is a collaboration platform only. It does not process, facilitate, or guarantee payments
            between users. All compensation, employment, and engagement terms are solely between the project
            leader and team members. See our{' '}
            <a href="/legal/terms" className="underline hover:no-underline">Terms of Service</a> (Sections 8 &amp; 9).
          </p>
        </div>
      </div>

      {/* Editor card */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Compensation Terms
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!content && isLeader && (
              <button
                onClick={handleUseTemplate}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <FileText className="h-3.5 w-3.5" />
                Use Template
              </button>
            )}
            {isLeader && (
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                {saved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          {isLeader ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document the compensation terms for this project here. Click 'Use Template' for a starting point."
              rows={16}
              className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          ) : content ? (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {content}
            </pre>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              The project leader has not yet documented compensation terms for this project.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
