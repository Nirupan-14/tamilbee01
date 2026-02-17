import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import Footer from '@/components/dashboard/Footer';

const Signup: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    city: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup({ ...form });
    navigate('/dashboard/user');
  };

  return (
     <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#3E4041] via-[#2f3132] to-[#1f2021]">

  {/* Center Content */}
  <div className="flex-1 flex items-center justify-center p-4">
    <div className="w-full max-w-md">

      {/* Professional Logo */}
      <div className="flex flex-col items-center mb-12">

        <h1 className="text-5xl font-extrabold tracking-wide relative">
          <span className="text-white">Tamil</span>
          <span className="text-[#E3C32F] relative">
            Bee
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#E3C32F] rounded-full"></span>
          </span>
        </h1>

        <p className="text-sm text-gray-400 mt-3 tracking-wide">
          Event & Business Management Platform
        </p>
        </div>

          {/* Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl">

            <h2 className="text-2xl font-bold text-[#3E4041] text-center">
              Create Account
            </h2>

            <p className="text-sm text-gray-500 text-center mt-1 mb-6">
              Start managing your events
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* First + Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    required
                    placeholder="John"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    required
                    placeholder="Doe"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F] pr-10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#E3C32F]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  required
                  placeholder="123 Main St"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                />
              </div>

              {/* City + Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    required
                    placeholder="New York"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    required
                    placeholder="+1 555-0100"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#E3C32F] text-[#3E4041] font-semibold text-sm hover:opacity-90 transition-all"
              >
                Create Account
              </button>

            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#E3C32F] font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
