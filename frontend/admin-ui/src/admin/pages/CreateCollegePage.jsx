import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateCollegePage() {
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  const handleSubmit = async () => {
    if (!formData.collegeId.trim() || !formData.name.trim()) {
      alert('College ID and Name are required ❌');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        collegeId: formData.collegeId || '',
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
        'https://testing-confe-backend.onrender.com/api/admin/college/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert('College created successfully ✅');
        resetForm();

        setTimeout(() => {
          navigate('/admin');
        }, 800);
      } else {
        alert(data.error || 'Failed ❌');
      }
    } catch (error) {
      console.error('CREATE COLLEGE ERROR:', error);
      alert('Something went wrong ❌');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen p-6 bg-violet-50">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-violet-700 mb-6">
          Create New College 🏫
        </h1>

        <div className="grid gap-4">
          {renderInput('collegeId', 'College ID (miet)')}
          {renderInput('name', 'College Name')}
          {renderInput('domain', 'Domain')}
          {renderInput('subdomain', 'Subdomain')}
          {renderInput('logo', 'Logo URL')}

          <div>
            <label className="text-sm text-gray-500 mb-1 block">
              Theme Color
            </label>
            <input
              type="color"
              name="themeColor"
              value={formData.themeColor}
              onChange={handleChange}
              className="h-12 w-full rounded-xl"
            />
          </div>

          {renderInput('razorpayLink', 'Razorpay Payment Link')}

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="paymentEnabled"
              checked={formData.paymentEnabled}
              onChange={handleChange}
            />
            Payment Enabled
          </label>

          {renderInput('telegramBotToken', 'Telegram Bot Token')}
          {renderInput('telegramChatId', 'Telegram Chat ID')}

          {renderInput('instagramAccessToken', 'Instagram Access Token')}
          {renderInput('instagramIgUserId', 'Instagram IG User ID')}
          {renderInput('instagramPageName', 'Instagram Page Name')}

          {renderInput('commandBotToken', 'Command Bot Token')}
          {renderInput('commandBotChatId', 'Command Bot Chat ID')}

          {renderInput('rootFolderId', 'Drive Root Folder ID')}
          {renderInput('queueFolderId', 'Queue Folder ID')}
          {renderInput('postedFolderId', 'Posted Folder ID')}
          {renderInput('rejectedFolderId', 'Rejected Folder ID')}
          {renderInput('editArchiveFolderId', 'Edit Archive Folder ID')}
          {renderInput('smallConfessionFolder', 'Small Confession Folder ID')}

          {renderInput('safeLimit', 'Safe Limit')}
          {renderInput('templateId', 'Template ID')}

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
            onClick={handleSubmit}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl transition"
          >
            {loading ? 'Saving...' : 'Create College'}
          </button>
        </div>
      </div>
    </div>
  );
}
