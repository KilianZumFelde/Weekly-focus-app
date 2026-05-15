import { api } from './api';
import type { Theme, CreateThemeBody, PatchThemeBody, DeleteThemeResponse } from '@shared/types';

export const themesService = {
  getThemes: () => api.get<Theme[]>('/themes'),
  createTheme: (body: CreateThemeBody) => api.post<Theme>('/themes', body),
  updateTheme: (id: string, body: PatchThemeBody) => api.patch<Theme>(`/themes/${id}`, body),
  deleteTheme: (id: string) => api.delete<DeleteThemeResponse>(`/themes/${id}`),
};
