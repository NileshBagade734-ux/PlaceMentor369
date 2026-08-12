import { useState, useEffect } from 'react';

/**
 * Custom React hook for fetching, filtering, and caching job listings
 */
export function useFetchJobs(endpoint = '/api/jobs') {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch job postings');
        const data = await res.json();
        if (isMounted) {
          setJobs(Array.isArray(data) ? data : data.jobs || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchJobs();
    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { jobs, loading, error, setJobs };
}
