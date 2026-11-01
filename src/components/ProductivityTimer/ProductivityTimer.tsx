import React, { useEffect, useState, useRef } from 'react';
import { TimerState } from '../../types';
import {
  requestNotificationPermission,
  showMobileTimeStartNotification,
  scheduleBackgroundAlarm,
  triggerTimerExpiredNotification,
} from '../../utils/notifications';
import { Play, Pause, RotateCcw, Plus, Shield, Sparkles } from 'lucide-react';

interface ProductivityTimerProps {
  timerState: TimerState;
  onUpdateTimerState: (newState: TimerState) => void;
  onTimerExpired: () => void;
  onTapSound: () => void;
  onTimerStartSound: () => void;
  onTimerPauseSound: () => void;
  onTimerContinueSound: () => void;
}

const PRESETS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '60m', seconds: 60 * 60 },
];

export const ProductivityTimer: React.FC<ProductivityTimerProps> = ({
  timerState,
  onUpdateTimerState,
  onTimerExpired,
  onTapSound,
  onTimerStartSound,
  onTimerPauseSound,
  onTimerContinueSound,
}) => {
  const { totalDurationSeconds, remainingSeconds, status, targetEndTime } = timerState;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Screen WakeLock management during active focus
  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // Ignore
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch {
      // Ignore
    }
  };

  // Timer Tick Interval with Background Recovery
  useEffect(() => {
    if (status !== 'running') {
      releaseWakeLock();
      return;
    }

    acquireWakeLock();

    const interval = setInterval(() => {
      if (targetEndTime) {
        const now = Date.now();
        const left = Math.round((targetEndTime - now) / 1000);

        if (left <= 0) {
          clearInterval(interval);
          releaseWakeLock();
          onUpdateTimerState({
            ...timerState,
            remainingSeconds: 0,
            status: 'expired',
          });
          triggerTimerExpiredNotification();
          onTimerExpired();
        } else {
          onUpdateTimerState({
            ...timerState,
            remainingSeconds: left,
          });
        }
      } else {
        if (remainingSeconds <= 1) {
          clearInterval(interval);
          releaseWakeLock();
          onUpdateTimerState({
            ...timerState,
            remainingSeconds: 0,
            status: 'expired',
          });
          triggerTimerExpiredNotification();
          onTimerExpired();
        } else {
          onUpdateTimerState({
            ...timerState,
            remainingSeconds: remainingSeconds - 1,
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, targetEndTime, remainingSeconds, timerState]);

  // START timer
  const handleStart = async () => {
    onTimerStartSound();
    await requestNotificationPermission();

    // Trigger exact required notification
    showMobileTimeStartNotification();

    const duration = remainingSeconds > 0 ? remainingSeconds : totalDurationSeconds;
    const targetEnd = Date.now() + duration * 1000;
    scheduleBackgroundAlarm(duration * 1000);

    onUpdateTimerState({
      ...timerState,
      remainingSeconds: duration,
      status: 'running',
      startedAt: Date.now(),
      targetEndTime: targetEnd,
    });
  };

  // PAUSE timer
  const handlePause = () => {
    onTimerPauseSound();
    onUpdateTimerState({
      ...timerState,
      status: 'paused',
      targetEndTime: undefined,
    });
  };

  // CONTINUE timer (Resume from pause)
  const handleContinue = () => {
    onTimerContinueSound();
    const targetEnd = Date.now() + remainingSeconds * 1000;
    scheduleBackgroundAlarm(remainingSeconds * 1000);

    onUpdateTimerState({
      ...timerState,
      status: 'running',
      targetEndTime: targetEnd,
    });
  };

  // RESET timer
  const handleReset = () => {
    onTapSound();
    onUpdateTimerState({
      ...timerState,
      remainingSeconds: totalDurationSeconds,
      status: 'idle',
      targetEndTime: undefined,
    });
  };

  // Select Preset
  const handleSelectPreset = (seconds: number) => {
    onTapSound();
    onUpdateTimerState({
      ...timerState,
      totalDurationSeconds: seconds,
      remainingSeconds: seconds,
      status: 'idle',
      targetEndTime: undefined,
    });
  };

  // Quick +5 Minutes
  const handleAddMinutes = (mins: number) => {
    onTapSound();
    const additionalSecs = mins * 60;
    const newRemaining = remainingSeconds + additionalSecs;
    const newTotal = totalDurationSeconds + additionalSecs;
    const newTarget = targetEndTime ? targetEndTime + additionalSecs * 1000 : undefined;

    onUpdateTimerState({
      ...timerState,
      remainingSeconds: newRemaining,
      totalDurationSeconds: newTotal,
      targetEndTime: newTarget,
    });
  };

  // Format time MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = totalDurationSeconds > 0
    ? Math.max(0, Math.min(100, ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
    : 0;

  return (
    <div className="space-y-4">
      {/* Clean Circular Timer Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-lg">
        {/* Subtle status tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-850 text-xs font-semibold mb-4">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'running'
                ? 'bg-emerald-400 animate-pulse'
                : status === 'paused'
                ? 'bg-amber-400'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-slate-300 text-[11px]">
            {status === 'running' ? 'Focus Active' : status === 'paused' ? 'Paused' : 'Ready'}
          </span>
        </div>

        {/* Circular Countdown Display */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="84"
              className="text-slate-800/80"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="100"
              cy="100"
              r="84"
              strokeWidth="8"
              strokeDasharray="527"
              strokeDashoffset={527 - (527 * (100 - progressPercent)) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              className={`transition-all duration-500 ${
                status === 'running' ? 'text-emerald-500 drop-shadow-[0_0_8px_#10b981]' : 'text-slate-600'
              }`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="font-mono text-4xl font-black text-white tracking-wider">
              {formatTime(remainingSeconds)}
            </span>
            {status === 'running' && (
              <span className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> "Your mobile time is start"
              </span>
            )}
          </div>
        </div>

        {/* Clean Controls: Start, Pause, Continue */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            disabled={status === 'idle' && remainingSeconds === totalDurationSeconds}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white active:scale-95 disabled:opacity-30 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {status === 'idle' && (
            <button
              onClick={handleStart}
              className="flex-1 max-w-[180px] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start</span>
            </button>
          )}

          {status === 'running' && (
            <button
              onClick={handlePause}
              className="flex-1 max-w-[180px] py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause</span>
            </button>
          )}

          {status === 'paused' && (
            <button
              onClick={handleContinue}
              className="flex-1 max-w-[180px] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Continue</span>
            </button>
          )}

          <button
            onClick={() => handleAddMinutes(5)}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-bold active:scale-95 transition flex items-center"
            title="+5 minutes"
          >
            <Plus className="w-3.5 h-3.5" /> 5m
          </button>
        </div>

        {/* Quiet policy notice */}
        <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Selected apps lock automatically when timer expires</span>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const isSelected = totalDurationSeconds === preset.seconds && status === 'idle';
          return (
            <button
              key={preset.seconds}
              onClick={() => handleSelectPreset(preset.seconds)}
              className={`py-2 rounded-xl text-xs font-bold border transition active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
