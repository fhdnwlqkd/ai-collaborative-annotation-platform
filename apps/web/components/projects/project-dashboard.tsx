"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Hexagon, ArrowLeft, LogOut, Copy } from "lucide-react"
import { type Project, type Task, MOCK_USER } from "@/lib/store"
import { TaskBoard } from "@/components/tasks/task-board"
import { ModelVersionsPage } from "@/components/models/model-versions-page"
import { ExportDatasetPage } from "@/components/export/export-dataset-page"
import { ProjectMembersPage } from "@/components/projects/project-members-page"
import { toast } from "sonner"

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
  project: Project
  tasks: Task[]
  activeTab: string
  onChangeTab: (tab: string) => void
  onOpenCanvas: (task: Task) => void
  onBack: () => void
  onLogout: () => void
  onTasksCreated: (tasks: Task[]) => void
  isOwner: boolean
}) {
  function copyInviteCode() {
    navigator.clipboard.writeText(project.inviteCode)
    toast.success("Invite code copied to clipboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Projects
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded bg-primary">
                <Hexagon className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="font-semibold text-foreground">{project.name}</h1>
            </div>
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded hover:text-foreground transition-colors"
            >
              {project.inviteCode}
              <Copy className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                {MOCK_USER.avatar}
              </div>
              <span className="text-sm text-foreground hidden sm:inline">{MOCK_USER.name}</span>
              {isOwner && (
                <span className="text-[10px] font-medium text-warning bg-warning/15 px-1.5 py-0.5 rounded">
                  Owner
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={onChangeTab} className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card shrink-0">
            <div className="max-w-7xl mx-auto px-6">
              <TabsList className="bg-transparent h-12 gap-2 p-0">
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground px-4 rounded-md h-9"
                >
                  Task Board
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground px-4 rounded-md h-9"
                >
                  Model Versions
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground px-4 rounded-md h-9"
                >
                  Export Dataset
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="data-[state=active]:bg-secondary data-[state=active]:text-foreground text-muted-foreground px-4 rounded-md h-9"
                >
                  Members
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="tasks" className="flex-1 mt-0">
            <TaskBoard
              tasks={tasks}
              projectId={project.id}
              onOpenCanvas={onOpenCanvas}
              onTasksCreated={onTasksCreated}
            />
          </TabsContent>
          <TabsContent value="models" className="flex-1 mt-0">
            <ModelVersionsPage projectId={project.id} confirmedCount={tasks.filter(t => t.status === "CONFIRMED").length} />
          </TabsContent>
          <TabsContent value="export" className="flex-1 mt-0">
            <ExportDatasetPage tasks={tasks} />
          </TabsContent>
          <TabsContent value="members" className="flex-1 mt-0">
            <ProjectMembersPage 
              projectId={project.id} 
              isOwner={isOwner}
              currentUserId={MOCK_USER.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
