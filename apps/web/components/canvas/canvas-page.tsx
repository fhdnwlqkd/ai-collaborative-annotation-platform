"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  MousePointer2,
  Square,
  Pentagon,
  Hand,
  ZoomIn,
  ZoomOut,
  Sparkles,
  CheckCircle2,
  Lock,
  Trash2,
  Eye,
  Loader2,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  User,
} from "lucide-react";
import {
  type Task,
  type Project,
  type Annotation,
  type TaskStatus,
  MOCK_ANNOTATIONS,
  MOCK_USER,
  LABEL_COLORS,
  ONLINE_USERS,
} from "@/lib/store";

type CanvasTool = "select" | "bbox" | "polygon" | "pan" | "zoomin" | "zoomout";
type SuggestStatus = "idle" | "queued" | "running" | "ready";

export function CanvasPage({
  task: initialTask,
  project,
  onBack,
  isOwner,
  onTaskUpdated,
}: {
  task: Task;
  project: Project;
  onBack: () => void;
  isOwner: boolean;
  onTaskUpdated: (task: Task) => void;
}) {
  const [task, setTask] = useState(initialTask);
  const [tool, setTool] = useState<CanvasTool>("select");
  const [annotations, setAnnotations] = useState<Annotation[]>(
    MOCK_ANNOTATIONS.filter((a) => a.taskId === initialTask.id),
  );
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null,
  );
  const [suggestStatus, setSuggestStatus] = useState<SuggestStatus>("idle");
  const [suggestions, setSuggestions] = useState<Annotation[]>([]);
  const [showSuggestionReview, setShowSuggestionReview] = useState(false);
  const [adjustedSuggestions, setAdjustedSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);

  // Internal Drag State
  const [draggingMode, setDraggingMode] = useState<
    "none" | "move" | "resize" | "vertex" | "pan"
  >("none");
  const [dragStartPos, setDragStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dragStartWorld, setDragStartWorld] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activeHandleIndex, setActiveHandleIndex] = useState<number | null>(
    null,
  );
  const [activeVertexIndex, setActiveVertexIndex] = useState<number | null>(
    null,
  );
  const [initialPoints, setInitialPoints] = useState<
    { x: number; y: number }[] | null
  >(null);

  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left - pan.x) / zoom,
        y: (clientY - rect.top - pan.y) / zoom,
      };
    },
    [pan, zoom],
  );

  const isPointInBBox = (
    p: { x: number; y: number },
    points: { x: number; y: number }[],
  ) => {
    const minX = Math.min(...points.map((pt) => pt.x));
    const minY = Math.min(...points.map((pt) => pt.y));
    const maxX = Math.max(...points.map((pt) => pt.x));
    const maxY = Math.max(...points.map((pt) => pt.y));
    return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  };

  const isPointInPolygon = (
    p: { x: number; y: number },
    points: { x: number; y: number }[],
  ) => {
    let isInside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      if (
        points[i].y > p.y !== points[j].y > p.y &&
        p.x <
          ((points[j].x - points[i].x) * (p.y - points[i].y)) /
            (points[j].y - points[i].y) +
            points[i].x
      ) {
        isInside = !isInside;
      }
    }
    return isInside;
  };

  const getBBoxHandleIdx = (
    worldPos: { x: number; y: number },
    ann: Annotation,
  ) => {
    if (ann.type !== "bbox") return null;
    const minX = Math.min(...ann.points.map((p) => p.x));
    const minY = Math.min(...ann.points.map((p) => p.y));
    const maxX = Math.max(...ann.points.map((p) => p.x));
    const maxY = Math.max(...ann.points.map((p) => p.y));
    const handles = [
      { x: minX, y: minY }, // 0: TL
      { x: maxX, y: minY }, // 1: TR
      { x: maxX, y: maxY }, // 2: BR
      { x: minX, y: maxY }, // 3: BL
    ];
    for (let i = 0; i < handles.length; i++) {
      const h = handles[i];
      const dx = (h.x - worldPos.x) * zoom;
      const dy = (h.y - worldPos.y) * zoom;
      if (Math.sqrt(dx * dx + dy * dy) < 8) return i;
    }
    return null;
  };

  const getPolygonVertexIdx = (
    worldPos: { x: number; y: number },
    ann: Annotation,
  ) => {
    if (ann.type !== "polygon") return null;
    for (let i = 0; i < ann.points.length; i++) {
      const v = ann.points[i];
      const dx = (v.x - worldPos.x) * zoom;
      const dy = (v.y - worldPos.y) * zoom;
      if (Math.sqrt(dx * dx + dy * dy) < 8) return i;
    }
    return null;
  };

  const findHitAnnotation = useCallback(
    (worldPos: { x: number; y: number }) => {
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        if (ann.type === "bbox" && isPointInBBox(worldPos, ann.points))
          return ann.id;
        if (ann.type === "polygon" && isPointInPolygon(worldPos, ann.points))
          return ann.id;
      }
      if (showSuggestionReview) {
        for (let i = suggestions.length - 1; i >= 0; i--) {
          const s = suggestions[i];
          if (!selectedSuggestions.has(s.id)) continue;
          if (s.type === "bbox" && isPointInBBox(worldPos, s.points))
            return s.id;
          if (s.type === "polygon" && isPointInPolygon(worldPos, s.points))
            return s.id;
        }
      }
      return null;
    },
    [annotations, showSuggestionReview, suggestions, selectedSuggestions],
  );

  // Confirm / Reopen modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);

  const isLocked = task.status === "CONFIRMED";

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Background grid
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, w / zoom, h / zoom);

    const gridSize = 40;
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w / zoom; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h / zoom);
      ctx.stroke();
    }
    for (let y = 0; y < h / zoom; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w / zoom, y);
      ctx.stroke();
    }

    // Mock image placeholder
    ctx.fillStyle = "#1a2338";
    ctx.fillRect(40, 40, 560, 360);
    ctx.strokeStyle = "#334155";
    ctx.strokeRect(40, 40, 560, 360);
    ctx.fillStyle = "#475569";
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(initialTask.fileName, 320, 225);

    // Draw annotations
    const allAnnotations = [...annotations];
    if (showSuggestionReview) {
      suggestions.forEach((s) => {
        if (selectedSuggestions.has(s.id)) allAnnotations.push(s);
      });
    }

    allAnnotations.forEach((ann) => {
      const isSelected = ann.id === selectedAnnotation;
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.fillStyle = ann.color + "20";

      if (ann.type === "bbox" && ann.points.length >= 2) {
        const minX = Math.min(...ann.points.map((p) => p.x));
        const minY = Math.min(...ann.points.map((p) => p.y));
        const maxX = Math.max(...ann.points.map((p) => p.x));
        const maxY = Math.max(...ann.points.map((p) => p.y));
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

        ctx.fillStyle = ann.color;
        const labelText = `${ann.label}${ann.confidence ? ` ${(ann.confidence * 100).toFixed(0)}%` : ""}`;
        const textWidth = ctx.measureText(labelText).width + 8;
        ctx.fillRect(minX, minY - 20, textWidth, 20);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(labelText, minX + 4, minY - 6);
      } else if (ann.type === "polygon" && ann.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const centroidX =
          ann.points.reduce((s, p) => s + p.x, 0) / ann.points.length;
        const centroidY =
          ann.points.reduce((s, p) => s + p.y, 0) / ann.points.length;
        ctx.fillStyle = ann.color;
        const labelText = ann.label;
        const tw = ctx.measureText(labelText).width + 8;
        ctx.fillRect(centroidX - tw / 2, centroidY - 10, tw, 20);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(labelText, centroidX, centroidY + 4);
      }

      // Draw handles for selected annotation
      if (isSelected && !isLocked) {
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = 1;
        if (ann.type === "bbox") {
          const minX = Math.min(...ann.points.map((p) => p.x));
          const minY = Math.min(...ann.points.map((p) => p.y));
          const maxX = Math.max(...ann.points.map((p) => p.x));
          const maxY = Math.max(...ann.points.map((p) => p.y));
          const handles = [
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
          ];
          handles.forEach((h) => {
            ctx.beginPath();
            ctx.arc(h.x, h.y, 4 / zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        } else if (ann.type === "polygon") {
          ann.points.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 / zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        }
      }
    });

    // Draw current drawing in progress
    if (isDrawing && drawPoints.length > 0) {
      ctx.strokeStyle = "#3B82F6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      if (tool === "bbox" && drawPoints.length === 2) {
        const [p1, p2] = drawPoints;
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (tool === "polygon") {
        ctx.beginPath();
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
        for (let i = 1; i < drawPoints.length; i++) {
          ctx.lineTo(drawPoints[i].x, drawPoints[i].y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Simulated live cursors
    const cursorPositions = [
      { x: 280, y: 180, user: ONLINE_USERS[1] },
      { x: 420, y: 260, user: ONLINE_USERS[2] },
    ];
    cursorPositions.forEach(({ x, y, user }) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 2, y + 14);
      ctx.lineTo(x + 7, y + 10);
      ctx.closePath();
      ctx.fillStyle = user.color;
      ctx.fill();
      ctx.fillStyle = user.color;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(user.name, x + 12, y + 14);
    });

    ctx.restore();
  }, [
    annotations,
    selectedAnnotation,
    zoom,
    pan,
    suggestions,
    showSuggestionReview,
    selectedSuggestions,
    isDrawing,
    drawPoints,
    tool,
    initialTask.fileName,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      drawCanvas();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isLocked) return;
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const { x, y } = worldPos;

    if (tool === "select") {
      if (selectedAnnotation) {
        const ann = [...annotations, ...suggestions].find(
          (a) => a.id === selectedAnnotation,
        );
        if (ann) {
          const hIdx = getBBoxHandleIdx(worldPos, ann);
          if (hIdx !== null) {
            setDraggingMode("resize");
            setActiveHandleIndex(hIdx);
            setDragStartWorld(worldPos);
            setInitialPoints([...ann.points]);
            return;
          }
          const vIdx = getPolygonVertexIdx(worldPos, ann);
          if (vIdx !== null) {
            setDraggingMode("vertex");
            setActiveVertexIndex(vIdx);
            setDragStartWorld(worldPos);
            setInitialPoints([...ann.points]);
            return;
          }
        }
      }

      const hitId = findHitAnnotation(worldPos);
      if (hitId) {
        setSelectedAnnotation(hitId);
        setDraggingMode("move");
        setDragStartWorld(worldPos);
        const ann = [...annotations, ...suggestions].find(
          (a) => a.id === hitId,
        );
        if (ann) setInitialPoints([...ann.points]);
      } else {
        setSelectedAnnotation(null);
      }
    } else if (tool === "bbox") {
      setIsDrawing(true);
      setDrawPoints([
        { x, y },
        { x, y },
      ]);
    } else if (tool === "polygon") {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawPoints([{ x, y }]);
      } else {
        const first = drawPoints[0];
        const dist = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);
        if (drawPoints.length >= 3 && dist * zoom < 15) {
          const newAnn: Annotation = {
            id: `a-${Date.now()}`,
            taskId: task.id,
            label:
              Object.keys(LABEL_COLORS)[
                Math.floor(Math.random() * Object.keys(LABEL_COLORS).length)
              ],
            type: "polygon",
            points: drawPoints,
            color:
              Object.values(LABEL_COLORS)[
                Math.floor(Math.random() * Object.values(LABEL_COLORS).length)
              ],
            createdBy: "Alex Kim",
          };
          setAnnotations((prev) => [...prev, newAnn]);
          setIsDrawing(false);
          setDrawPoints([]);
        } else {
          setDrawPoints((prev) => [...prev, { x, y }]);
        }
      }
    } else if (tool === "pan") {
      setDraggingMode("pan");
      setDragStartPos({ x: e.clientX, y: e.clientY });
    } else if (tool === "zoomin") {
      setZoom((z) => Math.min(z + 0.25, 3));
    } else if (tool === "zoomout") {
      setZoom((z) => Math.max(z - 0.25, 0.5));
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    const { x, y } = worldPos;

    if (draggingMode === "pan" && dragStartPos) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      setDragStartPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDrawing && tool === "bbox" && drawPoints.length >= 1) {
      setDrawPoints([drawPoints[0], { x, y }]);
      return;
    }

    if (!dragStartWorld || !initialPoints || !selectedAnnotation) return;

    const dx = x - dragStartWorld.x;
    const dy = y - dragStartWorld.y;

    const updateAnnotationPoints = (
      id: string,
      newPoints: { x: number; y: number }[],
    ) => {
      if (annotations.some((a) => a.id === id)) {
        setAnnotations((prev) =>
          prev.map((a) => (a.id === id ? { ...a, points: newPoints } : a)),
        );
      } else if (suggestions.some((s) => s.id === id)) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, points: newPoints } : s)),
        );
        if (!adjustedSuggestions.has(id)) {
          setAdjustedSuggestions((prev) => new Set(prev).add(id));
        }
      }
    };

    if (draggingMode === "move") {
      const newPoints = initialPoints.map((p) => ({
        x: p.x + dx,
        y: p.y + dy,
      }));
      updateAnnotationPoints(selectedAnnotation, newPoints);
    } else if (draggingMode === "vertex" && activeVertexIndex !== null) {
      const newPoints = [...initialPoints];
      newPoints[activeVertexIndex] = {
        x: initialPoints[activeVertexIndex].x + dx,
        y: initialPoints[activeVertexIndex].y + dy,
      };
      updateAnnotationPoints(selectedAnnotation, newPoints);
    } else if (draggingMode === "resize" && activeHandleIndex !== null) {
      const minX = Math.min(...initialPoints.map((p) => p.x));
      const minY = Math.min(...initialPoints.map((p) => p.y));
      const maxX = Math.max(...initialPoints.map((p) => p.x));
      const maxY = Math.max(...initialPoints.map((p) => p.y));

      let newMinX = minX,
        newMinY = minY,
        newMaxX = maxX,
        newMaxY = maxY;

      if (activeHandleIndex === 0) {
        newMinX = minX + dx;
        newMinY = minY + dy;
      } else if (activeHandleIndex === 1) {
        newMaxX = maxX + dx;
        newMinY = minY + dy;
      } else if (activeHandleIndex === 2) {
        newMaxX = maxX + dx;
        newMaxY = maxY + dy;
      } else if (activeHandleIndex === 3) {
        newMinX = minX + dx;
        newMaxY = maxY + dy;
      }

      const pts = [
        { x: newMinX, y: newMinY },
        { x: newMaxX, y: newMinY },
        { x: newMaxX, y: newMaxY },
        { x: newMinX, y: newMaxY },
      ];
      updateAnnotationPoints(selectedAnnotation, pts);
    }
  }

  function handleCanvasMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (tool === "bbox" && isDrawing) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      const start = drawPoints[0];
      if (
        Math.abs(worldPos.x - start.x) * zoom > 5 &&
        Math.abs(worldPos.y - start.y) * zoom > 5
      ) {
        const newAnn: Annotation = {
          id: `a-${Date.now()}`,
          taskId: task.id,
          label:
            Object.keys(LABEL_COLORS)[
              Math.floor(Math.random() * Object.keys(LABEL_COLORS).length)
            ],
          type: "bbox",
          points: [
            { x: start.x, y: start.y },
            { x: worldPos.x, y: start.y },
            { x: worldPos.x, y: worldPos.y },
            { x: start.x, y: worldPos.y },
          ],
          color:
            Object.values(LABEL_COLORS)[
              Math.floor(Math.random() * Object.values(LABEL_COLORS).length)
            ],
          createdBy: "Alex Kim",
        };
        setAnnotations((prev) => [...prev, newAnn]);
      }
      setIsDrawing(false);
      setDrawPoints([]);
    }
    setDraggingMode("none");
    setDragStartPos(null);
    setDragStartWorld(null);
    setActiveHandleIndex(null);
    setActiveVertexIndex(null);
    setInitialPoints(null);
  }

  function handleAutoSuggest() {
    setSuggestStatus("queued");
    setTimeout(() => {
      setSuggestStatus("running");
      setTimeout(() => {
        const mockSuggestions: Annotation[] = [
          {
            id: `s-${Date.now()}-1`,
            taskId: task.id,
            label: "car",
            type: "bbox",
            points: [
              { x: 100, y: 160 },
              { x: 220, y: 160 },
              { x: 220, y: 260 },
              { x: 100, y: 260 },
            ],
            color: "#0D9488",
            confidence: 0.89,
            createdBy: "AI",
          },
          {
            id: `s-${Date.now()}-2`,
            taskId: task.id,
            label: "person",
            type: "bbox",
            points: [
              { x: 340, y: 120 },
              { x: 390, y: 120 },
              { x: 390, y: 300 },
              { x: 340, y: 300 },
            ],
            color: "#3B82F6",
            confidence: 0.76,
            createdBy: "AI",
          },
          {
            id: `s-${Date.now()}-3`,
            taskId: task.id,
            label: "bicycle",
            type: "bbox",
            points: [
              { x: 440, y: 200 },
              { x: 520, y: 200 },
              { x: 520, y: 300 },
              { x: 440, y: 300 },
            ],
            color: "#8B5CF6",
            confidence: 0.62,
            createdBy: "AI",
          },
        ];
        setSuggestions(mockSuggestions);
        setSuggestStatus("ready");
        toast.success("AI suggestions ready! Click View to review.");
      }, 2000);
    }, 1000);
  }

  function handleViewSuggestions() {
    setShowSuggestionReview(true);
    setSelectedSuggestions(new Set(suggestions.map((s) => s.id)));
    setAdjustedSuggestions(new Set());
  }

  function handleToggleSuggestion(id: string) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdjustSuggestion(id: string) {
    setAdjustedSuggestions((prev) => new Set(prev).add(id));
    toast.info("Bounding box adjusted. Ready to apply.");
  }

  function handleApplySuggestions() {
    const toApply = suggestions.filter(
      (s) => selectedSuggestions.has(s.id) && adjustedSuggestions.has(s.id),
    );
    if (toApply.length === 0) {
      toast.error("You must adjust all selected suggestions before applying.");
      return;
    }
    const unadjusted = [...selectedSuggestions].filter(
      (id) => !adjustedSuggestions.has(id),
    );
    if (unadjusted.length > 0) {
      toast.error(
        `${unadjusted.length} suggestion(s) need adjustment before applying.`,
      );
      return;
    }
    setAnnotations((prev) => [...prev, ...toApply]);
    setShowSuggestionReview(false);
    setSuggestions([]);
    setSuggestStatus("idle");
    setAdjustedSuggestions(new Set());
    setSelectedSuggestions(new Set());
    toast.success(`${toApply.length} annotations added from AI suggestions.`);
  }

  function handleConfirmTask() {
    setShowConfirmModal(true);
  }

  function executeConfirm() {
    const updated: Task = {
      ...task,
      status: "CONFIRMED" as TaskStatus,
      confirmedBy: MOCK_USER.name,
      confirmedAt: new Date().toISOString().split("T")[0],
    };
    setTask(updated);
    onTaskUpdated(updated);
    setShowConfirmModal(false);
    toast.success("Task confirmed and locked.");
  }

  function handleReopenTask() {
    setReopenReason("");
    setShowReopenModal(true);
  }

  function handleReopenSubmit() {
    if (!reopenReason.trim()) {
      toast.error("Please provide a reason for reopening.");
      return;
    }
    setShowReopenModal(false);
    setShowReopenConfirm(true);
  }

  function executeReopen() {
    const updated: Task = {
      ...task,
      status: "IN_PROGRESS" as TaskStatus,
      confirmedBy: undefined,
      confirmedAt: undefined,
    };
    setTask(updated);
    onTaskUpdated(updated);
    setShowReopenConfirm(false);
    setReopenReason("");
    toast.success("Task reopened for editing.");
  }

  function handleDeleteAnnotation(id: string) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnotation === id) setSelectedAnnotation(null);
  }

  const TOOLS: {
    id: CanvasTool;
    icon: React.ReactNode;
    label: string;
    shortcut: string;
  }[] = [
    {
      id: "select",
      icon: <MousePointer2 className="h-5 w-5" />,
      label: "Select",
      shortcut: "V",
    },
    {
      id: "bbox",
      icon: <Square className="h-5 w-5" />,
      label: "Bounding Box",
      shortcut: "B",
    },
    {
      id: "polygon",
      icon: <Pentagon className="h-5 w-5" />,
      label: "Polygon",
      shortcut: "P",
    },
    {
      id: "pan",
      icon: <Hand className="h-5 w-5" />,
      label: "Pan",
      shortcut: "H",
    },
    {
      id: "zoomin",
      icon: <ZoomIn className="h-5 w-5" />,
      label: "Zoom In",
      shortcut: "+",
    },
    {
      id: "zoomout",
      icon: <ZoomOut className="h-5 w-5" />,
      label: "Zoom Out",
      shortcut: "-",
    },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isLocked) return;
      const key = e.key.toLowerCase();
      if (key === "v") setTool("select");
      if (key === "b") setTool("bbox");
      if (key === "p") setTool("polygon");
      if (key === "h") setTool("pan");
      if (key === "escape") {
        setIsDrawing(false);
        setDrawPoints([]);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedAnnotation) {
        handleDeleteAnnotation(selectedAnnotation);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, selectedAnnotation]);

  return (
    <div className="bg-background flex h-screen flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="border-border bg-card flex h-12 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground h-8"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="bg-border h-4 w-px" />
          <span className="text-foreground text-sm font-medium">
            {project.name}
          </span>
          <ChevronRight className="text-muted-foreground h-3 w-3" />
          <span className="text-muted-foreground text-sm">{task.fileName}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Online users */}
          <div className="flex -space-x-2">
            {ONLINE_USERS.map((u) => (
              <div
                key={u.id}
                className="border-card flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-medium"
                style={{ backgroundColor: u.color, color: "#FFFFFF" }}
                title={u.name}
              >
                {u.avatar}
              </div>
            ))}
          </div>

          {/* Confirmed By info */}
          {isLocked && task.confirmedBy && (
            <div className="text-muted-foreground bg-secondary flex items-center gap-1.5 rounded px-2 py-1 text-xs">
              <User className="h-3 w-3" />
              <span>
                Confirmed by{" "}
                <strong className="text-foreground">{task.confirmedBy}</strong>
              </span>
              {task.confirmedAt && (
                <span className="text-muted-foreground">
                  on {task.confirmedAt}
                </span>
              )}
            </div>
          )}

          <Badge
            variant="outline"
            className={
              task.status === "CONFIRMED"
                ? "bg-teal/15 text-teal border-teal/30 gap-1"
                : task.status === "IN_PROGRESS"
                  ? "bg-primary/15 text-primary border-primary/30 gap-1"
                  : "bg-secondary text-secondary-foreground border-border gap-1"
            }
          >
            {task.status === "CONFIRMED" ? (
              <Lock className="h-3 w-3" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {task.status === "CONFIRMED"
              ? "Confirmed"
              : task.status === "IN_PROGRESS"
                ? "In Progress"
                : "Todo"}
          </Badge>

          {/* Confirm button - any member can confirm */}
          {!isLocked && (
            <Button
              size="sm"
              onClick={handleConfirmTask}
              className="bg-teal text-teal-foreground hover:bg-teal/90 h-8"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Confirm Task
            </Button>
          )}

          {/* Reopen button - owner only */}
          {isLocked && isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReopenTask}
              className="border-warning/50 text-warning hover:bg-warning/10 h-8"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reopen
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="border-border bg-card flex w-12 shrink-0 flex-col items-center gap-1 border-r py-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => !isLocked && setTool(t.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                tool === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
              title={`${t.label} (${t.shortcut})`}
              disabled={isLocked}
            >
              {t.icon}
            </button>
          ))}
          <div className="text-muted-foreground mt-auto text-center font-mono text-[10px]">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Canvas */}
        <div className="relative flex-1">
          {isLocked && (
            <div className="bg-background/60 pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <div className="bg-card border-teal/30 flex items-center gap-2 rounded-lg border px-4 py-2">
                <Lock className="text-teal h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
                  Task is confirmed and locked
                </span>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className={`h-full w-full ${
              tool === "bbox" || tool === "polygon"
                ? "cursor-crosshair"
                : tool === "pan"
                  ? "cursor-grab"
                  : tool === "zoomin"
                    ? "cursor-zoom-in"
                    : tool === "zoomout"
                      ? "cursor-zoom-out"
                      : "cursor-default"
            }`}
          />
        </div>

        {/* Right Sidebar */}
        <div className="border-border bg-card flex w-72 shrink-0 flex-col overflow-hidden border-l">
          {/* Annotation List Panel */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-border flex shrink-0 items-center justify-between border-b px-3 py-2.5">
              <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                Annotations
              </h3>
              <Badge
                variant="outline"
                className="border-border text-muted-foreground text-[10px]"
              >
                {annotations.length}
              </Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-1 p-2">
                {annotations.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-xs">
                    No annotations yet
                  </p>
                ) : (
                  annotations.map((ann) => (
                    <button
                      key={ann.id}
                      onClick={() =>
                        setSelectedAnnotation(
                          ann.id === selectedAnnotation ? null : ann.id,
                        )
                      }
                      className={`flex w-full items-center gap-2 rounded-md p-2 text-left text-xs transition-colors ${
                        ann.id === selectedAnnotation
                          ? "bg-secondary ring-primary/50 ring-1"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div
                        className="h-3 w-3 shrink-0 rounded-sm"
                        style={{ backgroundColor: ann.color }}
                      />
                      <span className="text-foreground flex-1 font-medium">
                        {ann.label}
                      </span>
                      <span className="text-muted-foreground">{ann.type}</span>
                      {!isLocked && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnnotation(ann.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              handleDeleteAnnotation(ann.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* AI Suggest Panel */}
          <div className="border-teal/30 shrink-0 border-t">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Sparkles className="text-teal h-4 w-4" />
              <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                AI Suggest
              </h3>
            </div>
            <div className="px-3 pb-3">
              {suggestStatus === "idle" && (
                <Button
                  size="sm"
                  onClick={handleAutoSuggest}
                  disabled={isLocked}
                  className="bg-teal text-teal-foreground hover:bg-teal/90 h-8 w-full text-xs"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Auto Suggest
                </Button>
              )}
              {(suggestStatus === "queued" || suggestStatus === "running") && (
                <div className="bg-secondary flex items-center gap-2 rounded-md px-3 py-2">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-xs">
                    {suggestStatus === "queued" ? "QUEUED..." : "RUNNING..."}
                  </span>
                </div>
              )}
              {suggestStatus === "ready" && !showSuggestionReview && (
                <Button
                  size="sm"
                  onClick={handleViewSuggestions}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-full text-xs"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View {suggestions.length} Suggestions
                </Button>
              )}
            </div>
          </div>

          {/* Suggestion Review Panel */}
          {showSuggestionReview && (
            <>
              <Separator />
              <div className="border-primary/30 shrink-0 border-t">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <SlidersHorizontal className="text-primary h-4 w-4" />
                  <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                    Review Suggestions
                  </h3>
                </div>
                <ScrollArea className="max-h-48">
                  <div className="flex flex-col gap-1.5 px-3">
                    {suggestions.map((s) => {
                      const isSelected = selectedSuggestions.has(s.id);
                      const isAdjusted = adjustedSuggestions.has(s.id);
                      return (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 rounded-md border p-2 text-xs ${
                            isSelected
                              ? "border-primary/50 bg-primary/5"
                              : "border-border bg-secondary/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSuggestion(s.id)}
                            className="accent-primary"
                          />
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-foreground font-medium">
                            {s.label}
                          </span>
                          <span className="text-muted-foreground">
                            {((s.confidence ?? 0) * 100).toFixed(0)}%
                          </span>
                          <button
                            onClick={() => handleAdjustSuggestion(s.id)}
                            className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              isAdjusted
                                ? "bg-teal/15 text-teal"
                                : "bg-warning/15 text-warning hover:bg-warning/25"
                            }`}
                          >
                            {isAdjusted ? "Adjusted" : "Adjust"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowSuggestionReview(false);
                      setSuggestStatus("idle");
                      setSuggestions([]);
                    }}
                    className="text-muted-foreground h-7 flex-1 text-xs"
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplySuggestions}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 flex-1 text-xs"
                  >
                    Apply Selected
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm Task Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Confirm Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to confirm this task? This will lock all
              annotations and prevent further editing.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 border-border rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <FileIcon className="text-muted-foreground h-5 w-5" />
              <div>
                <p className="text-foreground text-sm font-medium">
                  {task.fileName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {annotations.length} annotation(s)
                </p>
              </div>
            </div>
          </div>
          <div className="bg-warning/10 border-warning/20 flex items-start gap-2 rounded-md border p-3">
            <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs">
              Only the{" "}
              <strong className="text-foreground">project owner</strong> can
              reopen a confirmed task.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowConfirmModal(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={executeConfirm}
              className="bg-teal text-teal-foreground hover:bg-teal/90"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Task - Reason Modal (Owner Only) */}
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reopen Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Provide a reason for reopening this confirmed task. This will
              unlock editing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Reason for reopening</Label>
            <Textarea
              placeholder="e.g. Missing annotations in the bottom-left quadrant..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="bg-input border-border text-foreground resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowReopenModal(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReopenSubmit}
              disabled={!reopenReason.trim()}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen Confirmation Dialog (Owner Only) */}
      <Dialog open={showReopenConfirm} onOpenChange={setShowReopenConfirm}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="text-warning h-5 w-5" />
              Confirm Reopen
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will change the task status back to IN_PROGRESS and unlock
              editing for all members.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 border-border rounded-lg border p-3">
            <p className="text-muted-foreground mb-1 text-xs">Reason:</p>
            <p className="text-foreground text-sm">{reopenReason}</p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowReopenConfirm(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={executeReopen}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reopen Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
