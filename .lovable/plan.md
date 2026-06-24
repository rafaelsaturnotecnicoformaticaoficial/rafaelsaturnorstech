## Visão geral

Criar uma página `/pedidos` no site da RS Tech com:
- Catálogo de produtos físicos administrável pelo admin
- Carrinho de compras (estado local)
- Cálculo de frete em tempo real via API do SuperFrete (CEP destino → CEP origem 37855-000)
- Checkout com Stripe (cartão + Pix), Stripe gerenciando os impostos
- Painel de pedidos no admin com status

## Passo 1 — Ativar Stripe (built-in Lovable)

Vou chamar `enable_stripe_payments`. Você só precisa preencher o formulário (e-mail, nome do negócio). Ambiente **teste** fica disponível na hora; aceitar pagamentos reais exige reivindicar a conta depois.

Configuração de impostos: **cálculo e coleta de impostos (+0,5%)** — o Stripe calcula no checkout, você cuida da emissão/recolhimento.

## Passo 2 — Banco de dados (Lovable Cloud)

Novas tabelas:

- `shop_products` — nome, descrição, preço (centavos), imagem, estoque, peso (g), altura/largura/comprimento (cm), tax_code Stripe, ativo
- `shop_orders` — usuário (opcional), nome, e-mail, whatsapp, CEP, endereço completo, subtotal, frete, total, serviço de frete escolhido, stripe_session_id, status (`pendente`, `pago`, `enviado`, `entregue`, `cancelado`), código de rastreio
- `shop_order_items` — order_id, product_id, snapshot do nome/preço, quantidade

RLS:
- Produtos: leitura pública; escrita só admin
- Pedidos / itens: cliente vê os próprios; admin vê tudo; criação via edge function (service role)

## Passo 3 — SuperFrete

Vou pedir seu token via `add_secret` (`SUPERFRETE_TOKEN`).

Edge function `calcular-frete`:
- Recebe CEP destino + itens (peso e dimensões totais)
- Chama `https://api.superfrete.com/api/v0/calculator` com origem **37855-000**
- Retorna lista de serviços (PAC, SEDEX, Mini Envios) com preço e prazo

## Passo 4 — Checkout Stripe

Edge function `criar-pedido-checkout`:
- Valida itens, recalcula totais no servidor (nunca confia em preço do cliente)
- Cria registro `shop_orders` como `pendente`
- Cria Stripe Checkout Session com:
  - Line items dos produtos
  - Linha extra de "Frete" como `shipping_options`
  - `automatic_tax: { enabled: true }`
  - `customer_email`, metadata com `order_id`
  - URLs de sucesso e cancelamento
- Retorna URL do Stripe → abre em nova aba

Edge function `stripe-webhook` (verify_jwt = false):
- Recebe `checkout.session.completed`
- Marca pedido como `pago`, baixa estoque

## Passo 5 — UI

**`/pedidos`** (pública):
- Grid de produtos com foto, nome, preço, botão "Adicionar"
- Drawer de carrinho lateral com itens, quantidade, subtotal
- Formulário: nome, e-mail, WhatsApp, CEP (busca ViaCEP) + endereço, número, complemento
- Botão "Calcular frete" → mostra opções SuperFrete
- Botão "Pagar com Stripe" → redireciona pro checkout

**`/pedidos/sucesso`** e **`/pedidos/cancelado`** — telas de retorno

**Admin** — nova aba **Loja** com 2 sub-seções:
- **Produtos**: CRUD com upload de imagem, estoque, dimensões, peso
- **Pedidos**: lista com filtros (status, data), detalhes do pedido, botões para marcar como enviado / cancelar e campo de código de rastreio

## Passo 6 — Header

Adicionar link "Loja" no menu (ou renomear o atual `/loja` que aponta pra Magazine Luiza para "Magazine Luiza" e usar "Loja" para a nova).

## Detalhes técnicos

- Stack atual: React + Vite + Supabase + Tailwind/shadcn (sem mudanças)
- Stripe SDK em edge function via `npm:stripe@17`
- SuperFrete: fetch direto (REST), header `Authorization: Bearer <token>`, `User-Agent` obrigatório
- Preços sempre em **centavos** no banco; conversão pra reais só na UI
- Webhook Stripe precisa de `STRIPE_WEBHOOK_SECRET` (te peço depois de ativar)
- Carrinho persiste no `localStorage`

## Ordem de execução

1. Confirmar este plano
2. `enable_stripe_payments` (você preenche o formulário)
3. Migration das tabelas
4. `add_secret` do `SUPERFRETE_TOKEN`
5. Edge functions (frete, checkout, webhook)
6. Páginas e admin
7. Cadastrar produtos de teste e testar fluxo completo no ambiente sandbox

## O que **fica de fora** desta primeira versão

- Cupons de desconto
- Múltiplos endereços salvos por cliente
- Devoluções / estorno automático
- Geração de etiqueta direto no SuperFrete (só cálculo; etiqueta você compra no painel deles)
- Rastreamento automático do código

Posso adicionar qualquer um depois.

Confirma para eu começar pelo passo 2 (ativar Stripe)?
