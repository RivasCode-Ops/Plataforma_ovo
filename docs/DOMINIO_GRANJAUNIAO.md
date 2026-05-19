# Domínio granjauniao.com.br no GitHub Pages

Quando for ativar o domínio, renomeie `site/public/CNAME.example` → `site/public/CNAME`. O workflow detecta `public/CNAME` e passa a usar `BASE_PATH=/`.

Enquanto `CNAME` não existir, o preview segue em https://rivascode-ops.github.io/granjauniao-site/

## Checklist

### 0. Ativar build para domínio próprio

```powershell
Copy-Item site\public\CNAME.example site\public\CNAME
```

### 1. Publicar no repo do site

```powershell
cd C:\_PROJETOS\Plataforma_ovo
.\scripts\publicar-site-github.ps1
```

Aguarde o workflow **Deploy GitHub Pages** em verde.

### 2. GitHub — domínio customizado

1. https://github.com/RivasCode-Ops/granjauniao-site/settings/pages
2. **Custom domain** → `granjauniao.com.br` → Save
3. Marque **Enforce HTTPS** quando o certificado estiver pronto (pode levar até 24h)

### 3. DNS no registrador do domínio

**Opção A — apex (granjauniao.com.br):** registros **A** apontando para os IPs do GitHub Pages:

| Tipo | Nome | Valor |
|------|------|--------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

**Opção B — www:** registro **CNAME** `www` → `rivascode-ops.github.io`

Se usar só apex (A), o `CNAME` no repositório já cobre o apex via Pages.

**Opcional — redirecionar www → apex:** CNAME `www` → `rivascode-ops.github.io` e em Pages configure o domínio preferido.

IPs e detalhes atualizados: [GitHub Docs — Managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

### 4. Validar

- https://granjauniao.com.br/ — home com imagens e botões WhatsApp
- https://wa.me/5589999754044 — abre conversa no celular

**HTTPS com erro de certificado?** Se o navegador mostrar certificado `*.github.io`, o passo 2 (Custom domain em Pages) ainda não foi concluído ou o certificado está propagando. Até lá use **http://granjauniao.com.br**. Ver [TROUBLESHOOT_DOMINIOS.md](TROUBLESHOOT_DOMINIOS.md).

### 5. Preview github.io

Com `CNAME` ativo, o build usa `BASE_PATH=/`. O endereço  
https://rivascode-ops.github.io/granjauniao-site/ pode deixar de carregar assets corretamente — use o domínio próprio como URL principal.

Para voltar só ao preview github.io, apague `site/public/CNAME`, publique de novo e desative o custom domain em Pages.

## WhatsApp e telefone (conferidos)

| Canal | Valor |
|-------|--------|
| WhatsApp | (89) 9 9975-4044 → `5589999754044` |
| Fixo | (89) 3422-3207 → `tel:+558934223207` |
| E-mail | jvandsilva@hotmail.com |

Todos os botões da home usam `wa.me/5589999754044` com mensagens pré-preenchidas em português.
