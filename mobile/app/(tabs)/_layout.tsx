import { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { MicButton } from '../../components/capture/MicButton';
import { DraftCard } from '../../components/capture/DraftCard';
import { RecordingSheet } from '../../components/capture/RecordingSheet';
import { UndoSnackbar } from '../../components/shared/UndoSnackbar';
import { aiService } from '../../services/ai.service';
import { themesService } from '../../services/themes.service';
import { tasksService } from '../../services/tasks.service';
import { habitsService } from '../../services/habits.service';
import type { DraftItem, Theme } from '@shared/types';

const ACTIVE_COLOR = '#BF5B45';
const INACTIVE_COLOR = '#6B6B6B';
const TAB_BG = '#1A1A1A';

const CANCEL_PHRASES = /scratch that|start over|cancel that|never mind/i;

type CaptureState = 'idle' | 'recording' | 'processing' | 'drafting';

export default function TabsLayout() {
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [speechDetected, setSpeechDetected] = useState(false);
  const [undoLabel, setUndoLabel] = useState('');
  const [undoCallback, setUndoCallback] = useState<(() => void) | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const captureStateRef = useRef<CaptureState>('idle');
  const resultReceivedRef = useRef(false);

  const _setCaptureState = (s: CaptureState) => {
    captureStateRef.current = s;
    setCaptureState(s);
  };

  useEffect(() => {
    themesService.getThemes().then(setThemes).catch(() => {});
  }, []);

  // ─── Speech recognition events ───────────────────────────────────────────

  useSpeechRecognitionEvent('start', () => {
    resultReceivedRef.current = false;
    setSpeechDetected(false);
  });

  useSpeechRecognitionEvent('result', event => {
    const transcript = event.results[0]?.transcript ?? '';

    if (!event.isFinal) {
      setSpeechDetected(true);
      setPartialTranscript(transcript);
      if (CANCEL_PHRASES.test(transcript)) {
        ExpoSpeechRecognitionModule.stop();
        _setCaptureState('idle');
        setPartialTranscript('');
      }
      return;
    }

    resultReceivedRef.current = true;
    setSpeechDetected(false);
    setPartialTranscript('');

    if (!transcript.trim()) {
      openEmptyDraft();
      return;
    }
    void handleTranscript(transcript);
  });

  useSpeechRecognitionEvent('end', () => {
    if (!resultReceivedRef.current && captureStateRef.current !== 'idle') {
      openEmptyDraft();
    }
  });

  useSpeechRecognitionEvent('error', () => {
    setPartialTranscript('');
    if (captureStateRef.current !== 'idle') {
      openEmptyDraft();
    }
  });

  // ─── Capture helpers ──────────────────────────────────────────────────────

  const triggerUndo = useCallback((label: string, onUndo: () => void) => {
    setUndoLabel(label);
    setUndoCallback(() => onUndo);
    setShowUndo(true);
  }, []);

  const openEmptyDraft = () => {
    const emptyTask: DraftItem = {
      type: 'task',
      title: '',
      themeId: null,
      themeConfidence: null,
      effort: null,
      effortConfidence: null,
      returnLevel: null,
      returnLevelConfidence: null,
      weekAssignment: 'this_week',
      goalId: null,
    };
    setDraftItems([emptyTask]);
    _setCaptureState('drafting');
  };

  const handleTranscript = async (transcript: string) => {
    _setCaptureState('processing');
    const result = await aiService.parseTranscript({
      transcript,
      context: {
        themes: themes.map(t => ({ id: t.id, name: t.name })),
        activeGoals: [],
      },
    });
    setDraftItems(result.items);
    _setCaptureState('drafting');
  };

  // ─── Mic button handlers ──────────────────────────────────────────────────

  const handlePress = () => {
    if (captureStateRef.current !== 'idle') return;
    openEmptyDraft();
  };

  const handleStartRecording = async () => {
    if (captureStateRef.current !== 'idle') return;
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      openEmptyDraft();
      return;
    }
    _setCaptureState('recording');
    ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: true });
  };

  const handleStopRecording = () => {
    if (captureStateRef.current !== 'recording') return;
    _setCaptureState('processing');
    ExpoSpeechRecognitionModule.stop();
  };

  // ─── Save helpers ─────────────────────────────────────────────────────────

  const saveDraftItem = async (item: DraftItem) => {
    if (item.type === 'task') {
      const themeId = item.themeId ?? (themes.find(t => t.isSystem)?.id ?? themes[0]?.id ?? '');
      const created = await tasksService.createTask({
        themeId,
        title: item.title || 'Untitled',
        effort: item.effort ?? 'medium',
        returnLevel: item.returnLevel ?? 'medium',
        weekAssignment: item.weekAssignment,
        goalId: item.goalId ?? undefined,
        reminder: item.suggestedReminder ?? undefined,
      });
      triggerUndo(`"${created.title}" added`, async () => {
        await tasksService.deleteTask(created.id);
      });
    } else {
      const themeId = item.themeId ?? (themes.find(t => t.isSystem)?.id ?? themes[0]?.id ?? '');
      const created = await habitsService.createHabit({
        themeId,
        title: item.title || 'Untitled',
        weeklyTarget: item.weeklyTarget ?? 3,
        goalId: item.goalId ?? undefined,
      });
      triggerUndo(`"${created.title}" habit added`, async () => {
        await habitsService.deleteHabit(created.id, { confirmed: true });
      });
    }
  };

  const handleSave = async (item: DraftItem) => {
    _setCaptureState('idle');
    setDraftItems([]);
    await saveDraftItem(item).catch(() => {});
  };

  const handleSaveAll = async (items: DraftItem[]) => {
    _setCaptureState('idle');
    setDraftItems([]);
    for (const item of items) {
      await saveDraftItem(item).catch(() => {});
    }
  };

  const handleCancel = () => {
    _setCaptureState('idle');
    setDraftItems([]);
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarStyle: { backgroundColor: TAB_BG, borderTopColor: '#2A2A2A' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'This Week',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="backlog"
          options={{
            title: 'Backlog',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            title: 'Goals',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="flag-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* FAB — always visible across all tabs */}
      <MicButton
        onPress={handlePress}
        onStartRecording={() => void handleStartRecording()}
        onStopRecording={handleStopRecording}
        isRecording={captureState === 'recording'}
      />

      {/* Recording / processing overlay */}
      {(captureState === 'recording' || captureState === 'processing') && (
        <RecordingSheet
          state={captureState}
          transcript={partialTranscript}
          speechDetected={speechDetected}
        />
      )}

      {/* DraftCard — appears when drafting */}
      {captureState === 'drafting' && draftItems.length > 0 && (
        <DraftCard
          items={draftItems}
          themes={themes}
          onSave={handleSave}
          onSaveAll={handleSaveAll}
          onCancel={handleCancel}
        />
      )}

      {/* Undo snackbar */}
      <UndoSnackbar
        visible={showUndo}
        label={undoLabel}
        onUndo={() => {
          if (undoCallback) undoCallback();
          setShowUndo(false);
        }}
        onDismiss={() => setShowUndo(false)}
      />
    </View>
  );
}

export type { CaptureState };

const styles = StyleSheet.create({
  container: { flex: 1 },
});
