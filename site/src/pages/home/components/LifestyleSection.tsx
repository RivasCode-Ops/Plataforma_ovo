import { useInView } from '@/hooks/useInView';

const POINTS = [
  { icon: 'ri-restaurant-line', text: 'Versáteis na culinária: fritos, cozidos, mexidos, assados e muito mais' },
  { icon: 'ri-heart-pulse-line', text: 'Rica fonte de proteínas, vitaminas e minerais essenciais' },
  { icon: 'ri-time-line', text: 'Refeição rápida e nutritiva para o dia a dia corrido' },
  { icon: 'ri-seedling-line', text: 'Ingrediente base para bolos, pães, massas e confeitaria' },
  { icon: 'ri-money-cny-circle-line', text: 'Uma das proteínas mais acessíveis e completas disponíveis' },
  { icon: 'ri-home-heart-line', text: 'Sempre presentes nas cozinhas brasileiras de Norte a Sul' },
];

export default function LifestyleSection() {
  const { ref: leftRef, inView: leftInView } = useInView();
  const { ref: rightRef, inView: rightInView } = useInView();

  return (
    <section className="py-0 overflow-hidden bg-white">
      <div className="flex flex-col lg:flex-row min-h-[600px]">

        {/* Left: Image */}
        <div
          ref={leftRef as React.RefObject<HTMLDivElement>}
          className={`w-full lg:w-1/2 h-72 lg:h-auto relative transition-all duration-700 ${leftInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
        >
          <img
            src="https://readdy.ai/api/search-image?query=Warm%20inviting%20Brazilian%20home%20kitchen%20in%20morning%20light%2C%20happy%20woman%20cooking%20fresh%20eggs%20in%20black%20cast%20iron%20pan%20for%20breakfast%2C%20wooden%20kitchen%20interior%2C%20fresh%20herbs%20and%20vegetables%20on%20counter%2C%20authentic%20warm%20family%20lifestyle%20photography%2C%20golden%20morning%20sunlight%20through%20window%2C%20cozy%20atmosphere%2C%20fresh%20food&width=900&height=700&seq=life005&orientation=landscape"
            alt="Ovos frescos na cozinha brasileira - Granja União Picos PI"
            title="Ovos Frescos no Dia a Dia – Granja União"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 lg:to-white/20" />
        </div>

        {/* Right: Content */}
        <div
          ref={rightRef as React.RefObject<HTMLDivElement>}
          className={`w-full lg:w-1/2 bg-[#F5F1E8] flex items-center transition-all duration-700 delay-200 ${rightInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
        >
          <div className="px-8 md:px-12 lg:px-16 py-14 lg:py-20 max-w-xl mx-auto lg:mx-0">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-5">
              Versatilidade no Dia a Dia
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#2C2C2C] leading-tight mb-5">
              O Ovo é o Ingrediente <span className="text-[#4A7C59]">Essencial</span> da Cozinha Brasileira
            </h2>
            <p className="text-[#666] text-base leading-relaxed mb-8">
              Nutritivo, econômico e incrivelmente versátil — o ovo está presente em todas as refeições do dia e é indispensável na cozinha de qualquer família brasileira. Com a Granja União, você garante que esse ingrediente essencial seja sempre fresco e de qualidade.
            </p>

            {/* Feature List */}
            <ul className="space-y-3 mb-8">
              {POINTS.map((point) => (
                <li key={point.text} className="flex items-start gap-3">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0 bg-[#E8F3E8] rounded-full mt-0.5">
                    <i className={`${point.icon} text-[#4A7C59] text-sm`} />
                  </div>
                  <span className="text-sm text-[#555] leading-relaxed">{point.text}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://wa.me/5589999754044?text=Ol%C3%A1!%20Quero%20fazer%20um%20pedido%20na%20Granja%20Uni%C3%A3o."
              target="_blank"
              rel="nofollow noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#4A7C59] hover:bg-[#3a6547] text-white font-semibold text-base px-7 py-3.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-whatsapp-fill text-xl" />
              Faça Seu Pedido Agora
              <i className="ri-arrow-right-line" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
