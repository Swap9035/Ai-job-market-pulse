// ApiStatus.jsx — fixed version

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ApiStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        // Use a proper API endpoint instead of root
        await axios.get(`${API_URL}/api/jobs`, { timeout: 8000 });

        setStatus('online');
      } catch (err) {
        console.log("API check failed:", err.message);

        // Only mark offline if it's REALLY failing
        setStatus('offline');
      }
    };

    checkApi();

    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if working
  if (status === 'online' || status === 'checking') return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-center">
      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
        ⚠️ Backend is waking up... (Render free tier sleeps)
      </p>
    </div>
  );
}

export default ApiStatus;