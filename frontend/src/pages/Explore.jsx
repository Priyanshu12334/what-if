import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';
import CATEGORY_IMAGES from '../data/categoryImages';

const CategoryCard = ({ cat }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const image = CATEGORY_IMAGES[cat.slug] || cat.image;
  const words = cat.name.trim().split(/\s+/);
  const initials = words.length > 1
    ? words.slice(0, 2).map((word) => word[0]).join('')
    : cat.name.slice(0, 2);

  return (
    <Link
      to={`/categories/${cat.slug}`}
      className="category-card-gradient group block border border-white/[0.08] hover:border-white/[0.25] transition duration-300 text-left bg-[#0A0A0A] overflow-hidden"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0A0A]">
        {image && !imageFailed ? (
          <img
            src={image}
            alt=""
            onError={() => setImageFailed(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition duration-300 ease-out"
          />
        ) : (
          <div className="absolute inset-1 flex items-center justify-center border border-white/[0.08] bg-[#0A0A0A]">
            <span className="font-heading text-8xl sm:text-9xl text-[#F5F5F5]/10">{initials}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent pointer-events-none" />
        <span className="absolute top-3 left-3 z-10 font-mono text-[10px] uppercase tracking-widest text-[#A1A1AA] bg-[#0A0A0A]/80 px-2 py-0.5 border border-white/[0.08] backdrop-blur-sm">
          {cat.group}
        </span>
      </div>

      <div className="p-5 flex flex-col justify-between">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#F5F5F5] group-hover:text-[#f2a93b] transition duration-200">
            {cat.name}
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] mt-1.5 block">
            {cat.count} What If Questions
          </span>
          <p className="font-body text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed mt-3">
            {cat.description}
          </p>
        </div>
        <div className="flex items-center justify-end pt-3 mt-4">
          <span className="font-mono text-xs text-[#A1A1AA] group-hover:text-[#F5F5F5] group-hover:translate-x-1 transition duration-200">
            View category →
          </span>
        </div>
      </div>
    </Link>
  );
};

const Explore = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('All');
  const [randomItem, setRandomItem] = useState(null);
  const [randomLoading, setRandomLoading] = useState(false);
  const [randomError, setRandomError] = useState('');
  const [showRandomAnswer, setShowRandomAnswer] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandom = async () => {
    try {
      setRandomLoading(true);
      setRandomError('');
      setShowRandomAnswer(false);
      const { data } = await api.get('/categories/random');
      setRandomItem(data);
    } catch (err) {
      setRandomError(err.response?.data?.message || 'Could not load a random question. Please try again.');
    } finally {
      setRandomLoading(false);
    }
  };

  const groups = ['All', ...Array.from(new Set(categories.map((c) => c.group)))];

  const filteredCategories = categories.filter((cat) => {
    const matchesGroup = activeGroup === 'All' || cat.group === activeGroup;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      cat.name.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.group.toLowerCase().includes(query);
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 text-left">
      <div className="pb-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
              CATEGORIES
            </span>
            <h1 className="font-heading page-title font-bold text-[#F5F5F5]">
              Pick a category
            </h1>
            <p className="font-body text-sm text-[#A1A1AA] mt-3 max-w-2xl">
              What if the impossible became possible? Explore questions that spark curiosity.
            </p>
          </div>
          <button
            onClick={fetchRandom}
            disabled={randomLoading}
            className="bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] px-5 py-2.5 font-body text-xs uppercase tracking-widest font-semibold transition cursor-pointer disabled:opacity-60 shrink-0 self-start sm:self-auto "
          >
            {randomLoading ? 'Loading…' : 'Random what if'}
          </button>
        </div>
      </div>

      {randomError && (
        <div className="border border-white/[0.08] p-4 mb-8 font-body text-sm text-red-400">
          {randomError}
        </div>
      )}

      {randomItem && (
        <div className="border border-white/[0.08] bg-[#0A0A0A] relative overflow-hidden mb-10 p-5 sm:p-8 rounded-xl">
          {CATEGORY_IMAGES[randomItem.slug] && (
            <img
              src={CATEGORY_IMAGES[randomItem.slug]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/95 via-[#0A0A0A]/75 to-[#0A0A0A]/55 pointer-events-none" />
          <button
            type="button"
            onClick={() => setRandomItem(null)}
            aria-label="Close random question"
            className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-[#A1A1AA] transition hover:bg-[#F5F5F5]/10 hover:text-[#F5F5F5] cursor-pointer"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div className="relative z-10">
            <div className="mb-3 pr-10">
              <Link
                to={`/categories/${randomItem.slug}`}
                className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] hover:underline"
              >
                {randomItem.categoryName} →
              </Link>
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-4 max-w-3xl">
              {randomItem.question}
            </h3>
            <button
              onClick={() => setShowRandomAnswer(!showRandomAnswer)}
              className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#F5F5F5] border-b border-white/[0.08] pb-0.5 transition cursor-pointer"
            >
              {showRandomAnswer ? 'Hide speculation' : 'Read speculation'}
            </button>
            {showRandomAnswer && (
              <p className="mt-4 pt-4 border-t border-white/[0.08] max-w-[70ch] font-body text-sm leading-relaxed text-[#F5F5F5]/90 whitespace-pre-line">
                {randomItem.answer}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search universes, genres or topics…"
            className="w-full bg-[#0A0A0A] border border-white/20 px-4 py-3 text-sm text-[#F5F5F5] placeholder-[#F5F5F5]/40 font-body focus:outline-none focus:border-[#f2a93b] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#A1A1AA] hover:text-[#F5F5F5] transition"
            >
              [clear]
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 border transition cursor-pointer max-sm:flex max-sm:min-h-[44px] max-sm:min-w-0 max-sm:items-center max-sm:justify-center max-sm:whitespace-normal max-sm:break-words max-sm:px-1.5 max-sm:py-1.5 max-sm:text-[11px] max-sm:text-center max-sm:leading-tight ${
                activeGroup === group
                  ? 'border-[#f2a93b] text-[#f2a93b] bg-[#f2a93b]/10'
                  : 'border-white/[0.08] text-[#A1A1AA] hover:border-white/[0.25] hover:text-[#F5F5F5]'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="border border-white/[0.08] p-6 my-8 text-left">
          <p className="font-body text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCategories}
            className="font-mono text-xs uppercase tracking-widest border border-white/[0.08] px-3 py-1.5 text-red-400 hover:bg-red-400/10 transition cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border border-white/[0.08] bg-[#0A0A0A]">
              <div className="aspect-[4/3] w-full bg-[#F5F5F5]/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20 pt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="border border-white/[0.08] p-12 text-left bg-[#0A0A0A]">
          <p className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
            No universes found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} />
          ))}
        </div>
      )}
      <p className="mt-8 text-center font-body text-xs text-[#A1A1AA]">
        Visuals are for illustrative purposes only. WHAT IF? is an independent fan-made project and is not affiliated with any studio or franchise.
      </p>
    </div>
  );
};

export default Explore;
