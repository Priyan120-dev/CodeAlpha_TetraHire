import React from 'react';
import { Award, Target, Landmark, Rocket } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          Empowering Talent & Companies
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          TetraHire is a modern, production-grade recruitment portal designed to connect highly skilled candidates with growth-oriented employers through clean interfaces, robust APIs, and state-of-the-art security features.
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-900/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission & Values</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We believe that recruitment should be smooth, secure, and smart. Traditional job boards are flooded with spam postings and manual applicant sorting. TetraHire was built to introduce automated resume handling, detailed statistics, application status flows, and secure role authorizations, helping teams make better decisions faster.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Target size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Focus Goals</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Award size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Premium Standards</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-850 shadow-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Core Principles</h3>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 items-center justify-center text-xs font-bold mt-0.5">1</span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Integrity First:</strong> We enforce strict employer verification to eliminate fake jobs.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 items-center justify-center text-xs font-bold mt-0.5">2</span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">User Control:</strong> Fast profile setups, resume replacements, and cover letter attachments.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 rounded-full bg-blue-500/10 text-blue-600 items-center justify-center text-xs font-bold mt-0.5">3</span>
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Security Architecture:</strong> Protecting personal information, PDF CVs, and company logos.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
