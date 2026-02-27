"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MOCK_MEMBERS, MOCK_USER, type ProjectMember } from "@/lib/store"
import { toast } from "sonner"
import { UserMinus, Loader2, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export function ProjectMembersPage({ 
  projectId, 
  isOwner, 
  currentUserId 
}: { 
  projectId: string
  isOwner: boolean
  currentUserId: string
}) {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      // Sort members: OWNER first, then PARTICIPANT
      const sortedMembers = [...MOCK_MEMBERS].sort((a, b) => {
        if (a.role === "OWNER" && b.role !== "OWNER") return -1
        if (a.role !== "OWNER" && b.role === "OWNER") return 1
        return 0
      })
      setMembers(sortedMembers)
      setIsLoading(isLoading => !isLoading)
    }, 1000)
    return () => clearTimeout(timer)
  }, [projectId])

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    setIsRemoving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Randomly fail for demonstration (optional path mentioned in prompt)
    const shouldFail = Math.random() < 0.1
    
    if (shouldFail) {
      toast.error(`Failed to remove ${memberToRemove.name}. Please try again.`)
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id))
      toast.success(`${memberToRemove.name} has been removed from the project.`)
    }

    setIsRemoving(false)
    setMemberToRemove(null)
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Project Members</h2>
        </div>
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-[80px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Project Members</h2>
          <Badge variant="secondary" className="bg-secondary/50">
            {members.length}
          </Badge>
        </div>
      </div>

      {members.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <User className="w-10 h-10" />
            </EmptyMedia>
            <EmptyTitle>No members found</EmptyTitle>
            <EmptyDescription>There are no members in this project yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined At</TableHead>
                {isOwner && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary border border-primary/20">
                        {member.avatar}
                      </div>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 text-foreground">
                          {member.name}
                          {member.id === currentUserId && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-primary/30 text-primary bg-primary/5">
                              You
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        member.role === "OWNER"
                          ? "bg-warning/15 text-warning border-warning/20"
                          : "bg-secondary/50 text-secondary-foreground border-transparent"
                      }
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.joinedAt}</TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {member.role !== "OWNER" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setMemberToRemove(member)}
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member from project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-semibold text-foreground">{memberToRemove?.name}</span> from the project. 
              They will no longer have access to tasks or model versions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                handleRemoveMember()
              }}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
