"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
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
} from "lucide-react"
import {
  type Task,
  type Project,
  type Annotation,
  type TaskStatus,
  MOCK_ANNOTATIONS,
  MOCK_USER,
  LABEL_COLORS,
  ONLINE_USERS,
} from "@/lib/store"

type CanvasTool = "select" | "bbox" | "polygon" | "pan" | "zoomin" | "zoomout"
type SuggestStatus = "idle" | "queued" | "running" | "ready"

export function CanvasPage({
  task: initialTask,
  project,
  onBack,
  isOwner,
  onTaskUpdated,
}: {
  task: Task
  project: Project
  onBack: () => void
  isOwner: boolean
  onTaskUpdated: (task: Task) => void
}) {
  const [task, setTask] = useState(initialTask)
  const [tool, setTool] = useState<CanvasTool>("select")
  const [annotations, setAnnotations] = useState<Annotation[]>(
    MOCK_ANNOTATIONS.filter((a) => a.taskId === initialTask.id)
  )
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [suggestStatus, setSuggestStatus] = useState<SuggestStatus>("idle")
  const [suggestions, setSuggestions] = useState<Annotation[]>([])
  const [showSuggestionReview, setShowSuggestionReview] = useState(false)
  const [adjustedSuggestions, setAdjustedSuggestions] = useState<Set<string>>(new Set())
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([])

  // Confirm / Reopen modals
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [reopenReason, setReopenReason] = useState("")
  const [showReopenConfirm, setShowReopenConfirm] = useState(false)

  const isLocked = task.status === "CONFIRMED"

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.translate(pan.x, pan.y)
    ctx.scale(zoom, zoom)

    // Background grid
    ctx.fillStyle = "#0F172A"
    ctx.fillRect(0, 0, w / zoom, h / zoom)

    const gridSize = 40
    ctx.strokeStyle = "#1E293B"
    ctx.lineWidth = 0.5
    for (let x = 0; x < w / zoom; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h / zoom)
      ctx.stroke()
    }
    for (let y = 0; y < h / zoom; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w / zoom, y)
      ctx.stroke()
    }

    // Mock image placeholder
    ctx.fillStyle = "#1a2338"
    ctx.fillRect(40, 40, 560, 360)
    ctx.strokeStyle = "#334155"
    ctx.strokeRect(40, 40, 560, 360)
    ctx.fillStyle = "#475569"
    ctx.font = "14px monospace"
    ctx.textAlign = "center"
    ctx.fillText(initialTask.fileName, 320, 225)

    // Draw annotations
    const allAnnotations = [...annotations]
    if (showSuggestionReview) {
      suggestions.forEach((s) => {
        if (selectedSuggestions.has(s.id)) allAnnotations.push(s)
      })
    }

    allAnnotations.forEach((ann) => {
      const isSelected = ann.id === selectedAnnotation
      ctx.strokeStyle = ann.color
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.fillStyle = ann.color + "20"

      if (ann.type === "bbox" && ann.points.length >= 2) {
        const minX = Math.min(...ann.points.map((p) => p.x))
        const minY = Math.min(...ann.points.map((p) => p.y))
        const maxX = Math.max(...ann.points.map((p) => p.x))
        const maxY = Math.max(...ann.points.map((p) => p.y))
        ctx.fillRect(minX, minY, maxX - minX, maxY - minY)
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)

        ctx.fillStyle = ann.color
        const labelText = `${ann.label}${ann.confidence ? ` ${(ann.confidence * 100).toFixed(0)}%` : ""}`
        const textWidth = ctx.measureText(labelText).width + 8
        ctx.fillRect(minX, minY - 20, textWidth, 20)
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "11px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(labelText, minX + 4, minY - 6)
      } else if (ann.type === "polygon" && ann.points.length >= 3) {
        ctx.beginPath()
        ctx.moveTo(ann.points[0].x, ann.points[0].y)
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        const centroidX = ann.points.reduce((s, p) => s + p.x, 0) / ann.points.length
        const centroidY = ann.points.reduce((s, p) => s + p.y, 0) / ann.points.length
        ctx.fillStyle = ann.color
        const labelText = ann.label
        const tw = ctx.measureText(labelText).width + 8
        ctx.fillRect(centroidX - tw / 2, centroidY - 10, tw, 20)
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "11px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(labelText, centroidX, centroidY + 4)
      }
    })

    // Draw current drawing in progress
    if (isDrawing && drawPoints.length > 0) {
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      if (tool === "bbox" && drawPoints.length === 2) {
        const [p1, p2] = drawPoints
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
      } else if (tool === "polygon") {
        ctx.beginPath()
        ctx.moveTo(drawPoints[0].x, drawPoints[0].y)
        for (let i = 1; i < drawPoints.length; i++) {
          ctx.lineTo(drawPoints[i].x, drawPoints[i].y)
        }
        ctx.stroke()
      }
      ctx.setLineDash([])
    }

    // Simulated live cursors
    const cursorPositions = [
      { x: 280, y: 180, user: ONLINE_USERS[1] },
      { x: 420, y: 260, user: ONLINE_USERS[2] },
    ]
    cursorPositions.forEach(({ x, y, user }) => {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 2, y + 14)
      ctx.lineTo(x + 7, y + 10)
      ctx.closePath()
      ctx.fillStyle = user.color
      ctx.fill()
      ctx.fillStyle = user.color
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(user.name, x + 12, y + 14)
    })

    ctx.restore()
  }, [annotations, selectedAnnotation, zoom, pan, suggestions, showSuggestionReview, selectedSuggestions, isDrawing, drawPoints, tool, initialTask.fileName])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      drawCanvas()
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [drawCanvas])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isLocked) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom

    if (tool === "bbox") {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawPoints([{ x, y }])
      } else {
        const start = drawPoints[0]
        const newAnn: Annotation = {
          id: `a-${Date.now()}`,
          taskId: task.id,
          label: Object.keys(LABEL_COLORS)[Math.floor(Math.random() * Object.keys(LABEL_COLORS).length)],
          type: "bbox",
          points: [
            { x: start.x, y: start.y },
            { x, y: start.y },
            { x, y },
            { x: start.x, y },
          ],
          color: Object.values(LABEL_COLORS)[Math.floor(Math.random() * Object.values(LABEL_COLORS).length)],
          createdBy: "Alex Kim",
        }
        setAnnotations((prev) => [...prev, newAnn])
        setIsDrawing(false)
        setDrawPoints([])
      }
    } else if (tool === "polygon") {
      if (!isDrawing) {
        setIsDrawing(true)
        setDrawPoints([{ x, y }])
      } else {
        const first = drawPoints[0]
        const dist = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2)
        if (drawPoints.length >= 3 && dist < 15) {
          const newAnn: Annotation = {
            id: `a-${Date.now()}`,
            taskId: task.id,
            label: Object.keys(LABEL_COLORS)[Math.floor(Math.random() * Object.keys(LABEL_COLORS).length)],
            type: "polygon",
            points: drawPoints,
            color: Object.values(LABEL_COLORS)[Math.floor(Math.random() * Object.values(LABEL_COLORS).length)],
            createdBy: "Alex Kim",
          }
          setAnnotations((prev) => [...prev, newAnn])
          setIsDrawing(false)
          setDrawPoints([])
        } else {
          setDrawPoints((prev) => [...prev, { x, y }])
        }
      }
    } else if (tool === "zoomin") {
      setZoom((z) => Math.min(z + 0.25, 3))
    } else if (tool === "zoomout") {
      setZoom((z) => Math.max(z - 0.25, 0.5))
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isDrawing && tool === "bbox" && drawPoints.length === 1) {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left - pan.x) / zoom
      const y = (e.clientY - rect.top - pan.y) / zoom
      setDrawPoints([drawPoints[0], { x, y }])
    }
  }

  function handleAutoSuggest() {
    setSuggestStatus("queued")
    setTimeout(() => {
      setSuggestStatus("running")
      setTimeout(() => {
        const mockSuggestions: Annotation[] = [
          {
            id: `s-${Date.now()}-1`,
            taskId: task.id,
            label: "car",
            type: "bbox",
            points: [{ x: 100, y: 160 }, { x: 220, y: 160 }, { x: 220, y: 260 }, { x: 100, y: 260 }],
            color: "#0D9488",
            confidence: 0.89,
            createdBy: "AI",
          },
          {
            id: `s-${Date.now()}-2`,
            taskId: task.id,
            label: "person",
            type: "bbox",
            points: [{ x: 340, y: 120 }, { x: 390, y: 120 }, { x: 390, y: 300 }, { x: 340, y: 300 }],
            color: "#3B82F6",
            confidence: 0.76,
            createdBy: "AI",
          },
          {
            id: `s-${Date.now()}-3`,
            taskId: task.id,
            label: "bicycle",
            type: "bbox",
            points: [{ x: 440, y: 200 }, { x: 520, y: 200 }, { x: 520, y: 300 }, { x: 440, y: 300 }],
            color: "#8B5CF6",
            confidence: 0.62,
            createdBy: "AI",
          },
        ]
        setSuggestions(mockSuggestions)
        setSuggestStatus("ready")
        toast.success("AI suggestions ready! Click View to review.")
      }, 2000)
    }, 1000)
  }

  function handleViewSuggestions() {
    setShowSuggestionReview(true)
    setSelectedSuggestions(new Set(suggestions.map((s) => s.id)))
    setAdjustedSuggestions(new Set())
  }

  function handleToggleSuggestion(id: string) {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAdjustSuggestion(id: string) {
    setAdjustedSuggestions((prev) => new Set(prev).add(id))
    toast.info("Bounding box adjusted. Ready to apply.")
  }

  function handleApplySuggestions() {
    const toApply = suggestions.filter(
      (s) => selectedSuggestions.has(s.id) && adjustedSuggestions.has(s.id)
    )
    if (toApply.length === 0) {
      toast.error("You must adjust all selected suggestions before applying.")
      return
    }
    const unadjusted = [...selectedSuggestions].filter(
      (id) => !adjustedSuggestions.has(id)
    )
    if (unadjusted.length > 0) {
      toast.error(`${unadjusted.length} suggestion(s) need adjustment before applying.`)
      return
    }
    setAnnotations((prev) => [...prev, ...toApply])
    setShowSuggestionReview(false)
    setSuggestions([])
    setSuggestStatus("idle")
    setAdjustedSuggestions(new Set())
    setSelectedSuggestions(new Set())
    toast.success(`${toApply.length} annotations added from AI suggestions.`)
  }

  function handleConfirmTask() {
    setShowConfirmModal(true)
  }

  function executeConfirm() {
    const updated: Task = {
      ...task,
      status: "CONFIRMED" as TaskStatus,
      confirmedBy: MOCK_USER.name,
      confirmedAt: new Date().toISOString().split("T")[0],
    }
    setTask(updated)
    onTaskUpdated(updated)
    setShowConfirmModal(false)
    toast.success("Task confirmed and locked.")
  }

  function handleReopenTask() {
    setReopenReason("")
    setShowReopenModal(true)
  }

  function handleReopenSubmit() {
    if (!reopenReason.trim()) {
      toast.error("Please provide a reason for reopening.")
      return
    }
    setShowReopenModal(false)
    setShowReopenConfirm(true)
  }

  function executeReopen() {
    const updated: Task = {
      ...task,
      status: "IN_PROGRESS" as TaskStatus,
      confirmedBy: undefined,
      confirmedAt: undefined,
    }
    setTask(updated)
    onTaskUpdated(updated)
    setShowReopenConfirm(false)
    setReopenReason("")
    toast.success("Task reopened for editing.")
  }

  function handleDeleteAnnotation(id: string) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
    if (selectedAnnotation === id) setSelectedAnnotation(null)
  }

  const TOOLS: { id: CanvasTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: "select", icon: <MousePointer2 className="w-5 h-5" />, label: "Select", shortcut: "V" },
    { id: "bbox", icon: <Square className="w-5 h-5" />, label: "Bounding Box", shortcut: "B" },
    { id: "polygon", icon: <Pentagon className="w-5 h-5" />, label: "Polygon", shortcut: "P" },
    { id: "pan", icon: <Hand className="w-5 h-5" />, label: "Pan", shortcut: "H" },
    { id: "zoomin", icon: <ZoomIn className="w-5 h-5" />, label: "Zoom In", shortcut: "+" },
    { id: "zoomout", icon: <ZoomOut className="w-5 h-5" />, label: "Zoom Out", shortcut: "-" },
  ]

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isLocked) return
      const key = e.key.toLowerCase()
      if (key === "v") setTool("select")
      if (key === "b") setTool("bbox")
      if (key === "p") setTool("polygon")
      if (key === "h") setTool("pan")
      if (key === "escape") { setIsDrawing(false); setDrawPoints([]) }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isLocked])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground h-8">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-foreground">{project.name}</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{task.fileName}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Online users */}
          <div className="flex -space-x-2">
            {ONLINE_USERS.map((u) => (
              <div
                key={u.id}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium border-2 border-card"
                style={{ backgroundColor: u.color, color: "#FFFFFF" }}
                title={u.name}
              >
                {u.avatar}
              </div>
            ))}
          </div>

          {/* Confirmed By info */}
          {isLocked && task.confirmedBy && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
              <User className="w-3 h-3" />
              <span>Confirmed by <strong className="text-foreground">{task.confirmedBy}</strong></span>
              {task.confirmedAt && <span className="text-muted-foreground">on {task.confirmedAt}</span>}
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
            {task.status === "CONFIRMED" ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
            {task.status === "CONFIRMED" ? "Confirmed" : task.status === "IN_PROGRESS" ? "In Progress" : "Todo"}
          </Badge>

          {/* Confirm button - any member can confirm */}
          {!isLocked && (
            <Button
              size="sm"
              onClick={handleConfirmTask}
              className="h-8 bg-teal text-teal-foreground hover:bg-teal/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Confirm Task
            </Button>
          )}

          {/* Reopen button - owner only */}
          {isLocked && isOwner && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReopenTask}
              className="h-8 border-warning/50 text-warning hover:bg-warning/10"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reopen
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-12 border-r border-border bg-card flex flex-col items-center py-2 gap-1 shrink-0">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => !isLocked && setTool(t.id)}
              className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${
                tool === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              title={`${t.label} (${t.shortcut})`}
              disabled={isLocked}
            >
              {t.icon}
            </button>
          ))}
          <div className="mt-auto text-[10px] text-muted-foreground text-center font-mono">
            {Math.round(zoom * 100)}%
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          {isLocked && (
            <div className="absolute inset-0 z-10 bg-background/60 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-2 bg-card border border-teal/30 px-4 py-2 rounded-lg">
                <Lock className="w-4 h-4 text-teal" />
                <span className="text-sm text-foreground font-medium">Task is confirmed and locked</span>
              </div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className={`w-full h-full ${
              tool === "bbox" || tool === "polygon" ? "cursor-crosshair" :
              tool === "pan" ? "cursor-grab" :
              tool === "zoomin" ? "cursor-zoom-in" :
              tool === "zoomout" ? "cursor-zoom-out" : "cursor-default"
            }`}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-72 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
          {/* Annotation List Panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-2.5 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Annotations</h3>
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                {annotations.length}
              </Badge>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 flex flex-col gap-1">
                {annotations.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No annotations yet</p>
                ) : (
                  annotations.map((ann) => (
                    <button
                      key={ann.id}
                      onClick={() => setSelectedAnnotation(ann.id === selectedAnnotation ? null : ann.id)}
                      className={`w-full text-left p-2 rounded-md text-xs flex items-center gap-2 transition-colors ${
                        ann.id === selectedAnnotation
                          ? "bg-secondary ring-1 ring-primary/50"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: ann.color }}
                      />
                      <span className="text-foreground font-medium flex-1">{ann.label}</span>
                      <span className="text-muted-foreground">{ann.type}</span>
                      {!isLocked && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnnotation(ann.id)
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* AI Suggest Panel */}
          <div className="shrink-0 border-t border-teal/30">
            <div className="px-3 py-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal" />
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">AI Suggest</h3>
            </div>
            <div className="px-3 pb-3">
              {suggestStatus === "idle" && (
                <Button
                  size="sm"
                  onClick={handleAutoSuggest}
                  disabled={isLocked}
                  className="w-full h-8 bg-teal text-teal-foreground hover:bg-teal/90 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Auto Suggest
                </Button>
              )}
              {(suggestStatus === "queued" || suggestStatus === "running") && (
                <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {suggestStatus === "queued" ? "QUEUED..." : "RUNNING..."}
                  </span>
                </div>
              )}
              {suggestStatus === "ready" && !showSuggestionReview && (
                <Button
                  size="sm"
                  onClick={handleViewSuggestions}
                  className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View {suggestions.length} Suggestions
                </Button>
              )}
            </div>
          </div>

          {/* Suggestion Review Panel */}
          {showSuggestionReview && (
            <>
              <Separator />
              <div className="shrink-0 border-t border-primary/30">
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Review Suggestions</h3>
                </div>
                <ScrollArea className="max-h-48">
                  <div className="px-3 flex flex-col gap-1.5">
                    {suggestions.map((s) => {
                      const isSelected = selectedSuggestions.has(s.id)
                      const isAdjusted = adjustedSuggestions.has(s.id)
                      return (
                        <div
                          key={s.id}
                          className={`p-2 rounded-md border text-xs flex items-center gap-2 ${
                            isSelected ? "border-primary/50 bg-primary/5" : "border-border bg-secondary/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSuggestion(s.id)}
                            className="accent-primary"
                          />
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="text-foreground font-medium">{s.label}</span>
                          <span className="text-muted-foreground">{((s.confidence ?? 0) * 100).toFixed(0)}%</span>
                          <button
                            onClick={() => handleAdjustSuggestion(s.id)}
                            className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              isAdjusted
                                ? "bg-teal/15 text-teal"
                                : "bg-warning/15 text-warning hover:bg-warning/25"
                            }`}
                          >
                            {isAdjusted ? "Adjusted" : "Adjust"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
                <div className="px-3 py-2.5 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowSuggestionReview(false)
                      setSuggestStatus("idle")
                      setSuggestions([])
                    }}
                    className="h-7 text-xs text-muted-foreground flex-1"
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleApplySuggestions}
                    className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
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
              Are you sure you want to confirm this task? This will lock all annotations and prevent further editing.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <FileIcon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground font-medium">{task.fileName}</p>
                <p className="text-xs text-muted-foreground">{annotations.length} annotation(s)</p>
              </div>
            </div>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Only the <strong className="text-foreground">project owner</strong> can reopen a confirmed task.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)} className="text-muted-foreground">
              Cancel
            </Button>
            <Button onClick={executeConfirm} className="bg-teal text-teal-foreground hover:bg-teal/90">
              <CheckCircle2 className="w-4 h-4 mr-1" />
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
              Provide a reason for reopening this confirmed task. This will unlock editing.
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
            <Button variant="ghost" onClick={() => setShowReopenModal(false)} className="text-muted-foreground">
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
              <AlertTriangle className="w-5 h-5 text-warning" />
              Confirm Reopen
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will change the task status back to IN_PROGRESS and unlock editing for all members.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary/50 rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Reason:</p>
            <p className="text-sm text-foreground">{reopenReason}</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowReopenConfirm(false)} className="text-muted-foreground">
              Cancel
            </Button>
            <Button onClick={executeReopen} className="bg-warning text-warning-foreground hover:bg-warning/90">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reopen Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
