import { useState } from 'react';

/**
 * Error Test Page
 *
 * This page is for testing the ErrorBoundary component.
 * It should only be used in development and removed before production.
 */

interface BuggyComponentProps {
  shouldThrow: boolean;
}

function BuggyComponent({ shouldThrow }: BuggyComponentProps) {
  if (shouldThrow) {
    throw new Error('Test error thrown intentionally!');
  }
  return <div className="text-green-600">No error - component rendered successfully</div>;
}

export function ErrorTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Error Boundary Test Page
        </h1>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Development Only:</strong> This page is for testing error handling.
            Remove before deploying to production.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Error Boundary</h2>
            <p className="text-gray-600 mb-4">
              Click the button below to trigger an intentional error. The ErrorBoundary
              should catch it and display a fallback UI.
            </p>

            <button
              onClick={() => setShouldThrow(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
            >
              Throw Error
            </button>

            <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">Component Status:</p>
              <BuggyComponent shouldThrow={shouldThrow} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">What to Expect</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                <span>Click "Throw Error" button</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                <span>Component will throw an error during render</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                <span>ErrorBoundary catches the error</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">4.</span>
                <span>Fallback UI is displayed with error details (in dev mode)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">5.</span>
                <span>User can try again or reload the page</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
