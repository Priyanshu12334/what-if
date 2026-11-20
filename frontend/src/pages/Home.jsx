import { useEffect, useState } from 'react';
import api from '../api/axios';
import { fetchCachedData, getCachedData, setCachedData } from '../api/memoryCache';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const getPercentages = (counts) => {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (!total) return counts.map(() => 0);
  const exact = counts.map((count) => (count / total) * 100);
  const percentages = exact.map(Math.floor);
  const order = exact
    .map((percentage, index) => ({ index, fraction: percentage - percentages[index] }))
    .sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < 100 - percentages.reduce((sum, percentage) => sum + percentage, 0); index += 1) {
    percentages[order[index].index] += 1;
  }
  return percentages;
};

const Home = () => {
  const { user } = useAuth();
  const cacheKey = `daily:${new Date().toISOString().slice(0, 10)}:${user?.id || 'current'}`;
  const [poll, setPoll] = useState(() => getCachedData(cacheKey) || null);
  const [selectedOption, setSelectedOption] = useState(() => getCachedData(cacheKey)?.myVote ?? null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(() => getCachedData(cacheKey) === undefined);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPoll();
  }, []);

  const loadPoll = async () => {
    if (getCachedData(cacheKey) === undefined) setLoading(true);
    setError('');
    try {
      const data = await fetchCachedData(cacheKey, async () => (await api.get('/daily')).data);
      setPoll(data);
      setSelectedOption(data.myVote);
      setStreak(data.streak);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (optionIndex) => {
    if (voting || !poll) return;
    const previousPoll = poll;
    const previousOption = selectedOption;
    const nextOption = selectedOption === optionIndex ? null : optionIndex;
    const counts = poll.results.options.map(({ votes }) => votes);
    if (previousOption !== null) counts[previousOption] -= 1;
    if (nextOption !== null) counts[nextOption] += 1;
    const percentages = getPercentages(counts);
    const optimisticPoll = {
      ...poll,
      myVote: nextOption,
      results: {
        ...poll.results,
        options: poll.results.options.map((result, index) => ({
          ...result,
          votes: counts[index],
          percentage: percentages[index]
        })),
        totalVotes: counts.reduce((sum, count) => sum + count, 0)
      }
    };
    setPoll(optimisticPoll);
    setCachedData(cacheKey, optimisticPoll);
    setSelectedOption(nextOption);
    try {
      setVoting(true);
      setError('');
      const { data } = await api.post('/daily/vote', { optionIndex: nextOption });
      setCachedData(cacheKey, data);
      setPoll(data);
      setSelectedOption(data.myVote);
      setStreak(data.streak);
    } catch (err) {
      setPoll(previousPoll);
      setCachedData(cacheKey, previousPoll);
      setSelectedOption(previousOption);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className={poll && !loading ? 'pb-0 mb-0' : 'pb-8 mb-8'}>
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate font-heading text-lg text-[#F5F5F5]">
            {user?.name?.trim() ? `Hi, ${user.name.trim()}` : 'Hi'}
          </span>
          {!loading && (
            <span className="shrink-0 whitespace-nowrap border border-white/[0.08] px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest">
              <span className="text-[#A1A1AA]">STREAK</span>{' '}
              <span className="text-[#f2a93b]">{streak}</span>{' '}
              <span className="text-[#A1A1AA]">{streak === 1 ? 'DAY' : 'DAYS'}</span>
            </span>
          )}
        </div>

        {loading ? (
          <>
            <div className="flex items-center justify-between gap-4 mt-4 mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-9 sm:h-12 w-full max-w-2xl" />
              <Skeleton className="h-9 sm:h-12 w-4/5 max-w-xl" />
            </div>
            <Skeleton className="h-4 w-80 max-w-full mt-4" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mt-4 mb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b]">DAILY WHAT IF</span>
            </div>
            <h1 className="font-heading page-title font-bold text-[#F5F5F5]">
              {poll?.question || 'No daily question available'}
            </h1>
            <p className="font-body text-sm text-[#A1A1AA] mt-4">
              One question for everyone, every day. Pick your answer to see the explanation.
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mb-6 border border-white/[0.08] p-4 font-body text-sm text-red-400">
          <p>{error}</p>
          <button type="button" onClick={loadPoll} className="mt-3 underline">Try again</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full border border-white/[0.08]" />
          <Skeleton className="h-14 w-full border border-white/[0.08]" />
          <Skeleton className="h-14 w-full border border-white/[0.08]" />
          <Skeleton className="h-14 w-full border border-white/[0.08]" />
        </div>
      ) : poll && (
        <div className="mt-6">
          <section>
            <div className="space-y-3">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={voting}
                  aria-pressed={selectedOption === index}
                  onClick={() => castVote(index)}
                  className={`daily-poll-gradient daily-poll-option block w-full border p-4 text-left transition disabled:opacity-60 ${selectedOption === index ? 'border-[#f2a93b] bg-[#f2a93b]/5' : 'border-white/[0.08] hover:border-white/20'}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                      <span className="font-body text-sm text-[#F5F5F5]">{option.text}</span>
                      {selectedOption === index && <span className="font-mono text-[10px] uppercase tracking-widest text-[#f2a93b]">YOUR VOTE</span>}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[#A1A1AA]">
                      {poll.results.options[index].votes} votes · {poll.results.options[index].percentage}%
                    </span>
                  </div>
                  <div className="h-1 bg-[#F5F5F5]/10">
                    <div className="h-full bg-[#f2a93b] transition-[width] duration-300" style={{ width: `${poll.results.options[index].percentage}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4">
            <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
              <span className="text-[#f2a93b]">TOTAL VOTES</span> <span className="font-semibold text-[#F5F5F5]">{poll.results.totalVotes}</span>
            </p>
          </div>

          {poll.explanation && (
            <section className="mt-4 border border-white/[0.08] p-5 sm:mt-0 md:mt-4 sm:p-6">
              <h2 className="font-mono text-xs font-medium uppercase tracking-widest text-[#f2a93b]">
                WHAT MIGHT HAPPEN
              </h2>
              <p className="mt-3 w-full max-w-none font-body font-light text-base leading-7 text-[#ffffff]">
                {poll.explanation}
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
