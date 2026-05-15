import { useState, useRef, useCallback } from 'react';

interface UndoState {
  visible: boolean;
  label: string;
  onUndo: () => void;
}

export function useUndo() {
  const [state, setState] = useState<UndoState>({ visible: false, label: '', onUndo: () => {} });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showUndo = useCallback((label: string, onUndo: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setState({ visible: true, label, onUndo });

    timerRef.current = setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, 4000);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState((s) => ({ ...s, visible: false }));
  }, []);

  return { undoState: state, showUndo, dismiss };
}
