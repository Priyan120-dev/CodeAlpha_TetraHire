import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const AccordionSection = ({ title, sectionId, children }) => {
    const isOpen = openSection === sectionId;
    return (
      <div className="border-b border-slate-800 md:border-b-0 pb-4 md:pb-0">
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full flex md:hidden items-center justify-between text-white font-bold py-3 text-sm text-left focus:outline-none"
        >
          <span>{title}</span>
          <span className="text-lg font-light text-slate-500">{isOpen ? '−' : '+'}</span>
        </button>
        <h3 className="hidden md:block text-white font-semibold mb-4 text-sm">{title}</h3>
        <div className={`transition-all duration-300 ${isOpen ? 'block animate-fade-in' : 'hidden md:block'}`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="space-y-4 border-b border-slate-800 md:border-b-0 pb-6 md:pb-0">
          <div className="flex items-center">
            <Logo size="sm" className="[&_span:last-child]:text-white" />
          </div>
          <p className="text-sm leading-relaxed">
            Smart Hiring Starts Here. A complete production-ready full-stack job board platform for developers and employers.
          </p>
        </div>

        {/* For Candidates */}
        <AccordionSection title="For Candidates" sectionId="candidates">
          <ul className="space-y-2.5 text-sm pt-2 md:pt-0">
            <li><Link to="/jobs" className="hover:text-blue-400 transition-colors block py-1">Browse Jobs</Link></li>
            <li><Link to="/candidate/dashboard" className="hover:text-blue-400 transition-colors block py-1">Candidate Dashboard</Link></li>
            <li><Link to="/applications" className="hover:text-blue-400 transition-colors block py-1">Applied Jobs</Link></li>
            <li><Link to="/saved-jobs" className="hover:text-blue-400 transition-colors block py-1">Saved Bookmarks</Link></li>
          </ul>
        </AccordionSection>

        {/* For Employers */}
        <AccordionSection title="For Employers" sectionId="employers">
          <ul className="space-y-2.5 text-sm pt-2 md:pt-0">
            <li><Link to="/employer/dashboard" className="hover:text-blue-400 transition-colors block py-1">Employer Dashboard</Link></li>
            <li><Link to="/employer/profile" className="hover:text-blue-400 transition-colors block py-1">Company Profile</Link></li>
            <li><Link to="/jobs" className="hover:text-blue-400 transition-colors block py-1">Post a New Job</Link></li>
          </ul>
        </AccordionSection>

        {/* Company */}
        <AccordionSection title="Company" sectionId="company">
          <ul className="space-y-2.5 text-sm pt-2 md:pt-0">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors block py-1">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors block py-1">Contact Support</Link></li>
            <li><a href="http://localhost:5000/api-docs/" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors block py-1">API Docs (Swagger)</a></li>
          </ul>
        </AccordionSection>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4 text-slate-500 pb-16 md:pb-0">
        <p>&copy; {new Date().getFullYear()} TetraHire. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-slate-400">Privacy Policy</Link>
          <Link to="/" className="hover:text-slate-400">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
