import React, { useState } from 'react';
import { authService } from '../../services/AuthService';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ChangePinForm: React.FC = () => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'verify' | 'new' | 'confirm'>('verify');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVerify = async () => {
    if (oldPin.length !== 4) return;
    setStep('new');
    setError('');
  };

  const handleNext = () => {
    if (newPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      setStep('new');
      setNewPin('');
      setConfirmPin('');
      return;
    }

    setIsProcessing(true);
    const result = await authService.changePin(oldPin, newPin);
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep('verify');
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
      }, 3000);
    } else {
      setError('Current PIN is incorrect or update failed.');
      setStep('verify');
      setOldPin('');
    }
    setIsProcessing(false);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mt-8">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <KeyRound className="text-indigo-600" size={24} />
          <h3 className="text-xl font-bold text-slate-900">Change Security PIN</h3>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in zoom-in duration-300">
            <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-full mb-4">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="text-lg font-bold text-slate-900">PIN Updated Successfully</h4>
            <p className="text-slate-500 text-sm mt-2">Your data has been re-encrypted with your new PIN.</p>
          </div>
        ) : (
          <div className="max-w-xs mx-auto space-y-6">
            <div className="space-y-4">
              {step === 'verify' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    placeholder="••••"
                  />
                </div>
              )}

              {step === 'new' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    placeholder="••••"
                    autoFocus
                  />
                </div>
              )}

              {step === 'confirm' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    placeholder="••••"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-medium justify-center bg-red-50 p-2 rounded-lg">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={step === 'verify' ? handleVerify : step === 'new' ? handleNext : handleChangePin}
              disabled={isProcessing || (step === 'verify' ? oldPin.length !== 4 : step === 'new' ? newPin.length !== 4 : confirmPin.length !== 4)}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all disabled:bg-slate-200"
            >
              {isProcessing ? 'Updating...' : step === 'confirm' ? 'Confirm Change' : 'Next Step'}
            </button>

            {step !== 'verify' && (
              <button
                onClick={() => setStep('verify')}
                className="w-full text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Cancel and reset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
