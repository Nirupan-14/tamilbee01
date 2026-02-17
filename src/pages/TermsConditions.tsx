import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/dashboard/Footer';

const TermsConditions: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <div className="flex-1 max-w-3xl mx-auto p-6 py-12">
      <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-8">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h1 className="text-3xl font-bold text-foreground mb-6">Terms &amp; Conditions</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>These terms and conditions outline the rules and regulations for the use of EventPro's platform.</p>
        <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
        <p>By accessing this platform, you accept these terms and conditions in full. Do not continue to use EventPro if you do not accept all of the terms and conditions stated on this page.</p>
        <h2 className="text-lg font-semibold text-foreground">2. License</h2>
        <p>Unless otherwise stated, EventPro owns the intellectual property rights for all material on this platform.</p>
        <h2 className="text-lg font-semibold text-foreground">3. User Content</h2>
        <p>Users are responsible for the content they publish on the platform. EventPro reserves the right to remove any content that violates these terms.</p>
        <h2 className="text-lg font-semibold text-foreground">4. Limitations</h2>
        <p>EventPro shall not be held liable for any damages arising from the use of this platform.</p>
      </div>
    </div>
    <Footer />
  </div>
);

export default TermsConditions;
