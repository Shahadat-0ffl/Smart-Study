import { Link } from 'react-router-dom';
import { FiBookOpen, FiAward } from 'react-icons/fi';

function Hero() {
  return (
    <section className="py-20 bg-[var(--background)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 text-[var(--text)]">
            Unlock Your Potential with
            <span className="block text-[var(--secondary)]">SmartStudy</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] mb-8 max-w-3xl mx-auto">
            Master your subjects with AI-powered tutoring, personalized assessments, and intelligent performance insights tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/ai-tutor" className="btn-primary" class="flex items-center gap-2">
              <FiBookOpen className="text-lg" />
              Get Started
            </Link>
            <Link to="/signup" className="btn-secondary" class="flex items-center gap-2">
              <FiAward className="text-lg" />
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;