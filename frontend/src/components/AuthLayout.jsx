import { Link, useLocation } from 'react-router-dom';

const SAMPLES = {
  login: {
    question: 'What if the sun never set?',
    options: [
      { text: 'Ecosystem collapse & endless daylight', pct: 38 },
      { text: 'Shift to perpetual indoor night-cycles', pct: 29 },
      { text: 'Polar migration toward twilight zones', pct: 21 },
      { text: 'Industrial production runs 24/7 forever', pct: 12 }
    ]
  },
  register: {
    question: "What if humans didn't need to sleep?",
    options: [
      { text: 'Global economy shifts to 24/7 operations', pct: 44 },
      { text: 'Creative arts & philosophy flourish', pct: 27 },
      { text: 'Mental fatigue and sensory overload surge', pct: 19 },
      { text: 'Societies eliminate residential bedrooms', pct: 10 }
    ]
  }
};

const AuthLayout = ({ children, badge, headline, subtext }) => {
  const { pathname } = useLocation();
  const sample = pathname === '/register' ? SAMPLES.register : SAMPLES.login;

  return (
    <div className="min-h-screen lg:h-dvh overflow-x-clip lg:overflow-hidden [@media(max-height:640px)]:overflow-y-auto bg-[#000000] text-[#F5F5F5] grid grid-cols-1 lg:grid-cols-2 gap-0 w-full">
      <div className="hidden min-w-0 lg:flex flex-col p-10 bg-white/[0.03] text-left">
        <Link
          to="/"
          className="font-heading text-xl font-bold tracking-tight text-[#F5F5F5] hover:opacity-90 inline-block"
        >
          <><span className="text-[#FFFFFF]">WHAT</span><span className="text-[#f2a93b]"> IF?</span></>
        </Link>

        <div className="flex-1 flex flex-col justify-center gap-5 w-full max-w-xl">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#f2a93b] block">
            {badge}
          </span>
          <h2 className="font-heading text-3xl font-bold text-[#F5F5F5] leading-tight">
            {headline}
          </h2>
          <p className="font-body text-sm text-[#A1A1AA] leading-6">
            {subtext}
          </p>

          <div className="border border-white/[0.08] bg-[#0D0D0D] rounded-none p-4 w-full max-w-xl text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#f2a93b] block mb-2">
              SAMPLE QUESTION
            </span>
            <h3 className="font-heading text-base font-bold text-[#F5F5F5] mb-3">
              {sample.question}
            </h3>
            <div className="space-y-1.5">
              {sample.options.map((opt, i) => (
                <div key={i} className="py-1.5">
                  <div className="flex justify-between font-body text-sm text-[#F5F5F5]/80 mb-1">
                    <span>{opt.text}</span>
                    <span className="font-mono text-xs text-[#A1A1AA]">
                      {opt.pct}%
                    </span>
                  </div>
                  <div className="h-[3px] bg-[#F5F5F5]/10 w-full overflow-hidden">
                    <div
                      className="h-full bg-[#f2a93b]"
                      style={{ width: `${opt.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ backgroundImage: 'radial-gradient(ellipse at bottom right, rgba(242,169,59,0.07), transparent 60%)' }}
        className="min-w-0 flex flex-col justify-center items-center min-h-screen lg:min-h-full bg-[#000000] px-5 py-8 lg:p-10 w-full text-left"
      >
        <div className="lg:hidden w-full max-w-sm mb-6">
          <Link
            to="/"
            className="font-heading text-xl font-bold tracking-tight text-[#F5F5F5]"
          >
            <><span className="text-[#FFFFFF]">WHAT</span><span className="text-[#f2a93b]"> IF?</span></>
          </Link>
        </div>

        <div className="min-w-0 w-full max-w-sm text-left">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
