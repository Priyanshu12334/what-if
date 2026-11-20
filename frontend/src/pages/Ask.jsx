import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { clearCachedData } from '../api/memoryCache';
import { useAuth } from '../context/AuthContext';
import { useLimit } from '../context/LimitContext';
import AiAnswerCards from '../components/AiAnswerCards';
import Skeleton from '../components/Skeleton';

const Ask = () => {
  const { user } = useAuth();
  const { quota, isValidated, unavailable, updateFromAskResponse } = useLimit();
  const remaining = quota?.remaining ?? null;
  const historyCacheKey = `history:${user?.id || 'current'}`;
  const [searchParams] = useSearchParams();
  const inputRef = useRef(null);
  const answerRef = useRef(null);
  const prefixRef = useRef(null);
  const [prefixWidth, setPrefixWidth] = useState(0);
  const autoSubmittedQuestion = useRef(null);
  const [userText, setUserText] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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
    const minHeight = isLaptop ? 120 : 88;
    const maxHeight = isLaptop ? 260 : 180;
    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [userText, prefixWidth]);

  useEffect(() => {
    const answer = answerRef.current;
    if (loading || !result || !answer?.querySelector('span')) return;
    const navbarHeight = document.querySelector('nav')?.getBoundingClientRect().height ?? 0;
    const top = window.scrollY + answer.getBoundingClientRect().top - navbarHeight - 16;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }, [loading, result]);

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
  }, [searchParams, isValidated]);

  const submitQuestion = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || !isValidated) return;
    const questionText = trimmed.replace(/^what\s*if\b\s*/i, '').trim();
    const fullPrompt = /^what\s*if\b/i.test(trimmed) ? trimmed : `What if ${trimmed}`;
    if (fullPrompt.length > 200) return;

    setLastQuestion(questionText);
    setUserText('');
    if (inputRef.current) {
      inputRef.current.style.height = `${window.matchMedia('(min-width: 768px)').matches ? 120 : 88}px`;
      inputRef.current.style.overflowY = 'hidden';
      inputRef.current.focus();
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/ask', { prompt: fullPrompt });
      clearCachedData(historyCacheKey);
      setResult(data.aiReply);
      updateFromAskResponse(data);
    } catch (err) {
      updateFromAskResponse(err.response?.data);
      setUserText(questionText);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
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
        <div className="font-mono text-xs text-[#A1A1AA]">
          {unavailable ? 'Limit unavailable' : remaining === null ? <div className="h-3 w-44 animate-pulse bg-white/10" /> : remaining === 0 ? 'Daily limit reached. Come back tomorrow.' : <><span className="text-[#f2a93b]">{remaining}</span> {remaining === 1 ? 'what-if' : 'what-ifs'} left today</>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest font-medium text-[#A1A1AA] mb-2">
            YOUR SCENARIO
          </label>
          <div
            onClick={() => inputRef.current?.focus()}
            className="ask-input-gradient relative border border-white/20 bg-transparent focus-within:border-[#f2a93b] transition cursor-text"
          >
            <div className="pointer-events-none absolute left-4 top-3 flex items-baseline gap-2 md:left-5 md:top-4">
              <span ref={prefixRef} className="select-none font-heading text-base font-medium leading-7 text-[#ece8df]/90 whitespace-pre">What if</span>
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
              className="w-full min-h-[88px] max-h-[180px] md:min-h-[120px] md:max-h-[260px] overflow-x-hidden bg-transparent text-[#F5F5F5] text-base md:text-lg focus:outline-none font-body resize-none leading-7 px-4 py-3 md:px-5 md:py-4 m-0 border-0 outline-none rounded-none break-words"
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
          disabled={loading || !userText.trim() || !isValidated || remaining === 0}
          className={`mt-0 md:mt-3 bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] font-body text-xs uppercase tracking-widest font-semibold py-3.5 px-6 transition disabled:opacity-50 ${loading || !userText.trim() || !isValidated || remaining === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {loading ? 'Asking…' : remaining === 0 ? 'Daily limit reached' : 'Ask'}
        </button>
      </form>

      {lastQuestion && (
        <div className="mt-10">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
            YOU ASKED
          </p>
          <h2 className="mb-5 line-clamp-3 break-words font-body text-base font-medium leading-snug text-[#F5F5F5] md:text-xl">
            What if {lastQuestion}
          </h2>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : result && (
            <div ref={answerRef}>
              <AiAnswerCards reply={result} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ask;
