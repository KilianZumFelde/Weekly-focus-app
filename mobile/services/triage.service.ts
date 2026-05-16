import { api } from './api';
import type { GetTriageResponse, TriageAction, TriageTaskResponse } from '@shared/types';

export const triageService = {
  getTriage: () => api.get<GetTriageResponse>('/tasks/triage'),

  triageTask: (taskId: string, action: TriageAction) =>
    api.post<TriageTaskResponse>(`/tasks/${taskId}/triage`, { action }),
};
