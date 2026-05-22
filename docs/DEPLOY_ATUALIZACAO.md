# Deploy — pedido no site (D) + desconto por lote (E)

Checklist único após as alterações no código.

## No seu PC (uma vez)

### 1. Enviar código para o GitHub

```powershell
cd C:\_PROJETOS\Plataforma_ovo
git add -A
git status
git commit -m "feat: pedido publico no site e desconto temporario por lote"
git push
```

(Só faça commit se quiser versionar; o passo seguinte exige código no remoto.)

### 2. Atualizar a VPS

```powershell
.\scripts\deploy-atualizacao-vps.ps1
```

O script na VPS:

- `git pull`
- migração `008_lote_desconto.sql`
- gera `SITE_PEDIDO_TOKEN` no `.env.prod` se ainda não existir
- rebuild `backend` + `web` (painel)

Anote o token se aparecer no terminal (para o GitHub).

### 3. Site (GitHub Pages)

1. Repo **granjauniao-site** → Settings → Secrets → **VITE_SITE_PEDIDO_TOKEN** = mesmo valor de `SITE_PEDIDO_TOKEN` na VPS  
   (ou use o valor em `infra\.env.prod` no PC)

2. Publicar:

```powershell
.\scripts\publicar-site-github.ps1
```

3. Aguardar workflow verde em Actions.

## Testes rápidos

| O quê | URL / ação |
|--------|------------|
| API | https://app.granjauniao.com.br/api/health |
| Painel | Login → **Lotes** → **Desconto** em um lote |
| Site | https://granjauniao.com.br#pedido — enviar pedido teste |
| Painel | Pedido novo com obs `[Site: granjauniao.com.br]` |

## Se algo falhar

- **git pull** na VPS sem arquivos novos → falta `git push` no PC  
- **Pedido site 401** → token diferente entre VPS e build do site  
- **Pedido site CORS** → `CORS_ORIGIN` com `https://granjauniao.com.br`  
- **Desconto não aplica** → migração 008; reinicie backend  

Mais detalhes: [INTEGRACAO_GRANJAUNIAO.md](INTEGRACAO_GRANJAUNIAO.md) · [DESCONTO_LOTE.md](DESCONTO_LOTE.md) · [RUNBOOK_HTTPS_VPS.md](RUNBOOK_HTTPS_VPS.md)
