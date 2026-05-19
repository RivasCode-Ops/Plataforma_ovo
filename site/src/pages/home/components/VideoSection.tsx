import { useState, useRef, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';

const VIDEO_URL =
  'https://storage.readdy-site.link/project_files/5e569ba0-2d5e-4d74-b496-ad306314a7f7/e77b8a09-9825-4643-8290-09acd4b08e53_Video.mp4?v=47cf08b299dc5d0ec5c48ebf181c5d60';

export default function VideoSection() {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: sectionRef, inView } = useInView();

  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* ── Section ── */}
      <section
        id="video"
        className="py-20 md:py-28 bg-[#FEFDFB]"
        ref={sectionRef as React.RefObject<HTMLElement>}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-4">
              Vídeo Institucional
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#2C2C2C] leading-tight mb-4">
              Conheça a <span className="text-[#4A7C59]">Granja União</span> por Dentro
            </h2>
            <p className="text-[#666] text-base max-w-2xl mx-auto leading-relaxed">
              Veja de perto como cuidamos de cada detalhe para entregar ovos frescos e de qualidade
              para Picos e toda a região.
            </p>
          </div>

          {/* Thumbnail / trigger */}
          <div
            className={`transition-all duration-700 delay-200 ${
              inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ aspectRatio: '16/9' }}
              onClick={handleOpen}
            >
              {/* Thumbnail image */}
              <img
                src="https://readdy.ai/api/search-image?query=Beautiful%20aerial%20view%20of%20a%20poultry%20egg%20farm%20in%20Picos%20Piaui%20Brazil%20northeast%20region%2C%20lush%20green%20rural%20landscape%2C%20sunny%20day%2C%20golden%20hour%20light%2C%20rows%20of%20farm%20buildings%2C%20chickens%20grazing%20outdoors%2C%20warm%20earthy%20tones%2C%20cinematic%20wide%20shot%2C%20farm%20documentary%20style&width=1200&height=675&seq=video-thumb-001&orientation=landscape"
                alt="Vídeo institucional Granja União Picos PI"
                title="Granja União – Vídeo Institucional"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 group-hover:from-black/70 transition-all duration-300" />

              {/* Play button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 flex items-center justify-center rounded-full border-2 border-white/60 bg-white/10 backdrop-blur-sm group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#4A7C59] group-hover:bg-[#3d6b4a] transition-colors duration-300">
                    <i className="ri-play-fill text-white text-2xl pl-1" />
                  </div>
                </div>
                <p className="mt-4 text-white/90 text-sm font-medium tracking-wide">
                  Assistir vídeo
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#999] mt-5 tracking-wide">
            Granja União — Picos, Piauí
          </p>
        </div>
      </section>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          {/* Modal box */}
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
            style={{ aspectRatio: '16/9' }}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={VIDEO_URL}
              className="w-full h-full object-cover"
              controls
              playsInline
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors duration-200 cursor-pointer whitespace-nowrap"
              aria-label="Fechar vídeo"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
