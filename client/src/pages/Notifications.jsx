import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Bell, CheckSquare, BellOff, Calendar, Loader2 } from 'lucide-react';

const Notifications = () => {
  const { notifications, loading, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      addToast('All notifications marked as read.', 'success');
    }
  };

  const handleMarkRead = async (id) => {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      addToast('Notification marked as read.', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading inbox...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="text-blue-600" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Stay updated on your job application progress and verification alerts</p>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <CheckSquare size={14} /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-12 text-center rounded-2xl shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <BellOff size={24} />
          </div>
          <p className="text-sm font-bold text-slate-850 dark:text-slate-200">Your inbox is empty</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You'll receive automatic alerts here when recruiters update your application pipeline status.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => {
                if (!notif.isRead) handleMarkRead(notif._id);
              }}
              className={`p-4 border rounded-xl transition-all cursor-pointer flex justify-between items-start gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 text-slate-500'
                  : 'bg-blue-50/40 border-blue-100 hover:bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 dark:hover:bg-blue-950/30'
              }`}
            >
              <div className="space-y-1">
                <h4 className={`text-sm font-bold ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                  {notif.title}
                </h4>
                <p className="text-xs leading-relaxed">{notif.message}</p>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 pt-1">
                  <Calendar size={12} /> {new Date(notif.createdAt).toLocaleDateString()}
                </p>
              </div>

              {!notif.isRead && (
                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
