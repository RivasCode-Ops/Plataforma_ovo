import { useInView } from '@/hooks/useInView';

const WA_LINK = 'https://wa.me/5589999754044?text=Ol%C3%A1!%20Quero%20receber%20ovos%20frescos%20da%20Granja%20Uni%C3%A3o%20hoje!';

export default function CtaBanner() {
  const { ref, inView } = useInView();

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      ref={ref as React.RefObject<HTMLElement>}
    >
      {/* BG Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://readdy.ai/api/search-image?query=Aerial%20view%20of%20lush%20green%20farm%20fields%20with%20chicken%20coops%20in%20rural%20Brazil%2C%20idyllic%20countryside%20under%20clear%20blue%20sky%20with%20white%20clouds%2C%20vibrant%20green%20colors%2C%20peaceful%20pastoral%20landscape%20photography%2C%20warm%20sunlight%2C%20Brazilian%20northeast%20agriculture%2C%20Piau%C3%AD%20region%2C%20wide%20angle&width=1600&height=700&seq=cta006&orientation=landscape"
          alt="Granja União - Fazenda em Picos PI"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-[#2D5F3F]/85" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#F5C842]/10 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 text-center">
        <div
          className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#F5C842] bg-white/10 border border-[#F5C842]/30 px-3 py-1 rounded-full mb-5">
            Peça Agora
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Pronto para Receber <span className="text-[#F5C842]">Ovos Frescos</span> Hoje?
          </h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Entre em contato agora pelo WhatsApp e garanta a qualidade Granja União na sua porta. Atendemos em Picos, PI e toda a região.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={WA_LINK}
              target="_blank"
              rel="nofollow noreferrer"
              className="flex items-center gap-3 bg-[#F5C842] hover:bg-[#e6b82e] text-[#2C2C2C] font-bold text-base md:text-lg px-8 py-4 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap shadow-xl"
            >
              <i className="ri-whatsapp-fill text-2xl text-[#25D366]" />
              Chamar no WhatsApp Agora
            </a>
            <a
              href="tel:+558934223207"
              className="flex items-center gap-2.5 bg-white/10 border border-white/30 hover:bg-white/20 text-white font-semibold text-base px-7 py-4 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-phone-line text-xl" />
              (89) 3422-3207
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <i className="ri-checkbox-circle-fill text-[#4A7C59]" /> Respondemos rápido
            </span>
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <i className="ri-checkbox-circle-fill text-[#4A7C59]" /> Entrega local em Picos, PI
            </span>

          </div>
        </div>
      </div>
    </section>
  );
}
