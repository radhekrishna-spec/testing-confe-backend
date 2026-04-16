import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function EditCollegeSettingsPage() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    collegeId: '',
    name: '',
    domain: '',
    subdomain: '',
    logo: '',
    themeColor: '#000000',
    isActive: true,
    razorpayLink: '',
    paymentEnabled: false,
  });

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
          isActive: college.isActive ?? true,
          razorpayLink: college.payment?.razorpayLink || '',
          paymentEnabled: college.payment?.enabled || false,
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

      const res = await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/college/${collegeId}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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
          }),
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-violet-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-6">
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

          <input
            type="color"
            name="themeColor"
            value={formData.themeColor}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />

          <input
            name="razorpayLink"
            placeholder="Razorpay Link"
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
