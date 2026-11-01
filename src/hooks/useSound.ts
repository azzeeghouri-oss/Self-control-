import { useCallback, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { SoundSettings } from '../types';

export function useSound(settings: SoundSettings) {
  useEffect(() => {
    soundManager.setMuted(!settings.enabled);
    soundManager.setVolume(settings.volume);
  }, [settings.enabled, settings.volume]);

  const tap = useCallback(() => {
    soundManager.playTap();
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
  }, [settings.haptics]);

  const greenTick = useCallback(() => {
    soundManager.playGreenTick();
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 80]);
    }
  }, [settings.haptics]);

  const redCross = useCallback(() => {
    soundManager.playRedCross();
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [settings.haptics]);

  const timerStart = useCallback(() => {
    soundManager.playTimerStart();
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 40, 50, 60]);
    }
  }, [settings.haptics]);

  const timerPause = useCallback(() => {
    soundManager.playTimerPause();
  }, []);

  const timerContinue = useCallback(() => {
    soundManager.playTimerContinue();
  }, []);

  const keypad = useCallback((digit: string) => {
    soundManager.playKeypad(digit);
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [settings.haptics]);

  const vaultLock = useCallback(() => {
    soundManager.playVaultLock();
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 120]);
    }
  }, [settings.haptics]);

  const vaultUnlock = useCallback(() => {
    soundManager.playVaultUnlock();
    if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 80]);
    }
  }, [settings.haptics]);

  const alarmStart = useCallback(() => {
    soundManager.startAlarm();
  }, []);

  const alarmStop = useCallback(() => {
    soundManager.stopAlarm();
  }, []);

  return {
    tap,
    greenTick,
    redCross,
    timerStart,
    timerPause,
    timerContinue,
    keypad,
    vaultLock,
    vaultUnlock,
    alarmStart,
    alarmStop,
  };
}
