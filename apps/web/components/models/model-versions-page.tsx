"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Brain,
  Database,
  BarChart3,
  AlertTriangle,
  Globe,
  Layers,
} from "lucide-react";
import { type ModelVersion, MOCK_MODELS } from "@/lib/store";

const STATUS_CONFIG: Record<
  ModelVersion["status"],
  { label: string; class: string; icon: React.ReactNode }
> = {
  QUEUED: {
    label: "Queued",
    class: "bg-secondary text-secondary-foreground border-border",
    icon: <Clock className="h-3 w-3" />,
  },
  RUNNING: {
    label: "Running",
    class: "bg-primary/15 text-primary border-primary/30",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  SUCCESS: {
    label: "Success",
    class: "bg-teal/15 text-teal border-teal/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  FAIL: {
    label: "Failed",
    class: "bg-destructive/15 text-destructive border-destructive/30",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export function ModelVersionsPage({
  projectId,
  confirmedCount,
}: {
  projectId: string;
  confirmedCount: number;
}) {
  const [models, setModels] = useState<ModelVersion[]>(
    MOCK_MODELS.filter((m) => m.projectId === projectId),
  );
  const [selected, setSelected] = useState<string | null>(
    models[0]?.id ?? null,
  );
  const [showTrain, setShowTrain] = useState(false);
  const [trainName, setTrainName] = useState("");
  const [trainBase, setTrainBase] = useState("YOLOv8n");
  const [isTraining, setIsTraining] = useState(false);

  const selectedModel = models.find((m) => m.id === selected);
  const activeModel = models.find((m) => m.isActive);
  const baseModels = models.filter((m) => m.modelType === "base");
  const fineTunedModels = models.filter((m) => m.modelType === "fine-tuned");

  function handleSetActive(id: string) {
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        isActive: m.id === id,
      })),
    );
  }

  function handleTrainNew(e: React.FormEvent) {
    e.preventDefault();
    if (!trainName) return;
    setIsTraining(true);

    const newModel: ModelVersion = {
      id: `m-${Date.now()}`,
      projectId,
      name: trainName,
      baseModel: trainBase,
      status: "QUEUED",
      isActive: false,
      isGlobalDefault: false,
      modelType: "fine-tuned",
      mAP: null,
      trainedAt: new Date().toISOString().split("T")[0],
      confirmedTasksUsed: confirmedCount,
    };

    setModels((prev) => [...prev, newModel]);
    setSelected(newModel.id);

    // Simulate QUEUED -> RUNNING -> SUCCESS
    setTimeout(() => {
      setModels((prev) =>
        prev.map((m) =>
          m.id === newModel.id ? { ...m, status: "RUNNING" } : m,
        ),
      );
      setTimeout(() => {
        setModels((prev) =>
          prev.map((m) =>
            m.id === newModel.id ? { ...m, status: "SUCCESS", mAP: 0.82 } : m,
          ),
        );
        setIsTraining(false);
        setShowTrain(false);
        setTrainName("");
      }, 3000);
    }, 1500);
  }

  return (
    <div className="mx-auto h-full max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Model Versions
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Manage base models, fine-tuned versions, and set the active model
            for AI suggestions
          </p>
        </div>
        <Button
          onClick={() => setShowTrain(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Fine-tune New Model
        </Button>
      </div>

      {/* Active Model Banner */}
      {activeModel && (
        <div className="bg-warning/10 border-warning/20 mb-6 flex items-center gap-3 rounded-lg border p-4">
          <Star className="text-warning fill-warning h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-foreground text-sm font-medium">
              Active Model:{" "}
              <span className="text-warning">{activeModel.name}</span>
            </p>
            <p className="text-muted-foreground text-xs">
              This model is used for AI suggestions across the project
            </p>
          </div>
          {activeModel.mAP !== null && (
            <Badge
              variant="outline"
              className="border-warning/30 text-warning text-xs"
            >
              mAP {activeModel.mAP.toFixed(2)}
            </Badge>
          )}
        </div>
      )}

      <div className="flex h-[calc(100vh-320px)] gap-6">
        {/* Model List */}
        <div className="border-border bg-card flex w-80 shrink-0 flex-col overflow-hidden rounded-lg border">
          {/* Base Models Section */}
          <div className="border-border bg-secondary/30 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Globe className="text-muted-foreground h-3.5 w-3.5" />
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Base Models ({baseModels.length})
              </h3>
            </div>
          </div>
          <div className="border-border flex flex-col gap-1 border-b p-2">
            {baseModels.map((model) => {
              const cfg = STATUS_CONFIG[model.status];
              return (
                <button
                  key={model.id}
                  onClick={() => setSelected(model.id)}
                  className={`w-full rounded-md p-3 text-left transition-colors ${
                    model.id === selected
                      ? "bg-secondary ring-primary/50 ring-1"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    {model.isActive && (
                      <Star className="text-warning fill-warning h-3.5 w-3.5 shrink-0" />
                    )}
                    {model.isGlobalDefault && (
                      <Globe className="text-primary h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="text-foreground truncate text-sm font-medium">
                      {model.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/30 gap-1 text-[10px]"
                    >
                      Base
                    </Badge>
                    {model.isGlobalDefault && (
                      <span className="text-muted-foreground text-[10px]">
                        Global Default
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fine-tuned Section */}
          <div className="border-border bg-secondary/30 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Layers className="text-muted-foreground h-3.5 w-3.5" />
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Fine-tuned ({fineTunedModels.length})
              </h3>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 p-2">
              {fineTunedModels.map((model) => {
                const cfg = STATUS_CONFIG[model.status];
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelected(model.id)}
                    className={`w-full rounded-md p-3 text-left transition-colors ${
                      model.id === selected
                        ? "bg-secondary ring-primary/50 ring-1"
                        : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      {model.isActive && (
                        <Star className="text-warning fill-warning h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="text-foreground truncate text-sm font-medium">
                        {model.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${cfg.class} gap-1`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                      {model.mAP !== null && (
                        <span className="text-muted-foreground text-[10px]">
                          mAP: {model.mAP.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Detail Panel */}
        <div className="border-border bg-card flex-1 overflow-hidden rounded-lg border">
          {selectedModel ? (
            <div className="p-6">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    {selectedModel.isActive && (
                      <Star className="text-warning fill-warning h-4 w-4" />
                    )}
                    {selectedModel.isGlobalDefault && (
                      <Globe className="text-primary h-4 w-4" />
                    )}
                    <h3 className="text-foreground text-lg font-semibold">
                      {selectedModel.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${STATUS_CONFIG[selectedModel.status].class} gap-1`}
                    >
                      {STATUS_CONFIG[selectedModel.status].icon}
                      {STATUS_CONFIG[selectedModel.status].label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        selectedModel.modelType === "base"
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-teal/10 text-teal border-teal/30"
                      }`}
                    >
                      {selectedModel.modelType === "base"
                        ? "Base Model"
                        : "Fine-tuned"}
                    </Badge>
                    {selectedModel.isGlobalDefault && (
                      <Badge
                        variant="outline"
                        className="bg-secondary text-muted-foreground border-border text-xs"
                      >
                        Global Default
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedModel.isActive &&
                    selectedModel.status === "SUCCESS" && (
                      <Button
                        size="sm"
                        onClick={() => handleSetActive(selectedModel.id)}
                        className="bg-warning text-warning-foreground hover:bg-warning/90"
                      >
                        <Star className="mr-1 h-4 w-4" />
                        Set Active
                      </Button>
                    )}
                  {selectedModel.isActive && (
                    <Badge className="bg-warning/15 text-warning border-warning/30">
                      Active Model
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 border-border rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4" />
                    Base Model
                  </div>
                  <p className="text-foreground font-medium">
                    {selectedModel.baseModel}
                  </p>
                </div>
                <div className="bg-secondary/50 border-border rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4" />
                    mAP Score
                  </div>
                  <p className="text-foreground font-medium">
                    {selectedModel.mAP !== null
                      ? selectedModel.mAP.toFixed(3)
                      : selectedModel.modelType === "base"
                        ? "N/A (Base)"
                        : "Pending..."}
                  </p>
                </div>
                <div className="bg-secondary/50 border-border rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Database className="h-4 w-4" />
                    Training Data
                  </div>
                  <p className="text-foreground font-medium">
                    {selectedModel.modelType === "base"
                      ? "Pre-trained (COCO)"
                      : `${selectedModel.confirmedTasksUsed} confirmed tasks`}
                  </p>
                </div>
                <div className="bg-secondary/50 border-border rounded-lg border p-4">
                  <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {selectedModel.modelType === "base"
                      ? "Availability"
                      : "Trained At"}
                  </div>
                  <p className="text-foreground font-medium">
                    {selectedModel.modelType === "base"
                      ? "Auto-assigned on creation"
                      : selectedModel.trainedAt}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Select a model to view details
            </div>
          )}
        </div>
      </div>

      {/* Fine-tune New Model Modal */}
      <Dialog open={showTrain} onOpenChange={setShowTrain}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Fine-tune New Model
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new fine-tuned model from confirmed annotation data
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTrainNew} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Model Name</Label>
              <Input
                placeholder="e.g. YOLOv8n-traffic-v4"
                value={trainName}
                onChange={(e) => setTrainName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">
                Base Model (for fine-tuning)
              </Label>
              <Select value={trainBase} onValueChange={setTrainBase}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="YOLOv8n">YOLOv8n (Nano)</SelectItem>
                  <SelectItem value="YOLOv8s">YOLOv8s (Small)</SelectItem>
                  <SelectItem value="YOLOv8m">YOLOv8m (Medium)</SelectItem>
                  <SelectItem value="YOLOv8l">YOLOv8l (Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-warning/10 border-warning/20 flex items-start gap-2 rounded-md border p-3">
              <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-muted-foreground text-xs">
                Training will use a snapshot of{" "}
                <strong className="text-foreground">{confirmedCount}</strong>{" "}
                CONFIRMED tasks. Only confirmed tasks are included in the
                training dataset.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowTrain(false)}
                className="text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isTraining || !trainName}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isTraining ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Training...
                  </>
                ) : (
                  "Start Fine-tuning"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
