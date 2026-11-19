import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

const fieldClass = 'mt-2 w-full border border-white/20 bg-[#0A0A0A] px-4 py-3 font-body text-sm text-[#F5F5F5] outline-none transition focus:border-[#f2a93b]';

const ContactIcon = ({ children }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
    {children}
  </svg>
);

const Contact = () => {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const submitFeedback = async (event) => {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      setStatus({ type: 'error', message: 'Feedback is temporarily unavailable. Please try again later.' });
      return;
    }

    setSending(true);
    setStatus({ type: '', message: '' });
    try {
      await emailjs.sendForm(serviceId, templateId, form, { publicKey });
      form.reset();
      setStatus({ type: 'success', message: 'Thanks for reaching out. Your message has been sent.' });
    } catch {
      setStatus({ type: 'error', message: 'Your message could not be sent. Please try again.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-form-gradient mx-auto max-w-6xl px-6 py-14 sm:py-20">
      <header className="mb-10 pb-8 sm:mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#f2a93b]">CONTACT</p>
        <h1 className="font-heading page-title font-bold text-[#F5F5F5]">Get in Touch</h1>
        <p className="font-body text-sm text-[#A1A1AA] mt-3 max-w-2xl">
          Have feedback, suggestions, or found a bug? I&apos;d love to hear from you.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)] lg:gap-12">
        <section className="border border-white/[0.08] bg-[#0D0D0D] p-3 sm:p-5">
          <h2 className="mb-3 font-heading text-xl font-semibold text-[#F5F5F5]">Send us a message</h2>
          <form ref={formRef} onSubmit={submitFeedback} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
                Name
                <input className={fieldClass} type="text" name="from_name" autoComplete="name" required maxLength={100} />
              </label>
              <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
                Email
                <input className={fieldClass} type="email" name="reply_to" autoComplete="email" required maxLength={254} />
              </label>
            </div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
              Subject
              <input className={fieldClass} type="text" name="subject" required maxLength={150} />
            </label>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
              Feedback type
              <select className={fieldClass} name="feedback_type" defaultValue="General Feedback" required>
                <option>General Feedback</option>
                <option>Suggestion</option>
                <option>Bug Report</option>
              </select>
            </label>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
              Feedback / Message
              <textarea className={`${fieldClass} min-h-36 resize-none`} name="message" required maxLength={5000} />
            </label>
            <div className="flex flex-col items-start gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={sending}
                className="border border-white/[0.08] bg-[#f2a635] px-6 py-3 font-mono text-xs font-medium uppercase tracking-widest text-[#000000] transition hover:bg-[#e1a141] hover:black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
              {status.message && (
                <p aria-live="polite" className={`font-body text-sm ${status.type === 'success' ? 'text-[#f2a93b]' : 'text-red-400'}`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </section>

        <section className="h-fit border border-white/[0.08] p-5 sm:p-8">
          <h2 className="font-heading text-xl font-bold text-[#F5F5F5]">About the Creator</h2>
          <p className="mt-2 font-body text-sm text-[#A1A1AA]">Priyanshu Suyal</p>
          <div className="mt-7 space-y-4">
            <a href="mailto:suyalpriyanshu2@gmail.com" className="flex items-center gap-3 font-body text-sm text-[#F5F5F5]/75 transition hover:text-[#f2a93b]">
              <ContactIcon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></ContactIcon>
              <span className="break-all">suyalpriyanshu2@gmail.com</span>
            </a>
            <a href="https://portfolio-ten-blond-87.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-body text-sm text-[#F5F5F5]/75 transition hover:text-[#f2a93b] hover:underline">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
              Portfolio
            </a>
            <a href="https://www.linkedin.com/in/priyanshu-suyal-5732b224a" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-body text-sm text-[#F5F5F5]/75 transition hover:text-[#f2a93b]">
              <ContactIcon><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></ContactIcon>
              LinkedIn
            </a>
            <a href="https://github.com/Priyanshu12334" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-body text-sm text-[#F5F5F5]/75 transition hover:text-[#f2a93b]">
              <ContactIcon><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6S18.6 1.2 15 3.6a13.2 13.2 0 0 0-7 0C4.4 1.2 2.2 1.5 2.2 1.5a4.8 4.8 0 0 0-.1 3.6A5.2 5.2 0 0 0 .7 8.7c0 5.2 3.2 6.4 6.2 6.7A3.4 3.4 0 0 0 6 18.1V22" /></ContactIcon>
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
