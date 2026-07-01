import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion size={40} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The resource or page you are looking for does not exist or has been moved. Use the options below to get back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.history.back()}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-750 dark:text-slate-200 px-6 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-center gap-2 active:scale-97 transition-all"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
        <Link
          to="/"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/10 active:scale-97 transition-all"
        >
          <Home size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
