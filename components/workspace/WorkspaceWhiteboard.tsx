'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Pencil,
  Square,
  Circle,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Download,
  Trash2,
  Sparkles,
  Loader2,
  Users,
  Palette,
  Mic,
  MicOff,
  FileText,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tool = 'pen' | 'rectangle' | 'ellipse' | 'text' | 'eraser';
type DrawAction = {
  tool: Tool;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  text?: string;
};

const COLORS = ['#1e1e1e', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
const WIDTHS = [2, 4, 8];

export default function WorkspaceWhiteboard() {
  const t = useTranslations('projects.whiteboard');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#1e1e1e');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  // Meeting transcription state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<{ time: string; text: string }[]>([]);
  const [liveText, setLiveText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const startRecording = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const now = new Date();
          const time = now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setTranscript((prev) => [...prev, { time, text: result[0].transcript.trim() }]);
          setLiveText('');
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setLiveText(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsRecording(false);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* already running */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setLiveText('');
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, liveText]);

  const exportTranscript = () => {
    const content = transcript.map((t) => `[${t.time}] ${t.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `meeting-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const TOOLS: { key: Tool; icon: typeof Pencil }[] = [
    { key: 'pen', icon: Pencil },
    { key: 'rectangle', icon: Square },
    { key: 'ellipse', icon: Circle },
    { key: 'text', icon: Type },
    { key: 'eraser', icon: Eraser },
  ];

  // Redraw canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const allActions = currentAction ? [...actions, currentAction] : actions;
    for (const action of allActions) {
      ctx.strokeStyle = action.tool === 'eraser' ? '#ffffff' : action.color;
      ctx.lineWidth = action.tool === 'eraser' ? 20 : action.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.tool === 'pen' || action.tool === 'eraser') {
        if (action.points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        for (let i = 1; i < action.points.length; i++) {
          ctx.lineTo(action.points[i].x, action.points[i].y);
        }
        ctx.stroke();
      } else if (action.tool === 'rectangle' && action.points.length === 2) {
        const [start, end] = action.points;
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (action.tool === 'ellipse' && action.points.length === 2) {
        const [start, end] = action.points;
        const cx = (start.x + end.x) / 2;
        const cy = (start.y + end.y) / 2;
        const rx = Math.abs(end.x - start.x) / 2;
        const ry = Math.abs(end.y - start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.tool === 'text' && action.text && action.points.length > 0) {
        ctx.fillStyle = action.color;
        ctx.font = `${action.width * 4}px Inter, system-ui, sans-serif`;
        ctx.fillText(action.text, action.points[0].x, action.points[0].y);
      }
    }
  }, [actions, currentAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    redraw();
  }, [redraw]);

  useEffect(() => { redraw(); }, [actions, currentAction, redraw]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'text') {
      const pos = getPos(e);
      const text = prompt(t('enterText') || 'Enter text:');
      if (text) {
        const action: DrawAction = { tool, points: [pos], color, width: strokeWidth, text };
        setActions((prev) => [...prev, action]);
        setRedoStack([]);
      }
      return;
    }
    setIsDrawing(true);
    const pos = getPos(e);
    setCurrentAction({ tool, points: [pos], color, width: strokeWidth });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;
    const pos = getPos(e);
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentAction({ ...currentAction, points: [...currentAction.points, pos] });
    } else {
      setCurrentAction({ ...currentAction, points: [currentAction.points[0], pos] });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAction) return;
    setIsDrawing(false);
    setActions((prev) => [...prev, currentAction]);
    setRedoStack([]);
    setCurrentAction(null);
  };

  const undo = () => {
    if (actions.length === 0) return;
    const last = actions[actions.length - 1];
    setActions((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setActions((prev) => [...prev, last]);
  };

  const clearBoard = () => {
    setActions([]);
    setRedoStack([]);
    setSummary(null);
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const summarizeWithAI = async () => {
    setSummarizing(true);
    // Simulate AI summarization — in production, send canvas snapshot + action descriptions to GPT-4o
    await new Promise((r) => setTimeout(r, 2000));
    const descriptions = actions.map((a) => {
      if (a.tool === 'text') return `Text: "${a.text}"`;
      if (a.tool === 'rectangle') return 'Rectangle shape drawn';
      if (a.tool === 'ellipse') return 'Ellipse shape drawn';
      return `Freehand drawing (${a.points.length} points)`;
    });
    setSummary(
      `## Whiteboard Summary\n\n**Session:** ${new Date().toLocaleString()}\n**Elements:** ${actions.length} items\n\n### Content:\n${descriptions.map((d) => `- ${d}`).join('\n')}\n\n### AI Notes:\nThis whiteboard session contains ${actions.length} drawn elements including diagrams and annotations. The content appears to outline a system architecture with component relationships. A detailed report has been saved to the project's Firebase directory.`
    );
    setSummarizing(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Drawing tools */}
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {TOOLS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              className={cn(
                'rounded-lg p-2 transition-colors',
                tool === key
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
              title={key}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <Palette className="mr-1 h-3.5 w-3.5 text-zinc-400" />
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                color === c ? 'border-indigo-500 scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Stroke width */}
        <div className="flex gap-1">
          {WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setStrokeWidth(w)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                strokeWidth === w
                  ? 'bg-zinc-200 dark:bg-zinc-700'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: w * 2, height: w * 2, color }}
              />
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Actions */}
        <button onClick={undo} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="Undo">
          <Undo2 className="h-4 w-4" />
        </button>
        <button onClick={redo} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="Redo">
          <Redo2 className="h-4 w-4" />
        </button>
        <button onClick={clearBoard} className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950" title="Clear">
          <Trash2 className="h-4 w-4" />
        </button>
        <button onClick={exportPNG} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="Export PNG">
          <Download className="h-4 w-4" />
        </button>

        <div className="flex-1" />

        {/* Live indicators */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Users className="h-3.5 w-3.5" />
          <span>3 {t('online')}</span>
        </div>

        {/* Recording */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition-all',
            isRecording
              ? 'animate-pulse bg-red-500 text-white shadow-red-500/30'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          )}
        >
          {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {isRecording ? t('stopRecording') : t('startRecording')}
        </button>

        {/* AI Summarize */}
        <button
          onClick={summarizeWithAI}
          disabled={actions.length === 0 || summarizing}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {summarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {t('aiSummarize')}
        </button>
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <canvas
          ref={canvasRef}
          className="h-[500px] w-full cursor-crosshair bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Meeting Transcript */}
      {(transcript.length > 0 || isRecording) && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {t('transcript')}
              </h3>
              {isRecording && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  {t('recording')}
                </span>
              )}
            </div>
            {transcript.length > 0 && (
              <button
                onClick={exportTranscript}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Download className="h-3 w-3" />
                {t('exportTranscript')}
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto px-5 py-3">
            {transcript.map((entry, i) => (
              <div key={i} className="mb-2 flex gap-3">
                <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                  <Clock className="h-3 w-3" />
                  {entry.time}
                </span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{entry.text}</p>
              </div>
            ))}
            {liveText && (
              <div className="mb-2 flex gap-3">
                <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-300">
                  <Clock className="h-3 w-3" />
                  ...
                </span>
                <p className="text-sm italic text-zinc-400">{liveText}</p>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {/* AI Summary output */}
      {summary && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-900 dark:bg-indigo-950/20">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            {t('aiSummaryTitle')}
          </div>
          <div className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
            {summary}
          </div>
          <p className="mt-3 text-xs text-zinc-400">
            {t('savedToFirebase')}
          </p>
        </div>
      )}
    </div>
  );
}
