import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      <Hero />
      <hr/>
      <Features />
      <Footer />
    </div>
  );
}

export default Home;