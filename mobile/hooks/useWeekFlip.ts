import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { api } from '../services/api';

interface WeekFlipResult {
  alreadyFlipped?: boolean;
  currentWeekStart?: string;
  newWeekStart?: string;
  archivedTaskCount?: number;
  streaksUpdated?: number;
}

export function useWeekFlip(onFlipComplete: () => void) {
  const hasChecked = useRef(false);

  const checkAndFlip = async () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      await api.post<WeekFlipResult>('/internal/week-flip', undefined, {
        'X-User-Timezone': timezone,
      });
    } catch {
      // Non-fatal: triage check will still run
    }
    onFlipComplete();
  };

  useEffect(() => {
    // Check on mount
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkAndFlip();
    }

    // Re-check whenever app comes to foreground
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkAndFlip();
      }
    });

    return () => sub.remove();
  }, []);
}
