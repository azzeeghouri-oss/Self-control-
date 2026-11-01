export type HabitStatus = 'none' | 'no' | 'yes';

export interface DayHabitRecord {
  date: string; // YYYY-MM-DD
  status: HabitStatus; // 'no' = clean (green tick), 'yes' = relapse (red cross)
  notes?: string;
  timestamp?: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'expired';

export interface TimerState {
  totalDurationSeconds: number; // total set seconds
  remainingSeconds: number;
  status: TimerStatus;
  startedAt?: number;
  targetEndTime?: number; // absolute timestamp for background recovery
  timerName: string;
}

export type LockMode = 'lock' | 'hide';

export interface ProtectedApp {
  id: string;
  name: string;
  packageName: string;
  category: 'social' | 'entertainment' | 'browser' | 'gaming' | 'utility';
  icon: string; // Icon name or SVG identifier
  color: string;
  lockMode: LockMode;
  isProtected: boolean;
  blockedCount: number;
}

export interface DevicePolicySettings {
  isPolicyActive: boolean;
  autoLockOnTimerExpiration: boolean;
  requirePinForPolicySettings: boolean;
  securityPin: string; // 4 to 6 digit PIN (default: "1234")
  securityQuestion: string;
  securityAnswer: string;
  isLockedDueToTimer: boolean;
  lockedAt?: number;
  apps: ProtectedApp[];
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  voiceAnnouncements: boolean;
  haptics: boolean;
}

export type ActiveTab = 'habits' | 'timer' | 'policy';
