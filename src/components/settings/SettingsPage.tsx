import { Layout } from '../layout/Layout';
import { ExportButton } from './ExportButton';
import { ImportButton } from './ImportButton';
import { ChangePinForm } from './ChangePinForm';
import { ShieldAlert } from 'lucide-react';

/**
 * Settings page component
 * Application settings and preferences
 */
export function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="mt-2 text-slate-600">Secure your configuration and manage your financial data.</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Security & Backups</h3>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              All your data is encrypted locally using your 4-digit PIN. To move your data between devices or keep a safe copy, use the export feature below.
            </p>

            <div className="space-y-6">
              <ExportButton />
              <ImportButton />
              <ChangePinForm />

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <strong>Warning:</strong> Exported backups are encrypted with your CURRENT PIN.
                  If you change your PIN later, older backups will still require the PIN they were created with.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400">
            <span>Encryption Standard: AES-256-GCM</span>
            <span>KDF: PBKDF2 (600k iterations)</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
