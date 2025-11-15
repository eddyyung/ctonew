'use client';

import { useState, useEffect } from 'react';
import ApiKeyForm from '@/components/ApiKeyForm';
import AuthStatus from '@/components/AuthStatus';
import Toast from '@/components/Toast';
import TrendingDashboard from '@/components/TrendingDashboard';

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export default function Home() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkInitialAuthStatus();
  }, []);

  const checkInitialAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      setIsAuthenticated(result.isAuthenticated);
    } catch (error) {
      console.error('Error checking initial auth status:', error);
    } finally {
      setAuthCheckComplete(true);
    }
  };

  const handleApiKeySuccess = () => {
    setToast({ message: 'API key validated and stored successfully!', type: 'success' });
    setIsAuthenticated(true);
  };

  const handleApiKeyError = (error: string) => {
    setToast({ message: error, type: 'error' });
  };

  const handleLogout = () => {
    setToast({ message: 'Logged out successfully', type: 'success' });
    setIsAuthenticated(false);
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              YouTube Hot Content Analytics
            </h1>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              Analyze and visualize trending YouTube content with real-time data insights
            </p>
          </div>

          {!authCheckComplete ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {isAuthenticated ? (
                <div className="space-y-6">
                  <AuthStatus onLogout={handleLogout} />
                  <TrendingDashboard />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-gray-800">
                    <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white text-center">
                      Authenticate Your API Key
                    </h2>

                    <div className="mb-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                          Getting Started
                        </h3>
                        <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                          <li>• Get your YouTube Data API v3 key from Google Cloud Console</li>
                          <li>• Enable the YouTube Data API v3 in your project</li>
                          <li>• Enter your API key below to authenticate</li>
                        </ul>
                      </div>
                    </div>

                    <ApiKeyForm onSuccess={handleApiKeySuccess} onError={handleApiKeyError} />
                  </div>

                  <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Why an API Key is Required
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li>✓ Access to real-time YouTube data and analytics</li>
                      <li>✓ Retrieve trending content and channel information</li>
                      <li>✓ Generate comprehensive analytics reports</li>
                      <li>✓ Your API key is stored securely in your browser session only</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
