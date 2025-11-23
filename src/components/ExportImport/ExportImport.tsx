// export/import progress component

import { useState } from 'react';
import { exportData, importData, clearAllData } from '../../services/localStore';

interface ExportImportProps {
  onClose: () => void;
}

export function ExportImport({ onClose }: ExportImportProps) {
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dabaago-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage('Export successful!');
    } catch (error) {
      setMessage('Export failed: ' + (error as Error).message);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      setMessage('Import successful! Please refresh the page.');
    } catch (error) {
      setMessage('Import failed: ' + (error as Error).message);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        await clearAllData();
        setMessage('All data cleared. Please refresh the page.');
      } catch (error) {
        setMessage('Clear failed: ' + (error as Error).message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Export / Import</h2>

        <div className="space-y-4">
          <div>
            <button
              onClick={handleExport}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export Progress
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Download your progress as a JSON file
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Import Progress</label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-600 mt-2">
              Select a previously exported JSON file
            </p>
          </div>

          <div>
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Data
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Permanently delete all progress and statistics
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes('failed') || message.includes('Clear') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

