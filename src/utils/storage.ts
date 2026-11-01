import { DayHabitRecord, DevicePolicySettings, ProtectedApp, SoundSettings, TimerState } from '../types';

const HABITS_KEY = 'aegis_habits_records_v1';
const POLICY_KEY = 'aegis_device_policy_v1';
const TIMER_KEY = 'aegis_timer_state_v1';
const SOUND_KEY = 'aegis_sound_settings_v1';

export const DEFAULT_PROTECTED_APPS: ProtectedApp[] = [
  {
    id: 'app-instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    category: 'social',
    icon: 'Camera',
    color: 'from-pink-500 to-rose-600',
    lockMode: 'lock',
    isProtected: true,
    blockedCount: 7,
  },
  {
    id: 'app-tiktok',
    name: 'TikTok',
    packageName: 'com.zhiliaoapp.musically',
    category: 'entertainment',
    icon: 'Video',
    color: 'from-neutral-800 to-neutral-950',
    lockMode: 'hide',
    isProtected: true,
    blockedCount: 14,
  },
  {
    id: 'app-youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    category: 'entertainment',
    icon: 'PlayCircle',
    color: 'from-red-600 to-red-700',
    lockMode: 'lock',
    isProtected: true,
    blockedCount: 9,
  },
  {
    id: 'app-reddit',
    name: 'Reddit',
    packageName: 'com.reddit.frontpage',
    category: 'social',
    icon: 'MessageSquare',
    color: 'from-orange-500 to-orange-600',
    lockMode: 'lock',
    isProtected: true,
    blockedCount: 4,
  },
  {
    id: 'app-chrome',
    name: 'Chrome Browser',
    packageName: 'com.android.chrome',
    category: 'browser',
    icon: 'Globe',
    color: 'from-blue-500 to-amber-500',
    lockMode: 'lock',
    isProtected: true,
    blockedCount: 12,
  },
  {
    id: 'app-netflix',
    name: 'Netflix',
    packageName: 'com.netflix.mediaclient',
    category: 'entertainment',
    icon: 'Tv',
    color: 'from-red-700 to-black',
    lockMode: 'hide',
    isProtected: true,
    blockedCount: 2,
  },
  {
    id: 'app-twitter',
    name: 'X (Twitter)',
    packageName: 'com.twitter.android',
    category: 'social',
    icon: 'Hash',
    color: 'from-neutral-700 to-neutral-900',
    lockMode: 'lock',
    isProtected: true,
    blockedCount: 6,
  },
  {
    id: 'app-games',
    name: 'Mobile Games',
    packageName: 'com.games.launcher',
    category: 'gaming',
    icon: 'Gamepad2',
    color: 'from-purple-600 to-indigo-700',
    lockMode: 'hide',
    isProtected: true,
    blockedCount: 11,
  },
];

export const DEFAULT_DEVICE_POLICY: DevicePolicySettings = {
  isPolicyActive: true,
  autoLockOnTimerExpiration: true,
  requirePinForPolicySettings: true,
  securityPin: '1234',
  securityQuestion: 'What is your primary focus goal?',
  securityAnswer: 'Discipline',
  isLockedDueToTimer: false,
  apps: DEFAULT_PROTECTED_APPS,
};

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.8,
  voiceAnnouncements: true,
  haptics: true,
};

export const DEFAULT_TIMER_STATE: TimerState = {
  totalDurationSeconds: 25 * 60, // 25 min default pomodoro/focus
  remainingSeconds: 25 * 60,
  status: 'idle',
  timerName: 'Productivity Focus Session',
};

// Helper to format date YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDateString(): string {
  return formatDate(new Date());
}

// Generate realistic seeded history for current year up to yesterday
function generateSeedHabits(): Record<string, DayHabitRecord> {
  const records: Record<string, DayHabitRecord> = {};
  const today = new Date();
  const currentYear = today.getFullYear();

  // Seed previous 45 days so the calendar looks rich immediately
  for (let i = 45; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // only if in same year
    if (d.getFullYear() === currentYear) {
      const dateStr = formatDate(d);
      // Realistic high-discipline pattern: mostly 'no' (green ticks), with occasional 'yes' (red crosses)
      // e.g. 85% clean days
      const isClean = i % 11 !== 0 && i % 17 !== 0;
      records[dateStr] = {
        date: dateStr,
        status: isClean ? 'no' : 'yes',
        timestamp: d.getTime(),
        notes: isClean ? 'Workout completed, stayed disciplined.' : 'Felt tired late at night.',
      };
    }
  }

  return records;
}

export function loadHabitRecords(): Record<string, DayHabitRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) {
      const initial = generateSeedHabits();
      localStorage.setItem(HABITS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return generateSeedHabits();
  }
}

export function saveHabitRecords(records: Record<string, DayHabitRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save habit records', e);
  }
}

export function loadDevicePolicy(): DevicePolicySettings {
  if (typeof window === 'undefined') return DEFAULT_DEVICE_POLICY;
  try {
    const raw = localStorage.getItem(POLICY_KEY);
    if (!raw) {
      localStorage.setItem(POLICY_KEY, JSON.stringify(DEFAULT_DEVICE_POLICY));
      return DEFAULT_DEVICE_POLICY;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DEVICE_POLICY, ...parsed };
  } catch {
    return DEFAULT_DEVICE_POLICY;
  }
}

export function saveDevicePolicy(policy: DevicePolicySettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(POLICY_KEY, JSON.stringify(policy));
  } catch (e) {
    console.error('Failed to save device policy', e);
  }
}

export function loadTimerState(): TimerState {
  if (typeof window === 'undefined') return DEFAULT_TIMER_STATE;
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return DEFAULT_TIMER_STATE;
    const parsed = JSON.parse(raw) as TimerState;

    // Check if targetEndTime was in the past and timer was running
    if (parsed.status === 'running' && parsed.targetEndTime) {
      const now = Date.now();
      const left = Math.round((parsed.targetEndTime - now) / 1000);
      if (left <= 0) {
        parsed.remainingSeconds = 0;
        parsed.status = 'expired';
      } else {
        parsed.remainingSeconds = left;
      }
    }
    return parsed;
  } catch {
    return DEFAULT_TIMER_STATE;
  }
}

export function saveTimerState(state: TimerState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save timer state', e);
  }
}

export function loadSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS;
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (!raw) return DEFAULT_SOUND_SETTINGS;
    return { ...DEFAULT_SOUND_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

export function saveSoundSettings(settings: SoundSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOUND_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save sound settings', e);
  }
}
