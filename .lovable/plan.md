## Plano de implementação

### 1. Criar tabelas no banco de dados
- **partners** (id, name, logo_url, website_url, active, sort_order)
- **affiliate_products** (id, name, image_url, affiliate_link, active, sort_order)
- **adsense_blocks** (id, name, ad_code, position, active)

### 2. Configurar autenticação
- Página de login para admin (/admin/login)
- Proteção das rotas admin

### 3. Criar componentes públicos
- **PartnersCarousel** — carrossel de logos dos parceiros após o Hero
- **AffiliateProducts** — seção de produtos com links de afiliados
- **DynamicAdBlock** — renderiza código AdSense do banco

### 4. Criar painel admin (/admin)
- Dashboard com abas: Parceiros, Produtos, Anúncios
- CRUD para cada seção (adicionar, editar, remover)
- Upload de imagens via URL

### 5. Integrar na página inicial
- Carrossel de parceiros após o Hero
- Produtos afiliados na página
- Blocos de anúncios dinâmicos