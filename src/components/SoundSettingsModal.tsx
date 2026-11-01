import React from 'react';
import { SoundSettings } from '../types';
import { Volume2, VolumeX, X, Play, Sliders, Vibrate, CheckCircle, ShieldAlert } from 'lucide-react';

interface SoundSettingsModalProps {
  isOpen: boolean;
  settings: SoundSettings;
  onUpdateSettings: (newSettings: SoundSettings) => void;
  onClose: () => void;
  onTapSound: () => void;
  onGreenTickSound: () => void;
  onRedCrossSound: () => void;
  onTimerStartSound: () => void;
  onVaultLockSound: () => void;
  onVaultUnlockSound: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
  onTapSound,
  onGreenTickSound,
  onRedCrossSound,
  onTimerStartSound,
  onVaultLockSound,
  onVaultUnlockSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={() => {
            onTapSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Interactive Audio Engine</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Web Audio API synthesized sound effects on every button and action.
        </p>

        {/* Master Sound Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 mb-3">
          <div className="flex items-center gap-2.5">
            {settings.enabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <span className="text-xs font-bold text-white block">Sound Effects</span>
              <span className="text-[10px] text-slate-400">Trigger on UI selections</span>
            </div>
          </div>
          <button
            onClick={() => {
              onTapSound();
              onUpdateSettings({ ...settings, enabled: !settings.enabled });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.enabled ? 'bg-emerald-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 mb-3">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Volume
            </span>
            <span className="text-emerald-400 font-mono">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => {
              const vol = parseFloat(e.target.value);
              onUpdateSettings({ ...settings, volume: vol });
            }}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Haptics Switch */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-white block">Android Haptic Vibrate</span>
              <span className="text-[10px] text-slate-400">Tactile physical vibration</span>
            </div>
          </div>
          <button
            onClick={() => {
              onTapSound();
              onUpdateSettings({ ...settings, haptics: !settings.haptics });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.haptics ? 'bg-emerald-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.haptics ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Test Sound Triggers */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Test Sound Effects
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onGreenTickSound}
              className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Green Tick Chime
            </button>

            <button
              onClick={onRedCrossSound}
              className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Red Cross Tone
            </button>

            <button
              onClick={onTimerStartSound}
              className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-300 font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Play className="w-3.5 h-3.5 text-blue-400" /> Start Fanfare
            </button>

            <button
              onClick={onVaultLockSound}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
            >
              Vault Lock Sound
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            onTapSound();
            onClose();
          }}
          className="w-full mt-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
