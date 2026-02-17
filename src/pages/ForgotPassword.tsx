import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Footer from '@/components/dashboard/Footer';

type Step = 'email' | 'otp' | 'verified' | 'reset';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#3E4041] via-[#2f3132] to-[#1f2021]">

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* TamilBee Logo */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-wide">
              <span className="text-white">Tamil</span>
              <span className="text-[#E3C32F]">Bee</span>
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Secure Account Recovery
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-2xl p-8">

            {/* STEP 1 — EMAIL */}
            {step === 'email' && (
              <>
                <h2 className="text-2xl font-bold text-[#3E4041] text-center">
                  Forgot Password?
                </h2>

                <p className="text-sm text-gray-500 text-center mt-1 mb-6">
                  Enter your email to receive a verification code
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep('otp');
                  }}
                  className="space-y-4"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#E3C32F] text-[#3E4041] font-semibold text-sm hover:opacity-90 transition"
                  >
                    Send Code
                  </button>
                </form>
              </>
            )}

            {/* STEP 2 — OTP */}
            {step === 'otp' && (
              <>
                <h2 className="text-2xl font-bold text-[#3E4041] text-center">
                  Enter OTP
                </h2>

                <p className="text-sm text-gray-500 text-center mt-1 mb-6">
                  4-digit code sent to {email}
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStep('verified');
                  }}
                  className="space-y-6"
                >
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(i, e.target.value)
                        }
                        className="w-14 h-14 text-center text-xl font-bold rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#E3C32F] text-[#3E4041] font-semibold text-sm hover:opacity-90 transition"
                  >
                    Verify
                  </button>
                </form>
              </>
            )}

            {/* STEP 3 — VERIFIED */}
            {step === 'verified' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-[#E3C32F] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[#3E4041]">
                  Verified!
                </h2>

                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Your identity has been verified.
                </p>

                <button
                  onClick={() => setStep('reset')}
                  className="w-full py-2.5 rounded-lg bg-[#E3C32F] text-[#3E4041] font-semibold text-sm hover:opacity-90 transition"
                >
                  Set New Password
                </button>
              </div>
            )}

            {/* STEP 4 — RESET PASSWORD */}
            {step === 'reset' && (
              <>
                <h2 className="text-2xl font-bold text-[#3E4041] text-center">
                  New Password
                </h2>

                <form
                  onSubmit={handleResetSubmit}
                  className="space-y-4 mt-6"
                >
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />

                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#E3C32F]"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#E3C32F] text-[#3E4041] font-semibold text-sm hover:opacity-90 transition"
                  >
                    Reset Password
                  </button>
                </form>
              </>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-[#E3C32F] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
