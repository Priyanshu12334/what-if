import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AskBox = () => {
  const [userText, setUserText] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = userText.trim();
    if (!trimmed) return;
    navigate(`/ask?q=${encodeURIComponent(trimmed)}`);
  };

  const totalChars = userText.length > 0 ? 8 + userText.length : 0;

  return (
    <div className="askbox-gradient border border-white/[0.08] bg-[#0A0A0A] p-6 text-left my-8">
      <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-3">
        CAN'T FIND YOUR QUESTION?
      </span>
      <form onSubmit={handleSubmit}>
        <div className="ask-input-gradient flex items-center gap-2 border border-white/20 bg-transparent px-4 py-4 focus-within:border-[#f2a93b] transition">
          <strong className="font-heading font-bold text-[#F5F5F5] select-none pointer-events-none text-base sm:text-lg whitespace-nowrap">
            What if
          </strong>
          <input
            type="text"
            maxLength={192}
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Write your scenario…"
            className="w-full bg-transparent text-[#F5F5F5] text-base focus:outline-none font-body"
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
