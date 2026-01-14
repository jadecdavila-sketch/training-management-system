import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usersApi } from '@/services/api';
import { Button } from '@/components/common/Button';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      const response = await usersApi.exportData(user.id);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export your data');
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-8 py-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <h1 className="text-2xl font-bold text-secondary-900">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Name
              </label>
              <div className="text-base text-secondary-900">{user.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Email
              </label>
              <div className="text-base text-secondary-900">{user.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Role
              </label>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                user.role === 'ADMIN' ? 'bg-error-100 text-error-700' :
                user.role === 'FACILITATOR' ? 'bg-warning-100 text-warning-700' :
                'bg-info-100 text-info-700'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Data */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">
            Privacy & Data
          </h2>
          <p className="text-sm text-secondary-600 mb-4">
            You have the right to access and download all personal data we have about you.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-info-50 border border-info-200 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-info-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-info-600">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-secondary-900 mb-1">
                  Download Your Data
                </h3>
                <p className="text-sm text-secondary-600 mb-3">
                  Export all your personal information, training history, and activity logs as a JSON file.
                </p>
                <Button
                  variant="primary"
                  className="bg-info-600 hover:bg-info-700"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? 'Exporting...' : 'Export My Data'}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-secondary-900 mb-1">
                  Data Deletion
                </h3>
                <p className="text-sm text-secondary-600">
                  To request deletion of your personal data, please contact your system administrator. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">
            Your Rights (GDPR)
          </h2>
          <div className="text-sm text-secondary-600 space-y-2">
            <p>
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Right to Access:</strong> You can request a copy of your personal data.</li>
              <li><strong>Right to Rectification:</strong> You can request corrections to your data.</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your personal data.</li>
              <li><strong>Right to Data Portability:</strong> You can export your data in a machine-readable format.</li>
            </ul>
            <p className="mt-3">
              For any privacy-related questions or to exercise these rights, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
