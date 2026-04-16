'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { SectionCard } from '@/components/dashboard/section-card';
import { apiRequest } from '@/lib/api';

type Project = {
  id: string;
  title: string;
  summary: string;
};

type Task = {
  id: string;
  title: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
};

const statuses: Task['status'][] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectForm, setProjectForm] = useState({ title: '', summary: '', tags: 'Impact, Research' });
  const [taskTitle, setTaskTitle] = useState('');

  const loadProjects = async () => {
    const result = await apiRequest<Project[]>('/projects');
    setProjects(result);
    if (!selectedProjectId && result[0]) {
      setSelectedProjectId(result[0].id);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    const loadProject = async () => {
      const project = await apiRequest<{ tasks: Task[] }>(`/projects/${selectedProjectId}`);
      setTasks(project.tasks);
    };

    void loadProject();
  }, [selectedProjectId]);

  const groupedTasks = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        items: tasks.filter((task) => task.status === status)
      })),
    [tasks]
  );

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: projectForm.title,
        summary: projectForm.summary,
        tags: projectForm.tags.split(',').map((value) => value.trim()).filter(Boolean)
      })
    });
    setProjectForm({ title: '', summary: '', tags: 'Impact, Research' });
    await loadProjects();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.36fr_0.64fr]">
      <SectionCard title="Launch a new project" eyebrow="Build">
        <form className="space-y-4" onSubmit={createProject}>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            placeholder="Project title"
            value={projectForm.title}
            onChange={(event) => setProjectForm((current) => ({ ...current, title: event.target.value }))}
          />
          <textarea
            className="min-h-32 w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            placeholder="Project summary"
            value={projectForm.summary}
            onChange={(event) => setProjectForm((current) => ({ ...current, summary: event.target.value }))}
          />
          <input
            className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none"
            placeholder="Tags"
            value={projectForm.tags}
            onChange={(event) => setProjectForm((current) => ({ ...current, tags: event.target.value }))}
          />
          <button className="w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
            Create project
          </button>
        </form>
        <div className="mt-6 space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`w-full rounded-2xl p-4 text-left ${selectedProjectId === project.id ? 'bg-ink text-white' : 'bg-mist text-ink'}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <div className="font-semibold">{project.title}</div>
              <div className="mt-1 text-sm opacity-75">{project.summary}</div>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Kanban board" eyebrow="Execution">
        <form
          className="mb-6 flex gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!selectedProjectId || !taskTitle.trim()) {
              return;
            }

            await apiRequest(`/projects/${selectedProjectId}/tasks`, {
              method: 'POST',
              body: JSON.stringify({ title: taskTitle })
            });
            setTaskTitle('');
            const project = await apiRequest<{ tasks: Task[] }>(`/projects/${selectedProjectId}`);
            setTasks(project.tasks);
          }}
        >
          <input
            className="flex-1 rounded-full border border-ink/10 bg-mist px-5 py-3 outline-none"
            placeholder="Add a task"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
          />
          <button className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white" type="submit">
            Add task
          </button>
        </form>
        <div className="grid gap-4 lg:grid-cols-5">
          {groupedTasks.map((column) => (
            <div key={column.status} className="rounded-3xl bg-mist p-4">
              <h3 className="text-sm font-semibold text-campus">{column.status.replaceAll('_', ' ')}</h3>
              <div className="mt-4 space-y-3">
                {column.items.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="w-full rounded-2xl bg-white px-3 py-3 text-left text-sm text-ink"
                    onClick={async () => {
                      const nextStatus = statuses[(statuses.indexOf(task.status) + 1) % statuses.length];
                      await apiRequest(`/projects/tasks/${task.id}/status`, {
                        method: 'PATCH',
                        body: JSON.stringify({ status: nextStatus })
                      });
                      const project = await apiRequest<{ tasks: Task[] }>(`/projects/${selectedProjectId}`);
                      setTasks(project.tasks);
                    }}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
