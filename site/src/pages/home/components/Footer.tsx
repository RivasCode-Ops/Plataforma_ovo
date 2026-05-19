import Logo from '@/components/base/Logo';

const WA_LINK = 'https://wa.me/5589999754044?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Granja%20Uni%C3%A3o.';

const NAV_LINKS = [
  { label: 'Início', href: '#hero' },
  { label: 'Sobre Nós', href: '#sobre' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Contato', href: '#contato' },
];

const PRODUCTS_LIST = [
  'Ovos Brancos',
  'Ovos Vermelhos',
  'Ovos Grandes (Extra)',
  'Caixa Atacado',
];

function scrollTo(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Footer() {
  return (
    <footer className="bg-[#1C3828] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8">

        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Logo variant="inverted" size="md" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Fornecedor e depósito de ovos frescos em Picos, PI. Qualidade e confiança para sua mesa todos os dias.
            </p>
            {/* SIM badges */}
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center bg-[#4A7C59] rounded-full shrink-0">
                  <i className="ri-check-line text-white text-[10px]" />
                </div>
                <span className="text-white/80 text-xs font-semibold">SIM, fazemos entrega</span>
              </div>

            </div>
            <a
              href={WA_LINK}
              target="_blank"
              rel="nofollow noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-sm font-bold px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-whatsapp-fill text-base" />
              Fazer Pedido
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Navegação</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                    className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Produtos</h4>
            <ul className="space-y-3">
              {PRODUCTS_LIST.map((product) => (
                <li key={product}>
                  <a
                    href="#produtos"
                    onClick={(e) => { e.preventDefault(); scrollTo('#produtos'); }}
                    className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer"
                  >
                    {product}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-whatsapp-fill text-[#25D366] text-sm" />
                </div>
                <a href="https://wa.me/5589999754044" target="_blank" rel="nofollow noreferrer" className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer whitespace-nowrap">
                  (89) 9 9975-4044
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-mail-fill text-[#F5C842] text-sm" />
                </div>
                <a href="mailto:jvandsilva@hotmail.com" className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer break-all">
                  jvandsilva@hotmail.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-phone-fill text-[#F5C842] text-sm" />
                </div>
                <a href="tel:+558934223207" className="text-white/70 hover:text-white text-sm transition-colors cursor-pointer whitespace-nowrap">
                  (89) 3422-3207
                </a>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-map-pin-fill text-[#F5C842] text-sm" />
                </div>
                <address className="text-white/70 text-sm not-italic leading-relaxed">
                  Rua São Vicente, 174<br />
                  Centro, Picos – PI
                </address>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                  <i className="ri-time-fill text-[#F5C842] text-sm" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  Seg–Sex: 7h–18h<br />
                  Sábado: 7h–13h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
          <p className="text-white/40 text-xs text-center sm:text-left">
            © 2026 J. Vanderlei da Silva — CNPJ 22.348.323/0001-03 · Todos os direitos reservados.
          </p>
          <p className="text-white/40 text-xs text-center sm:text-right">
            Desenvolvido por <strong className="text-white/60 font-semibold">RIVASTECH</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
