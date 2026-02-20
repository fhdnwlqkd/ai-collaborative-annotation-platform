"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  CheckCircle2,
  Tag,
  FileImage,
  Database,
  Loader2,
  FileArchive,
} from "lucide-react"
import { type Task } from "@/lib/store"

export function ExportDatasetPage({ tasks }: { tasks: Task[] }) {
  const confirmedTasks = tasks.filter((t) => t.status === "CONFIRMED")
  const totalAnnotations = confirmedTasks.reduce(
    (sum, t) => sum + t.annotationCount,
    0
  )

  const [showExport, setShowExport] = useState(false)
  const [format, setFormat] = useState("YOLO")
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  function handleExport() {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      setExported(true)
      setTimeout(() => {
        setShowExport(false)
        setExported(false)
      }, 1500)
    }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Export Dataset</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Export confirmed tasks as a training dataset
          </p>
        </div>
        <Button
          onClick={() => setShowExport(true)}
          disabled={confirmedTasks.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Dataset
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-sm text-teal mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Confirmed Tasks
          </div>
          <p className="text-3xl font-bold text-foreground">{confirmedTasks.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            of {tasks.length} total tasks
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-sm text-primary mb-2">
            <Tag className="w-4 h-4" />
            Total Annotations
          </div>
          <p className="text-3xl font-bold text-foreground">{totalAnnotations}</p>
          <p className="text-xs text-muted-foreground mt-1">
            across confirmed tasks
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-sm text-warning mb-2">
            <Database className="w-4 h-4" />
            Default Format
          </div>
          <p className="text-3xl font-bold text-foreground">YOLO</p>
          <p className="text-xs text-muted-foreground mt-1">
            change during export
          </p>
        </div>
      </div>

      {/* Confirmed Task List */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Included Tasks (Confirmed Only)
          </h3>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            {confirmedTasks.length} tasks
          </Badge>
        </div>
        {confirmedTasks.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground text-sm">
            No confirmed tasks available for export. Confirm tasks in the Task Board first.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {confirmedTasks.map((task) => (
              <div
                key={task.id}
                className="px-4 py-3 flex items-center gap-4"
              >
                <FileImage className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground font-medium flex-1">
                  {task.fileName}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {task.annotationCount} annotations
                </span>
                <Badge variant="outline" className="bg-teal/15 text-teal border-teal/30 text-[10px] gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Confirmed
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Modal */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Export Dataset</DialogTitle>
          </DialogHeader>

          {!exporting && !exported ? (
            <div className="flex flex-col gap-4">
              <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground mb-1">Export Summary</p>
                <p className="text-xs text-muted-foreground">
                  {confirmedTasks.length} confirmed tasks with {totalAnnotations} total annotations
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="YOLO">YOLO Format</SelectItem>
                    <SelectItem value="COCO">COCO JSON</SelectItem>
                    <SelectItem value="VOC">Pascal VOC XML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setShowExport(false)} className="text-muted-foreground">
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Generate & Download
                </Button>
              </DialogFooter>
            </div>
          ) : exporting ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating {format} dataset...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-12 h-12 rounded-full bg-teal/15 flex items-center justify-center">
                <FileArchive className="w-6 h-6 text-teal" />
              </div>
              <p className="text-sm text-foreground font-medium">Download complete!</p>
              <p className="text-xs text-muted-foreground">dataset_{format.toLowerCase()}.zip</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
