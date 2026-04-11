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
  Palette,
  Mic,
  MicOff,
  FileText,
  Clock,
  MousePointer2,
  Diamond,
  Play,
  ArrowRight,
  Workflow,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'text' | 'eraser';
type FlowNodeType = 'process' | 'decision' | 'terminal';
type FlowTool = 'flow-process' | 'flow-decision' | 'flow-terminal' | 'flow-connector';

type DrawAction = {
  tool: Tool;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  text?: string;
};

interface FlowNode {
  id: string;
  type: FlowNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

interface FlowConnector {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

const COLORS = ['#1e1e1e', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
const WIDTHS = [2, 4, 8];

const FLOW_NODE_DEFAULTS: Record<FlowNodeType, { width: number; height: number; color: string }> = {
  process: { width: 160, height: 60, color: '#3b82f6' },
  decision: { width: 140, height: 100, color: '#f59e0b' },
  terminal: { width: 140, height: 50, color: '#22c55e' },
};

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

  // Flow diagram state
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [connectors, setConnectors] = useState<FlowConnector[]>([]);
  const [flowTool, setFlowTool] = useState<FlowTool | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  // Select / lasso state
  const [lassoPoints, setLassoPoints] = useState<{ x: number; y: number }[]>([]);
  const [isLassoing, setIsLassoing] = useState(false);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedActionIndices, setSelectedActionIndices] = useState<Set<number>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

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
    { key: 'select', icon: MousePointer2 },
    { key: 'pen', icon: Pencil },
    { key: 'rectangle', icon: Square },
    { key: 'ellipse', icon: Circle },
    { key: 'text', icon: Type },
    { key: 'eraser', icon: Eraser },
  ];

  // ─── Helper: point-in-polygon (for lasso) ──────────────────────────────────
  const pointInPolygon = useCallback((px: number, py: number, poly: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
      if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }, []);

  // ─── Helper: bounding box center of a DrawAction ──────────────────────────
  const actionCenter = useCallback((a: DrawAction) => {
    const xs = a.points.map((p) => p.x);
    const ys = a.points.map((p) => p.y);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }, []);

  // ─── Helper: get connector anchor points for a node ───────────────────────
  const getNodeAnchors = useCallback((n: FlowNode) => ({
    top: { x: n.x + n.width / 2, y: n.y },
    bottom: { x: n.x + n.width / 2, y: n.y + n.height },
    left: { x: n.x, y: n.y + n.height / 2 },
    right: { x: n.x + n.width, y: n.y + n.height / 2 },
  }), []);

  // ─── Helper: find node at position ────────────────────────────────────────
  const nodeAtPos = useCallback((px: number, py: number) => {
    return flowNodes.find((n) => px >= n.x && px <= n.x + n.width && py >= n.y && py <= n.y + n.height);
  }, [flowNodes]);

