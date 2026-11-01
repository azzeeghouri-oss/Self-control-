import React, { useState } from 'react';
import { DayHabitRecord, HabitStatus } from '../../types';
import { getTodayDateString } from '../../utils/storage';
import { Check, X, ChevronLeft, ChevronRight, Lock, Calendar as CalendarIcon } from 'lucide-react';

interface AnnualCalendarProps {
  records: Record<string, DayHabitRecord>;
  onUpdateDay: (dateStr: string, status: HabitStatus, notes?: string) => void;
  onTapSound: () => void;
  onGreenTickSound: () => void;
  onRedCrossSound: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const AnnualCalendar: React.FC<AnnualCalendarProps> = ({
  records,
  onUpdateDay,
  onTapSound,
  onGreenTickSound,
  onRedCrossSound,
}) => {
  const realNow = new Date();
  const realYear = realNow.getFullYear();
  const realMonth = realNow.getMonth(); // 0-indexed
  const realDate = realNow.getDate();

  // Active displayed month & year (starts with current month by default)
  const [displayedYear, setDisplayedYear] = useState<number>(realYear);
  const [displayedMonth, setDisplayedMonth] = useState<number>(realMonth);

  // Selected date modal state
  const [selectedDateModal, setSelectedDateModal] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Calculate days in the current displayed month
  const firstDayOfWeek = new Date(displayedYear, displayedMonth, 1).getDay();
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();

  // Days remaining in the real current month
  const totalDaysInCurrentMonth = new Date(realYear, realMonth + 1, 0).getDate();
  const daysRemainingInMonth = Math.max(0, totalDaysInCurrentMonth - realDate);

  // Future months can ONLY be loaded/unlocked when the current month ends
  const isViewingCurrentOrFutureMonth =
    displayedYear > realYear || (displayedYear === realYear && displayedMonth >= realMonth);

  const isNextMonthUnlocked = !isViewingCurrentOrFutureMonth;

  const handlePrevMonth = () => {
    onTapSound();
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((prev) => prev - 1);
    } else {
      setDisplayedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (!isNextMonthUnlocked) {
      onTapSound();
      return;
    }
    onTapSound();
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((prev) => prev + 1);
    } else {
      setDisplayedMonth((prev) => prev + 1);
    }
  };

  const handleOpenDayModal = (dateStr: string) => {
    onTapSound();
    setSelectedDateModal(dateStr);
  };

  const handleSetStatus = (status: HabitStatus) => {
    if (!selectedDateModal) return;
    if (status === 'no') onGreenTickSound();
    else if (status === 'yes') onRedCrossSound();
    else onTapSound();

    onUpdateDay(selectedDateModal, status);
    setSelectedDateModal(null);
  };

  const nextMonthName = MONTH_NAMES[(displayedMonth + 1) % 12];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Clean Month Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            {MONTH_NAMES[displayedMonth]} {displayedYear}
          </h3>
          {!isNextMonthUnlocked && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              {nextMonthName} unlocks in {daysRemainingInMonth} day{daysRemainingInMonth === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {/* Previous / Next Month Navigation */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-90"
            title="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {isNextMonthUnlocked ? (
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-90"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div
              className="p-1.5 text-slate-600 cursor-not-allowed"
              title={`${nextMonthName} unlocks when this month finishes`}
            >
              <Lock className="w-3 h-3 text-slate-600" />
            </div>
          )}
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_NAMES.map((w, idx) => (
          <span key={idx} className="text-[10px] font-bold text-slate-500 py-0.5">
            {w}
          </span>
        ))}
      </div>

      {/* Single-Month Clean Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`offset-${i}`} className="aspect-square" />
        ))}

        {/* Days of Current Month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dStr = String(dayNum).padStart(2, '0');
          const mStr = String(displayedMonth + 1).padStart(2, '0');
          const dateKey = `${displayedYear}-${mStr}-${dStr}`;
          const record = records[dateKey];
          const status = record?.status || 'none';
          const isToday = dateKey === todayStr;

          return (
            <button
              key={dateKey}
              onClick={() => handleOpenDayModal(dateKey)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                isToday ? 'ring-1.5 ring-emerald-400 bg-slate-850' : ''
              } ${
                status === 'no'
                  ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-300'
                  : status === 'yes'
                  ? 'bg-rose-950/70 border border-rose-500/60 text-rose-300'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-850 text-slate-400'
              }`}
            >
              <span className={`text-[10px] leading-none ${isToday ? 'font-bold text-emerald-400' : 'text-slate-400'}`}>
                {dayNum}
              </span>

              <div className="h-3 flex items-center justify-center mt-0.5">
                {status === 'no' && <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3.5]" />}
                {status === 'yes' && <X className="w-3.5 h-3.5 text-rose-400 stroke-[3.5]" />}
                {status === 'none' && <span className="w-1 h-1 rounded-full bg-slate-700/80" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend Footnote */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <strong className="text-slate-300 font-medium">✓ No</strong> (Clean)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <strong className="text-slate-300 font-medium">✕ Yes</strong> (Relapse)
        </span>
        <span className="text-slate-500 text-[10px]">Tap day to edit</span>
      </div>

      {/* Quick Day Edit Popup */}
      {selectedDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">{selectedDateModal}</span>
              <button
                onClick={() => {
                  onTapSound();
                  setSelectedDateModal(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3 text-center">
              Did you do masturbation on this day?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => handleSetStatus('no')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition active:scale-95 ${
                  records[selectedDateModal]?.status === 'no'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> No (✓)
              </button>

              <button
                onClick={() => handleSetStatus('yes')}
                className={`py-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition active:scale-95 ${
                  records[selectedDateModal]?.status === 'yes'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-rose-950/40 border border-rose-600/50 text-rose-300 hover:bg-rose-900/40'
                }`}
              >
                <X className="w-3.5 h-3.5 stroke-[3]" /> Yes (✕)
              </button>
            </div>

            <button
              onClick={() => handleSetStatus('none')}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 rounded-lg transition"
            >
              Clear Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
