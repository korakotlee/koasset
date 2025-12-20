import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button variant="outline" size="small" onClick={onRetry} className="bg-white text-red-700 border-red-300 hover:bg-red-50">
                {retryLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
