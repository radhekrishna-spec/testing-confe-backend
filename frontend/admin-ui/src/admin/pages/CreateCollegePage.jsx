import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';


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
        collegeId: formData.collegeId,
        name: formData.name,
        domain: formData.domain,
        subdomain: formData.subdomain,
        logo: formData.logo,
        themeColor: formData.themeColor,
        isActive: formData.isActive,

        payment: {
          razorpayLink: formData.razorpayLink,
          enabled: formData.paymentEnabled,
        },

        telegram: {
          botToken: formData.telegramBotToken,
          chatId: formData.telegramChatId,
        },

        instagram: {
          accessToken: formData.instagramAccessToken,
          igUserId: formData.instagramIgUserId,
          pageName: formData.instagramPageName,
        },

        commandBot: {
          botToken: formData.commandBotToken,
          chatId: formData.commandBotChatId,
        },

        drive: {
          rootFolderId: formData.rootFolderId,
          queueFolderId: formData.queueFolderId,
          postedFolderId: formData.postedFolderId,
          rejectedFolderId: formData.rejectedFolderId,
          editArchiveFolderId: formData.editArchiveFolderId,
          smallConfessionFolder: formData.smallConfessionFolder,
        },

        posting: {
          safeLimit: Number(formData.safeLimit) || 0,
          templateId: formData.templateId,
        },
      };

      const res = await fetch(
        `${API_BASE}/api/admin/college/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert('College created successfully ✅');
        resetForm();

        setTimeout(() => {
          navigate('/admin');
        }, 700);
      } else {
        alert(data.error || 'Failed ❌');
      }
    } catch (error) {
      console.error(error);
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
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-gray-400 outline-none"
    />
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8">
          🏫 Create New College
        </h1>

        <div className="grid md:grid-cols-2 gap-4">
          {renderInput('collegeId', 'College ID')}
          {renderInput('name', 'College Name')}
          {renderInput('domain', 'Domain')}
          {renderInput('subdomain', 'Subdomain')}
          {renderInput('logo', 'Logo URL')}
          {renderInput('razorpayLink', 'Razorpay Link')}

          {renderInput('telegramBotToken', 'Telegram Bot Token')}
          {renderInput('telegramChatId', 'Telegram Chat ID')}

          {renderInput(
            'instagramAccessToken',
            'Instagram Access Token'
          )}
          {renderInput('instagramIgUserId', 'Instagram User ID')}
          {renderInput('instagramPageName', 'Instagram Page Name')}

          {renderInput('commandBotToken', 'Command Bot Token')}
          {renderInput('commandBotChatId', 'Command Bot Chat ID')}

          {renderInput('rootFolderId', 'Root Folder ID')}
          {renderInput('queueFolderId', 'Queue Folder ID')}
          {renderInput('postedFolderId', 'Posted Folder ID')}
          {renderInput('rejectedFolderId', 'Rejected Folder ID')}
          {renderInput(
            'editArchiveFolderId',
            'Edit Archive Folder ID'
          )}
          {renderInput(
            'smallConfessionFolder',
            'Small Confession Folder'
          )}

          {renderInput('safeLimit', 'Safe Limit')}
          {renderInput('templateId', 'Template ID')}
        </div>

        {/* Theme Color */}
        <div className="mt-6">
          <label className="text-sm text-gray-400 block mb-2">
            Theme Color
          </label>
          <input
            type="color"
            name="themeColor"
            value={formData.themeColor}
            onChange={handleChange}
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5"
          />
        </div>

        {/* Checkboxes */}
        <div className="mt-6 space-y-3">
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
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-white text-black py-3 font-semibold hover:scale-[1.01] transition"
        >
          {loading ? 'Saving...' : 'Create College'}
        </button>
      </div>
    </div>
  );
}