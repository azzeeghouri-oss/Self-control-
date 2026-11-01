import React from 'react';
import { Bell, Lock, Volume2, ShieldAlert } from 'lucide-react';

interface AlarmModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onGoToLockedApps: () => void;
  onTapSound: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  onDismiss,
  onSnooze,
  onGoToLockedApps,
  onTapSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/80 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.4)] animate-bounce-slow">
        {/* Pulsing Alarm Icon */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping duration-1000" />
          <div className="relative w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/60">
            <Bell className="w-10 h-10 animate-wiggle" />
          </div>
        </div>

        {/* Title */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Alarm Ringing
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight">Time Has Expired!</h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Your allocated mobile focus time has ended.
        </p>

        {/* Device Policy Automatic Enforcement Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 text-left flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300">Device Policy Enforced</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Distracting apps are now automatically locked or hidden. PIN required to unlock.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => {
              onTapSound();
              onDismiss();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-lg shadow-rose-950/50 active:scale-95 transition"
          >
            Dismiss Alarm
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onTapSound();
                onSnooze(5);
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold active:scale-95 transition"
            >
              +5 Min Snooze
            </button>

            <button
              onClick={() => {
                onTapSound();
                onGoToLockedApps();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Lock className="w-3.5 h-3.5" /> View Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
