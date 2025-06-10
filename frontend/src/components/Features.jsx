import { FiBookOpen, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Features() {
  const features = [
    {
      title: 'AI Tutor',
      description: 'Get personalized, step-by-step explanations for any subject with our advanced AI tutoring system that adapts to your learning style.',
      icon: FiBookOpen,
      link: '/ai-tutor',
    },
    {
      title: 'AI Assessment',
      description: 'Test your knowledge with intelligent, adaptive quizzes that adjust difficulty based on your performance and learning progress.',
      icon: FiTarget,
      link: '/ai-assessment',
    },
    {
      title: 'Risk Predictor',
      description: 'Analyze your academic performance with predictive analytics and receive actionable insights to improve your grades.',
      icon: FiTrendingUp,
      link: '/risk-predictor',
    },
  ];

  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-4">
            Why Choose
            <span className="text-[var(--primary)]"> SmartStudy</span>?
          </h2>
          <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
            Experience the future of education with our cutting-edge AI-powered learning platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="card group hover:bg-[var(--primary)]/5 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="inline-flex p-3 rounded-lg bg-[var(--primary)] text-white mb-6">
                    <IconComponent size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text)] mb-4 group-hover:text-[var(--primary)] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--muted)] leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6">
                    <Link
                      to={feature.link}
                      className="btn-primary text-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;