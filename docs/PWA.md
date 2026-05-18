# App no celular (PWA)

O painel pode ser **instalado** no celular ou tablet como um aplicativo.

## Android (Chrome)

1. Abra o painel no Chrome
2. Toque em **Instalar** no banner, ou menu ⋮ → **Instalar aplicativo**
3. O ícone aparece na tela inicial

## iPhone (Safari)

1. Abra o painel no Safari
2. Toque em **Compartilhar** (quadrado com seta)
3. **Adicionar à Tela de Início**

## Produção

A instalação PWA exige **HTTPS** (funciona automaticamente após deploy com SSL).

Em desenvolvimento local (`localhost`), o Chrome no PC também permite instalar para teste.

## Atualizações

O app atualiza sozinho ao abrir (service worker). Se algo parecer antigo, feche e abra de novo.
