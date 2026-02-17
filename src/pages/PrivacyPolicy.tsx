import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/dashboard/Footer';

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <div className="flex-1 max-w-3xl mx-auto p-6 py-12">
      <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.</p>
        <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email, and event details.</p>
        <h2 className="text-lg font-semibold text-foreground">2. How We Use Information</h2>
        <p>We use collected information to provide and improve our services, communicate with you, and ensure platform security.</p>
        <h2 className="text-lg font-semibold text-foreground">3. Data Protection</h2>
        <p>We implement industry-standard security measures to protect your personal information.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Contact Us</h2>
        <p>If you have questions about this privacy policy, please contact us at privacy@eventpro.com.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default PrivacyPolicy;
