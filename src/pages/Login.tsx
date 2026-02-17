import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Eye, EyeOff } from 'lucide-react';
import Footer from '@/components/dashboard/Footer';

const Login: React.FC = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, role);

    navigate(role === 'admin'
      ? '/dashboard/admin'
      : '/dashboard/user'
    );
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
          Event Management Platform
        </p>

      </div>


          {/* Card */}
          <div className="bg-white p-8 rounded-xl shadow-2xl">

            <h2 className="text-2xl font-bold text-[#3E4041] text-center">
              Welcome Back
            </h2>

            <p className="text-sm text-gray-500 text-center mt-1 mb-6">
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#3E4041] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#E3C32F] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#E3C32F] text-[#3E4041] font-semibold text-sm hover:opacity-90 transition-all"
              >
                Sign In
              </button>

            </form>

            {/* Signup */}
            <p className="text-sm text-gray-500 text-center mt-6">
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-[#E3C32F] font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
