"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Hexagon,
  Plus,
  Users,
  Image as ImageIcon,
  LogOut,
  LinkIcon,
} from "lucide-react"
import { type Project, MOCK_USER } from "@/lib/store"

export function ProjectListPage({
  projects,
  onSelectProject,
  onLogout,
}: {
  projects: Project[]
  onSelectProject: (project: Project) => void
  onLogout: () => void
}) {
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createDesc, setCreateDesc] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createName.trim()) return
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: createName,
      description: createDesc,
      inviteCode: createName.toUpperCase().replace(/\s/g, "-").slice(0, 8) + "-2026",
      createdAt: new Date().toISOString().split("T")[0],
      taskCount: 0,
      memberCount: 1,
      ownerId: MOCK_USER.id,
    }
    setShowCreate(false)
    setCreateName("")
    setCreateDesc("")
    onSelectProject(newProject)
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoinError("")
    const match = projects.find(
      (p) => p.inviteCode.toLowerCase() === joinCode.trim().toLowerCase()
    )
    if (match) {
      setShowJoin(false)
      setJoinCode("")
      onSelectProject(match)
    } else {
      setJoinError("Invalid invite code. Please check and try again.")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Hexagon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LabelForge</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                {MOCK_USER.avatar}
              </div>
              <span className="text-sm text-foreground hidden sm:inline">{MOCK_USER.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a project or create a new one to get started
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowJoin(true)}
              className="border-border text-foreground hover:bg-secondary"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Join Project
            </Button>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => onSelectProject(project)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors text-balance">
                    {project.name}
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded shrink-0 ml-2">
                    {project.inviteCode}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {project.taskCount} tasks
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {project.memberCount} members
                  </span>
                  <span className="ml-auto">{project.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Project Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Project Name</Label>
              <Input
                placeholder="e.g. Urban Traffic Detection"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Description</Label>
              <Textarea
                placeholder="Describe the annotation objectives..."
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                className="bg-input border-border text-foreground resize-none"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="text-muted-foreground">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Project Modal */}
      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Join Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground">Invite Code</Label>
              <Input
                placeholder="e.g. URBAN-2026"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="bg-input border-border text-foreground font-mono"
              />
              {joinError && <p className="text-sm text-destructive">{joinError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowJoin(false)} className="text-muted-foreground">
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Join
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
