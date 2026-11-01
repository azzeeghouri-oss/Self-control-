import React from 'react';
import confetti from 'canvas-confetti';
import { DayHabitRecord, HabitStatus } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { AnnualCalendar } from './AnnualCalendar';
import { Check, X, Flame, ShieldCheck, TrendingUp } from 'lucide-react';

interface HabitLoggerProps {
  records: Record<string, DayHabitRecord>;
  onUpdateDay: (dateStr: string, status: HabitStatus, notes?: string) => void;
  onTapSound: () => void;
  onGreenTickSound: () => void;
  onRedCrossSound: () => void;
}

export const HabitLogger: React.FC<HabitLoggerProps> = ({
  records,
  onUpdateDay,
  onTapSound,
  onGreenTickSound,
  onRedCrossSound,
}) => {
  const todayStr = getTodayDateString();
  const todayRecord = records[todayStr];
  const todayStatus: HabitStatus = todayRecord?.status || 'none';

  // Calculate clean metrics
  const calculateMetrics = () => {
    let currentStreak = 0;
    let totalClean = 0;
    let totalRelapses = 0;

    const sortedDates = Object.keys(records).sort();
    sortedDates.forEach((d) => {
      if (records[d].status === 'no') totalClean++;
      else if (records[d].status === 'yes') totalRelapses++;
    });

    // Count backwards from today
    let checkDate = new Date();
    const format = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayVal = records[format(checkDate)]?.status;
    if (todayVal === 'no') {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (!todayVal || todayVal === 'none') {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = format(checkDate);
      if (records[dStr]?.status === 'no') {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const totalLogged = totalClean + totalRelapses;
    const rate = totalLogged > 0 ? Math.round((totalClean / totalLogged) * 100) : 100;

    return { currentStreak, totalClean, rate };
  };

  const { currentStreak, totalClean, rate } = calculateMetrics();

  const handleToggle = (choice: 'no' | 'yes') => {
    if (choice === 'no') {
      onGreenTickSound();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#10b981', '#34d399', '#38bdf8'],
        });
      } catch {
        // Ignored
      }
      onUpdateDay(todayStr, 'no');
    } else {
      onRedCrossSound();
      onUpdateDay(todayStr, 'yes');
    }
  };

  return (
    <div className="space-y-4">
      {/* TODAY'S CHECK-IN DASHBOARD CARD */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Daily Habit Tracker
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{todayStr}</span>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-4">
          Did you do masturbation?
        </h2>

        {/* Large Clean Action Buttons: No (Clean ✓) vs Yes (✕) */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            type="button"
            onClick={() => handleToggle('no')}
            className={`py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all active:scale-95 border ${
              todayStatus === 'no'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/40'
                : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-emerald-600/50 hover:bg-emerald-950/20'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                todayStatus === 'no'
                  ? 'bg-white text-emerald-700'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              <Check className="w-5 h-5 stroke-[3.5]" />
            </div>
            <span className="text-base font-black">No</span>
            <span className={`text-[10px] ${todayStatus === 'no' ? 'text-white/90 font-medium' : 'text-emerald-400'}`}>
              Clean ✓
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleToggle('yes')}
            className={`py-4 px-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 font-bold transition-all active:scale-95 border ${
              todayStatus === 'yes'
                ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-950/60 ring-2 ring-rose-400/40'
                : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-rose-600/50 hover:bg-rose-950/20'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                todayStatus === 'yes'
                  ? 'bg-white text-rose-700'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/40'
              }`}
            >
              <X className="w-5 h-5 stroke-[3.5]" />
            </div>
            <span className="text-base font-black">Yes</span>
            <span className={`text-[10px] ${todayStatus === 'yes' ? 'text-white/90 font-medium' : 'text-rose-400'}`}>
              Relapse ✕
            </span>
          </button>
        </div>

        {/* Status text */}
        <div className="text-center">
          {todayStatus === 'no' && (
            <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Logged Clean for Today! Streak protected.
            </span>
          )}
          {todayStatus === 'yes' && (
            <span className="text-xs text-rose-400 font-semibold inline-flex items-center gap-1">
              <X className="w-3.5 h-3.5 stroke-[3]" /> Logged for Today. Reset and restart stronger.
            </span>
          )}
          {todayStatus === 'none' && (
            <span className="text-xs text-slate-400 font-medium">
              Choose an option above to log today's status.
            </span>
          )}
        </div>
      </div>

      {/* 3 CLEAN STAT METRICS */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-emerald-400" />
            <span>Streak</span>
          </div>
          <span className="text-xl font-black text-emerald-400">{currentStreak}</span>
          <span className="text-[10px] text-slate-500 block">days</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Clean</span>
          </div>
          <span className="text-xl font-black text-blue-400">{totalClean}</span>
          <span className="text-[10px] text-slate-500 block">total</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Success</span>
          </div>
          <span className="text-xl font-black text-purple-400">{rate}%</span>
          <span className="text-[10px] text-slate-500 block">rate</span>
        </div>
      </div>

      {/* CLEAN SINGLE-MONTH CALENDAR */}
      <AnnualCalendar
        records={records}
        onUpdateDay={onUpdateDay}
        onTapSound={onTapSound}
        onGreenTickSound={onGreenTickSound}
        onRedCrossSound={onRedCrossSound}
      />
    </div>
  );
};
