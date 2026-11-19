import { Link, Navigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener?.('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    if (reducedMotion) {
      video.pause();
      return;
    }

    let cancelled = false;
    const startPlayback = () => {
      if (cancelled) return;
      const playback = video.play();
      playback?.catch((error) => {
        if (!cancelled && error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
          setVideoFailed(true);
        }
      });
    };

    if (video.readyState >= 2) startPlayback();
    else video.addEventListener('canplay', startPlayback, { once: true });

    return () => {
      cancelled = true;
      video.removeEventListener('canplay', startPlayback);
    };
  }, [reducedMotion, videoFailed]);

  if (user) {
    return <Navigate to="/daily" replace />;
  }

  return (
    <div className="landing-page bg-[#000000] text-[#F5F5F5] overflow-x-clip">
      <section className="relative isolate overflow-hidden bg-[#000000]">
        {!videoFailed && (
          <video
            aria-hidden="true"
            ref={videoRef}
            autoPlay={!reducedMotion}
            muted
            loop={!reducedMotion}
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          >
            <source src="/videos/space-bg.mp4" type="video/mp4" />
          </video>
        )}
        <div aria-hidden="true" className="landing-hero-atmosphere absolute inset-0 z-[1]" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 sm:py-32 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] mb-4 text-center">
            A NEW WHAT IF EVERY DAY
          </p>

          <h1 className="font-heading text-5xl lg:text-7xl font-bold tracking-tight text-[#F5F5F5] text-center mb-6">
            What if…?
          </h1>

          <p className="mx-auto max-w-[42rem] font-body text-base sm:text-xl text-[#F5F5F5]/80 mb-10 leading-relaxed font-normal text-center">
            A new question every day. Think through what could happen, share your answer, and see what the community thinks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] font-body text-xs uppercase tracking-widest font-semibold px-8 py-4 transition duration-200 cursor-pointer"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center border border-white/[0.08] hover:border-white/[0.08] text-[#F5F5F5] hover:text-[#f2a93b] font-body text-xs uppercase tracking-widest font-semibold px-8 py-4 transition duration-200 cursor-pointer"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{ backgroundImage: 'radial-gradient(ellipse at top left, rgba(242,169,59,0.07), transparent 60%)' }}
        className="w-full bg-[#000000] text-left"
      >
        <div className="max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
          <p className="font-mono text-xs tracking-widest text-[#f2a93b] uppercase mb-2">
            FEATURED WHAT-IF
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-3">
            Try a what-if
          </h2>
          <p className="mb-10 max-w-4xl font-body text-sm sm:text-base leading-relaxed text-[#A1A1AA]">
            Explore interesting what-if scenarios, share your thoughts, vote on possibilities, and discover what others think.
          </p>

          <div className="border border-white/[0.08] bg-[#0A0A0A] rounded-none p-8 sm:p-12">
            <div className="mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
                THE QUESTION
              </span>
              <p className="font-heading text-2xl sm:text-3xl text-[#F5F5F5] font-bold leading-snug">
                What if gravity suddenly reversed for 10 seconds every day?
              </p>
            </div>

            <div className="pt-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA] block mb-2">
                WHAT MIGHT HAPPEN
              </span>
              <p className="font-body text-sm sm:text-base text-[#F5F5F5]/80 leading-relaxed font-normal">
                If gravity reversed for 10 seconds each day, loose objects would fly upward and everyday tasks would get chaotic. People might secure their furniture, make rooms safer, and build a daily routine to prepare for it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{ backgroundImage: 'radial-gradient(ellipse at top right, rgba(242,169,59,0.06), transparent 60%)' }}
        className="w-full bg-[#000000] text-left"
      >
        <div className="max-w-6xl mx-auto px-6 pb-20 sm:pb-28">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-10">
            What you get
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#f2a93b] mb-2">Daily</h3>
              <p className="font-body text-sm text-[#A1A1AA] leading-relaxed">
                A new what-if every day. Pick what you think would happen and see how others voted.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#f2a93b] mb-2">Streak</h3>
              <p className="font-body text-sm text-[#A1A1AA] leading-relaxed">
                Build a daily streak. Come back every day and keep it going.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#f2a93b] mb-2">Categories</h3>
              <p className="font-body text-sm text-[#A1A1AA] leading-relaxed">
                Browse by category. What-ifs from movies, anime, myths, science and more.
              </p>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#f2a93b] mb-2">Ask AI</h3>
              <p className="font-body text-sm text-[#A1A1AA] leading-relaxed">
                Ask your own what-if. Type any scenario and get an AI answer in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-[#000000] text-left">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-[2fr_1fr_1fr] md:gap-8">
            <div className="col-span-2 flex min-w-0 flex-col items-start gap-2 md:col-span-1">
              <Link to="/" className="inline-flex min-h-10 items-center font-heading text-base font-bold tracking-tight sm:text-lg">
                <span><span className="text-[#FFFFFF]">WHAT</span><span className="text-[#f2a93b]"> IF?</span></span>
              </Link>
              <p className="font-body text-sm leading-relaxed text-[#A1A1AA]">Ask a what-if. See where it leads.</p>
            </div>
            <div className="flex min-w-0 flex-col items-start">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">EXPLORE</h2>
              <div className="flex flex-col items-start">
                <Link to="/contact" className="inline-flex min-h-10 items-center font-body text-sm text-[#A1A1AA] hover:underline">Contact</Link>
                <Link to="/login" className="inline-flex min-h-10 items-center font-body text-sm text-[#A1A1AA] hover:underline">Login</Link>
                <Link to="/register" className="inline-flex min-h-10 items-center font-body text-sm text-[#A1A1AA] hover:underline">Register</Link>
              </div>
            </div>
            <div className="flex min-w-0 flex-col items-start">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-[#A1A1AA]">SOCIAL</h2>
              <div className="flex flex-col items-start">
                <a href="https://github.com/Priyanshu12334" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-3 font-body text-sm text-[#A1A1AA] hover:underline">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.3.8-.6v-2.1c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.8 2.5 4.1 1.8.1-.8.4-1.3.7-1.6-2.5-.3-5.1-1.3-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3.1 1.1a10.7 10.7 0 0 1 5.7 0c2.2-1.4 3.1-1.1 3.1-1.1.6 1.6.2 2.8.1 3.1.7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5.1 5.4.4.3.8 1 .8 2v3c0 .3.2.7.8.6A11.1 11.1 0 0 0 12 .9Z" /></svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/priyanshu-suyal-5732b224a" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-3 font-body text-sm text-[#A1A1AA] hover:underline">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6ZM8 19H5V9h3v10ZM6.5 7.6a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6ZM19 19h-3v-4.9c0-1.2 0-2.7-1.7-2.7s-2 1.3-2 2.6V19H9V9h3v1.4h.1a3.3 3.3 0 0 1 3-1.7c3.2 0 3.9 2.1 3.9 4.8V19Z" /></svg>
                  LinkedIn
                </a>
                <a href="https://portfolio-ten-blond-87.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-3 font-body text-sm text-[#A1A1AA] hover:underline">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
                  Portfolio
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-white/[0.08] pt-4 md:flex-row md:items-center md:justify-between">
            <p className="font-body text-xs text-[#A1A1AA]">A product by Priyanshu Suyal</p>
            <p className="font-body text-xs text-[#A1A1AA]">&copy; 2026 WHAT IF? All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
