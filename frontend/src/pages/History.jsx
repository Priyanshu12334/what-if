import { useState, useEffect } from 'react';
import api from '../api/axios';
import { fetchCachedData, getCachedData, setCachedData } from '../api/memoryCache';
import Skeleton from '../components/Skeleton';
import AiAnswerCards from '../components/AiAnswerCards';
import { useAuth } from '../context/AuthContext';

const recentHistory = (items = []) => items
  .filter((item) => new Date(item.createdAt).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)
  .slice(0, 20);

const History = () => {
  const { user } = useAuth();
  const cacheKey = `history:${user?.id || 'current'}`;
  const [history, setHistory] = useState(() => recentHistory(getCachedData(cacheKey)));
  const [loading, setLoading] = useState(() => getCachedData(cacheKey) === undefined);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      if (getCachedData(cacheKey) === undefined) setLoading(true);
      setError('');
      const data = await fetchCachedData(cacheKey, async () => (await api.get('/ask/history')).data);
      setHistory(recentHistory(data));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recent entries.');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id) => {
    try {
      setDeletingId(id);
      setError('');
      await api.delete(`/ask/history/${id}`);
      const updated = history.filter((item) => item._id !== id);
      setHistory(updated);
      setCachedData(cacheKey, updated);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this recent entry.');
    } finally {
      setDeletingId(null);
    }
  };

  const clearAll = async () => {
    try {
      setClearing(true);
      setError('');
      await api.delete('/ask/history');
      setHistory([]);
      setCachedData(cacheKey, []);
      setExpandedId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not clear recent entries.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-left">
      <div className="pb-8 flex items-end justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
            RECENT
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold text-[#F5F5F5] whitespace-nowrap">
            Recent questions
          </h1>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={clearing}
            className="shrink-0 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {clearing ? 'Clearing…' : 'Clear All'}
          </button>
        )}
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-card relative w-full max-w-md border border-white/[0.08] bg-[#0D0D0D] p-6 text-left sm:p-8" role="dialog" aria-modal="true" aria-labelledby="clear-history-title" onClick={(event) => event.stopPropagation()}>
            <h2 id="clear-history-title" className="mb-3 font-heading text-xl font-bold text-[#F5F5F5]">
              Clear all recent questions?
            </h2>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowClearConfirm(false)} className="border border-white/[0.08] px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-widest text-[#F5F5F5] transition hover:border-white/[0.08]">
                Cancel
              </button>
              <button type="button" onClick={() => { setShowClearConfirm(false); clearAll(); }} className="bg-[#e10e0e] px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#ff1717]" disabled={clearing}>
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-8 text-xs font-mono tracking-widest text-red-400 border border-white/[0.08] bg-[#0A0A0A]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="divide-y divide-white/[0.08] border-b border-white/[0.08]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="py-5">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-3 w-full max-w-xl">
                  <Skeleton className="h-6 sm:h-7 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-6 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#0A0A0A] p-12 text-left">
          <p className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
            No recent questions found.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.08] border-b border-white/[0.08]">
          {history.map((item) => {
            const isExpanded = expandedId === item._id;
            return (
              <div key={item._id} className="recent-row-gradient">
                <div className="flex items-start gap-3 py-4 sm:py-5 px-3 sm:px-4 transition hover:bg-white/[0.02]">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    aria-expanded={isExpanded}
                    className="min-w-0 flex-1 text-left focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2a93b] rounded-none cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base md:text-xl font-bold text-[#F5F5F5] transition">
                        {item.prompt}
                      </h3>
                      <span className="font-mono text-xs text-[#A1A1AA] mt-2 block tracking-widest">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </button>
                  <div className="flex items-center gap-3 shrink-0 whitespace-nowrap pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(item._id);
                      }}
                      disabled={deletingId === item._id}
                      title="Delete"
                      aria-label="Delete question"
                      className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[#F5F5F5]/50 hover:text-[#ff6b6b] transition disabled:opacity-50 rounded-none cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2a93b]"
                      style={{ borderRadius: 0 }}
                    >
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4h8v2m-11 0 1 14h12l1-14m-10 4v6m4-6v6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse question' : 'Expand question'}
                      className="flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent p-0 rounded-none cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2a93b]"
                    >
                      <svg
                        aria-hidden="true"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 shrink-0 text-[#f2a93b] transition-transform duration-200"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows] duration-[250ms] ease ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-3 sm:px-4 pb-5 pt-4 border-t border-white/[0.08]">
                      <AiAnswerCards reply={item.aiReply || 'No simulation reply recorded.'} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
