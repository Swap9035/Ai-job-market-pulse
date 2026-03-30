// ApiStatus.jsx — shows if Flask backend is reachable
// Shows a warning banner if backend is down
// Disappears automatically when backend comes back

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function ApiStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        await axios.get(`${API_URL}/`, { timeout: 3000 });
        setStatus('online');
      } catch {
        setStatus('offline');
      }
    };

    checkApi();
    // Check every 30 seconds
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if online
  if (status === 'online' || status === 'checking') return null;

  return (
    <div className="bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-800 px-4 py-2 text-center">
      <p className="text-red-600 dark:text-red-300 text-sm">
        ⚠️ Backend server is offline — start Flask with{' '}
        <code className="bg-red-100 dark:bg-red-800 px-1 rounded">
          python app.py
        </code>
      </p>
    </div>
  );
}

export default ApiStatus;