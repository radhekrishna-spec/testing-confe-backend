import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = 'https://testing-confe-backend.onrender.com';

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
    fetch(`${API_BASE}/api/admin/college/${collegeId}`)
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

          razorpayLink:
            college.payment?.razorpayLink || '',
          paymentEnabled:
            college.payment?.enabled || false,

          telegramBotToken:
            college.telegram?.botToken || '',
          telegramChatId:
            college.telegram?.chatId || '',

          instagramAccessToken:
            college.instagram?.accessToken || '',
          instagramIgUserId:
            college.instagram?.igUserId || '',
          instagramPageName:
            college.instagram?.pageName || '',

          commandBotToken:
            college.commandBot?.botToken || '',
          commandBotChatId:
            college.commandBot?.chatId || '',

          rootFolderId:
            college.drive?.rootFolderId || '',
          queueFolderId:
            college.drive?.queueFolderId || '',
          postedFolderId:
            college.drive?.postedFolderId || '',
          rejectedFolderId:
            college.drive?.rejectedFolderId || '',
          editArchiveFolderId:
            college.drive?.editArchiveFolderId || '',
          smallConfessionFolder:
            college.drive?.smallConfessionFolder || '',

          safeLimit:
            college.posting?.safeLimit || '',
          templateId:
            college.posting?.templateId || '',

          isActive:
            college.isActive ?? true,
        });
      })
      .finally(() => setLoading(false));
  }, [collegeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
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
          accessToken:
            formData.instagramAccessToken,
          igUserId:
            formData.instagramIgUserId,
          pageName:
            formData.instagramPageName,
        },

        commandBot: {
          botToken: formData.commandBotToken,
          chatId: formData.commandBotChatId,
        },

        drive: {
          rootFolderId:
            formData.rootFolderId,
          queueFolderId:
            formData.queueFolderId,
          postedFolderId:
            formData.postedFolderId,
          rejectedFolderId:
            formData.rejectedFolderId,
          editArchiveFolderId:
            formData.editArchiveFolderId,
          smallConfessionFolder:
            formData.smallConfessionFolder,
        },

        posting: {
          safeLimit:
            Number(formData.safeLimit) || 0,
          templateId: formData.templateId,
        },
      };

      const res = await fetch(
        `${API_BASE}/api/admin/college/${collegeId}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert('College settings updated ✅');
      } else {
        alert(data.error || 'Update failed ❌');
      }
    } catch (error) {
      alert('Something went wrong ❌');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (
    name,
    placeholder
  ) => (
    <input
      name={name}
      placeholder={placeholder}
      value={formData[name]}
      onChange={handleChange}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white placeholder:text-gray-400 outline-none"
    />
  );

  if (loading) {
    return (
      <div className="text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-8">
          ✏ Edit College Settings
        </h1>

        <div className="grid md:grid-cols-2 gap-4">
          {renderInput('name', 'College Name')}
          {renderInput('domain', 'Domain')}
          {renderInput(
            'subdomain',
            'Subdomain'
          )}
          {renderInput('logo', 'Logo URL')}
          {renderInput(
            'razorpayLink',
            'Razorpay Link'
          )}

          {renderInput(
            'telegramBotToken',
            'Telegram Bot Token'
          )}
          {renderInput(
            'telegramChatId',
            'Telegram Chat ID'
          )}

          {renderInput(
            'instagramAccessToken',
            'Instagram Access Token'
          )}
          {renderInput(
            'instagramIgUserId',
            'Instagram User ID'
          )}
          {renderInput(
            'instagramPageName',
            'Instagram Page Name'
          )}

          {renderInput(
            'commandBotToken',
            'Command Bot Token'
          )}
          {renderInput(
            'commandBotChatId',
            'Command Bot Chat ID'
          )}

          {renderInput(
            'rootFolderId',
            'Root Folder ID'
          )}
          {renderInput(
            'queueFolderId',
            'Queue Folder ID'
          )}
          {renderInput(
            'postedFolderId',
            'Posted Folder ID'
          )}
          {renderInput(
            'rejectedFolderId',
            'Rejected Folder ID'
          )}
          {renderInput(
            'editArchiveFolderId',
            'Edit Archive Folder ID'
          )}
          {renderInput(
            'smallConfessionFolder',
            'Small Folder'
          )}

          {renderInput(
            'safeLimit',
            'Safe Limit'
          )}
          {renderInput(
            'templateId',
            'Template ID'
          )}
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
              checked={
                formData.paymentEnabled
              }
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

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-8 w-full rounded-2xl bg-white text-black py-3 font-semibold hover:scale-[1.01] transition"
        >
          {saving
            ? 'Saving...'
            : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}