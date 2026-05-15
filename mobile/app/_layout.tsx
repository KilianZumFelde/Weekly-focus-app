import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/auth';
import type { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return; // still loading
    if (!session) {
      router.replace('/sign-in');
    }
  }, [session]);

  if (session === undefined) return null; // splash while loading

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="triage" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="coach" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="goal-form" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="themes-management" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="reminders" options={{ presentation: 'fullScreenModal' }} />
      </Stack>
    </>
  );
}
