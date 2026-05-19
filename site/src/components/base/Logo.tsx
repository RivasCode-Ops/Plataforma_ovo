interface LogoProps {
  variant?: 'default' | 'inverted' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const LOGO_URL =
  'https://storage.readdy-site.link/project_files/5e569ba0-2d5e-4d74-b496-ad306314a7f7/673d6562-26a1-4a20-b1cf-3b3496ff196d_ftC45.jpg?v=b28c5db7f7c1fb379a691ba54300472b';

export default function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const imgSize =
    size === 'sm' ? 'h-14 w-auto' : size === 'lg' ? 'h-24 w-auto' : 'h-18 w-auto';

  const needsBackground = variant === 'inverted' || variant === 'light';

  return (
    <div
      className={`flex items-center select-none ${
        needsBackground
          ? 'bg-white/90 rounded-2xl px-3 py-1.5 backdrop-blur-sm'
          : ''
      }`}
    >
      <img
        src={LOGO_URL}
        alt="Granja União – Fornecedor de Ovos Frescos em Picos, PI"
        className={`${imgSize} object-contain`}
        style={{ maxHeight: size === 'lg' ? '96px' : size === 'sm' ? '56px' : '72px' }}
        loading="eager"
        draggable="false"
      />
    </div>
  );
}
