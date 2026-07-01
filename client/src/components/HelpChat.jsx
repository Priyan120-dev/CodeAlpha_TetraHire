import React, { useState } from 'react';
import { HelpCircle, X, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const HelpChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { addToast } = useToast();

  const faqs = [
    { q: 'How do I apply for a job?', a: 'Browse jobs under "Find Jobs", click details, and hit "Apply".' },
    { q: 'Can I post jobs as a recruiter?', a: 'Register as an Employer to access post-job tools.' },
    { q: 'Is there offline support?', a: 'Yes! Jobs you have previously viewed will show up offline.' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    addToast('Message sent! Support will contact you shortly.', 'success');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 left-4 md:bottom-8 md:left-8 z-30 font-sans">
      {isOpen ? (
        <div className="w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl p-4 animate-fade-in flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#00BE9B] animate-pulse"></span>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">TetraSupport Assistant</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-3 py-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            <p className="font-semibold text-slate-500">Frequently Asked Questions:</p>
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-900">
                <span className="block font-bold text-slate-700 dark:text-slate-350">Q: {faq.q}</span>
                <span className="block mt-1 text-slate-500 dark:text-slate-400">A: {faq.a}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Ask a question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Get Help"
          className="p-3 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg hover:scale-105 active:scale-90 transition-all border border-slate-800 dark:border-slate-200/20"
        >
          <HelpCircle size={20} />
        </button>
      )}
    </div>
  );
};

export default HelpChat;
