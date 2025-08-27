## Facebook Connect Service (Node.js + Express + TypeScript)

Micro-serviço para centralizar integrações com a Facebook Graph API (v23.0): autenticação OAuth2, armazenamento de tokens e postagens em páginas.

### Requisitos
- Node.js (LTS ou mais recente)
- MySQL 8+

### Setup
1. Instale dependências:
```bash
npm install
```
2. Configure o `.env` a partir de `.env.example`:
```bash
cp .env.example .env
# Preencha FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, DB_*
```
3. Rode em desenvolvimento:
```bash
npm run dev
```
4. Build e produção:
```bash
npm run build && npm start
```

### Rotas
- `GET /health`: verificação
- `GET /auth/facebook/login`: redireciona para o Facebook OAuth
- `GET /auth/facebook/callback`: troca `code` por `access_token`, persiste usuário, token e páginas
- `POST /posts/page/:pageId`: cria uma postagem na página
- `POST /posts/page/:pageId/bulk`: cria múltiplas postagens sequenciais

### Estrutura
- `src/controllers`: controladores HTTP
- `src/services`: integração com Graph API e regras de negócio
- `src/routes`: rotas Express
- `src/shared/database`: TypeORM DataSource
- `src/users | tokens | pages`: entidades TypeORM
- `src/middlewares`: logs e tratamento de erros
- `src/webhooks` (placeholder): estrutura para futuros webhooks
- `src/jobs` (placeholder): estrutura para filas/jobs
- `src/auth` (placeholder): estrutura para JWT/API Gateway

### Notas
- TypeORM `synchronize: true` para facilitar desenvolvimento (não usar em produção sem migrações)
- Tokens de usuário podem ser trocados por long-lived via `tokenService.refreshUserToken`

