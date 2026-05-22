import { useState, useEffect } from 'react';
import Logo from '@/components/base/Logo';

const WA_LINK = 'https://wa.me/5589999754044?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Granja%20Uni%C3%A3o.';

const NAV_LINKS = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Pedido', href: '#pedido' },
  { label: 'Contato', href: '#contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/97 backdrop-blur-sm border-b border-[#F0EDE8]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-20 md:h-24">
          {/* Logo */}
          <a href="#hero" onClick={(e) => handleNav(e, '#hero')} className="flex items-center cursor-pointer">
            <Logo variant={scrolled ? 'default' : 'light'} size="lg" />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className={`text-sm font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                  scrolled ? 'text-[#2C2C2C] hover:text-[#4A7C59]' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href={WA_LINK}
              target="_blank"
              rel="nofollow noreferrer"
              className="hidden md:flex items-center gap-2 bg-[#25D366] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-[#1ebe5a] whitespace-nowrap"
            >
              <i className="ri-whatsapp-line text-base" />
              Pedir Agora
            </a>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-colors ${
                scrolled ? 'text-[#2C2C2C]' : 'text-white'
              }`}
              aria-label="Menu"
            >
              <i className={`${menuOpen ? 'ri-close-line' : 'ri-menu-3-line'} text-2xl`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-all duration-300 flex flex-col md:hidden pt-20 px-6 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-6 mt-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="font-heading text-2xl text-[#2C2C2C] font-bold border-b border-[#F5F1E8] pb-4 cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <a
            href={WA_LINK}
            target="_blank"
            rel="nofollow noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-base font-bold px-6 py-4 rounded-full mt-4 whitespace-nowrap cursor-pointer"
          >
            <i className="ri-whatsapp-line text-xl" />
            Fazer Pedido pelo WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
