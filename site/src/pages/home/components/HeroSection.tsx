import { useEffect, useState } from 'react';

const WA_LINK = 'https://wa.me/5589999754044?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Granja%20Uni%C3%A3o.';

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector('#produtos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://readdy.ai/api/search-image?query=Beautiful%20collection%20of%20fresh%20golden%20farm%20eggs%20arranged%20in%20rustic%20wooden%20bowl%20overflowing%20with%20eggs%2C%20warm%20sunlight%20streaming%20through%20barn%20window%2C%20lush%20green%20leaves%20in%20background%2C%20rich%20warm%20amber%20golden%20tones%2C%20soft%20bokeh%20effect%2C%20premium%20artisan%20food%20photography%2C%20ultra%20high%20detail%2C%20professional%20lighting%2C%20farm%20fresh%20atmosphere&width=1920&height=1080&seq=hero001&orientation=landscape"
          alt="Ovos frescos Granja União"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
        <div className="max-w-2xl">
          {/* Tag */}
          <div
            className={`inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6 transition-all duration-700 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFF8E7]" />
            Direto da Granja para Sua Mesa
          </div>

          {/* Headline */}
          <h1
            className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 transition-all duration-700 delay-100 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Ovos Frescos com <span className="text-[#F5C842]">Qualidade</span> e <span className="text-[#F5C842]">Confiança</span> em Picos, PI
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-xl text-white/85 leading-relaxed mb-8 max-w-xl transition-all duration-700 delay-200 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            A Granja União é o fornecedor e depósito de ovos frescos mais confiável de Picos e região. Qualidade garantida, entrega local e atendimento personalizado.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <a
              href={WA_LINK}
              target="_blank"
              rel="nofollow noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold text-base px-7 py-4 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shadow-lg"
            >
              <i className="ri-whatsapp-fill text-xl" />
              Pedir pelo WhatsApp
            </a>
            <a
              href="#produtos"
              onClick={scrollToProducts}
              className="flex items-center justify-center gap-2.5 bg-white/15 backdrop-blur-sm border border-white/40 hover:bg-white/25 text-white font-semibold text-base px-7 py-4 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-shopping-basket-line text-xl" />
              Ver Produtos
            </a>
          </div>

          {/* Trust Badges */}
          <div
            className={`flex flex-wrap items-center gap-3 mt-10 transition-all duration-700 delay-500 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {[
              { icon: 'ri-checkbox-circle-fill', text: 'SIM, Entregamos', highlight: true },

              { icon: 'ri-shield-check-line', text: 'Qualidade Garantida', highlight: false },
              { icon: 'ri-time-line', text: 'Atendimento Rápido', highlight: false },
            ].map((badge) => (
              <div
                key={badge.text}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${
                  badge.highlight
                    ? 'bg-[#4A7C59]/30 border-[#4A7C59]/60 text-white font-semibold'
                    : 'bg-white/10 border-white/20 text-white/80'
                }`}
              >
                <i className={`${badge.icon} text-base ${badge.highlight ? 'text-[#F5C842]' : 'text-[#F5C842]'}`} />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-float">
        <span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
        <i className="ri-arrow-down-line text-white/50 text-lg" />
      </div>
    </section>
  );
}
