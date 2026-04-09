'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  PenTool,
  Eraser,
  Eye,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getInvitation,
  signInvitation,
  declineInvitation,
  type InvitationWithSender,
} from '@/app/actions/nda';

type PageState = 'loading' | 'not_found' | 'review' | 'sign' | 'signed' | 'declined';

export default function NDADetailPage() {
  const t = useTranslations('nda');
  const params = useParams();
  const invitationId = params?.id as string;

  const [invitation, setInvitation] = useState<InvitationWithSender | null>(null);
  const [state, setState] = useState<PageState>('loading');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (!invitationId) { setState('not_found'); return; }
    getInvitation(invitationId).then((inv) => {
      if (!inv) { setState('not_found'); return; }
      setInvitation(inv);
      if (inv.status === 'nda_signed' || inv.status === 'approved') setState('signed');
      else if (inv.status === 'declined' || inv.status === 'rejected') setState('declined');
      else setState('review');
    });
  }, [invitationId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#18181b';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSign = async () => {
    if (!invitation) return;
    setSubmitting(true);
    const canvas = canvasRef.current;
    const signatureData = canvas?.toDataURL('image/png') || '';
    const result = await signInvitation(invitationId, signatureData);
    if (result.success) setState('signed');
    setSubmitting(false);
  };

  const handleDecline = async () => {
    if (!invitation) return;
    setSubmitting(true);
    const result = await declineInvitation(invitationId);
    if (result.success) setState('declined');
    setSubmitting(false);
  };

  if (state === 'loading') {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (state === 'not_found') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <AlertTriangle className="mx-auto h-10 w-10 text-zinc-300" />
        <h1 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Invitation not found</h1>
        <Link href="/nda" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to Invitations</Link>
      </div>
    );
  }

  if (state === 'signed') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          NDA Signed
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          {t('signedSuccess')}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/nda"
            className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Back to Invitations
          </Link>
          {invitation && (
            <Link
              href={`/projects/${invitation.projectId}`}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {t('viewDetails')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (state === 'declined') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <AlertTriangle className="h-8 w-8 text-zinc-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          NDA Declined
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          {t('declinedMessage')}
        </p>
        <Link
          href="/nda"
          className="mt-8 inline-block rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
        >
          Back to Invitations
        </Link>
      </div>
    );
  }

  // Days until expiry (estimate — 14 days from sentAt if no expiresAt)
  const daysLeft = invitation
    ? Math.max(0, Math.ceil((new Date(invitation.sentAt).getTime() + 14 * 86400000 - Date.now()) / 86400000))
    : 14;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/nda"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invitations
      </Link>

      {/* Project info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900">
            <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {invitation?.projectTitle || 'Untitled Project'}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t('roleOffered', { role: invitation?.role || 'Team Member' })} · From {invitation?.senderName || 'Unknown'}
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-950 dark:text-orange-400">
            <Clock className="h-3 w-3" />
            {t('expiresIn', { days: daysLeft })}
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('projectSynopsis')}
          </h3>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {invitation?.projectSynopsis || 'No synopsis provided.'}
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('requiredSkills')}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(invitation?.requiredSkills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Confidential notice */}
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {t('confidentialNotice')}
          </p>
        </div>
      </div>

      {/* NDA Document */}
      {state === 'review' && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <Shield className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {t('title')}
            </h2>
          </div>

          <div className="px-6 py-5">
            {/* Mock NDA content */}
            <div className="prose prose-sm max-w-none text-zinc-600 dark:text-zinc-400">
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                NON-DISCLOSURE AGREEMENT
              </p>
              <p>
                This Non-Disclosure Agreement (&ldquo;Agreement&rdquo;) is entered into between the
                Disclosing Party (Project Creator) and the Receiving Party (You), effective upon
                electronic signature.
              </p>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">1. Confidential Information</p>
              <p>
                &ldquo;Confidential Information&rdquo; means all non-public information disclosed by the
                Disclosing Party, including but not limited to: project specifications, technical
                designs, business plans, financial data, customer lists, trade secrets, and any
                other proprietary information.
              </p>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">2. Obligations</p>
              <p>
                The Receiving Party agrees to: (a) hold all Confidential Information in strict
                confidence; (b) not disclose Confidential Information to any third party without
                prior written consent; (c) use Confidential Information solely for evaluating and
                participating in the Project.
              </p>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">3. Duration</p>
              <p>
                This Agreement shall remain in effect for a period of two (2) years from the date
                of signature, regardless of whether the Receiving Party participates in the Project.
              </p>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">4. Return of Information</p>
              <p>
                Upon termination or upon request, the Receiving Party shall return or destroy all
                Confidential Information and any copies thereof.
              </p>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">5. Remedies</p>
              <p>
                The Receiving Party acknowledges that any breach may cause irreparable harm to the
                Disclosing Party, entitling them to seek injunctive relief in addition to any other
                available remedies.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <button
              onClick={() => setState('sign')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <PenTool className="h-4 w-4" />
              {t('sign')}
            </button>
            <button
              onClick={handleDecline}
              disabled={submitting}
              className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('decline')}
            </button>
          </div>
        </div>
      )}

      {/* Signature pad */}
      {state === 'sign' && (
        <div className="mt-6 rounded-2xl border border-blue-200 bg-white p-6 dark:border-blue-800 dark:bg-zinc-900">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
            <PenTool className="h-5 w-5 text-blue-500" />
            {t('signatureLabel')}
          </h2>

          <div className="relative rounded-xl border-2 border-dashed border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800">
            <canvas
              ref={canvasRef}
              width={600}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full cursor-crosshair"
            />
            <button
              type="button"
              onClick={clearSignature}
              className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              <Eraser className="h-3 w-3" />
              {t('signatureClear')}
            </button>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-zinc-300 text-blue-600"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {t('signatureConfirm')}
            </span>
          </label>

          {/* Legal notice */}
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('legalNotice')}
            </p>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSign}
              disabled={!hasSigned || !confirmed || submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t('sign')}
            </button>
            <button
              onClick={() => setState('review')}
              className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              Back to Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
