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
    if (!question.trim()) return;
    const fullPrompt = `What if ${question.trim()}`;
    if (fullPrompt.length > 200) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await api.post('/ask', { prompt: fullPrompt });
      clearCachedData(historyCacheKey);
      setResult(data.aiReply);
      setRemaining(prev => Math.max(0, prev - 1));
      setUserText('');
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

  const totalChars = userText.length > 0 ? 8 + userText.length : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 mb-12 gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
          ASK ANY WHAT-IF WITH AI
          </span>
          <h1 className="font-heading page-title font-bold text-[#F5F5F5]">
            Ask a question
          </h1>
        </div>
        <div className="font-mono text-xs text-[#A1A1AA] tracking-widest uppercase">
          Questions left today: <span className={remaining === 0 ? 'text-red-400' : 'text-[#f2a93b]'}>{remaining} / 10</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest font-medium text-[#A1A1AA] mb-2">
            YOUR QUESTION
          </label>
          <div className="ask-input-gradient flex items-center gap-2 border border-white/20 bg-transparent px-4 py-8 focus-within:border-[#f2a93b] transition">
            <strong className="font-heading font-bold text-[#F5F5F5] select-none pointer-events-none text-base sm:text-lg whitespace-nowrap">
              What if
            </strong>
            <input
              ref={inputRef}
              type="text"
              required
              maxLength={192}
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Write your scenario…"
              className="w-full bg-transparent text-[#F5F5F5] text-base focus:outline-none font-body"
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
