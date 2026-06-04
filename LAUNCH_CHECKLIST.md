# VYNTA - LAUNCH CHECKLIST (STAGE 11)

Este documento centraliza as verificações finais antes do lançamento oficial em produção.

## 1. Banco de Dados e Backend
- [ ] Rodar `npx prisma generate` localmente e no servidor.
- [ ] Rodar `npx prisma db push` para aplicar o enum `PRO_YEARLY`.
- [ ] Verificar se as variáveis de ambiente de produção (AbacatePay, JWT, DB) estão corretas.

## 2. AbacatePay
- [ ] Garantir que o produto `Vynta PRO Anual` (valor R$ 239,90) é criado corretamente.
- [ ] Testar compra de VIP (R$ 19,90), PRO (R$ 29,90) e PRO ANUAL (R$ 239,90) via link de teste.
- [ ] Validar Webhook de confirmação para os 3 cenários (ativando assinatura por 30 ou 365 dias).

## 3. Fluxo de Usuários Existentes vs Novos
- [ ] Registrar uma conta nova e confirmar que o Trial é de exatamente 1 dia (24 horas).
- [ ] Logar com uma conta antiga no Trial e garantir que ela não perde os dias residuais (validação via `subscriptionExpiresAt`).
- [ ] Testar bloqueio da rota `/dashboard` e redirecionamento para `/unlock` quando o plano expira.

## 4. Admin Dashboard
- [ ] Verificar se a contagem de usuários reflete o PRO_YEARLY.
- [ ] Checar se a Receita Recorrente Estimada (MRR) está calculando corretamente: (VIPs * 19,90) + (PROs * 29,90) + (PRO_YEARLY * 19,99).
- [ ] Testar links do WhatsApp para usuários que vencem hoje/em 3 dias.

## 5. Interface
- [ ] Responsividade da tela de bloqueio (`/unlock`) com os 3 cards.
- [ ] Responsividade da tela de assinaturas (`/subscription`).
- [ ] Oferta promocional (Cenário VIP -> Promo R$ 24,90).

## 6. Build
- [ ] Rodar `npm run build` para garantir que as tipagens atualizadas (UserPlan, DashboardStats) passam na verificação estrita do TypeScript e do Next.js.
