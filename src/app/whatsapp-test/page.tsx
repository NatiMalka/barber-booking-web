'use client';

import { useState } from 'react';

export default function WhatsAppTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testWhatsApp = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/whatsapp-test');
      const data = await response.json();
      setResult(data);
      if (!data.success) {
        setError('Test failed. Check console for details.');
      }
    } catch (err) {
      setError('Error running test: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Integration Test</h1>
      
      <button
        onClick={testWhatsApp}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test WhatsApp Integration'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && !error && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Test completed successfully! Check your WhatsApp for a test message.
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">API Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 