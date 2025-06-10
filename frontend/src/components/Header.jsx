import { Link } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';

function Header() {
  return (
    <header className="bg-[var(--primary)] text-white py-6 shadow-md">
      <div className="container mx-auto px-4 text-center">
        <Link to="/" className="group">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 hover:text-[var(--secondary)] transition-colors duration-200">
            <FaGraduationCap className="text-4xl" />
            SmartStudy
          </h1>
        </Link>
        <p className="text-lg text-[var(--muted)] mt-2">
          Your intelligent education companion
        </p>
      </div>
    </header>
  );
}

export default Header;