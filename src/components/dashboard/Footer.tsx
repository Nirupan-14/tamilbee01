import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="border-t border-border bg-card px-6 py-4 mt-auto">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} EventPro. All rights reserved.</p>
      <div className="flex items-center gap-4">
        <Link to="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link>
        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
