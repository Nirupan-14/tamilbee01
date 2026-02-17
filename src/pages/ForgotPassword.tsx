import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
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
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">EventPro</span>
          </div>

          <div className="glass-card p-8">
            {step === 'email' && (
              <>
                <h1 className="text-2xl font-bold text-foreground text-center">Forgot password?</h1>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-6">Enter your email to receive a verification code</p>
                <form onSubmit={(e) => { e.preventDefault(); setStep('otp'); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                    Send Code
                  </button>
                </form>
              </>
            )}

            {step === 'otp' && (
              <>
                <h1 className="text-2xl font-bold text-foreground text-center">Enter OTP</h1>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-6">We sent a 4-digit code to {email}</p>
                <form onSubmit={(e) => { e.preventDefault(); setStep('verified'); }} className="space-y-6">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="w-14 h-14 text-center text-xl font-bold rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    ))}
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                    Verify
                  </button>
                </form>
              </>
            )}

            {step === 'verified' && (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground">Verified!</h1>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Your identity has been verified. Set your new password.</p>
                <button onClick={() => setStep('reset')} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Set New Password
                </button>
              </div>
            )}

            {step === 'reset' && (
              <>
                <h1 className="text-2xl font-bold text-foreground text-center">New password</h1>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-6">Enter your new password</p>
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground" />
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                    Reset Password
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to login
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
