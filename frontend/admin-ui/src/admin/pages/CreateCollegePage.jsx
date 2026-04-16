import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateCollegePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
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

      isActive: true,
    });
  };

  const handleSubmit = async () => {
    if (!formData.collegeId.trim() || !formData.name.trim()) {
      alert('College ID and Name are required ❌');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        'https://testing-confe-backend.onrender.com/api/admin/college/create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collegeId: formData.collegeId.trim(),
            name: formData.name.trim(),
            domain: formData.domain.trim(),
            subdomain: formData.subdomain.trim(),
            logo: formData.logo.trim(),
            themeColor: formData.themeColor,

            isActive: formData.isActive,

            payment: {
              razorpayLink: formData.razorpayLink.trim(),
              enabled: formData.paymentEnabled,
            },

            telegram: {
              botToken: formData.telegramBotToken.trim(),
              chatId: formData.telegramChatId.trim(),
            },

            instagram: {
              accessToken: formData.instagramAccessToken.trim(),
              igUserId: formData.instagramIgUserId.trim(),
              pageName: formData.instagramPageName.trim(),
            },
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert('College created successfully ✅');
        resetForm();

        // optional redirect
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

  return (
    <div className="min-h-screen p-6 bg-violet-50">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-violet-700 mb-6">
          Create New College 🏫
        </h1>

        <div className="grid gap-4">
          <input
            name="collegeId"
            placeholder="College ID (miet)"
            value={formData.collegeId}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="name"
            placeholder="College Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="domain"
            placeholder="Domain"
            value={formData.domain}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="subdomain"
            placeholder="Subdomain"
            value={formData.subdomain}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="logo"
            placeholder="Logo URL"
            value={formData.logo}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

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

          <input
            name="razorpayLink"
            placeholder="Razorpay Payment Link"
            value={formData.razorpayLink}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="paymentEnabled"
              checked={formData.paymentEnabled}
              onChange={handleChange}
            />
            Payment Enabled
          </label>

          <input
            name="telegramBotToken"
            placeholder="Telegram Bot Token"
            value={formData.telegramBotToken}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="telegramChatId"
            placeholder="Telegram Chat ID"
            value={formData.telegramChatId}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="instagramAccessToken"
            placeholder="Instagram Access Token"
            value={formData.instagramAccessToken}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="instagramIgUserId"
            placeholder="Instagram IG User ID"
            value={formData.instagramIgUserId}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

          <input
            name="instagramPageName"
            placeholder="Instagram Page Name"
            value={formData.instagramPageName}
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />

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
