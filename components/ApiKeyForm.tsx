'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const apiKeySchema = z.object({
  apiKey: z
    .string()
  apiKey: z.string()
    .min(1, 'API key is required')
    .min(10, 'API key appears to be too short')
    .regex(/^[A-Za-z0-9_-]+$/, 'API key contains invalid characters'),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

interface ApiKeyFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function ApiKeyForm({ onSuccess, onError }: ApiKeyFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeySchema),
  });

  const onSubmit = async (data: ApiKeyFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        reset();
        onSuccess();
      } else {
        onError(result.error || 'Failed to validate API key');
      }
    } catch {
      onError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            YouTube Data API Key
          </label>
          <input
            {...register('apiKey')}
            type="password"
            id="apiKey"
            placeholder="Enter your YouTube Data API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
          {errors.apiKey && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.apiKey.message}</p>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.apiKey.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Validating...
              </div>
            ) : (
              'Validate & Store API Key'
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="mb-1">Your API key will be stored securely in your browser session.</p>
        <p>
          Get your API key from the{' '}
          <a
            href="https://console.developers.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Google Cloud Console
          </a>
          .
        </p>
      </div>
    </div>
  );
}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="mb-1">Your API key will be stored securely in your browser session.</p>
        <p>Get your API key from the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a>.</p>
      </div>
    </div>
  );
}
