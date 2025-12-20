import { useRef } from 'react';
import { backupService } from '../../services/backupService';
import { Layout } from '../layout/Layout';

/**
 * Settings page component
 * Application settings and preferences
 */
export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      backupService.exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('WARNING: This action will replace all your current data with the backup. This cannot be undone. Are you sure you want to proceed?')) {
      // Reset input
      event.target.value = '';
      return;
    }

    try {
      await backupService.importData(file);
      alert('Data imported successfully! The page will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please ensure the file is a valid backup.');
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">Manage your application preferences and data.</p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Data Management</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Export your data to create a backup or import data from a previous backup.</p>
            </div>
            <div className="mt-5 flex gap-4">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Export Backup
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Import Backup
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
