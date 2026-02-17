import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import Footer from '@/components/dashboard/Footer';

const Signup: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    address: '', city: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup({ ...form, password: form.password });
    navigate('/dashboard/user');
  };

  const fields: { key: string; label: string; type?: string; placeholder: string; half?: boolean }[] = [
    { key: 'firstName', label: 'First Name', placeholder: 'John', half: true },
    { key: 'lastName', label: 'Last Name', placeholder: 'Doe', half: true },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { key: 'address', label: 'Address', placeholder: '123 Main St' },
    { key: 'city', label: 'City', placeholder: 'New York', half: true },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 555-0100', half: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">EventPro</span>
          </div>

          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-foreground text-center">Create account</h1>
            <p className="text-sm text-muted-foreground text-center mt-1 mb-6">Start managing your events</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.filter(f => f.half).slice(0, 2).map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={(form as any)[f.key]}
                      onChange={(e) => update(f.key, e.target.value)}
                      required
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>
                ))}
              </div>

              {fields.filter(f => !f.half).map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type={f.key === 'password' ? (showPassword ? 'text' : 'password') : (f.type || 'text')}
                      value={(form as any)[f.key]}
                      onChange={(e) => update(f.key, e.target.value)}
                      required
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                    {f.key === 'password' && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                {fields.filter(f => f.half).slice(2).map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={(form as any)[f.key]}
                      onChange={(e) => update(f.key, e.target.value)}
                      required
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                Create account
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