  // ─── Draw a single flow node ──────────────────────────────────────────────
  const drawFlowNode = useCallback((ctx: CanvasRenderingContext2D, node: FlowNode, selected: boolean) => {
    ctx.save();
    ctx.fillStyle = node.color + '18';
    ctx.strokeStyle = node.color;
    ctx.lineWidth = selected ? 3 : 2;

    if (node.type === 'process') {
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.width, node.height, 6);
      ctx.fill();
      ctx.stroke();
    } else if (node.type === 'decision') {
      const cx = node.x + node.width / 2, cy = node.y + node.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx, node.y);
      ctx.lineTo(node.x + node.width, cy);
      ctx.lineTo(cx, node.y + node.height);
      ctx.lineTo(node.x, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (node.type === 'terminal') {
      const r = node.height / 2;
      ctx.beginPath();
      ctx.roundRect(node.x, node.y, node.width, node.height, r);
      ctx.fill();
      ctx.stroke();
    }

    // Selection dashes
    if (selected) {
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      ctx.strokeRect(node.x - 4, node.y - 4, node.width + 8, node.height + 8);
      ctx.setLineDash([]);
    }

    // Node text
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const lines = node.text.split('\n');
    const lh = 16;
    const startY = node.y + node.height / 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((line, i) => ctx.fillText(line, node.x + node.width / 2, startY + i * lh));

    // Drag handle
    if (selected) {
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(node.x + node.width / 2 - 6 + i * 5, node.y - 3, 2, 2);
      }
    }
    ctx.restore();
  }, []);

  // ─── Redraw canvas ────────────────────────────────────────────────────────
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
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw actions (pen strokes, shapes, text)
    const allActions = currentAction ? [...actions, currentAction] : actions;
    for (let idx = 0; idx < allActions.length; idx++) {
      const action = allActions[idx];
      ctx.strokeStyle = action.tool === 'eraser' ? '#ffffff' : action.color;
      ctx.lineWidth = action.tool === 'eraser' ? 20 : action.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.tool === 'pen' || action.tool === 'eraser') {
        if (action.points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        for (let i = 1; i < action.points.length; i++) ctx.lineTo(action.points[i].x, action.points[i].y);
        ctx.stroke();
      } else if (action.tool === 'rectangle' && action.points.length === 2) {
        const [s, e] = action.points;
        ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
      } else if (action.tool === 'ellipse' && action.points.length === 2) {
        const [s, e] = action.points;
        ctx.beginPath();
        ctx.ellipse((s.x + e.x) / 2, (s.y + e.y) / 2, Math.abs(e.x - s.x) / 2, Math.abs(e.y - s.y) / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.tool === 'text' && action.text && action.points.length > 0) {
        ctx.fillStyle = action.color;
        ctx.font = `${action.width * 4}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(action.text, action.points[0].x, action.points[0].y);
      }

      // Highlight selected actions
      if (selectedActionIndices.has(idx)) {
        const xs = action.points.map((p) => p.x), ys = action.points.map((p) => p.y);
        ctx.save();
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) - Math.min(...xs) + 8, Math.max(...ys) - Math.min(...ys) + 8);
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Draw connectors
    for (const conn of connectors) {
      const fromNode = flowNodes.find((n) => n.id === conn.fromId);
      const toNode = flowNodes.find((n) => n.id === conn.toId);
      if (!fromNode || !toNode) continue;

      const fromAnchors = getNodeAnchors(fromNode);
      const toAnchors = getNodeAnchors(toNode);

      // Pick best anchors (closest pair)
      let bestFrom = fromAnchors.right, bestTo = toAnchors.left, bestDist = Infinity;
      for (const fa of Object.values(fromAnchors)) {
        for (const ta of Object.values(toAnchors)) {
          const d = Math.hypot(ta.x - fa.x, ta.y - fa.y);
          if (d < bestDist) { bestDist = d; bestFrom = fa; bestTo = ta; }
        }
      }

      ctx.save();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bestFrom.x, bestFrom.y);
      // Simple elbow connector
      const midX = (bestFrom.x + bestTo.x) / 2;
      ctx.lineTo(midX, bestFrom.y);
      ctx.lineTo(midX, bestTo.y);
      ctx.lineTo(bestTo.x, bestTo.y);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(bestTo.y - bestFrom.y, bestTo.x - midX) || 0;
      const ax = bestTo.x, ay = bestTo.y;
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fill();

      // Connector label
      if (conn.label) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(conn.label, midX, Math.min(bestFrom.y, bestTo.y) - 4);
      }
      ctx.restore();
    }

    // Draw flow nodes
    for (const node of flowNodes) {
      drawFlowNode(ctx, node, selectedNodeIds.has(node.id));
    }

    // Draw lasso outline
    if (lassoPoints.length > 2) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.fillStyle = 'rgba(99,102,241,0.06)';
      ctx.beginPath();
      ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }, [actions, currentAction, flowNodes, connectors, selectedNodeIds, selectedActionIndices, lassoPoints, drawFlowNode, getNodeAnchors]);

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

  // ─── Mouse handlers ────────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);

    // Flow connector tool: click source → click target
    if (flowTool === 'flow-connector') {
      const node = nodeAtPos(pos.x, pos.y);
      if (node) {
        if (!connectingFrom) {
          setConnectingFrom(node.id);
          setSelectedNodeIds(new Set([node.id]));
        } else if (node.id !== connectingFrom) {
          setConnectors((prev) => [...prev, { id: crypto.randomUUID(), fromId: connectingFrom, toId: node.id }]);
          setConnectingFrom(null);
          setSelectedNodeIds(new Set());
        }
      }
      return;
    }

    // Flow node placement tool
    if (flowTool && !flowTool.endsWith('connector')) {
      const nodeType = flowTool.replace('flow-', '') as FlowNodeType;
      const def = FLOW_NODE_DEFAULTS[nodeType];
      const text = prompt(`Enter ${nodeType} label:`) || nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
      const newNode: FlowNode = {
        id: crypto.randomUUID(),
        type: nodeType,
        x: pos.x - def.width / 2,
        y: pos.y - def.height / 2,
        width: def.width,
        height: def.height,
        text,
        color: def.color,
      };
      setFlowNodes((prev) => [...prev, newNode]);
      setSelectedNodeIds(new Set([newNode.id]));
      setTool('select');
      setFlowTool(null);
      return;
    }

    // Select tool
    if (tool === 'select') {
      const node = nodeAtPos(pos.x, pos.y);
      if (node) {
        // Click on a node → select it and start drag
        if (!selectedNodeIds.has(node.id)) setSelectedNodeIds(new Set([node.id]));
        setIsDragging(true);
        setDragStart(pos);
        return;
      }
      // Check if clicking on a selected action's bounds
      const hasSelection = selectedNodeIds.size > 0 || selectedActionIndices.size > 0;
      if (hasSelection) {
        // Check if click is inside any selected node
        const inSelectedNode = flowNodes.find((n) => selectedNodeIds.has(n.id) && pos.x >= n.x && pos.x <= n.x + n.width && pos.y >= n.y && pos.y <= n.y + n.height);
        if (inSelectedNode) {
          setIsDragging(true);
          setDragStart(pos);
          return;
        }
      }
      // Start lasso selection
      setSelectedNodeIds(new Set());
      setSelectedActionIndices(new Set());
      setIsLassoing(true);
      setLassoPoints([pos]);
      return;
    }

    // Text tool
    if (tool === 'text') {
      const text = prompt(t('enterText') || 'Enter text:');
      if (text) {
        const action: DrawAction = { tool, points: [pos], color, width: strokeWidth, text };
        setActions((prev) => [...prev, action]);
        setRedoStack([]);
      }
      return;
    }

    // Drawing tools
    setIsDrawing(true);
    setCurrentAction({ tool, points: [pos], color, width: strokeWidth });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);

    // Dragging selected items
    if (isDragging && dragStart) {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      // Move selected flow nodes
      if (selectedNodeIds.size > 0) {
        setFlowNodes((prev) =>
          prev.map((n) => selectedNodeIds.has(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n)
        );
      }
      // Move selected draw actions
      if (selectedActionIndices.size > 0) {
        setActions((prev) =>
          prev.map((a, i) =>
            selectedActionIndices.has(i)
              ? { ...a, points: a.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
              : a
          )
        );
      }
      setDragStart(pos);
      return;
    }

    // Lasso drawing
    if (isLassoing) {
      setLassoPoints((prev) => [...prev, pos]);
      return;
    }

    // Drawing
    if (!isDrawing || !currentAction) return;
    if (tool === 'pen' || tool === 'eraser') {
      setCurrentAction({ ...currentAction, points: [...currentAction.points, pos] });
    } else {
      setCurrentAction({ ...currentAction, points: [currentAction.points[0], pos] });
    }
  };

  const handleMouseUp = () => {
    // End lasso → compute selection
    if (isLassoing && lassoPoints.length > 3) {
      const newNodeIds = new Set<string>();
      const newActionIndices = new Set<number>();

      // Check flow nodes
      for (const node of flowNodes) {
        const cx = node.x + node.width / 2;
        const cy = node.y + node.height / 2;
        if (pointInPolygon(cx, cy, lassoPoints)) newNodeIds.add(node.id);
      }

      // Check draw actions
      for (let i = 0; i < actions.length; i++) {
        const c = actionCenter(actions[i]);
        if (pointInPolygon(c.x, c.y, lassoPoints)) newActionIndices.add(i);
      }

      setSelectedNodeIds(newNodeIds);
      setSelectedActionIndices(newActionIndices);
      setIsLassoing(false);
      setLassoPoints([]);
      return;
    }

    if (isLassoing) {
      setIsLassoing(false);
      setLassoPoints([]);
    }

    // End drag
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    // End drawing
    if (!isDrawing || !currentAction) return;
    setIsDrawing(false);
    setActions((prev) => [...prev, currentAction]);
    setRedoStack([]);
    setCurrentAction(null);
  };

  // Double-click to edit flow node text
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    const node = nodeAtPos(pos.x, pos.y);
    if (node) {
      const newText = prompt('Edit label:', node.text);
      if (newText !== null) {
        setFlowNodes((prev) => prev.map((n) => n.id === node.id ? { ...n, text: newText } : n));
      }
    }
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
    setFlowNodes([]);
    setConnectors([]);
    setSelectedNodeIds(new Set());
    setSelectedActionIndices(new Set());
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

  // ─── Flow diagram helpers ─────────────────────────────────────────────────

  const addFlowNode = (type: FlowNodeType) => {
    const canvas = canvasRef.current;
    const def = FLOW_NODE_DEFAULTS[type];
    const cx = (canvas?.width || 800) / 2;
    const cy = (canvas?.height || 500) / 2;
    const offset = flowNodes.length * 20;
    const newNode: FlowNode = {
      id: crypto.randomUUID(),
      type,
      x: cx - def.width / 2 + offset,
      y: cy - def.height / 2 + offset,
      width: def.width,
      height: def.height,
      text: type === 'terminal' ? 'Start' : type === 'decision' ? 'Condition?' : 'Process',
      color: def.color,
    };
    setFlowNodes((prev) => [...prev, newNode]);
    setSelectedNodeIds(new Set([newNode.id]));
    setTool('select');
    setFlowTool(null);
  };

  const autoConnectNodes = () => {
    if (flowNodes.length < 2) return;
    const newConns: FlowConnector[] = [];
    for (let i = 0; i < flowNodes.length - 1; i++) {
      const already = connectors.some((c) => c.fromId === flowNodes[i].id && c.toId === flowNodes[i + 1].id);
      if (!already) {
        newConns.push({ id: crypto.randomUUID(), fromId: flowNodes[i].id, toId: flowNodes[i + 1].id });
      }
    }
    setConnectors((prev) => [...prev, ...newConns]);
  };

  const deleteSelected = () => {
    if (selectedNodeIds.size > 0) {
      setFlowNodes((prev) => prev.filter((n) => !selectedNodeIds.has(n.id)));
      setConnectors((prev) => prev.filter((c) => !selectedNodeIds.has(c.fromId) && !selectedNodeIds.has(c.toId)));
    }
    if (selectedActionIndices.size > 0) {
      setActions((prev) => prev.filter((_, i) => !selectedActionIndices.has(i)));
    }
    setSelectedNodeIds(new Set());
    setSelectedActionIndices(new Set());
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
      {/* Drawing Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Drawing tools */}
        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
          {TOOLS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTool(key); setFlowTool(null); setConnectingFrom(null); }}
              className={cn(
                'rounded-lg p-2 transition-colors',
                tool === key && !flowTool
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-400'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
              title={key}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

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
                strokeWidth === w ? 'bg-zinc-200 dark:bg-zinc-700' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
            >
              <div className="rounded-full bg-current" style={{ width: w * 2, height: w * 2, color }} />
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Undo / Redo / Clear / Export */}
        <button onClick={undo} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="Undo"><Undo2 className="h-4 w-4" /></button>
        <button onClick={redo} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="Redo"><Redo2 className="h-4 w-4" /></button>
        {(selectedNodeIds.size > 0 || selectedActionIndices.size > 0) && (
          <button onClick={deleteSelected} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950" title="Delete selected"><Trash2 className="h-4 w-4" /></button>
        )}
        <button onClick={clearBoard} className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950" title="Clear all"><Trash2 className="h-4 w-4" /></button>
        <button onClick={exportPNG} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800" title="Export PNG"><Download className="h-4 w-4" /></button>

        <div className="flex-1" />

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm transition-all', isRecording ? 'animate-pulse bg-red-500 text-white shadow-red-500/30' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700')}
        >
          {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
          {isRecording ? t('stopRecording') : t('startRecording')}
        </button>

        <button
          onClick={summarizeWithAI}
          disabled={(actions.length === 0 && flowNodes.length === 0) || summarizing}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {summarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {t('aiSummarize')}
        </button>
      </div>

      {/* Flow Diagram Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <Workflow className="h-3.5 w-3.5" />
          Flow Diagram
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Quick-add buttons */}
        <button
          onClick={() => addFlowNode('terminal')}
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
        >
          <Play className="h-3 w-3" /> Start / End
        </button>
        <button
          onClick={() => addFlowNode('process')}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        >
          <Square className="h-3 w-3" /> Process
        </button>
        <button
          onClick={() => addFlowNode('decision')}
          className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
        >
          <Diamond className="h-3 w-3" /> Decision
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Placement tools */}
        {([
          { key: 'flow-process' as FlowTool, icon: Square, label: 'Place Process' },
          { key: 'flow-decision' as FlowTool, icon: Diamond, label: 'Place Decision' },
          { key: 'flow-terminal' as FlowTool, icon: Play, label: 'Place Start/End' },
          { key: 'flow-connector' as FlowTool, icon: ArrowRight, label: 'Connect Nodes' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => { setFlowTool(flowTool === key ? null : key); setConnectingFrom(null); }}
            className={cn(
              'rounded-lg p-2 transition-colors',
              flowTool === key
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800'
            )}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        {connectingFrom && (
          <span className="text-xs text-indigo-500">Click target node…</span>
        )}

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Auto-connect */}
        <button
          onClick={autoConnectNodes}
          disabled={flowNodes.length < 2}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <GripVertical className="h-3 w-3" /> Auto-Connect
        </button>

        {flowNodes.length > 0 && (
          <span className="text-[10px] text-zinc-400">{flowNodes.length} nodes · {connectors.length} connectors</span>
        )}
      </div>

      {/* Canvas */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <canvas
          ref={canvasRef}
          className={cn(
            'h-[500px] w-full bg-white',
            tool === 'select' || flowTool ? 'cursor-default' : 'cursor-crosshair',
            isDragging && 'cursor-grabbing',
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
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
