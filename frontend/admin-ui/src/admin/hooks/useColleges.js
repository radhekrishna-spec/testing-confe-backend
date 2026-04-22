import { useEffect, useState } from 'react';
import { API_BASE } from '../../config';

export default function useColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/colleges`)
      .then((res) => res.json())
      .then((data) => {
        setColleges(data?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { colleges, loading };
}
