import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Shield, Bell, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { ActiveTab, SoundSettings } from '../types';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  soundSettings: SoundSettings;
  onToggleSound: () => void;
  onOpenSoundSettings: () => void;
  onTapSound: () => void;
  isPolicyLocked: boolean;
  isTimerRunning: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  soundSettings,
  onToggleSound,
  onOpenSoundSettings,
  onTapSound,
  isPolicyLocked,
  isTimerRunning,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  // Real-time clock for Android status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (tab: ActiveTab) => {
    onTapSound();
    onTabChange(tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:p-4 selection:bg-emerald-500">
      {/* Mobile container - Clean Android Phone Viewport */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[820px] sm:max-h-[900px] sm:rounded-3xl sm:border sm:border-slate-800/80 bg-slate-950 flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Android Status Bar */}
        <div className="w-full pt-3 pb-2.5 px-5 flex items-center justify-between text-xs font-semibold text-slate-400 select-none bg-slate-950/90 backdrop-blur sticky top-0 z-40 border-b border-slate-900">
          {/* Time & Background Status Indicators */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-200">{currentTime}</span>
            {isTimerRunning && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Focus
              </span>
            )}
            {isPolicyLocked && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                <Shield className="w-3 h-3 text-rose-400" />
                Locked
              </span>
            )}
          </div>

          {/* System Icons & Sound Quick Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSound}
              className="text-slate-400 hover:text-white transition p-0.5"
              title={soundSettings.enabled ? 'Mute sound effects' : 'Unmute sound effects'}
            >
              {soundSettings.enabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
            <Wifi className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <BatteryMedium className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
          {children}
        </div>

        {/* Bottom Navigation Bar: 3 Clean Tabs */}
        <div className="sticky bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 px-3 py-2">
          <div className="grid grid-cols-3 gap-2">
            {/* Tab 1: Habit Dashboard */}
            <button
              onClick={() => handleTabClick('habits')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-95 ${
                activeTab === 'habits'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="w-8 h-7 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] leading-tight">Dashboard</span>
            </button>

            {/* Tab 2: Focus Timer */}
            <button
              onClick={() => handleTabClick('timer')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-95 ${
                activeTab === 'timer'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="w-8 h-7 flex items-center justify-center">
                <Bell className={`w-4 h-4 ${isTimerRunning ? 'animate-bounce text-emerald-400' : ''}`} />
              </div>
              <span className="text-[11px] leading-tight">Timer</span>
            </button>

            {/* Tab 3: App Locker */}
            <button
              onClick={() => handleTabClick('policy')}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all active:scale-95 relative ${
                activeTab === 'policy'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="w-8 h-7 flex items-center justify-center">
                <Shield className={`w-4 h-4 ${isPolicyLocked ? 'text-rose-400' : ''}`} />
              </div>
              <span className="text-[11px] leading-tight">App Locker</span>
              {isPolicyLocked && (
                <span className="absolute top-1.5 right-4 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          {/* Android Home Bar Pill */}
          <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto mt-2 opacity-60" />
        </div>
      </div>
    </div>
  );
};
