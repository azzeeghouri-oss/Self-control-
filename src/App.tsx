import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  DayHabitRecord,
  DevicePolicySettings,
  HabitStatus,
  SoundSettings,
  TimerState,
} from './types';
import {
  loadDevicePolicy,
  loadHabitRecords,
  loadSoundSettings,
  loadTimerState,
  saveDevicePolicy,
  saveHabitRecords,
  saveSoundSettings,
  saveTimerState,
} from './utils/storage';
import { useSound } from './hooks/useSound';
import { AndroidFrame } from './components/AndroidFrame';
import { HabitLogger } from './components/HabitLogger/HabitLogger';
import { ProductivityTimer } from './components/ProductivityTimer/ProductivityTimer';
import { DevicePolicyManager } from './components/DevicePolicy/DevicePolicyManager';
import { PinAuthModal } from './components/DevicePolicy/PinAuthModal';
import { AlarmModal } from './components/ProductivityTimer/AlarmModal';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  // Persistent States
  const [habitRecords, setHabitRecords] = useState<Record<string, DayHabitRecord>>(loadHabitRecords);
  const [devicePolicy, setDevicePolicy] = useState<DevicePolicySettings>(loadDevicePolicy);
  const [timerState, setTimerState] = useState<TimerState>(loadTimerState);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(loadSoundSettings);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('habits');

  // Modals & Authentication
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinSuccessCallback, setPinSuccessCallback] = useState<(() => void) | null>(null);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState<boolean>(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState<boolean>(false);

  // Sound Engine Hook
  const sound = useSound(soundSettings);

  // Save changes to localStorage
  useEffect(() => {
    saveHabitRecords(habitRecords);
  }, [habitRecords]);

  useEffect(() => {
    saveDevicePolicy(devicePolicy);
  }, [devicePolicy]);

  useEffect(() => {
    saveTimerState(timerState);
  }, [timerState]);

  useEffect(() => {
    saveSoundSettings(soundSettings);
  }, [soundSettings]);

  // Register Service Worker on mount for background alarm support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          // Service worker registered
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  // Update Habit Day (No = Green Tick, Yes = Red Cross)
  const handleUpdateDay = useCallback((dateStr: string, status: HabitStatus, notes?: string) => {
    setHabitRecords((prev) => {
      const updated = { ...prev };
      if (status === 'none') {
        delete updated[dateStr];
      } else {
        updated[dateStr] = {
          date: dateStr,
          status,
          notes: notes || prev[dateStr]?.notes,
          timestamp: Date.now(),
        };
      }
      return updated;
    });
  }, []);

  // Timer Expiration Handler (Triggers Alarm and Device Policy Lockout)
  const handleTimerExpired = useCallback(() => {
    sound.alarmStart();
    setIsAlarmModalOpen(true);

    // Auto-Lock device policy if enabled
    if (devicePolicy.isPolicyActive && devicePolicy.autoLockOnTimerExpiration) {
      sound.vaultLock();
      setDevicePolicy((prev) => ({
        ...prev,
        isLockedDueToTimer: true,
        lockedAt: Date.now(),
      }));
    }
  }, [sound, devicePolicy]);

  // Dismiss Alarm
  const handleDismissAlarm = useCallback(() => {
    sound.alarmStop();
    setIsAlarmModalOpen(false);
  }, [sound]);

  // Snooze Alarm (+5 minutes)
  const handleSnoozeAlarm = useCallback((minutes: number) => {
    sound.alarmStop();
    setIsAlarmModalOpen(false);
    const secs = minutes * 60;
    setTimerState({
      ...timerState,
      totalDurationSeconds: secs,
      remainingSeconds: secs,
      status: 'running',
      targetEndTime: Date.now() + secs * 1000,
    });
    sound.timerContinue();
  }, [sound, timerState]);

  // Request PIN Authentication
  const handleRequestPinAuth = useCallback((onSuccess: () => void) => {
    setPinSuccessCallback(() => onSuccess);
    setIsPinModalOpen(true);
  }, []);

  // Toggle Sound On/Off quickly from Top Bar
  const handleToggleSoundMaster = useCallback(() => {
    setSoundSettings((prev) => {
      const next = { ...prev, enabled: !prev.enabled };
      if (next.enabled) sound.tap();
      return next;
    });
  }, [sound]);

  return (
    <>
      <AndroidFrame
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundSettings={soundSettings}
        onToggleSound={handleToggleSoundMaster}
        onOpenSoundSettings={() => setIsSoundModalOpen(true)}
        onTapSound={sound.tap}
        isPolicyLocked={devicePolicy.isPolicyActive && devicePolicy.isLockedDueToTimer}
        isTimerRunning={timerState.status === 'running'}
      >
        {/* In-App PWA Install Banner */}
        <PWAInstallBanner onTapSound={sound.tap} />

        {/* TAB 1: DAILY HABIT LOGGER */}
        {activeTab === 'habits' && (
          <HabitLogger
            records={habitRecords}
            onUpdateDay={handleUpdateDay}
            onTapSound={sound.tap}
            onGreenTickSound={sound.greenTick}
            onRedCrossSound={sound.redCross}
          />
        )}

        {/* TAB 2: PRODUCTIVITY TIMER */}
        {activeTab === 'timer' && (
          <ProductivityTimer
            timerState={timerState}
            onUpdateTimerState={setTimerState}
            onTimerExpired={handleTimerExpired}
            onTapSound={sound.tap}
            onTimerStartSound={sound.timerStart}
            onTimerPauseSound={sound.timerPause}
            onTimerContinueSound={sound.timerContinue}
          />
        )}

        {/* TAB 3: DEVICE POLICY & APP LOCKER */}
        {activeTab === 'policy' && (
          <DevicePolicyManager
            policy={devicePolicy}
            onUpdatePolicy={setDevicePolicy}
            onRequestPinAuth={handleRequestPinAuth}
            onTapSound={sound.tap}
            onVaultLockSound={sound.vaultLock}
            onVaultUnlockSound={sound.vaultUnlock}
          />
        )}
      </AndroidFrame>

      {/* SECURITY PIN AUTHENTICATION MODAL */}
      <PinAuthModal
        isOpen={isPinModalOpen}
        correctPin={devicePolicy.securityPin}
        securityQuestion={devicePolicy.securityQuestion}
        securityAnswer={devicePolicy.securityAnswer}
        onSuccess={() => {
          setIsPinModalOpen(false);
          if (pinSuccessCallback) {
            pinSuccessCallback();
            setPinSuccessCallback(null);
          }
        }}
        onCancel={() => {
          setIsPinModalOpen(false);
          setPinSuccessCallback(null);
        }}
        onKeypadSound={sound.keypad}
        onSuccessSound={sound.vaultUnlock}
        onErrorSound={sound.redCross}
        onTapSound={sound.tap}
      />

      {/* TIMER EXPIRED FULL-SCREEN ALARM MODAL */}
      <AlarmModal
        isOpen={isAlarmModalOpen}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onGoToLockedApps={() => {
          handleDismissAlarm();
          setActiveTab('policy');
        }}
        onTapSound={sound.tap}
      />

      {/* SOUND SETTINGS & PREVIEW MODAL */}
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        settings={soundSettings}
        onUpdateSettings={setSoundSettings}
        onClose={() => setIsSoundModalOpen(false)}
        onTapSound={sound.tap}
        onGreenTickSound={sound.greenTick}
        onRedCrossSound={sound.redCross}
        onTimerStartSound={sound.timerStart}
        onVaultLockSound={sound.vaultLock}
        onVaultUnlockSound={sound.vaultUnlock}
      />
    </>
  );
}
