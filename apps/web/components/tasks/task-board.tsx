"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Plus,
  Search,
  Upload,
  CheckCircle2,
  Clock,
  FileImage,
  Tag,
  Loader2,
  XCircle,
  RotateCcw,
  X,
} from "lucide-react";
import { type Task, type TaskStatus, type UploadFile } from "@/lib/store";
import { toast } from "sonner";

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; class: string; icon: React.ReactNode }
> = {
  TODO: {
    label: "Todo",
    class: "bg-secondary text-secondary-foreground border-border",
    icon: <Clock className="h-3 w-3" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    class: "bg-primary/15 text-primary border-primary/30",
    icon: <Loader2 className="h-3 w-3" />,
  },
  CONFIRMED: {
    label: "Confirmed",
    class: "bg-teal/15 text-teal border-teal/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
};

export function TaskBoard({
  tasks: initialTasks,
  projectId,
  onOpenCanvas,
  onTasksCreated,
}: {
  tasks: Task[];
  projectId: string;
  onOpenCanvas: (task: Task) => void;
  onTasksCreated: (tasks: Task[]) => void;
}) {
  const [tasks] = useState(initialTasks);
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTasks = [...tasks];

  const filtered = allTasks.filter((t) => {
    const matchesFilter = filter === "ALL" || t.status === filter;
    const matchesSearch = t.fileName
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const confirmedCount = allTasks.filter(
    (t) => t.status === "CONFIRMED",
  ).length;
  const inProgressCount = allTasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const todoCount = allTasks.filter((t) => t.status === "TODO").length;

  function addFiles(fileNames: string[]) {
    const newFiles: UploadFile[] = fileNames.map((name, i) => ({
      id: `uf-${Date.now()}-${i}`,
      name,
      size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
      status: "pending",
      progress: 0,
    }));
    setUploadFiles((prev) => [...prev, ...newFiles]);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files.map((f) => f.name));
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files).map((f) => f.name));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(id: string) {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  }

  const simulateUpload = useCallback(() => {
    if (uploadFiles.length === 0) return;
    setIsUploading(true);

    const fileIds = uploadFiles
      .filter((f) => f.status === "pending" || f.status === "error")
      .map((f) => f.id);
    let completedCount = 0;

    fileIds.forEach((id, index) => {
      // Set uploading
      setTimeout(() => {
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: "uploading" as const, progress: 0 }
              : f,
          ),
        );

        // Progress simulation
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30 + 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);

            // Randomly fail ~15% of uploads for demo
            const willFail = Math.random() < 0.15;
            setUploadFiles((prev) =>
              prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      status: willFail
                        ? ("error" as const)
                        : ("success" as const),
                      progress: 100,
                      error: willFail ? "Network timeout" : undefined,
                    }
                  : f,
              ),
            );
            completedCount++;

            // All done
            if (completedCount === fileIds.length) {
              setIsUploading(false);
            }
          } else {
            setUploadFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, progress } : f)),
            );
          }
        }, 200);
      }, index * 400);
    });
  }, [uploadFiles]);

  function handleRetryFile(id: string) {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: "pending" as const, progress: 0, error: undefined }
          : f,
      ),
    );
  }

  function handleCompleteUpload() {
    const successFiles = uploadFiles.filter((f) => f.status === "success");
    const newTasks: Task[] = successFiles.map((f, i) => ({
      id: `t-${Date.now()}-${i}`,
      projectId,
      fileName: f.name,
      imageUrl: "",
      status: "TODO" as TaskStatus,
      assignee: "",
      annotationCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }));

    onTasksCreated(newTasks);
    toast.success(`${newTasks.length} tasks created`);
    setShowUpload(false);
    setUploadFiles([]);
  }

  const successCount = uploadFiles.filter((f) => f.status === "success").length;
  const errorCount = uploadFiles.filter((f) => f.status === "error").length;
  const pendingCount = uploadFiles.filter((f) => f.status === "pending").length;
  const uploadingCount = uploadFiles.filter(
    (f) => f.status === "uploading",
  ).length;
  const allDone =
    uploadFiles.length > 0 && pendingCount === 0 && uploadingCount === 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-card border-border rounded-lg border p-4">
          <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Todo
          </div>
          <p className="text-foreground text-2xl font-bold">{todoCount}</p>
        </div>
        <div className="bg-card border-border rounded-lg border p-4">
          <div className="text-primary mb-1 flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4" />
            In Progress
          </div>
          <p className="text-foreground text-2xl font-bold">
            {inProgressCount}
          </p>
        </div>
        <div className="bg-card border-border rounded-lg border p-4">
          <div className="text-teal mb-1 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Confirmed
          </div>
          <p className="text-foreground text-2xl font-bold">{confirmedCount}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-input border-border text-foreground pl-9"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as TaskStatus | "ALL")}
        >
          <SelectTrigger className="bg-input border-border text-foreground w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="TODO">Todo</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Images
        </Button>
      </div>

      {/* Task list */}
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-border text-muted-foreground grid grid-cols-[1fr_120px_120px_100px_120px] gap-4 border-b px-4 py-3 text-xs font-medium tracking-wider uppercase">
          <span>File</span>
          <span>Status</span>
          <span>Assignee</span>
          <span>Labels</span>
          <span>Created</span>
        </div>
        {filtered.length === 0 ? (
          <div className="text-muted-foreground px-4 py-12 text-center text-sm">
            No tasks found matching your criteria.
          </div>
        ) : (
          filtered.map((task) => {
            const cfg = STATUS_CONFIG[task.status];
            return (
              <button
                key={task.id}
                onClick={() => onOpenCanvas(task)}
                className="border-border hover:bg-secondary/50 grid w-full grid-cols-[1fr_120px_120px_100px_120px] gap-4 border-b px-4 py-3 text-left transition-colors last:border-b-0"
              >
                <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <FileImage className="text-muted-foreground h-4 w-4 shrink-0" />
                  {task.fileName}
                </span>
                <span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${cfg.class} gap-1`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </Badge>
                </span>
                <span className="text-muted-foreground text-sm">
                  {task.assignee || "Unassigned"}
                </span>
                <span className="text-muted-foreground flex items-center gap-1 text-sm">
                  <Tag className="h-3 w-3" />
                  {task.annotationCount}
                </span>
                <span className="text-muted-foreground text-sm">
                  {task.createdAt}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Bulk Upload Modal */}
      <Dialog
        open={showUpload}
        onOpenChange={(open) => {
          if (!isUploading) {
            setShowUpload(open);
            if (!open) setUploadFiles([]);
          }
        }}
      >
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Bulk Image Upload
            </DialogTitle>
          </DialogHeader>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Drop images here or click to browse"
          >
            <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-foreground mb-1 text-sm font-medium">
              Drag & drop images here
            </p>
            <p className="text-muted-foreground text-xs">
              or click to browse files (JPG, PNG, WEBP)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
              {uploadFiles.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-3 rounded-md border p-2.5 text-xs ${
                    file.status === "error"
                      ? "border-destructive/40 bg-destructive/5"
                      : file.status === "success"
                        ? "border-teal/30 bg-teal/5"
                        : "border-border bg-secondary/30"
                  }`}
                >
                  <FileImage className="text-muted-foreground h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-foreground truncate font-medium">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {file.size}
                      </span>
                    </div>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1" />
                    )}
                    {file.status === "error" && (
                      <span className="text-destructive text-[10px]">
                        {file.error}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {file.status === "success" && (
                      <CheckCircle2 className="text-teal h-4 w-4" />
                    )}
                    {file.status === "uploading" && (
                      <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    )}
                    {file.status === "error" && (
                      <button
                        onClick={() => handleRetryFile(file.id)}
                        className="text-warning hover:text-warning/80"
                        title="Retry"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {file.status === "error" && (
                      <XCircle className="text-destructive h-4 w-4" />
                    )}
                    {file.status === "pending" && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {uploadFiles.length > 0 && (
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span>{uploadFiles.length} file(s)</span>
              {successCount > 0 && (
                <span className="text-teal">{successCount} uploaded</span>
              )}
              {errorCount > 0 && (
                <span className="text-destructive">{errorCount} failed</span>
              )}
              {uploadingCount > 0 && (
                <span className="text-primary">{uploadingCount} uploading</span>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowUpload(false);
                setUploadFiles([]);
              }}
              disabled={isUploading}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            {allDone && successCount > 0 ? (
              <Button
                onClick={handleCompleteUpload}
                className="bg-teal text-teal-foreground hover:bg-teal/90"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Create {successCount} Tasks
              </Button>
            ) : (
              <Button
                onClick={simulateUpload}
                disabled={
                  isUploading ||
                  uploadFiles.filter(
                    (f) => f.status === "pending" || f.status === "error",
                  ).length === 0
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1 h-4 w-4" />
                    Upload All
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
