"use client";

import { useState } from "react";
import { LoginPage } from "@/components/auth/login-page";
import { SignupPage } from "@/components/auth/signup-page";
import { ProjectListPage } from "@/components/projects/project-list-page";
import { ProjectDashboard } from "@/components/projects/project-dashboard";
import { CanvasPage } from "@/components/canvas/canvas-page";
import {
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_USER,
  type Project,
  type Task,
} from "@/lib/store";

export type AppView = "login" | "signup" | "projects" | "dashboard" | "canvas";

export default function App() {
  const [view, setView] = useState<AppView>("login");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [dashboardTab, setDashboardTab] = useState<string>("tasks");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  function handleLogin() {
    setView("projects");
  }

  function handleGoToSignup() {
    setView("signup");
  }

  function handleGoToLogin() {
    setView("login");
  }

  function handleSelectProject(project: Project) {
    setCurrentProject(project);
    setDashboardTab("tasks");
    setView("dashboard");
  }

  function handleOpenCanvas(task: Task) {
    setCurrentTask(task);
    setView("canvas");
  }

  function handleBackToProjects() {
    setCurrentProject(null);
    setView("projects");
  }

  function handleBackToDashboard() {
    setCurrentTask(null);
    setView("dashboard");
  }

  function handleLogout() {
    setCurrentProject(null);
    setCurrentTask(null);
    setView("login");
  }

  function handleTasksCreated(newTasks: Task[]) {
    setTasks((prev) => [...prev, ...newTasks]);
  }

  function handleTaskUpdated(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
    setCurrentTask(updatedTask);
  }

  const isOwner = currentProject
    ? currentProject.ownerId === MOCK_USER.id
    : false;
  const projectTasks = currentProject
    ? tasks.filter((t) => t.projectId === currentProject.id)
    : [];

  switch (view) {
    case "login":
      return (
        <LoginPage onLogin={handleLogin} onGoToSignup={handleGoToSignup} />
      );
    case "signup":
      return (
        <SignupPage onSignup={handleGoToLogin} onGoToLogin={handleGoToLogin} />
      );
    case "projects":
      return (
        <ProjectListPage
          projects={MOCK_PROJECTS}
          onSelectProject={handleSelectProject}
          onLogout={handleLogout}
        />
      );
    case "dashboard":
      return currentProject ? (
        <ProjectDashboard
          project={currentProject}
          tasks={projectTasks}
          activeTab={dashboardTab}
          onChangeTab={setDashboardTab}
          onOpenCanvas={handleOpenCanvas}
          onBack={handleBackToProjects}
          onLogout={handleLogout}
          onTasksCreated={handleTasksCreated}
          isOwner={isOwner}
        />
      ) : null;
    case "canvas":
      return currentTask && currentProject ? (
        <CanvasPage
          task={currentTask}
          project={currentProject}
          onBack={handleBackToDashboard}
          isOwner={isOwner}
          onTaskUpdated={handleTaskUpdated}
        />
      ) : null;
    default:
      return null;
  }
}
