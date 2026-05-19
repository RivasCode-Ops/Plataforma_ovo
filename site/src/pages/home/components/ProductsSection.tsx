import { useInView } from '@/hooks/useInView';

const WA_BASE = 'https://wa.me/5589999754044?text=';

const PRODUCTS = [
  {
    id: 1,
    name: 'Ovos Brancos',
    description: 'Ovos brancos frescos, selecionados com cuidado. Ideais para uso doméstico e culinária em geral.',
    detail: 'Caixa com 30 unidades',
    image: 'https://readdy.ai/api/search-image?query=Perfect%20dozen%20fresh%20white%20chicken%20eggs%20arranged%20neatly%20in%20white%20egg%20carton%20on%20clean%20white%20marble%20surface%2C%20soft%20natural%20studio%20lighting%2C%20minimal%20clean%20background%2C%20premium%20food%20product%20photography%2C%20crisp%20shadows%2C%20warm%20tones%2C%20high%20detail&width=600&height=600&seq=prod001&orientation=squarish',
    waMsg: 'Ol%C3%A1!%20Gostaria%20de%20saber%20o%20pre%C3%A7o%20e%20disponibilidade%20dos%20Ovos%20Brancos.',
  },
  {
    id: 2,
    name: 'Ovos Vermelhos',
    description: 'Ovos vermelhos com casca resistente e gema rica. Muito apreciados por seu sabor marcante e nutrição.',
    detail: 'Bandeja com 30 unidades',
    image: 'https://readdy.ai/api/search-image?query=Beautiful%20fresh%20brown%20organic%20chicken%20eggs%20in%20rustic%20woven%20straw%20basket%20on%20natural%20wood%20table%2C%20warm%20golden%20sunlight%2C%20artisan%20food%20photography%2C%20shallow%20depth%20of%20field%2C%20cozy%20warm%20amber%20tones%2C%20premium%20product%20styling%2C%20high%20resolution&width=600&height=600&seq=prod002&orientation=squarish',
    waMsg: 'Ol%C3%A1!%20Gostaria%20de%20saber%20o%20pre%C3%A7o%20e%20disponibilidade%20dos%20Ovos%20Vermelhos.',
  },
  {
    id: 3,
    name: 'Ovos Grandes (Extra)',
    description: 'Ovos extra grandes para quem busca mais volume e qualidade. Perfeitos para confeitaria e receitas especiais.',
    detail: 'Bandeja com 20 unidades',
    image: 'https://readdy.ai/api/search-image?query=Premium%20fresh%20large%20jumbo%20chicken%20eggs%20in%20transparent%20plastic%20commercial%20tray%20packaging%2C%20overhead%20top%20view%2C%20clean%20white%20background%2C%20professional%20product%20photography%2C%20crisp%20lighting%2C%20commercial%20egg%20packaging%2C%20food%20industry%20quality&width=600&height=600&seq=prod003&orientation=squarish',
    waMsg: 'Ol%C3%A1!%20Gostaria%20de%20saber%20o%20pre%C3%A7o%20e%20disponibilidade%20dos%20Ovos%20Grandes%20Extra.',
  },
  {
    id: 4,
    name: 'Caixa Atacado',
    description: 'Ideal para mercados, restaurantes e distribuidores. Compre em quantidade e economize com qualidade garantida.',
    detail: 'Caixa com 360 unidades',
    image: 'https://readdy.ai/api/search-image?query=Stack%20of%20many%20fresh%20egg%20cartons%20boxes%20piled%20up%20in%20warehouse%20distribution%20center%2C%20wholesale%20egg%20supply%20business%2C%20clean%20professional%20storage%2C%20warm%20neutral%20background%2C%20commercial%20food%20supply%20photography%2C%20organized%20egg%20inventory&width=600&height=600&seq=prod004&orientation=squarish',
    waMsg: 'Ol%C3%A1!%20Gostaria%20de%20saber%20o%20pre%C3%A7o%20e%20disponibilidade%20da%20Caixa%20Atacado.',
  },
];

interface ProductCardProps {
  product: typeof PRODUCTS[0];
  delay: number;
  inView: boolean;
}

function ProductCard({ product, delay, inView }: ProductCardProps) {
  return (
    <div
      className={`group bg-white rounded-2xl overflow-hidden border border-[#F0EDE8] transition-all duration-500 hover:-translate-y-1 hover:border-[#4A7C59]/30 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}s` }}
      data-product-shop
    >
      {/* Image */}
      <div className="w-full h-52 overflow-hidden bg-[#FFF8E7]">
        <img
          src={product.image}
          alt={`${product.name} - Granja União Picos PI`}
          title={`${product.name} – Ovos Frescos Granja União`}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <span className="text-xs font-medium text-[#4A7C59] bg-[#E8F3E8] px-2.5 py-1 rounded-full">{product.detail}</span>
        <h4 className="font-heading text-xl font-bold text-[#2C2C2C] mt-3 mb-2">
          <a className="group-hover:text-[#4A7C59] transition-colors cursor-pointer">{product.name}</a>
        </h4>
        <p className="text-sm text-[#666] leading-relaxed mb-4">{product.description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-[#F0EDE8]">
          <span className="text-sm text-[#999] font-medium">Consultar preço</span>
          <a
            href={`${WA_BASE}${product.waMsg}`}
            target="_blank"
            rel="nofollow noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-whatsapp-fill" />
            Pedir Agora
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const { ref, inView } = useInView();
  const WA_GENERAL = `${WA_BASE}Ol%C3%A1!%20Gostaria%20de%20ver%20todos%20os%20produtos%20da%20Granja%20Uni%C3%A3o.`;

  return (
    <section id="produtos" className="py-20 md:py-28 bg-[#FFF8E7]" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-4">
              Nossos Produtos
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-[44px] font-bold text-[#2C2C2C] leading-tight">
              Escolha o Ovo <span className="text-[#4A7C59]">Ideal para Você</span>
            </h2>
          </div>
          <p className="text-[#666] text-base leading-relaxed max-w-sm md:text-right">
            Do consumidor ao distribuidor, temos a opção certa. Fale conosco para valores e disponibilidade.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              delay={0.1 + index * 0.1}
              inView={inView}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <p className="text-[#666] text-sm mb-4">Não encontrou o que precisa? Fale diretamente conosco!</p>
          <a
            href={WA_GENERAL}
            target="_blank"
            rel="nofollow noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#4A7C59] hover:bg-[#3a6547] text-white font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-whatsapp-fill text-xl" />
            Consultar Todos os Produtos
          </a>
        </div>
      </div>
    </section>
  );
}
