import { useState, useEffect } from 'react';

const WA_LINK = 'https://wa.me/5589999754044?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Granja%20Uni%C3%A3o.';

export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {showTooltip && (
        <div className="bg-white text-[#2C2C2C] text-sm font-medium px-4 py-2 rounded-xl shadow-lg border border-[#E8F3E8] whitespace-nowrap animate-fade-in">
          Fale conosco agora! 🥚
        </div>
      )}
      <a
        href={WA_LINK}
        target="_blank"
        rel="nofollow noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label="Abrir WhatsApp"
        className="w-16 h-16 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl cursor-pointer hover:scale-110 transition-transform duration-200 animate-pulse-slow"
        style={{ boxShadow: '0 4px 20px rgba(37,211,102,0.5)' }}
      >
        <i className="ri-whatsapp-fill text-3xl" />
      </a>
    </div>
  );
}
