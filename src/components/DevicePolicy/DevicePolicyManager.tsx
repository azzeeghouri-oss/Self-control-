import React, { useState } from 'react';
import { DevicePolicySettings, LockMode, ProtectedApp } from '../../types';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  Plus,
  KeyRound,
  Check,
  Smartphone,
  Camera,
  Video,
  PlayCircle,
  MessageSquare,
  Globe,
  Tv,
  Hash,
  Gamepad2,
} from 'lucide-react';

interface DevicePolicyManagerProps {
  policy: DevicePolicySettings;
  onUpdatePolicy: (newPolicy: DevicePolicySettings) => void;
  onRequestPinAuth: (onSuccessAction: () => void) => void;
  onTapSound: () => void;
  onVaultLockSound: () => void;
  onVaultUnlockSound: () => void;
}

export const DevicePolicyManager: React.FC<DevicePolicyManagerProps> = ({
  policy,
  onUpdatePolicy,
  onRequestPinAuth,
  onTapSound,
  onVaultLockSound,
  onVaultUnlockSound,
}) => {
  const [showAddAppModal, setShowAddAppModal] = useState<boolean>(false);
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [newAppName, setNewAppName] = useState<string>('');
  const [newMode, setNewMode] = useState<LockMode>('lock');

  // Change PIN states
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<boolean>(false);

  // Master Switch: Toggle Policy Protection (requires PIN)
  const handleToggleMasterPolicy = () => {
    onTapSound();
    onRequestPinAuth(() => {
      const next = !policy.isPolicyActive;
      if (next) onVaultLockSound();
      else onVaultUnlockSound();
      onUpdatePolicy({ ...policy, isPolicyActive: next });
    });
  };

  // Toggle Auto-Lock on Timer Expiry
  const handleToggleAutoLock = () => {
    onTapSound();
    onUpdatePolicy({
      ...policy,
      autoLockOnTimerExpiration: !policy.autoLockOnTimerExpiration,
    });
  };

  // Toggle App Protection
  const handleToggleApp = (appId: string) => {
    onTapSound();
    const updated = policy.apps.map((app) =>
      app.id === appId ? { ...app, isProtected: !app.isProtected } : app
    );
    onUpdatePolicy({ ...policy, apps: updated });
  };

  // Toggle Lock vs Hide Mode for an app
  const handleToggleMode = (appId: string) => {
    onTapSound();
    const updated = policy.apps.map((app) => {
      if (app.id === appId) {
        return { ...app, lockMode: app.lockMode === 'lock' ? 'hide' : 'lock' as LockMode };
      }
      return app;
    });
    onUpdatePolicy({ ...policy, apps: updated });
  };

  // Manual Unlock Override (Requires PIN)
  const handleUnlockApps = () => {
    onTapSound();
    onRequestPinAuth(() => {
      onVaultUnlockSound();
      onUpdatePolicy({
        ...policy,
        isLockedDueToTimer: false,
        lockedAt: undefined,
      });
    });
  };

  // Manual Test Lockout
  const handleLockNow = () => {
    onVaultLockSound();
    onUpdatePolicy({
      ...policy,
      isLockedDueToTimer: true,
      lockedAt: Date.now(),
    });
  };

  // Add App
  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    onTapSound();

    const newApp: ProtectedApp = {
      id: `app-${Date.now()}`,
      name: newAppName.trim(),
      packageName: `com.${newAppName.toLowerCase().replace(/\s+/g, '')}.android`,
      category: 'social',
      icon: 'Smartphone',
      color: 'from-slate-700 to-slate-900',
      lockMode: newMode,
      isProtected: true,
      blockedCount: 0,
    };

    onUpdatePolicy({ ...policy, apps: [...policy.apps, newApp] });
    setNewAppName('');
    setShowAddAppModal(false);
  };

  // Save New PIN
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4 || newPin.length > 6) {
      setPinError('PIN must be 4 to 6 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match.');
      return;
    }

    onTapSound();
    onUpdatePolicy({ ...policy, securityPin: newPin });
    setPinSuccess(true);
    setTimeout(() => {
      setShowChangePinModal(false);
      setPinSuccess(false);
      setNewPin('');
      setConfirmPin('');
      setPinError(null);
    }, 1000);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-4 h-4 text-white" />;
      case 'Video': return <Video className="w-4 h-4 text-white" />;
      case 'PlayCircle': return <PlayCircle className="w-4 h-4 text-white" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-white" />;
      case 'Globe': return <Globe className="w-4 h-4 text-white" />;
      case 'Tv': return <Tv className="w-4 h-4 text-white" />;
      case 'Hash': return <Hash className="w-4 h-4 text-white" />;
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4 text-white" />;
      default: return <Smartphone className="w-4 h-4 text-white" />;
    }
  };

  const protectedCount = policy.apps.filter((a) => a.isProtected).length;

  return (
    <div className="space-y-4">
      {/* 1. MAIN CONTROL CARD */}
      <div
        className={`border rounded-3xl p-5 shadow-lg transition-all ${
          policy.isLockedDueToTimer
            ? 'bg-rose-950/40 border-rose-500/80 shadow-rose-950/30'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                policy.isLockedDueToTimer
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {policy.isLockedDueToTimer ? (
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white">App Locker Policy</h3>
              <p className="text-xs text-slate-400">
                {policy.isLockedDueToTimer
                  ? 'Locked: Focus timer finished'
                  : `${protectedCount} apps secured by PIN`}
              </p>
            </div>
          </div>

          {/* Master Enabled / Disabled toggle */}
          <button
            onClick={handleToggleMasterPolicy}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 ${
              policy.isPolicyActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3 h-3" />
            {policy.isPolicyActive ? 'Active' : 'Off'}
          </button>
        </div>

        {/* Lockout action button */}
        {policy.isLockedDueToTimer ? (
          <button
            onClick={handleUnlockApps}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:from-emerald-500 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Enter PIN to Unlock Apps
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
            <span className="text-slate-400">Auto-lock on timer end</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLockNow}
                className="text-[11px] text-rose-400 hover:underline font-medium"
              >
                Test Lock
              </button>
              <button
                onClick={handleToggleAutoLock}
                className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                  policy.autoLockOnTimerExpiration ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    policy.autoLockOnTimerExpiration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. SECURITY PIN ROW */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Security PIN:</span>
          <span className="font-mono text-slate-500">••••</span>
        </div>

        <button
          onClick={() => {
            onTapSound();
            onRequestPinAuth(() => setShowChangePinModal(true));
          }}
          className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
        >
          Change PIN
        </button>
      </div>

      {/* 3. STRAIGHTFORWARD APP LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Protected Apps ({policy.apps.length})
          </span>
          <button
            onClick={() => {
              onTapSound();
              setShowAddAppModal(true);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add App
          </button>
        </div>

        <div className="space-y-1.5">
          {policy.apps.map((app) => (
            <div
              key={app.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                app.isProtected
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-950/40 border-slate-850/40 opacity-50'
              }`}
            >
              {/* App icon & name */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-sm`}
                >
                  {renderIcon(app.icon)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{app.name}</h4>
                  <span className="text-[10px] text-slate-500 block">{app.category}</span>
                </div>
              </div>

              {/* Controls: Mode pill & Protection Switch */}
              <div className="flex items-center gap-2.5">
                {app.isProtected && (
                  <button
                    onClick={() => handleToggleMode(app.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition active:scale-95 ${
                      app.lockMode === 'lock'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-purple-950 text-purple-300 border border-purple-500/40'
                    }`}
                    title="Tap to switch between Lock with PIN and Hide mode"
                  >
                    {app.lockMode === 'lock' ? (
                      <>
                        <Lock className="w-2.5 h-2.5" /> Lock
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-2.5 h-2.5" /> Hide
                      </>
                    )}
                  </button>
                )}

                {/* On/Off Switch */}
                <button
                  onClick={() => handleToggleApp(app.id)}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    app.isProtected ? 'bg-emerald-600' : 'bg-slate-800'
                  }`}
                  title={app.isProtected ? 'Disable' : 'Enable'}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      app.isProtected ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add App Modal */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <form
            onSubmit={handleAddApp}
            className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl"
          >
            <h3 className="text-sm font-bold text-white mb-3">Add Protected App</h3>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">App Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SnapChat, Discord..."
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Restriction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onTapSound();
                      setNewMode('lock');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      newMode === 'lock'
                        ? 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Lock with PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTapSound();
                      setNewMode('hide');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      newMode === 'hide'
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Hide App
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onTapSound();
                  setShowAddAppModal(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs text-slate-400 bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500"
              >
                Add App
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change PIN Modal */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <form
            onSubmit={handleSavePin}
            className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl"
          >
            <h3 className="text-sm font-bold text-white mb-1">Update Security PIN</h3>
            <p className="text-[11px] text-slate-400 mb-3">Set 4 to 6 digits to lock access.</p>

            <div className="space-y-2.5 mb-4">
              <input
                type="password"
                maxLength={6}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="New 4-6 digit PIN"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-base font-mono font-bold text-white tracking-widest focus:outline-none focus:border-emerald-500"
                autoFocus
              />

              <input
                type="password"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm new PIN"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-base font-mono font-bold text-white tracking-widest focus:outline-none focus:border-emerald-500"
              />

              {pinError && <p className="text-[11px] text-rose-400 text-center">{pinError}</p>}
              {pinSuccess && (
                <p className="text-[11px] text-emerald-400 text-center flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> PIN updated!
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onTapSound();
                  setShowChangePinModal(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs text-slate-400 bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500"
              >
                Save PIN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
