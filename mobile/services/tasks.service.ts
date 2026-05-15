import { api } from './api';
import type {
  GetWeekTasksResponse, GetBacklogTasksResponse, Task,
  CreateTaskBody, PatchTaskBody, MoveTaskBody, TaskStatusResponse,
} from '@shared/types';

export const tasksService = {
  getWeekTasks: () => api.get<GetWeekTasksResponse>('/tasks/week'),
  getBacklogTasks: () => api.get<GetBacklogTasksResponse>('/tasks/backlog'),
  createTask: (body: CreateTaskBody) => api.post<Task>('/tasks', body),
  updateTask: (id: string, body: PatchTaskBody) => api.patch<Task>(`/tasks/${id}`, body),
  completeTask: (id: string) => api.post<TaskStatusResponse>(`/tasks/${id}/complete`),
  uncompleteTask: (id: string) => api.post<TaskStatusResponse>(`/tasks/${id}/uncomplete`),
  moveTask: (id: string, body: MoveTaskBody) => api.post<Task>(`/tasks/${id}/move`, body),
  deleteTask: (id: string) => api.delete<{ ok: true }>(`/tasks/${id}`),
};
