const AiAnswerCards = ({ reply }) => {
  if (!reply) return null;

  let answer = reply;
  if (typeof reply === 'string') {
    const start = reply.indexOf('{');
    const end = reply.lastIndexOf('}');
    if (start >= 0 && end >= start) {
      try {
        answer = JSON.parse(reply.slice(start, end + 1));
      } catch {
        answer = reply;
      }
    }
  }

  const sections = typeof answer === 'string'
    ? [['WHAT MIGHT HAPPEN', answer]]
    : [
        ['WHAT MIGHT HAPPEN', answer?.whatMightHappen],
        ['FUN FACT', answer?.funFact]
      ].filter(([, content]) => typeof content === 'string' && content.trim());

  return (
    <div className="space-y-4">
      {sections.map(([title, content]) => (
        <div key={title} className="border border-white/[0.08] bg-[#0A0A0A] p-6 text-left">
          <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
            {title}
          </span>
          <p className="w-full max-w-none font-body font-normal text-base leading-relaxed text-[#F5F5F5]/85 whitespace-pre-line">
            {content.replace(/^[:\s-]+/, '').trim()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default AiAnswerCards;
