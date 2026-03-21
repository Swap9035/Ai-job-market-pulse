// useApi.js — reusable data fetching hook
// Instead of writing useState + useEffect in every component,
// we put the logic here and reuse it everywhere
// This is called a "custom hook" — a key React pattern

import { useState, useEffect } from 'react';
import axios from 'axios';

export const API_URL = 'http://localhost:5000';

function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}${endpoint}`);
        setData(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}

export default useApi;