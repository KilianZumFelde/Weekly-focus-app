import { api } from './api';
import type {
  Habit, CreateHabitBody, PatchHabitBody,
  IncrementHabitResponse, HabitStatusResponse,
  DeleteHabitBody, DeleteHabitResponse, UndoDeleteHabitBody,
} from '@shared/types';

export const habitsService = {
  getHabits: () => api.get<Habit[]>('/habits'),
  createHabit: (body: CreateHabitBody) => api.post<Habit>('/habits', body),
  updateHabit: (id: string, body: PatchHabitBody) => api.patch<Habit>(`/habits/${id}`, body),
  incrementCount: (id: string) => api.post<IncrementHabitResponse>(`/habits/${id}/increment`),
  pauseHabit: (id: string) => api.post<HabitStatusResponse>(`/habits/${id}/pause`),
  resumeHabit: (id: string) => api.post<HabitStatusResponse>(`/habits/${id}/resume`),
  deleteHabit: (id: string, body: DeleteHabitBody) => api.delete<DeleteHabitResponse>(`/habits/${id}`, body),
  undoDelete: (id: string, body: UndoDeleteHabitBody) => api.post<HabitStatusResponse>(`/habits/${id}/undo-delete`, body),
};
