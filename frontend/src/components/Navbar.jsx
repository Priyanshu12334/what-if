import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogoutModal) {
        setShowLogoutModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal]);

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const navLinkClass = (path) =>
    `font-mono text-xs uppercase tracking-widest border-b pb-1 transition ${
      pathname === path
        ? 'border-[#f2a93b] text-[#f2a93b]'
        : 'border-transparent text-[#A1A1AA] hover:text-[#F5F5F5]'
    }`;

  const mobileNavLinkClass = (path) =>
    `font-mono text-xs uppercase tracking-widest py-2 transition block ${
      pathname === path
        ? 'text-[#f2a93b]'
        : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
    }`;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b bg-[#000000]/85 backdrop-blur-md ${scrolled ? 'border-white/[0.06]' : 'border-transparent'}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to={user ? '/daily' : '/'}
            className="inline-flex items-center gap-2 font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F5F5F5] hover:opacity-90 transition"
          >
            <span><span className="text-[#FFFFFF]">WHAT</span><span className="text-[#f2a93b]"> IF?</span></span>
          </Link>

          {user ? (
            <>
              {/* Desktop Menu */}
              <div className="hidden sm:flex items-center gap-8">
                <Link to="/daily" className={navLinkClass('/daily')}>
                  Daily
                </Link>
                <Link to="/categories" className={navLinkClass('/categories')}>
                  Categories
                </Link>
                <Link to="/ask" className={navLinkClass('/ask')}>
                  Ask
                </Link>
                <Link to="/history" className={navLinkClass('/history')}>
                  Recent
                </Link>
                <Link to="/contact" className={navLinkClass('/contact')}>
                  Contact
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-red-400 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden flex h-8 w-8 items-center justify-center bg-transparent text-[#A1A1AA] hover:text-[#F5F5F5] transition cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}
                >
                  {mobileMenuOpen ? '✕' : '☰'}
                </span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                to="/login"
                className="font-mono text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#F5F5F5] transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] px-4 py-2 font-body text-xs uppercase tracking-widest font-semibold transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Dropdown Menu (Logged in) */}
        {user && (
          <div
            aria-hidden={!mobileMenuOpen}
            inert={!mobileMenuOpen}
            className={`sm:hidden overflow-hidden bg-[#000000]/95 px-6 flex flex-col gap-2 transition-[max-height,opacity] duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 border-t border-white/[0.08] py-4' : 'max-h-0 opacity-0 py-0 pointer-events-none'}`}
          >
            <Link
              to="/daily"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass('/daily')}
            >
              Daily
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass('/categories')}
            >
              Categories
            </Link>
            <Link
              to="/ask"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass('/ask')}
            >
              Ask
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass('/history')}
            >
              Recent
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileNavLinkClass('/contact')}
            >
              Contact
            </Link>
            <div className="border-t border-white/[0.08] pt-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="font-mono text-xs uppercase tracking-widest text-red-400/80 hover:text-red-400 transition cursor-pointer py-1 block w-full text-left"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
        >
          <div className="modal-card border border-white/[0.08] bg-[#0D0D0D] p-6 sm:p-8 max-w-md w-full text-left relative">
            <span className="font-mono text-xs uppercase tracking-widest text-[#f2a93b] block mb-2">
              CONFIRM LOGOUT
            </span>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-3">
              Are you sure you want to logout?
            </h2>
            <p className="font-body text-sm text-[#A1A1AA] mb-8 leading-relaxed">
              You will need to sign in again to record answers or ask what-if questions.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="border border-white/[0.08] hover:border-white/[0.08] text-[#F5F5F5]/80 hover:text-[#F5F5F5] px-5 py-2.5 font-body text-xs uppercase tracking-widest font-semibold transition cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="bg-[#e10e0e] hover:bg-[#ff1717] text-white px-5 py-2.5 font-body text-xs uppercase tracking-widest font-semibold transition cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

