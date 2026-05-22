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

**Se a senha SSH falhar** (Permission denied) — use o **console web** do provedor:

```powershell
.\scripts\deploy-vps-console.ps1
```

Cole o bloco gerado (ja vai para a area de transferencia) no terminal da VPS.

**Com SSH funcionando** (ou apos configurar chave):

```powershell
.\scripts\configurar-ssh-vps.ps1          # uma vez: instala chave (console web ou -ComSenha)
.\scripts\deploy-atualizacao-vps.ps1      # deploy sem senha
```

Com senha: `.\scripts\deploy-atualizacao-vps.ps1 -ComSenha`

O script na VPS:

- `git pull`
- migração `008_lote_desconto.sql`
- gera `SITE_PEDIDO_TOKEN` no `.env.prod` se ainda não existir
- rebuild `backend` + `web` (painel)

Anote o token se aparecer no terminal (para o GitHub).

### 3. Site (GitHub Pages)

**Opção A — build local (recomendado, token no build):**

```powershell
.\scripts\publicar-site-build.ps1
```

No GitHub: **granjauniao-site** → Settings → Pages → Source: **Deploy from branch** → `gh-pages` / `/ (root)`.

**Opção B — GitHub Actions (main):**

1. Secret **VITE_SITE_PEDIDO_TOKEN** = valor de `SITE_PEDIDO_TOKEN` em `infra\.env.prod`
2. `.\scripts\publicar-site-github.ps1` e aguardar Actions verde

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
