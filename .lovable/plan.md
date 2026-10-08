## Objetivo

Transformar o site atual da RS Tech em loja completa (produtos, produtos digitais, serviços, agendamento, login, pedidos, upload de arquivos e envio ao WhatsApp), mantendo tudo o que já existe (home, Loja/impressão, Shopee, Blog, Suporte Remoto, admin atual).

## Entrega em 4 etapas (cada uma testada antes da próxima)

### Etapa 1 — Base: cadastro, categorias, produtos e serviços
- Login do cliente: Entrar, Criar conta (nome, e-mail, WhatsApp, cidade, estado, senha), Esqueci minha senha + página de redefinição. Login com Google continua.
- Categorias editáveis (iniciais: Informática, Acessórios, Cabos, Armazenamento, Periféricos, Impressão, Produtos Digitais, Outros).
- Produtos: foto, nome, descrição, categoria, preço, estoque, ativo, tipo físico/digital, "aceita arquivo do cliente".
- Serviços: foto, nome, descrição, categoria, preço, prazo (5 dias úteis / 10 dias úteis / personalizado / sob consulta), duração, ativo, agendável SIM/NÃO, campos de personalização (ex.: Topper de bolo: nome, idade, tema, cores, texto).
- Página pública "Produtos e Serviços": preços escondidos para quem não entrou, com aviso "Faça login ou crie sua conta para visualizar o preço."
- Texto "Prazo estimado: até X dias úteis" calculado sem sábados, domingos e feriados.

### Etapa 2 — Carrinho, upload e pedido
- Carrinho único para produtos, digitais e serviços (foto, nome, quantidade, preço, subtotal, remover).
- Envio de JPG/JPEG/PNG/PDF (até 10 MB) por item, direto do celular; arquivos privados, só o dono e o admin veem.
- Checkout com dados preenchidos automaticamente; recebimento: Retirada em São Pedro da União - MG (sem frete) ou Outra cidade (botão "Consultar frete pelo WhatsApp" com mensagem pronta).
- Pagamento: PIX, Dinheiro, Débito, Crédito (só registra, sem cobrança online).
- Resumo final, botão FINALIZAR PEDIDO, número automático #0001, #0002..., e abertura do WhatsApp (35) 99879-3630 com o modelo enviado.

### Etapa 3 — Agendamento
- Horários configuráveis por dia da semana (padrão seg–sex 09:00–11:00 e 13:00–16:00, intervalos de 30 min; sáb/dom fechados).
- Feriados cadastráveis; bloqueiam calendário e não contam como dia útil.
- Calendário visual só com datas/horários livres; o banco impede dois clientes no mesmo horário.
- Admin pode bloquear horários específicos.

### Etapa 4 — Área do cliente e painel admin
- Cliente: Meus Pedidos, Meus Agendamentos, Meus Dados.
- Admin (novas abas no painel existente): Dashboard, Produtos, Serviços, Categorias, Pedidos (status, arquivos), Agendamentos (confirmar, cancelar, remarcar, concluir, bloquear horário), Clientes (contagem de pedidos/agendamentos, nunca senha), Arquivos, Feriados, Horários, Configurações (empresa, cidade, WhatsApp, retirada, texto de frete).
- Status de pedido: Aguardando confirmação, Confirmado, Em produção, Pronto, Aguardando retirada, Concluído, Cancelado.
- Status de agendamento: Solicitado, Confirmado, Agendado, Em atendimento, Concluído, Cancelado.

## Pontos que mudam o que existe hoje
- O Suporte Remoto hoje agenda só segunda e sexta; o novo pedido diz segunda a sexta. Vou seguir o novo (seg–sex), ajustável no admin.
- A loja atual em /pedidos (frete SuperFrete + Mercado Pago, que está com erro de autorização) será substituída pelo novo checkout com retirada/WhatsApp. A impressão em /loja continua como está.

## Detalhes técnicos
- Novas tabelas: categories, catalog_items (produto/serviço, tipo, prazo, agendável, campos personalizados), orders (+ sequência para número), order_items, order_files, appointments (índice único em data+horário quando não cancelado), holidays, business_hours, blocked_slots, store_settings. Reaproveita profiles, user_roles/has_role.
- RLS: cliente só lê/escreve os próprios pedidos, itens, arquivos e agendamentos; admin via has_role; catálogo leitura pública mas preço exposto por view/função somente para autenticados.
- Bucket privado "order-files" com pastas por usuário; validação de tipo e tamanho no cliente e via políticas.
- Criação do pedido via função de banco segura que recalcula preços e gera número.
- Cálculo de dias úteis e disponibilidade em utilitário compartilhado + verificação no banco.
- Tabelas shop_* antigas mantidas (não apagadas), apenas deixam de ser usadas.
