
import { Link } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';
import { FiBookOpen, FiTarget, FiMail, FiPhone,FiAward } from 'react-icons/fi';
import { FaChartBar } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-[var(--surface)] text-[var(--text)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <FaGraduationCap className="text-3xl text-[var(--primary)]" />
              <h3 className="text-2xl font-bold text-[var(--primary)]">
                SmartStudy
              </h3>
            </div>
            <p className="text-[var(--muted)] leading-relaxed max-w-md">
              Empowering students worldwide with cutting-edge AI-driven learning tools, personalized education paths, and intelligent insights for academic excellence.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <FiAward className="text-[var(--primary)]" />
                <span>Award-winning platform</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-[var(--primary)]">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/ai-tutor"
                  className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors duration-200 flex items-center gap-2"
                >
                  <FiBookOpen className="text-[var(--primary)]" />
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-assessment"
                  className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors duration-200 flex items-center gap-2"
                >
                  <FiTarget className="text-[var(--primary)]" />
                  AI Assessment
                </Link>
              </li>
              <li>
                <Link
                  to="/risk-predictor"
                  className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors duration-200 flex items-center gap-2"
                >
                  <FaChartBar className="text-[var(--primary)]" />
                  Risk Predictor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-[var(--primary)]">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--muted)]">
                <FiMail className="text-[var(--primary)]" />
                <span>support@smartstudy.com</span>
              </div>
              <div className="flex items-center gap-3 text-[var(--muted)]">
                <FiPhone className="text-[var(--primary)]" />
                <span>+1-800-555-6789</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--muted)] text-sm">
              © {new Date().getFullYear()} SmartStudy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-[var(--muted)]">
              <a href="#" className="hover:text-[var(--primary)] transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[var(--primary)] transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="hover:text-[var(--primary)] transition-colors duration-200">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
