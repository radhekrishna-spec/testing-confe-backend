import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config';
import RecentActivityPanel from '../components//RecentActivity';
import AITrainingPanel from '../components/AITrainingPanel';
import CollegesGrid from '../components/CollegesGrid';
import GlobalComposerPanel from '../components/GlobalComposerPanel';
import useDashboardLogic from '../hooks/useDashboardLogic';
export default function Dashboard() {
  const navigate = useNavigate();

  const {
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
  } = useDashboardLogic();

  const retryFailedColleges = async () => {
    if (!lastResult) return;

    const failedColleges = lastResult
      .filter((item) => item.status === 'FAILED')
      .map((item) => item.collegeId);

    if (failedColleges.length === 0) {
      alert('No failed colleges');
      return;
    }

    setSelectedColleges(failedColleges);
    await sendToSelectedColleges();
  };

  const sendToSelectedColleges = async () => {
    if (!message.trim()) {
      alert('Please write a confession');
      return;
    }

    if (selectedColleges.length === 0) {
      alert('Please select at least one college');
      return;
    }

    try {
      setLoading(true);
      setProgressText(`Sending to ${selectedColleges.length} colleges...`);

      const res = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          collegeIds: selectedColleges,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      setRecentActivity((prev) => [
        {
          type: 'Selected',
          colleges: [...selectedColleges],
          message,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);

      setLastResult(data.data);
      setStatusType('success');
      setStatusMessage('Sent successfully 🚀');

      setMessage('');
      setSelectedColleges([]);
      setProgressText('');
    } catch (error) {
      console.error(error);
      setStatusType('error');
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendToAllColleges = async () => {
    if (!message.trim()) {
      alert('Please write a confession');
      return;
    }

    try {
      setLoading(true);
      setProgressText('Broadcasting to all colleges...');

      const res = await fetch(`${API_BASE}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          collegeIds: colleges.map((c) => c.collegeId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Broadcast failed');
      }

      setRecentActivity((prev) => [
        {
          type: 'Broadcast',
          colleges: [...colleges],
          message,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);

      setLastResult(data.data);
      setStatusType('success');
      setStatusMessage('Broadcast sent 🚀');

      setMessage('');
      setSelectedColleges([]);
      setProgressText('');
    } catch (error) {
      console.error(error);
      setStatusType('error');
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAITraining = async () => {
    if (!aiText.trim()) {
      alert('Write AI training text first');
      return;
    }

    if (selectedColleges.length === 0) {
      alert('Select at least one college');
      return;
    }

    try {
      setSavingAI(true);

      const requests = selectedColleges.map((collegeCode) =>
        fetch(`${API_BASE}/api/admin/ai-training/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            collegeCode,
            text: aiText,
            source: 'super_admin',
          }),
        }),
      );

      await Promise.all(requests);

      setStatusType('success');
      setStatusMessage(
        `AI training saved for ${selectedColleges.join(', ')} ✅`,
      );

      setAiText('');
      setSelectedColleges([]);
    } catch (error) {
      console.error(error);
      setStatusType('error');
      setStatusMessage('Save failed ❌');
    } finally {
      setSavingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Top Navbar */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🚀 Super Admin</h1>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl border border-white/20"
            >
              Frontend
            </button>

            <button
              onClick={() => navigate('/admin/backend')}
              className="px-4 py-2 rounded-xl border border-white/20"
            >
              Backend
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('adminAuth');
                navigate('/admin/login');
              }}
              className="px-4 py-2 rounded-xl bg-red-500 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/create-college')}
          className="px-5 py-3 rounded-2xl border border-white/20"
        >
          🏫 Create College
        </button>

        <button
          onClick={() => setActiveTab('global')}
          className={`px-5 py-3 rounded-2xl ${
            activeTab === 'global'
              ? 'bg-white text-black'
              : 'border border-white/20'
          }`}
        >
          🌍 Global
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-5 py-3 rounded-2xl ${
            activeTab === 'ai'
              ? 'bg-white text-black'
              : 'border border-white/20'
          }`}
        >
          🤖 AI Training
        </button>
      </div>

      {/* Status */}
      {statusMessage && (
        <div
          className={`mb-6 rounded-2xl p-3 ${
            statusType === 'success'
              ? 'bg-green-500/20 border border-green-400'
              : 'bg-red-500/20 border border-red-400'
          }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Panels */}
      {activeTab === 'global' && (
        <GlobalComposerPanel
          colleges={colleges}
          selectedColleges={selectedColleges}
          setSelectedColleges={setSelectedColleges}
          message={message}
          setMessage={setMessage}
          loading={loading}
          progressText={progressText}
          sendToSelectedColleges={sendToSelectedColleges}
          sendToAllColleges={sendToAllColleges}
        />
      )}

      {activeTab === 'ai' && (
        <AITrainingPanel
          colleges={colleges}
          selectedColleges={selectedColleges}
          setSelectedColleges={setSelectedColleges}
          aiText={aiText}
          setAiText={setAiText}
          savingAI={savingAI}
          saveAITraining={saveAITraining}
        />
      )}

      {/* Recent Activity */}
      <RecentActivityPanel
        recentActivity={recentActivity}
        lastResult={lastResult}
        retryFailedColleges={retryFailedColleges}
        clearActivity={clearActivity}
      />

      {/* Colleges Grid */}
      <CollegesGrid colleges={colleges} />
    </div>
  );
}
