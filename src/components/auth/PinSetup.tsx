import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export const PinSetup: React.FC = () => {
  const { setupPin } = useAuth();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'entry' | 'confirm'>('entry');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNext = useCallback(() => {
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    setError('');
    setStep('confirm');
  }, [pin]);

  const handleConfirm = useCallback(async () => {
    if (pin !== confirmPin) {
      setError('PINs do not match. Please try again.');
      setStep('entry');
      setPin('');
      setConfirmPin('');
      return;
    }

    setIsProcessing(true);
    try {
      await setupPin(pin);
    } catch {
      setError('Failed to setup PIN. Please try again.');
      setIsProcessing(false);
    }
  }, [pin, confirmPin, setupPin]);

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold">Secure Your Data</h1>
          <p className="text-indigo-100 mt-2">Create a 4-digit PIN to encrypt your estate information.</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2 font-bold text-amber-900 italic">
              <ShieldAlert size={18} />
              <span>DANGER: NO RECOVERY</span>
            </div>
            <p className="text-xs leading-relaxed">
              If you forget your PIN, all your data will be <strong>permanently lost</strong> and cannot be recovered.
              Backups are also encrypted with this PIN. Choose something you will remember.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {step === 'entry' ? 'Enter 4-digit PIN' : 'Confirm 4-digit PIN'}
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={step === 'entry' ? pin : confirmPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (step === 'entry') setPin(val);
                  else setConfirmPin(val);
                  if (error) setError('');
                }}
                className="w-full text-center text-3xl tracking-[1em] py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                placeholder="••••"
                autoFocus
                disabled={isProcessing}
              />
            </div>

            <button
              onClick={step === 'entry' ? handleNext : handleConfirm}
              disabled={isProcessing || (step === 'entry' ? pin.length !== 4 : confirmPin.length !== 4)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
            >
              {isProcessing ? 'Securing...' : step === 'entry' ? 'Next' : 'Secure App Now'}
            </button>

            {step === 'confirm' && (
              <button
                onClick={() => setStep('entry')}
                className="w-full text-slate-500 text-sm font-medium hover:text-slate-700"
                disabled={isProcessing}
              >
                Back to change PIN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
