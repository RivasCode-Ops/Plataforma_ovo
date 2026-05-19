# Granja União — Site (granjauniao.com.br)

Site institucional da granja (React + Vite + Tailwind). Cópia independente para publicar no **GitHub Pages** sem custo de hospedagem.

Repositório da plataforma (painel + API): [Plataforma_ovo](https://github.com/RivasCode-Ops/Plataforma_ovo)

## Desenvolvimento local

```bash
cd site
npm install
npm run dev
```

Abre em http://localhost:5174 (porta separada da API do painel).

## Publicar no GitHub Pages (grátis)

1. Crie um repositório **só para o site** (ex.: `granjauniao-site`)
2. Envie **o conteúdo desta pasta** (`site/`) para a raiz do repositório (não a pasta `site` inteira dentro de outro projeto)
3. No GitHub: **Settings → Pages → Build and deployment → GitHub Actions**
4. A cada push na branch `main`, o workflow `.github/workflows/pages.yml` publica o site

URL de preview: `https://SEU-USUARIO.github.io/NOME_DO_REPO/`

### Domínio próprio (granjauniao.com.br)

1. Em **Pages → Custom domain**, informe `granjauniao.com.br`
2. No DNS do domínio, aponte para o GitHub Pages (registros A/CNAME conforme a documentação do GitHub)
3. No workflow, use build com `BASE_PATH=/` (edite `pages.yml` ou rode build local com `BASE_PATH=/`)
4. Opcional: arquivo `public/CNAME` com o domínio

## Build manual

```bash
# Preview no GitHub Pages (troque pelo nome do seu repositório)
BASE_PATH=/granjauniao-site/ npm run build

# Domínio na raiz
BASE_PATH=/ npm run build
```

Saída em `out/`.

## Manutenção temporária

Em `src/router/config.tsx`, troque `<Home />` por `<Manutencao />` na rota `/` e faça deploy.

## Integração com Plataforma Ovo

Quando a API estiver no ar, use o widget documentado em `Plataforma_ovo/docs/INTEGRACAO_GRANJAUNIAO.md`.
