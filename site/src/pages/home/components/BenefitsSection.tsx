import { useInView } from '@/hooks/useInView';

const BENEFITS = [
  {
    icon: 'ri-leaf-line',
    title: 'Frescor Garantido',
    description: 'Nossos ovos são coletados e entregues com máximo frescor. Trabalhamos com rigoroso controle de qualidade para garantir que você receba sempre o melhor.',
    color: '#E8F3E8',
    iconColor: '#4A7C59',
    badge: null,
  },
  {
    icon: 'ri-truck-line',
    title: 'SIM, Fazemos Entrega!',
    description: 'Entregamos em Picos e toda a região de forma ágil e confiável. Faça seu pedido pelo WhatsApp e combinamos a entrega com comodidade para você. Simples assim.',
    color: '#FFF8E7',
    iconColor: '#B8860B',
    badge: 'ENTREGA',
  },

  {
    icon: 'ri-shield-check-line',
    title: 'Qualidade Certificada',
    description: 'Seguimos todas as normas sanitárias e de segurança alimentar. Você compra com segurança e transparência, sabendo exatamente de onde vêm os seus ovos.',
    color: '#FFF8E7',
    iconColor: '#B8860B',
    badge: null,
  },
  {
    icon: 'ri-price-tag-3-line',
    title: 'Preço Justo e Competitivo',
    description: 'Praticamos preços honestos e acessíveis para o consumidor final, feirantes, mercadinhos e distribuidores. Compre mais, economize mais.',
    color: '#E8F3E8',
    iconColor: '#4A7C59',
    badge: null,
  },
  {
    icon: 'ri-user-heart-line',
    title: 'Atendimento Personalizado',
    description: 'Nossa equipe está sempre disponível para tirar dúvidas, orientar sobre os produtos e garantir sua total satisfação com cada pedido.',
    color: '#FFF8E7',
    iconColor: '#B8860B',
    badge: null,
  },
  {
    icon: 'ri-store-2-line',
    title: 'Atacado e Varejo',
    description: 'Atendemos tanto o consumidor doméstico quanto grandes distribuidores e estabelecimentos comerciais. Temos a quantidade certa para o seu negócio.',
    color: '#E8F3E8',
    iconColor: '#4A7C59',
    badge: null,
  },
];

export default function BenefitsSection() {
  const { ref, inView } = useInView();

  return (
    <section id="diferenciais" className="py-20 md:py-28 bg-white" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-4">
            Nossos Diferenciais
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-bold text-[#2C2C2C] leading-tight mb-4">
            Por Que Escolher a <span className="text-[#4A7C59]">Granja União?</span>
          </h2>
          <p className="text-[#666] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Somos mais do que um fornecedor de ovos — somos um parceiro comprometido com a qualidade e satisfação dos nossos clientes em Picos, PI.
          </p>
          {/* SIM highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-2 bg-[#4A7C59] text-white text-sm font-bold px-5 py-2 rounded-full">
              <i className="ri-checkbox-circle-fill text-base" />
              SIM, fazemos Entrega
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {BENEFITS.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`group relative bg-white rounded-2xl p-6 border cursor-default transition-all duration-500 hover:-translate-y-1 ${
                benefit.badge
                  ? 'border-[#4A7C59]/40 bg-gradient-to-br from-[#E8F3E8]/60 to-white hover:border-[#4A7C59]/60'
                  : 'border-[#F0EDE8] hover:border-[#4A7C59]/30'
              } ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${0.1 + index * 0.07}s` }}
            >
              {/* Badge */}
              {benefit.badge && (
                <div className="absolute -top-3 left-5">
                  <span className="bg-[#4A7C59] text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    ✓ {benefit.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: benefit.color }}
              >
                <i className={`${benefit.icon} text-xl`} style={{ color: benefit.iconColor }} />
              </div>

              <h4 className="font-heading text-base font-bold text-[#2C2C2C] mb-2 leading-snug">
                <a className="hover:text-[#4A7C59] transition-colors">{benefit.title}</a>
              </h4>
              <p className="text-[#666] text-sm leading-relaxed">{benefit.description}</p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ backgroundColor: benefit.iconColor }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
