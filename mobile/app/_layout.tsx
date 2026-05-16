import { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/auth';
import { api } from '../services/api';
import type { Session } from '@supabase/supabase-js';
import type { GetTriageResponse } from '@shared/types';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const triageChecked = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;
    if (!session) {
      router.replace('/sign-in');
      return;
    }
    // Run week flip + triage check on first load and on foreground
    void runFlipAndTriageCheck();
  }, [session]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && session) {
        void runFlipAndTriageCheck();
      }
    });
    return () => sub.remove();
  }, [session]);

  const runFlipAndTriageCheck = async () => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await api.post('/internal/week-flip', undefined, { 'X-User-Timezone': timezone });
    } catch {
      // Non-fatal
    }

    try {
      const triage = await api.get<GetTriageResponse>('/tasks/triage');
      if (triage.needsTriage) {
        router.push('/triage');
      }
    } catch {
      // Non-fatal — if triage check fails, app proceeds normally
    }
  };

  if (session === undefined) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="triage" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen name="coach" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="goal-form" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="themes-management" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="reminders" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}
