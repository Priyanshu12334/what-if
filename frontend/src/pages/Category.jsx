import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Skeleton from '../components/Skeleton';
import AskBox from '../components/AskBox';
import CATEGORY_IMAGES from '../data/categoryImages';

const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchCategory();
  }, [slug]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      setError('');
      setBannerError(false);
      const { data } = await api.get(`/categories/${slug}`);
      setCategory(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Universe not found.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredItems = (category?.items || []).filter((item) => {
    const q = filterQuery.toLowerCase().trim();
    return !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 text-left">
      <Link
        to="/categories"
        className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#F5F5F5] transition inline-block mb-8"
      >
        ← All categories
      </Link>

      {loading ? (
        <div className="border border-white/[0.08] h-64 relative p-8 flex flex-col justify-end space-y-3 mb-12">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : category ? (
        <div className="relative border border-white/[0.08] overflow-hidden mb-12 bg-[#0A0A0A] rounded-xl">
          {!bannerError && (CATEGORY_IMAGES[slug] || category.image) && (
            <img
              src={CATEGORY_IMAGES[slug] || category.image}
              alt=""
              onError={() => setBannerError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent pointer-events-none" />
          <div className="relative z-10 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b]">
                {category.group}
              </span>
              <span className="text-[#F5F5F5]/20">•</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
                {category.items?.length || 0} Questions
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#F5F5F5] mb-4">
              {category.name}
            </h1>
            <p className="font-body text-sm sm:text-base text-[#F5F5F5]/80 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="border border-white/[0.08] p-6 mb-8 text-left">
          <p className="font-body text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCategory}
            className="font-mono text-xs uppercase tracking-widest border border-white/[0.08] px-3 py-1.5 text-red-400 hover:bg-red-400/10 transition cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {category?.items && category.items.length > 5 && (
        <div className="mb-8">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Search within ${category.name}…`}
            className="w-full bg-[#0A0A0A] border border-white/20 px-4 py-2.5 text-sm text-[#F5F5F5] placeholder-[#F5F5F5]/40 font-body focus:outline-none focus:border-[#f2a93b] transition"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-white/[0.08] p-6 flex justify-between items-start gap-4">
              <div className="flex items-start gap-4 w-full">
                <Skeleton className="h-4 w-6 shrink-0" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="h-4 w-4 shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border border-white/[0.08] p-8 text-left bg-[#0A0A0A]">
          <p className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">
            No questions found matching your filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const isOpen = openId === item.id;
            const num = String(index + 1).padStart(2, '0');
            return (
              <div
                key={item.id}
                className="border border-white/[0.08] bg-[#0A0A0A] transition hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 transition hover:bg-white/[0.02] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2a93b] rounded-none cursor-pointer"
                >
                  <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono text-xs text-[#A1A1AA] pt-1 shrink-0">
                      {num}
                    </span>
                    <h3 className="font-heading text-lg sm:text-xl font-medium text-[#F5F5F5] transition leading-snug">
                      {item.question}
                    </h3>
                  </div>
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
                    className={`w-4 h-4 shrink-0 mt-1 text-[#f2a93b] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-[250ms] ease ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-6 pt-4 sm:px-6 pl-14 sm:pl-16 border-t border-white/[0.08]">
                      <p className="w-full max-w-none border-l-2 border-[#f2a93b] pl-5 font-body font-normal text-base sm:text-lg leading-relaxed text-[#f3dfb5] whitespace-pre-line">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AskBox />

      <div className="mt-16 pt-8">
        <p className="font-mono text-xs text-[#A1A1AA] tracking-wider">
          Fan-made speculation. Not affiliated with any studio, publisher or franchise.
        </p>
      </div>
    </div>
  );
};

export default Category;
