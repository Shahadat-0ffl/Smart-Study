import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext'; // Adjust path as needed
import TimerPopup from './TimerPopup'; // Adjust path as needed

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('sstheme') || 'light');

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('sstheme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Toggle timer
  const toggleTimer = () => {
    setIsTimerOpen((prev) => !prev);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsProfileOpen(false); // Close profile dropdown when menu toggles
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  // Handle profile navigation
  const handleProfile = () => {
    navigate('/profile');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-[var(--surface)] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-[var(--primary)]">
                SmartStudy
              </Link>
            </div>

            {/* Center: Navigation Links (Desktop) */}
            <div className="hidden md:flex space-x-4">
              <Link
                to="/ai-tutor"
                className="text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                AI Tutor
              </Link>
              <Link
                to="/ai-translation"
                className="text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                AI Translation
              </Link>
              <Link
                to="/ai-assessment"
                className="text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                AI Assessment
              </Link>
              <Link
                to="/risk-predictor"
                className="text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Risk Predictor
              </Link>
            </div>

            {/* Right: Theme Toggle, Timer, Profile, and Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-[var(--text)] hover:bg-[var(--background)] transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                <span className="material-icons">{theme === 'light' ? 'brightness_4' : 'brightness_7'}</span>
              </button>

              {/* Timer Button */}
              {user && <button
                onClick={toggleTimer}
                className="btn-primary p-2 rounded-full flex items-center justify-center"
                aria-label={isTimerOpen ? 'Hide timer' : 'Show timer'}
              >
                <span className="material-icons text-[var(--surface)]">timer</span>
              </button>}

              {/* Profile Dropdown or Auth Links */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="btn-secondary p-2 rounded-full flex items-center space-x-2"
                    aria-label="Toggle profile menu"
                    aria-expanded={isProfileOpen}
                  >
                    <span className="material-icons">person</span>
                    <span className="hidden md:inline text-sm">{user.username}</span>
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleProfile}
                        className="w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--background)] transition-colors"
                      >
                        Your Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-[var(--text)] hover:bg-[var(--background)] transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary px-4 py-2 text-sm hidden md:block"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary px-4 py-2 text-sm hidden md:block"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-[var(--text)] p-2"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span className="material-icons">{isMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[var(--surface)]">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/ai-tutor"
                className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                AI Tutor
              </Link>
              <Link
                to="/ai-translation"
                className="text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                AI Translation
              </Link>
              <Link
                to="/ai-assessment"
                className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                AI Assessment
              </Link>
              <Link
                to="/risk-predictor"
                className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium"
                onClick={toggleMenu}
              >
                Risk Predictor
              </Link>
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {user && (
                <>
                  <button
                    onClick={() => {
                      handleProfile();
                      toggleMenu();
                    }}
                    className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="block text-[var(--text)] hover:text-[var(--primary)] px-3 py-2 rounded-md text-base font-medium w-full text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}


      </nav>

      {/* Render TimerPopup */}
      {isTimerOpen && <TimerPopup setIsVisible={setIsTimerOpen} />}
    </>
  );
}

export default Navbar;
