import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AskBox = () => {
  const [userText, setUserText] = useState('');
  const textareaRef = useRef(null);
  const prefixRef = useRef(null);
  const [prefixWidth, setPrefixWidth] = useState(0);
  const navigate = useNavigate();

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
    const el = textareaRef.current;
    if (!el) return;
    const isLaptop = window.matchMedia('(min-width: 768px)').matches;
    const minHeight = isLaptop ? 120 : 52;
    const maxHeight = isLaptop ? 260 : 160;
    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [userText, prefixWidth]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = userText.trim();
    if (!trimmed) return;
    const full = /^what\s*if\b/i.test(trimmed) ? trimmed : `What if ${trimmed}`;
    navigate(`/ask?q=${encodeURIComponent(full)}`);
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
    <div className="askbox-gradient border border-white/[0.08] bg-[#0A0A0A] p-6 text-left my-8">
      <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-3">
        CAN'T FIND YOUR QUESTION?
      </span>
      <form onSubmit={handleSubmit}>
        <div
          onClick={() => textareaRef.current?.focus()}
          className="ask-input-gradient relative border border-white/20 bg-transparent focus-within:border-[#f2a93b] transition cursor-text"
        >
          <div className="pointer-events-none absolute left-4 top-3 flex items-baseline gap-2 md:left-5 md:top-4">
            <span ref={prefixRef} className="select-none font-heading text-base font-bold leading-7 text-[#F5F5F5] whitespace-pre">What if</span>
            {!userText && <span className="text-sm leading-7 text-[#A1A1AA]/60 md:text-base">Write your scenario…</span>}
          </div>
          <textarea
            ref={textareaRef}
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
        <div className="flex items-center justify-between mt-3">
          <button
            type="submit"
            disabled={!userText.trim()}
            className="bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] font-body text-xs uppercase tracking-widest font-semibold py-2.5 px-6 transition disabled:opacity-50 cursor-pointer"
          >
            Ask
          </button>
          <div className="font-mono text-xs text-[#A1A1AA] tracking-widest">
            {totalChars}/200
          </div>
        </div>
      </form>
    </div>
  );
};

export default AskBox;
