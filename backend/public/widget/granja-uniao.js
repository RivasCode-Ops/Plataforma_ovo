/**
 * Widget Granja União — cardápio + pedido via WhatsApp
 * WordPress / HTML em www.granjauniao.com.br:
 *
 * <script
 *   src="https://SUA-API/widget/granja-uniao.js"
 *   data-api="https://SUA-API"
 *   data-whatsapp="5511999999999"
 *   data-titulo="Granja União"
 * ></script>
 */
(function () {
  const script = document.currentScript;
  const apiBase = (script?.dataset?.api || '').replace(/\/$/, '');
  const whatsapp = (script?.dataset?.whatsapp || '').replace(/\D/g, '');
  const titulo = script?.dataset?.titulo || 'Granja União';

  if (!apiBase || !whatsapp) {
    console.warn('[Granja União] Configure data-api e data-whatsapp no script.');
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    .gu-ovo-btn{position:fixed;bottom:24px;right:24px;z-index:9999;background:#25D366;color:#fff;
      border:none;border-radius:50px;padding:14px 22px;font:600 15px/1 system-ui,sans-serif;
      cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.2)}
    .gu-ovo-modal{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.45);
      display:none;align-items:center;justify-content:center;padding:16px}
    .gu-ovo-modal.aberto{display:flex}
    .gu-ovo-box{background:#fff;border-radius:16px;max-width:420px;width:100%;max-height:90vh;
      overflow:auto;padding:24px;font-family:system-ui,sans-serif}
    .gu-ovo-box h3{margin:0 0 12px;font-size:1.25rem}
    .gu-ovo-item{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:14px}
    .gu-ovo-item input[type=number]{width:48px;margin-left:auto}
    .gu-ovo-field{margin:10px 0}
    .gu-ovo-field label{display:block;font-size:12px;color:#666;margin-bottom:4px}
    .gu-ovo-field input,.gu-ovo-field textarea{width:100%;padding:8px;border:1px solid #ccc;
      border-radius:8px;box-sizing:border-box}
    .gu-ovo-actions{display:flex;gap:8px;margin-top:16px}
    .gu-ovo-actions button{flex:1;padding:12px;border-radius:8px;border:none;font-weight:600;cursor:pointer}
    .gu-ovo-wa{background:#25D366;color:#fff}
    .gu-ovo-fechar{background:#f5f5f4}
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.className = 'gu-ovo-btn';
  btn.type = 'button';
  btn.textContent = '🥚 Pedir ovos';
  document.body.appendChild(btn);

  const modal = document.createElement('div');
  modal.className = 'gu-ovo-modal';
  const box = document.createElement('div');
  box.className = 'gu-ovo-box';
  box.innerHTML = `<h3>${titulo}</h3>`;

  const produtosEl = document.createElement('div');
  produtosEl.id = 'gu-produtos';
  produtosEl.innerHTML = '<p>Carregando cardápio…</p>';
  box.appendChild(produtosEl);

  ['nome', 'tel', 'end', 'obs'].forEach((id, i) => {
    const labels = ['Nome *', 'Telefone *', 'Endereço', 'Observação'];
    const types = ['text', 'tel', 'text', null];
    const field = document.createElement('div');
    field.className = 'gu-ovo-field';
    field.innerHTML = `<label>${labels[i]}</label>`;
    if (types[i]) {
      const inp = document.createElement('input');
      inp.id = `gu-${id}`;
      inp.type = types[i];
      field.appendChild(inp);
    } else {
      const ta = document.createElement('textarea');
      ta.id = `gu-${id}`;
      ta.rows = 2;
      field.appendChild(ta);
    }
    box.appendChild(field);
  });

  const actions = document.createElement('div');
  actions.className = 'gu-ovo-actions';
  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'gu-ovo-fechar';
  fechar.textContent = 'Fechar';
  const wa = document.createElement('button');
  wa.type = 'button';
  wa.className = 'gu-ovo-wa';
  wa.textContent = 'Enviar no WhatsApp';
  actions.append(fechar, wa);
  box.appendChild(actions);
  modal.appendChild(box);
  document.body.appendChild(modal);

  async function carregarCardapio() {
    try {
      const res = await fetch(`${apiBase}/api/cardapio`);
      const json = await res.json();
      const produtos = json.data?.produtos || [];
      produtosEl.innerHTML = produtos
        .map(
          (p) =>
            `<label class="gu-ovo-item">
              <input type="checkbox" data-nome="${p.nome}">
              <span>${p.nome} (${p.unidade}) — R$ ${Number(p.preco).toFixed(2)}</span>
              <input type="number" min="1" value="1" data-qtd-for="${p.id}">
            </label>`
        )
        .join('');
    } catch {
      produtosEl.innerHTML = '<p>Cardápio indisponível. Envie mensagem pelo WhatsApp.</p>';
    }
  }

  function montarPedido() {
    const linhas = [];
    produtosEl.querySelectorAll('input[type=checkbox]:checked').forEach((cb) => {
      const row = cb.closest('.gu-ovo-item');
      const qtd = row?.querySelector('input[type=number]')?.value || 1;
      linhas.push(`${qtd}x ${cb.dataset.nome}`);
    });
    const nome = document.getElementById('gu-nome').value.trim();
    const tel = document.getElementById('gu-tel').value.trim();
    const end = document.getElementById('gu-end').value.trim();
    const obs = document.getElementById('gu-obs').value.trim();
    let msg = `*Pedido - ${titulo}*\n\n`;
    msg += (linhas.length ? linhas.join('\n') : '(Itens a combinar)') + '\n\n';
    msg += `*Nome:* ${nome}\n*Telefone:* ${tel}\n`;
    if (end) msg += `*Endereço:* ${end}\n`;
    if (obs) msg += `*Obs:* ${obs}\n`;
    msg += '\n_Enviado pelo site granjauniao.com.br_';
    return msg;
  }

  btn.addEventListener('click', () => {
    modal.classList.add('aberto');
    carregarCardapio();
  });
  fechar.addEventListener('click', () => modal.classList.remove('aberto'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('aberto');
  });
  wa.addEventListener('click', () => {
    const nome = document.getElementById('gu-nome').value.trim();
    const tel = document.getElementById('gu-tel').value.trim();
    if (!nome || !tel) {
      alert('Preencha nome e telefone.');
      return;
    }
    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(montarPedido())}`,
      '_blank',
      'noopener'
    );
    modal.classList.remove('aberto');
  });
})();
