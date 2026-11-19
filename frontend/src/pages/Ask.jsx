import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { clearCachedData } from '../api/memoryCache';
import { useAuth } from '../context/AuthContext';
import AiAnswerCards from '../components/AiAnswerCards';

const Ask = () => {
  const { user } = useAuth();
  const historyCacheKey = `history:${user?.id || 'current'}`;
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);
  const prefixRef = useRef(null);
  const [prefixWidth, setPrefixWidth] = useState(0);
  const autoSubmittedQuestion = useRef(null);
  const [userText, setUserText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [remaining, setRemaining] = useState(10);

  useEffect(() => {
    checkRemaining();
  }, []);

  useEffect(() => {
    const updatePrefix = () => {
      if (prefixRef.current) {
        setPrefixWidth(prefixRef.current.getBoundingClientRect().width + 8);
      }
    };
    updatePrefix();
    window.addEventListener('resize', updatePrefix);
    return () => window.removeEventListener('resize', updatePrefix);
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const isLaptop = window.matchMedia('(min-width: 768px)').matches;
    const minHeight = isLaptop ? 120 : 52;
    const maxHeight = isLaptop ? 260 : 160;
    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [userText, prefixWidth]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      const cleaned = q.replace(/^what\s*if\s*/i, '').trim();
      setUserText(cleaned);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      if (autoSubmittedQuestion.current !== q) {
        autoSubmittedQuestion.current = q;
        submitQuestion(cleaned);
      }
    }
  }, [searchParams]);

  const checkRemaining = async () => {
    try {
      const { data } = await api.get('/ask/history');
      const todayStr = new Date().toISOString().split('T')[0];
      const todayCount = data.filter(item => item.createdAt && item.createdAt.startsWith(todayStr)).length;
      setRemaining(Math.max(0, 10 - todayCount));
    } catch {
      setRemaining(10);
    }
  };

  const submitQuestion = async (question) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const fullPrompt = /^what\s*if\b/i.test(trimmed) ? trimmed : `What if ${trimmed}`;
    if (fullPrompt.length > 200) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/ask', { prompt: fullPrompt });
      clearCachedData(historyCacheKey);
      setResult(data.aiReply);
      setRemaining(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuestion(userText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    }
  };

  const totalChars = userText.length > 0 ? 8 + userText.length : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-12 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
            ASK ANY WHAT-IF WITH AI
          </span>
          <h1 className="font-heading page-title font-bold text-[#F5F5F5]">
            Ask your own what-if
          </h1>
        </div>
        <div className="font-mono text-xs text-[#A1A1AA] tracking-widest uppercase">
          {remaining === 0 ? 'Daily limit reached. Come back tomorrow.' : <><span className="text-[#f2a93b]">{remaining}</span> {remaining === 1 ? 'what-if' : 'what-ifs'} left today</>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest font-medium text-[#A1A1AA] mb-2">
            YOUR QUESTION
          </label>
          <div
            onClick={() => inputRef.current?.focus()}
            className="ask-input-gradient relative border border-white/20 bg-transparent focus-within:border-[#f2a93b] transition cursor-text"
          >
            <div className="pointer-events-none absolute left-4 top-3 flex items-baseline gap-2 md:left-5 md:top-4">
              <span ref={prefixRef} className="select-none font-heading text-base font-bold leading-7 text-[#F5F5F5] whitespace-pre">What if</span>
              {!userText && <span className="text-sm leading-7 text-[#A1A1AA]/60 md:text-base">Write your scenario…</span>}
            </div>
            <textarea
              ref={inputRef}
              rows={1}
              maxLength={192}
              aria-label="Write your scenario"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ textIndent: prefixWidth ? `${prefixWidth}px` : undefined }}
              className="w-full min-h-[52px] max-h-[160px] md:min-h-[120px] md:max-h-[260px] overflow-x-hidden bg-transparent text-[#F5F5F5] text-base md:text-lg focus:outline-none font-body resize-none leading-7 px-4 py-3 md:px-5 md:py-4 m-0 border-0 outline-none rounded-none break-words"
            />
          </div>
          <div className="mt-3 text-right font-mono text-xs text-[#A1A1AA] tracking-widest">
            {totalChars}/200
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 text-xs font-mono tracking-widest text-red-400 border border-white/[0.08] bg-[#0A0A0A]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !userText.trim() || remaining === 0}
          className={`mt-6 bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] font-body text-xs uppercase tracking-widest font-semibold py-3.5 px-6 transition disabled:opacity-50 ${loading || !userText.trim() || remaining === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? 'Asking…' : remaining === 0 ? 'Daily limit reached' : 'Ask'}
        </button>
      </form>

      {result && (
        <div className="pt-6">
          <AiAnswerCards reply={result} />
        </div>
      )}
    </div>
  );
};

export default Ask;
