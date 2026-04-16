import { useState } from 'react';

export default function CreateCollegePage() {
  const [formData, setFormData] = useState({
    collegeId: '',
    name: '',
    domain: '',
    subdomain: '',
    logo: '',
    themeColor: '#000000',
    razorpayLink: '',
    paymentEnabled: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
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
            collegeId: formData.collegeId,
            name: formData.name,
            domain: formData.domain,
            subdomain: formData.subdomain,
            logo: formData.logo,
            themeColor: formData.themeColor,
            payment: {
              razorpayLink: formData.razorpayLink,
              enabled: formData.paymentEnabled,
            },
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        alert('College created successfully ✅');
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

  return (
    <div className="min-h-screen p-6 bg-violet-50">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-violet-700 mb-6">
          Create New College
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

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-violet-600 text-white py-3 rounded-xl"
          >
            {loading ? 'Saving...' : 'Create College'}
          </button>
        </div>
      </div>
    </div>
  );
}
