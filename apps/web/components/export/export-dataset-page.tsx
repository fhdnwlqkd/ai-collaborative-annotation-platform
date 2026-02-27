"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  CheckCircle2,
  Tag,
  FileImage,
  Database,
  Loader2,
  FileArchive,
} from "lucide-react";
import { type Task } from "@/lib/store";

export function ExportDatasetPage({ tasks }: { tasks: Task[] }) {
  const confirmedTasks = tasks.filter((t) => t.status === "CONFIRMED");
  const totalAnnotations = confirmedTasks.reduce(
    (sum, t) => sum + t.annotationCount,
    0,
  );

  const [showExport, setShowExport] = useState(false);
  const [format, setFormat] = useState("YOLO");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => {
        setShowExport(false);
        setExported(false);
      }, 1500);
    }, 2000);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Export Dataset
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Export confirmed tasks as a training dataset
          </p>
        </div>
        <Button
          onClick={() => setShowExport(true)}
          disabled={confirmedTasks.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Dataset
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-card border-border rounded-lg border p-5">
          <div className="text-teal mb-2 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Confirmed Tasks
          </div>
          <p className="text-foreground text-3xl font-bold">
            {confirmedTasks.length}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            of {tasks.length} total tasks
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-5">
          <div className="text-primary mb-2 flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4" />
            Total Annotations
          </div>
          <p className="text-foreground text-3xl font-bold">
            {totalAnnotations}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            across confirmed tasks
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-5">
          <div className="text-warning mb-2 flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            Default Format
          </div>
          <p className="text-foreground text-3xl font-bold">YOLO</p>
          <p className="text-muted-foreground mt-1 text-xs">
            change during export
          </p>
        </div>
      </div>

      {/* Confirmed Task List */}
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            Included Tasks (Confirmed Only)
          </h3>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground text-xs"
          >
            {confirmedTasks.length} tasks
          </Badge>
        </div>
        {confirmedTasks.length === 0 ? (
          <div className="text-muted-foreground px-4 py-12 text-center text-sm">
            No confirmed tasks available for export. Confirm tasks in the Task
            Board first.
          </div>
        ) : (
          <div className="divide-border divide-y">
            {confirmedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 px-4 py-3">
                <FileImage className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-foreground flex-1 text-sm font-medium">
                  {task.fileName}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {task.annotationCount} annotations
                </span>
                <Badge
                  variant="outline"
                  className="bg-teal/15 text-teal border-teal/30 gap-1 text-[10px]"
                >
                  <CheckCircle2 className="h-3 w-3" />
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
            <DialogTitle className="text-foreground">
              Export Dataset
            </DialogTitle>
          </DialogHeader>

          {!exporting && !exported ? (
            <div className="flex flex-col gap-4">
              <div className="bg-secondary/50 border-border rounded-lg border p-4">
                <p className="text-foreground mb-1 text-sm">Export Summary</p>
                <p className="text-muted-foreground text-xs">
                  {confirmedTasks.length} confirmed tasks with{" "}
                  {totalAnnotations} total annotations
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowExport(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Generate & Download
                </Button>
              </DialogFooter>
            </div>
          ) : exporting ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">
                Generating {format} dataset...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="bg-teal/15 flex h-12 w-12 items-center justify-center rounded-full">
                <FileArchive className="text-teal h-6 w-6" />
              </div>
              <p className="text-foreground text-sm font-medium">
                Download complete!
              </p>
              <p className="text-muted-foreground text-xs">
                dataset_{format.toLowerCase()}.zip
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
