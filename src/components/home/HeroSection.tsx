import Button from '../common/Button';

export default function HeroSection() {
  return (
    <section className="hero-section flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        {/* Responsive heading: mobile (text-4xl), tablet (text-5xl md:text-6xl), desktop (lg:text-7xl) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Track Your Assets with{' '}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Confidence
          </span>
        </h1>

        {/* Responsive description: mobile (text-lg), tablet (text-xl), desktop (md:text-2xl) */}
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          Securely manage your complete financial portfolio in one place.
          Track investments, real estate, crypto, and more with powerful insights and peace of mind.
        </p>

        {/* Button with adequate touch target (size="large" ensures ≥44px height) */}
        <Button
          variant="primary"
          size="large"
          onClick={() => window.location.href = '/assets'}
        >
          Get Started
        </Button>
      </div>
    </section>
  );
}
