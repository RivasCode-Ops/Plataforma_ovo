import { useInView } from '@/hooks/useInView';

const WA_LINK = 'https://wa.me/5589999754044?text=Ol%C3%A1!%20Gostaria%20de%20entrar%20em%20contato%20com%20a%20Granja%20Uni%C3%A3o.';

export default function ContactSection() {
  const { ref, inView } = useInView();

  return (
    <section id="contato" className="py-20 md:py-28 bg-white" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className={`text-center mb-14 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-4">
            Contato
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-bold text-[#2C2C2C] leading-tight mb-4">
            Fale Conosco — <span className="text-[#4A7C59]">Estamos Aqui!</span>
          </h2>
          <p className="text-[#666] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Entre em contato pelo WhatsApp, telefone ou venha até nosso depósito em Picos, PI. Estamos prontos para atender você!
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 transition-all duration-700 delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* WhatsApp Card */}
          <div className="bg-[#F5F1E8] rounded-2xl p-7 flex flex-col">
            <div className="w-12 h-12 flex items-center justify-center bg-[#25D366]/15 rounded-xl mb-4">
              <i className="ri-whatsapp-fill text-2xl text-[#25D366]" />
            </div>
            <h4 className="font-heading text-lg font-bold text-[#2C2C2C] mb-2">WhatsApp</h4>
            <p className="text-sm text-[#666] leading-relaxed mb-5 flex-1">
              A forma mais rápida de fazer seu pedido. Respondemos em minutos!
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="nofollow noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white font-semibold text-sm px-5 py-3 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-whatsapp-fill" />
              Abrir WhatsApp
            </a>
          </div>

          {/* Phone & Address Card */}
          <div className="bg-[#E8F3E8] rounded-2xl p-7 flex flex-col">
            <div className="w-12 h-12 flex items-center justify-center bg-[#4A7C59]/15 rounded-xl mb-4">
              <i className="ri-contacts-line text-2xl text-[#4A7C59]" />
            </div>
            <h4 className="font-heading text-lg font-bold text-[#2C2C2C] mb-4">Comunicação</h4>
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-start gap-3">
                <i className="ri-whatsapp-fill text-[#25D366] text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#999] uppercase tracking-wide mb-0.5">WhatsApp</p>
                  <a href="https://wa.me/5589999754044" target="_blank" rel="nofollow noreferrer" className="text-[#2C2C2C] font-semibold text-base hover:text-[#4A7C59] transition-colors cursor-pointer whitespace-nowrap">
                    (89) 9 9975-4044
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-mail-fill text-[#4A7C59] text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#999] uppercase tracking-wide mb-0.5">E-mail</p>
                  <a href="mailto:jvandsilva@hotmail.com" className="text-[#2C2C2C] font-semibold text-sm hover:text-[#4A7C59] transition-colors cursor-pointer break-all">
                    jvandsilva@hotmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-phone-fill text-[#4A7C59] text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#999] uppercase tracking-wide mb-0.5">Telefone Fixo</p>
                  <a href="tel:+558934223207" className="text-[#2C2C2C] font-semibold text-base hover:text-[#4A7C59] transition-colors cursor-pointer whitespace-nowrap">
                    (89) 3422-3207
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="ri-map-pin-fill text-[#4A7C59] text-base mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-[#999] uppercase tracking-wide mb-0.5">Endereço</p>
                  <address className="text-sm text-[#555] not-italic leading-relaxed">
                    Rua São Vicente, 174<br />
                    Centro, Picos – PI<br />
                    Brasil
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-[#FFF8E7] rounded-2xl p-7 flex flex-col">
            <div className="w-12 h-12 flex items-center justify-center bg-[#F5C842]/20 rounded-xl mb-4">
              <i className="ri-time-line text-2xl text-[#B8860B]" />
            </div>
            <h4 className="font-heading text-lg font-bold text-[#2C2C2C] mb-4">Horário de Atendimento</h4>
            <div className="flex flex-col gap-3 flex-1">
              {[
                { day: 'Segunda a Sexta', time: '07h00 – 18h00' },
                { day: 'Sábado', time: '07h00 – 13h00' },
                { day: 'Domingo', time: 'Fechado' },
              ].map((item) => (
                <div key={item.day} className="flex items-center justify-between border-b border-[#F0E8C0] pb-2 last:border-0">
                  <span className="text-sm text-[#666]">{item.day}</span>
                  <span className={`text-sm font-semibold ${item.time === 'Fechado' ? 'text-red-400' : 'text-[#2C2C2C]'}`}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#999] mt-4 italic">
              * Pedidos pelo WhatsApp podem ser feitos a qualquer hora
            </p>
          </div>
        </div>

        {/* Map */}
        <div
          className={`rounded-2xl overflow-hidden border border-[#E8E8E8] h-[360px] md:h-[420px] w-full transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <iframe
            title="Localização Granja União - Picos PI"
            src="https://maps.google.com/maps?q=Rua+S%C3%A3o+Vicente%2C+174%2C+Centro%2C+Picos%2C+PI%2C+Brazil&hl=pt-BR&z=16&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label="Mapa da localização da Granja União em Picos, PI"
          />
        </div>

        {/* Legal info */}
        <div
          className={`mt-6 text-center transition-all duration-700 delay-400 ${inView ? 'opacity-100' : 'opacity-0'}`}
        >
          <p className="text-xs text-[#bbb]">
            J. Vanderlei da Silva — CNPJ: 22.348.323/0001-03 · Rua São Vicente, 174, Centro, Picos – PI, Brasil
          </p>
        </div>
      </div>
    </section>
  );
}
