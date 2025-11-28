export interface Alarm {
  id: string;
  time: string; // Format "HH:mm" 24h
  label: string;
  days: number[]; // 0 (Sun) - 6 (Sat). If empty, it's one-time.
  enabled: boolean;
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface AppSettings {
  is24Hour: boolean;
  volume: number; // 0 to 1
  snoozeMinutes: number;
}

export enum Tab {
  CLOCK = 'clock',
  ALARM = 'alarm',
  TIMER = 'timer',
  SETTINGS = 'settings'
}