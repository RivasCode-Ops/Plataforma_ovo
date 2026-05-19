import { useInView } from '@/hooks/useInView';

const STATS = [
  { value: '10+', label: 'Anos de Experiência', icon: 'ri-medal-line' },
  { value: '100%', label: 'Ovos Frescos Diariamente', icon: 'ri-leaf-line' },
  { value: 'Local', label: 'Entrega em Picos e Região', icon: 'ri-map-pin-line' },
];

export default function AboutSection() {
  const { ref: sectionRef, inView } = useInView();
  const { ref: imgRef, inView: imgInView } = useInView();

  return (
    <section id="sobre" className="py-20 md:py-28 bg-[#F5F1E8]" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image Side */}
          <div
            ref={imgRef as React.RefObject<HTMLDivElement>}
            className={`relative transition-all duration-700 ${imgInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
          >
            <div className="relative rounded-2xl overflow-hidden w-full h-[420px] md:h-[520px]">
              <img
                src="https://readdy.ai/api/search-image?query=Traditional%20family%20poultry%20farm%20in%20rural%20Brazil%20Piau%C3%AD%20state%2C%20northeast%20region%2C%20lush%20green%20fields%20with%20free-range%20hens%20pecking%20at%20grass%20under%20bright%20sunny%20blue%20sky%2C%20rustic%20white%20farm%20buildings%2C%20warm%20sunny%20daylight%2C%20idyllic%20rural%20countryside%20landscape%2C%20authentic%20Brazilian%20farming%2C%20warm%20natural%20light%2C%20vibrant%20colors&width=700&height=600&seq=about002&orientation=portrait"
                alt="Granja União - Fazenda local em Picos PI"
                title="Granja União – Tradição e Qualidade em Picos, PI"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/30 to-transparent" />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-5 -right-4 md:-right-6 bg-white rounded-xl p-4 shadow-md border border-[#E8F3E8] max-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-[#E8F3E8] rounded-full shrink-0">
                  <i className="ri-heart-fill text-[#4A7C59] text-lg" />
                </div>
                <div>
                  <p className="text-xs text-[#666] leading-tight">Confiança de</p>
                  <p className="text-sm font-semibold text-[#2C2C2C] leading-tight">Picos &amp; Região</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className={`transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-4">
              Nossa História
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-[42px] font-bold text-[#2C2C2C] leading-tight mb-5">
              Tradição e Qualidade no <span className="text-[#4A7C59]">Coração do Piauí</span>
            </h2>
            <p className="text-[#666] text-base leading-relaxed mb-4">
              A <strong className="text-[#2C2C2C]">Granja União</strong> é um fornecedor e depósito de ovos com sede em Picos, PI, comprometido em levar ovos frescos e de alta qualidade para consumidores, estabelecimentos comerciais e distribuidores da região.
            </p>
            <p className="text-[#666] text-base leading-relaxed mb-4">
              Com anos de atuação no mercado local, somos referência em <strong className="text-[#2C2C2C]">confiança, frescor e atendimento dedicado</strong>. Cada ovo que sai daqui passou por rigoroso controle de qualidade para chegar perfeito à sua mesa.
            </p>
            <p className="text-[#666] text-base leading-relaxed mb-8">
              Nossa missão é simples: fornecer o melhor produto, com o melhor preço e o melhor atendimento de Picos e região. Fazemos isso com orgulho e paixão pelo que fazemos.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`bg-white rounded-xl p-4 text-center border border-[#E8F3E8] transition-all duration-500`}
                  style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div className="w-9 h-9 flex items-center justify-center bg-[#E8F3E8] rounded-full mx-auto mb-2">
                    <i className={`${stat.icon} text-[#4A7C59] text-base`} />
                  </div>
                  <p className="font-heading text-xl font-bold text-[#4A7C59]">{stat.value}</p>
                  <p className="text-[10px] text-[#999] leading-tight mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
