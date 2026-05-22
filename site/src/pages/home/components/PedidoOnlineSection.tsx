import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { API_URL, pedidoSiteHabilitado, SITE_PEDIDO_TOKEN } from '@/config/pedido';
import { montarEndereco } from '@/utils/endereco';

interface ProdutoApi {
  id: number;
  nome: string;
  unidade: string;
  preco: number;
  preco_promocional?: number | null;
  promocao_ate?: string | null;
  disponivel: boolean;
  estoque: number;
}

interface LinhaCarrinho {
  produto_id: number;
  quantidade: number;
}

export default function PedidoOnlineSection() {
  const { ref, inView } = useInView();
  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [loadingCardapio, setLoadingCardapio] = useState(true);
  const [erroCardapio, setErroCardapio] = useState('');
  const [carrinho, setCarrinho] = useState<Record<number, number>>({});
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cep, setCep] = useState('');
  const [observacao, setObservacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [sucesso, setSucesso] = useState<{ pedido_id: number; mensagem: string } | null>(null);

  useEffect(() => {
    if (!pedidoSiteHabilitado) {
      setLoadingCardapio(false);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/cardapio`);
        if (!res.ok) throw new Error('Não foi possível carregar o cardápio');
        const json = await res.json();
        if (!cancel) {
          setProdutos(json.data?.produtos || []);
        }
      } catch {
        if (!cancel) setErroCardapio('Cardápio indisponível no momento. Use o WhatsApp.');
      } finally {
        if (!cancel) setLoadingCardapio(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const itens = useMemo((): LinhaCarrinho[] => {
    return Object.entries(carrinho)
      .filter(([, q]) => q > 0)
      .map(([id, quantidade]) => ({
        produto_id: Number(id),
        quantidade,
      }));
  }, [carrinho]);

  const precoExibicao = (p: ProdutoApi) =>
    p.preco_promocional != null ? p.preco_promocional : p.preco;

  const total = useMemo(() => {
    return itens.reduce((acc, linha) => {
      const p = produtos.find((x) => x.id === linha.produto_id);
      return acc + (p ? precoExibicao(p) * linha.quantidade : 0);
    }, 0);
  }, [itens, produtos]);

  const setQtd = useCallback((id: number, qtd: number) => {
    setCarrinho((prev) => {
      const next = { ...prev };
      if (qtd <= 0) delete next[id];
      else next[id] = qtd;
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroEnvio('');
    setSucesso(null);
    if (!pedidoSiteHabilitado) return;
    if (itens.length === 0) {
      setErroEnvio('Selecione pelo menos um produto.');
      return;
    }
    const endereco = montarEndereco({ rua, numero, bairro, cep });
    if (!nome.trim() || !telefone.trim() || !endereco) {
      setErroEnvio('Preencha nome, telefone e endereço de entrega.');
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/api/pedido-site`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Site-Pedido-Token': SITE_PEDIDO_TOKEN,
        },
        body: JSON.stringify({
          nome: nome.trim(),
          telefone: telefone.trim(),
          endereco,
          observacao: observacao.trim() || undefined,
          itens,
          website: '',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.erro || 'Não foi possível enviar o pedido');
      }
      setSucesso({
        pedido_id: json.data?.pedido_id ?? 0,
        mensagem: json.data?.mensagem || 'Pedido recebido!',
      });
      setCarrinho({});
      setNome('');
      setTelefone('');
      setRua('');
      setNumero('');
      setBairro('');
      setCep('');
      setObservacao('');
    } catch (err) {
      setErroEnvio(err instanceof Error ? err.message : 'Erro ao enviar');
    } finally {
      setEnviando(false);
    }
  };

  if (!pedidoSiteHabilitado) {
    return (
      <section id="pedido" className="py-16 bg-[#F5F1E8]" ref={ref as React.RefObject<HTMLElement>}>
        <div className="max-w-3xl mx-auto px-4 text-center text-[#666]">
          <p className="text-sm">
            Pedido online em configuração. Enquanto isso, use o{' '}
            <a href="#contato" className="text-[#4A7C59] font-semibold underline">
              WhatsApp
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="pedido"
      className="py-20 md:py-28 bg-[#F5F1E8]"
      ref={ref as React.RefObject<HTMLElement>}
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div
          className={`text-center mb-10 transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#4A7C59] bg-[#E8F3E8] px-3 py-1 rounded-full mb-4">
            Pedido online
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-3">
            Faça seu <span className="text-[#4A7C59]">pedido</span>
          </h2>
          <p className="text-[#666] text-base leading-relaxed">
            Escolha os produtos, informe seu endereço em Picos e envie. A granja confirma pelo
            WhatsApp.
          </p>
        </div>

        {sucesso ? (
          <div className="bg-white rounded-2xl border border-[#4A7C59]/30 p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#E8F3E8] flex items-center justify-center">
              <i className="ri-check-line text-3xl text-[#4A7C59]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#2C2C2C] mb-2">
              Pedido #{sucesso.pedido_id} registrado
            </h3>
            <p className="text-[#666] mb-6">{sucesso.mensagem}</p>
            <button
              type="button"
              onClick={() => setSucesso(null)}
              className="text-sm font-semibold text-[#4A7C59] hover:underline"
            >
              Fazer outro pedido
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`bg-white rounded-2xl border border-[#F0EDE8] p-6 md:p-8 shadow-sm transition-all duration-700 ${
              inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <fieldset className="mb-8">
              <legend className="font-heading font-bold text-[#2C2C2C] mb-4 block w-full">
                Produtos
              </legend>
              {loadingCardapio && (
                <p className="text-sm text-[#666]">Carregando cardápio…</p>
              )}
              {erroCardapio && (
                <p className="text-sm text-red-600">{erroCardapio}</p>
              )}
              {!loadingCardapio && !erroCardapio && (
                <ul className="space-y-3">
                  {produtos.map((p) => {
                    const qtd = carrinho[p.id] || 0;
                    return (
                      <li
                        key={p.id}
                        className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border ${
                          p.disponivel
                            ? 'border-[#F0EDE8] bg-[#FEFDFB]'
                            : 'border-[#F0EDE8] bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex-1 min-w-[180px]">
                          <p className="font-semibold text-[#2C2C2C]">{p.nome}</p>
                          <p className="text-sm text-[#666]">
                            {p.unidade} —{' '}
                            {p.preco_promocional != null ? (
                              <>
                                <span className="line-through text-[#999]">
                                  R$ {p.preco.toFixed(2)}
                                </span>{' '}
                                <span className="font-semibold text-[#4A7C59]">
                                  R$ {p.preco_promocional.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <>R$ {p.preco.toFixed(2)}</>
                            )}
                            {!p.disponivel && ' · indisponível'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!p.disponivel || qtd <= 0}
                            onClick={() => setQtd(p.id, Math.max(0, qtd - 1))}
                            className="w-9 h-9 rounded-lg border border-[#E0DDD8] text-lg disabled:opacity-40"
                            aria-label="Menos"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold">{qtd}</span>
                          <button
                            type="button"
                            disabled={!p.disponivel}
                            onClick={() =>
                              setQtd(
                                p.id,
                                Math.min(p.estoque || 99, qtd + 1),
                              )
                            }
                            className="w-9 h-9 rounded-lg border border-[#4A7C59] bg-[#4A7C59] text-white text-lg disabled:opacity-40"
                            aria-label="Mais"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {itens.length > 0 && (
                <p className="mt-4 text-right font-semibold text-[#2C2C2C]">
                  Total estimado: R$ {total.toFixed(2)}
                </p>
              )}
            </fieldset>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="text-sm font-medium text-[#444]">Nome *</span>
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none"
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#444]">WhatsApp / telefone *</span>
                <input
                  required
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none"
                  autoComplete="tel"
                  placeholder="(89) 99999-9999"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-[#444]">Rua *</span>
                <input
                  required
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#444]">Nº *</span>
                <input
                  required
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="text-sm font-medium text-[#444]">Bairro *</span>
                <input
                  required
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#444]">CEP</span>
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none"
                  placeholder="64600-000"
                />
              </label>
            </div>

            <label className="block mb-6">
              <span className="text-sm font-medium text-[#444]">Observações</span>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-[#E0DDD8] focus:border-[#4A7C59] focus:outline-none resize-none"
                placeholder="Horário preferido, referência do local…"
              />
            </label>

            {erroEnvio && (
              <p className="mb-4 text-sm text-red-600" role="alert">
                {erroEnvio}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando || loadingCardapio || !!erroCardapio}
              className="w-full py-4 rounded-xl bg-[#4A7C59] text-white font-semibold hover:bg-[#3d6849] disabled:opacity-50 transition-colors"
            >
              {enviando ? 'Enviando…' : 'Enviar pedido'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
