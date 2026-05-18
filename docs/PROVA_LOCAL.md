# Prova local (sem Docker)

Use quando ainda não tiver PostgreSQL/Docker instalado. O backend roda com banco **em memória** (`pg-mem`).

## Subir em 2 terminais

**Terminal 1 — API**

```powershell
cd C:\_PROJETOS\Plataforma_ovo\backend
npm install
npm run dev:local
```

**Terminal 2 — Painel**

```powershell
cd C:\_PROJETOS\Plataforma_ovo\frontend
npm install
npm run dev
```

## URLs

| Serviço | URL |
|---------|-----|
| Painel admin | http://localhost:5173 |
| API health | http://localhost:3000/api/health |
| Produtos | http://localhost:3000/api/produtos |
| Cardápio WhatsApp | http://localhost:3000/api/cardapio-whatsapp |

## Teste automático

```powershell
cd C:\_PROJETOS\Plataforma_ovo
powershell -ExecutionPolicy Bypass -File scripts\prova-local.ps1
```

## Produção

Com Docker/PostgreSQL, use `DATABASE_URL` real e **não** defina `USE_MEMORY_DB=1`.
