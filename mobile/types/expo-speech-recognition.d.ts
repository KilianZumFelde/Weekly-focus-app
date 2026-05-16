declare module 'expo-speech-recognition' {
  export interface SpeechRecognitionResultSegment {
    transcript: string;
    confidence: number;
  }

  export interface SpeechRecognitionResultEvent {
    isFinal: boolean;
    results: SpeechRecognitionResultSegment[];
  }

  export interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
  }

  export function useSpeechRecognitionEvent(
    event: 'result',
    listener: (event: SpeechRecognitionResultEvent) => void,
  ): void;
  export function useSpeechRecognitionEvent(
    event: 'error',
    listener: (event: SpeechRecognitionErrorEvent) => void,
  ): void;
  export function useSpeechRecognitionEvent(
    event: 'start' | 'end',
    listener: () => void,
  ): void;

  export const ExpoSpeechRecognitionModule: {
    requestPermissionsAsync(): Promise<{ granted: boolean }>;
    start(options: { lang: string; interimResults: boolean }): void;
    stop(): void;
  };
}
