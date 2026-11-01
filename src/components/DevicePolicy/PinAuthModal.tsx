import React, { useState } from 'react';
import { Lock, Delete, X, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PinAuthModalProps {
  isOpen: boolean;
  correctPin: string;
  securityQuestion: string;
  securityAnswer: string;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
  onKeypadSound: (digit: string) => void;
  onSuccessSound: () => void;
  onErrorSound: () => void;
  onTapSound: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  correctPin,
  securityQuestion,
  securityAnswer,
  title = 'Device Policy Authentication',
  subtitle = 'Enter security PIN to access protected settings',
  onSuccess,
  onCancel,
  onKeypadSound,
  onSuccessSound,
  onErrorSound,
  onTapSound,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [showForgot, setShowForgot] = useState<boolean>(false);
  const [enteredAnswer, setEnteredAnswer] = useState<string>('');
  const [forgotError, setForgotError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    onKeypadSound(digit);
    const newPin = pin + digit;
    setPin(newPin);
    setIsError(false);

    // If matches target PIN length (usually 4 digits)
    if (newPin.length === correctPin.length) {
      if (newPin === correctPin) {
        onSuccessSound();
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 200);
      } else {
        onErrorSound();
        setIsError(true);
        setTimeout(() => {
          setPin('');
          setIsError(false);
        }, 700);
      }
    }
  };

  const handleBackspace = () => {
    onTapSound();
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleClear = () => {
    onTapSound();
    setPin('');
    setIsError(false);
  };

  const handleVerifySecurityAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAnswer.trim().toLowerCase() === securityAnswer.trim().toLowerCase()) {
      onSuccessSound();
      setShowForgot(false);
      setEnteredAnswer('');
      onSuccess();
    } else {
      onErrorSound();
      setForgotError(true);
      setTimeout(() => setForgotError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs bg-slate-900 border-2 ${
          isError ? 'border-rose-500 animate-shake' : 'border-slate-800'
        } rounded-3xl p-6 shadow-2xl relative text-center`}
      >
        {/* Cancel Button */}
        <button
          onClick={() => {
            onTapSound();
            setPin('');
            onCancel();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!showForgot ? (
          <>
            {/* Header Lock Icon */}
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">{subtitle}</p>

            {/* PIN Dots Display */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {Array.from({ length: correctPin.length }).map((_, idx) => {
                const isFilled = idx < pin.length;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                      isError
                        ? 'bg-rose-500 border-rose-400 shadow-[0_0_8px_#f43f5e]'
                        : isFilled
                        ? 'bg-emerald-400 border-emerald-300 scale-110 shadow-[0_0_8px_#10b981]'
                        : 'border-slate-700 bg-slate-950'
                    }`}
                  />
                );
              })}
            </div>

            {isError && (
              <p className="text-xs text-rose-400 font-semibold mb-3 animate-pulse">
                Incorrect PIN. Please try again.
              </p>
            )}

            {/* Android Keypad 3x4 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(digit)}
                  className="aspect-square rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 active:bg-emerald-600 active:text-white border border-slate-800/80 text-xl font-bold text-slate-100 flex items-center justify-center shadow-sm active:scale-95 transition"
                >
                  {digit}
                </button>
              ))}

              {/* Clear */}
              <button
                onClick={handleClear}
                className="aspect-square rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/50 text-xs font-semibold text-slate-400 flex items-center justify-center active:scale-95 transition"
              >
                Clear
              </button>

              {/* Zero */}
              <button
                onClick={() => handleDigit('0')}
                className="aspect-square rounded-2xl bg-slate-950/80 hover:bg-slate-800/90 active:bg-emerald-600 active:text-white border border-slate-800/80 text-xl font-bold text-slate-100 flex items-center justify-center shadow-sm active:scale-95 transition"
              >
                0
              </button>

              {/* Backspace */}
              <button
                onClick={handleBackspace}
                className="aspect-square rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/50 text-slate-400 flex items-center justify-center active:scale-95 transition"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Forgot PIN / Default Hint */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span>Default PIN: <strong className="text-slate-400">1234</strong></span>
              <button
                onClick={() => {
                  onTapSound();
                  setShowForgot(true);
                }}
                className="text-emerald-400 hover:underline"
              >
                Forgot PIN?
              </button>
            </div>
          </>
        ) : (
          /* Forgot PIN / Recovery Screen */
          <form onSubmit={handleVerifySecurityAnswer} className="text-left">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white text-center">Security Verification</h3>
            <p className="text-xs text-slate-400 text-center mb-4">
              Answer your security question to unlock Device Policy
            </p>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Security Question:
              </label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-medium">
                {securityQuestion}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Your Answer:
              </label>
              <input
                type="text"
                value={enteredAnswer}
                onChange={(e) => setEnteredAnswer(e.target.value)}
                placeholder="Enter answer (Hint: Discipline)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              {forgotError && (
                <p className="text-[11px] text-rose-400 font-semibold mt-1">
                  Incorrect answer. Try again.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onTapSound();
                  setShowForgot(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700"
              >
                Back to PIN
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
              >
                Verify & Unlock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
