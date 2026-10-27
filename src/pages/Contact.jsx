import React, { useState } from 'react';
import { Send, CheckCircle2, Info } from 'lucide-react';
import { api } from '../services/api.js';
import { useShopping } from '../context/ShoppingContext.jsx';

export const Contact = () => {
  const { showToast } = useShopping();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact', { name, email, subject, message });
      if (res.success) {
        setSubmitted(true);
        showToast('Message received and logged in demo mode!', 'success');
      } else {
        showToast(res.message || 'Failed to submit message.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-8">
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Contact BasketWise Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have feedback on a retailer price point or want to suggest new product categories?
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Message Received</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your message has been stored in the BasketWise database. In live production mode with email dispatch enabled, an automatic confirmation is sent to your inbox.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
              }}
              className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Devin Vance"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Retailer Partnership Inquiry"
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your note or question here..."
                className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Demo mode explanation: Inquiries are saved directly to the database without attempting unconfigured SMTP delivery.
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
