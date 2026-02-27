"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hexagon, ArrowLeft, LogOut, Copy } from "lucide-react";
import { type Project, type Task, MOCK_USER } from "@/lib/store";
import { TaskBoard } from "@/components/tasks/task-board";
import { ModelVersionsPage } from "@/components/models/model-versions-page";
import { ExportDatasetPage } from "@/components/export/export-dataset-page";
import { ProjectMembersPage } from "@/components/projects/project-members-page";
import { toast } from "sonner";

export function ProjectDashboard({
  project,
  tasks,
  activeTab,
  onChangeTab,
  onOpenCanvas,
  onBack,
  onLogout,
  onTasksCreated,
  isOwner,
}: {
  project: Project;
  tasks: Task[];
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenCanvas: (task: Task) => void;
  onBack: () => void;
  onLogout: () => void;
  onTasksCreated: (tasks: Task[]) => void;
  isOwner: boolean;
}) {
  function copyInviteCode() {
    navigator.clipboard.writeText(project.inviteCode);
    toast.success("Invite code copied to clipboard");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border bg-card shrink-0 border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Projects
            </Button>
            <div className="bg-border h-5 w-px" />
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded">
                <Hexagon className="text-primary-foreground h-4 w-4" />
              </div>
              <h1 className="text-foreground font-semibold">{project.name}</h1>
            </div>
            <button
              onClick={copyInviteCode}
              className="text-muted-foreground bg-secondary hover:text-foreground flex items-center gap-1.5 rounded px-2 py-1 font-mono text-xs transition-colors"
            >
              {project.inviteCode}
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium">
                {MOCK_USER.avatar}
              </div>
              <span className="text-foreground hidden text-sm sm:inline">
                {MOCK_USER.name}
              </span>
              {isOwner && (
                <span className="text-warning bg-warning/15 rounded px-1.5 py-0.5 text-[10px] font-medium">
                  Owner
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-1 flex-col">
        <Tabs
          value={activeTab}
          onValueChange={onChangeTab}
          className="flex flex-1 flex-col"
        >
          <div className="border-border bg-card shrink-0 border-b">
            <div className="mx-auto max-w-7xl px-6">
              <TabsList className="h-12 gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground h-9 rounded-md px-4"
                >
                  Task Board
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground h-9 rounded-md px-4"
                >
                  Model Versions
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground h-9 rounded-md px-4"
                >
                  Export Dataset
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground h-9 rounded-md px-4"
                >
                  Members
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="tasks" className="mt-0 flex-1">
            <TaskBoard
              tasks={tasks}
              projectId={project.id}
              onOpenCanvas={onOpenCanvas}
              onTasksCreated={onTasksCreated}
            />
          </TabsContent>
          <TabsContent value="models" className="mt-0 flex-1">
            <ModelVersionsPage
              projectId={project.id}
              confirmedCount={
                tasks.filter((t) => t.status === "CONFIRMED").length
              }
            />
          </TabsContent>
          <TabsContent value="export" className="mt-0 flex-1">
            <ExportDatasetPage tasks={tasks} />
          </TabsContent>
          <TabsContent value="members" className="mt-0 flex-1">
            <ProjectMembersPage
              projectId={project.id}
              isOwner={isOwner}
              currentUserId={MOCK_USER.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
