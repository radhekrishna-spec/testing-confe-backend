import { useEffect, useState } from 'react';

export default function useDashboardLogic() {
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [colleges, setColleges] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [aiText, setAiText] = useState('');
  const [savingAI, setSavingAI] = useState(false);

  useEffect(() => {
    // fetch('https://testing-confe-backend.onrender.com/api/admin/colleges')
    fetch('http://localhost:3008/api/admin/colleges')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setColleges(data.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const savedActivity = localStorage.getItem('recentActivity');
    if (savedActivity) {
      setRecentActivity(JSON.parse(savedActivity));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
  }, [recentActivity]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const clearActivity = () => {
    setRecentActivity([]);
    setLastResult(null);
    localStorage.removeItem('recentActivity');
  };

  return {
    selectedColleges,
    setSelectedColleges,
    message,
    setMessage,
    loading,
    setLoading,
    progressText,
    setProgressText,
    recentActivity,
    setRecentActivity,
    lastResult,
    setLastResult,
    statusMessage,
    setStatusMessage,
    statusType,
    setStatusType,
    colleges,
    activeTab,
    setActiveTab,
    aiText,
    setAiText,
    savingAI,
    setSavingAI,
    clearActivity,
  };
}
