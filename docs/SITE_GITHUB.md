# Site no GitHub (cópia separada, sem custo)

O site fica em `site/` neste monorepo. Para **validar no GitHub Pages grátis**, use um repositório só do site.

## Passo a passo rápido

### 1. Publicar com script (Windows)

```powershell
cd C:\_PROJETOS\Plataforma_ovo
.\scripts\publicar-site-github.ps1 -CreateRepo
```

Cria/atualiza: `https://github.com/RivasCode-Ops/granjauniao-site`

### 2. Pedido online (API)

1. Na VPS: `SITE_PEDIDO_TOKEN` em `infra/.env.prod` (gerar com `.\scripts\gerar-env-prod.ps1` se ainda não tiver)
2. No repo **granjauniao-site** → Settings → Secrets → `VITE_SITE_PEDIDO_TOKEN` (mesmo valor)
3. Redeploy do backend na VPS após alterar `.env.prod`

Detalhes: [INTEGRACAO_GRANJAUNIAO.md](INTEGRACAO_GRANJAUNIAO.md) §3.

### 3. Ativar GitHub Pages

1. Abra https://github.com/RivasCode-Ops/granjauniao-site/settings/pages
2. **Build and deployment** → Source: **GitHub Actions**
3. Após o workflow verde, acesse: https://rivascode-ops.github.io/granjauniao-site/

### 4. Domínio granjauniao.com.br

Guia completo: [DOMINIO_GRANJAUNIAO.md](DOMINIO_GRANJAUNIAO.md) (DNS, Pages, HTTPS).

## O que NÃO vai para o repo do site

- Backend, painel admin, Docker → ficam em **Plataforma_ovo**
- O site no GitHub é só front estático (HTML/JS/CSS)

## Atualizar depois

Alterou algo em `site/` aqui? Rode de novo:

```powershell
.\scripts\publicar-site-github.ps1
```

## Manutenção

Tela de manutenção: `site/src/router/config.tsx` → use `<Manutencao />` em vez de `<Home />`.
