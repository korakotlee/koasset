import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Unlock, ShieldAlert, Timer } from 'lucide-react';

export const PinEntry: React.FC = () => {
  const { login, lockoutStatus } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.length !== 4) return;

    setIsProcessing(true);
    const success = await login(pin);
    if (!success) {
      setError('Incorrect PIN. Please try again.');
      setPin('');
      setIsProcessing(false);
    }
  }, [pin, login]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (lockoutStatus.isLocked) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-red-100">
          <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full mb-6 animate-pulse">
            <Lock size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Application Locked</h1>
          <p className="text-slate-600 mt-4 leading-relaxed">
            Too many failed PIN attempts. For security, your data is locked to prevent unauthorized access.
          </p>

          <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-center gap-2 text-indigo-600 mb-2 font-bold uppercase tracking-wider text-xs">
              <Timer size={14} />
              <span>Unlocks In</span>
            </div>
            <div className="text-4xl font-mono font-black text-slate-800 tracking-widest">
              {formatTime(lockoutStatus.remainingMs)}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-8 italic">
            This lockout is local to this device. Clearing browser cache might reset the timer but will NOT bypass encryption.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            <Unlock size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-indigo-100 mt-2">Enter your secure PIN to access your data.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secure 4-Digit PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setPin(val);
                  if (error) setError('');
                }}
                className={`w-full text-center text-3xl tracking-[1em] py-4 bg-slate-50 border-2 rounded-xl outline-none transition-all ${
                  error ? 'border-red-300 focus:border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                }`}
                placeholder="••••"
                autoFocus
                disabled={isProcessing}
              />
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm font-medium">
                  <ShieldAlert size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || pin.length !== 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              {isProcessing ? 'Verifying...' : 'Unlock Vault'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed px-4">
            Forgotten PIN? Your data is permanently encrypted and cannot be recovered without it.
          </p>
        </div>
      </div>
    </div>
  );
};
