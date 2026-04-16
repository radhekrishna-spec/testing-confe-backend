import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditCollegeSettingsPage() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  const initialState = {
    collegeId: '',
    name: '',
    domain: '',
    subdomain: '',
    logo: '',
    themeColor: '#000000',

    razorpayLink: '',
    paymentEnabled: false,

    telegramBotToken: '',
    telegramChatId: '',

    instagramAccessToken: '',
    instagramIgUserId: '',
    instagramPageName: '',

    commandBotToken: '',
    commandBotChatId: '',

    rootFolderId: '',
    queueFolderId: '',
    postedFolderId: '',
    rejectedFolderId: '',
    editArchiveFolderId: '',
    smallConfessionFolder: '',

    safeLimit: '',
    templateId: '',

    isActive: true,
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(
      `https://testing-confe-backend.onrender.com/api/admin/college/${collegeId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        const college = data?.data;
        if (!college) return;

        setFormData({
          collegeId: college.collegeId || '',
          name: college.name || '',
          domain: college.domain || '',
          subdomain: college.subdomain || '',
          logo: college.logo || '',
          themeColor: college.themeColor || '#000000',

          razorpayLink: college.payment?.razorpayLink || '',
          paymentEnabled: college.payment?.enabled || false,

          telegramBotToken: college.telegram?.botToken || '',
          telegramChatId: college.telegram?.chatId || '',

          instagramAccessToken: college.instagram?.accessToken || '',
          instagramIgUserId: college.instagram?.igUserId || '',
          instagramPageName: college.instagram?.pageName || '',

          commandBotToken: college.commandBot?.botToken || '',
          commandBotChatId: college.commandBot?.chatId || '',

          rootFolderId: college.drive?.rootFolderId || '',
          queueFolderId: college.drive?.queueFolderId || '',
          postedFolderId: college.drive?.postedFolderId || '',
          rejectedFolderId: college.drive?.rejectedFolderId || '',
          editArchiveFolderId: college.drive?.editArchiveFolderId || '',
          smallConfessionFolder: college.drive?.smallConfessionFolder || '',

          safeLimit: college.posting?.safeLimit || '',
          templateId: college.posting?.templateId || '',

          isActive: college.isActive ?? true,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [collegeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        name: formData.name || '',
        domain: formData.domain || '',
        subdomain: formData.subdomain || '',
        logo: formData.logo || '',
        themeColor: formData.themeColor || '#000000',
        isActive: formData.isActive,

        payment: {
          razorpayLink: formData.razorpayLink || '',
          enabled: formData.paymentEnabled || false,
        },

        telegram: {
          botToken: formData.telegramBotToken || '',
          chatId: formData.telegramChatId || '',
        },

        instagram: {
          accessToken: formData.instagramAccessToken || '',
          igUserId: formData.instagramIgUserId || '',
          pageName: formData.instagramPageName || '',
        },

        commandBot: {
          botToken: formData.commandBotToken || '',
          chatId: formData.commandBotChatId || '',
        },

        drive: {
          rootFolderId: formData.rootFolderId || '',
          queueFolderId: formData.queueFolderId || '',
          postedFolderId: formData.postedFolderId || '',
          rejectedFolderId: formData.rejectedFolderId || '',
          editArchiveFolderId: formData.editArchiveFolderId || '',
          smallConfessionFolder: formData.smallConfessionFolder || '',
        },

        posting: {
          safeLimit: Number(formData.safeLimit) || 0,
          templateId: formData.templateId || '',
        },
      };

      const res = await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/college/${collegeId}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert('College settings updated ✅');
      } else {
        alert(data.error || 'Update failed ❌');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong ❌');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (name, placeholder) => (
    <input
      name={name}
      placeholder={placeholder}
      value={formData[name]}
      onChange={handleChange}
      className="border p-3 rounded-xl"
    />
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-violet-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 border px-4 py-2 rounded-xl"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-violet-700 mb-6">
          Edit College Settings
        </h1>

        <div className="grid gap-4">
          {renderInput('name', 'College Name')}
          {renderInput('domain', 'Domain')}
          {renderInput('subdomain', 'Subdomain')}
          {renderInput('logo', 'Logo URL')}

          <input
            type="color"
            name="themeColor"
            value={formData.themeColor}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />

          {renderInput('razorpayLink', 'Razorpay Link')}

          {renderInput('telegramBotToken', 'Telegram Bot Token')}
          {renderInput('telegramChatId', 'Telegram Chat ID')}

          {renderInput('instagramAccessToken', 'Instagram Access Token')}
          {renderInput('instagramIgUserId', 'Instagram IG User ID')}
          {renderInput('instagramPageName', 'Instagram Page Name')}

          {renderInput('commandBotToken', 'Command Bot Token')}
          {renderInput('commandBotChatId', 'Command Bot Chat ID')}

          {renderInput('rootFolderId', 'Root Folder ID')}
          {renderInput('queueFolderId', 'Queue Folder ID')}
          {renderInput('postedFolderId', 'Posted Folder ID')}
          {renderInput('rejectedFolderId', 'Rejected Folder ID')}
          {renderInput('editArchiveFolderId', 'Edit Archive Folder ID')}
          {renderInput('smallConfessionFolder', 'Small Confession Folder')}

          {renderInput('safeLimit', 'Safe Limit')}
          {renderInput('templateId', 'Template ID')}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="paymentEnabled"
              checked={formData.paymentEnabled}
              onChange={handleChange}
            />
            Payment Enabled
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            College Active
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-violet-600 text-white py-3 rounded-xl"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
