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

### Banco de Dados
Manual (MySQL já instalado):
```sql
CREATE DATABASE IF NOT EXISTS fb_connect_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Execute o conteúdo de db/schema.sql
```

Ajuste o `.env` para apontar para as credenciais:
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=app
DB_PASSWORD=app
DB_NAME=fb_connect_service
```

### Rotas
- Documentação (Swagger)
  - UI: `GET /docs`
  - JSON: `GET /docs-json`
  - Edite `src/docs/openapi.json` para manter a documentação em dia
- `GET /health`: verificação
- `GET /auth/facebook/login`: redireciona para o Facebook OAuth
- `GET /auth/facebook/callback`: troca `code` por `access_token`, persiste usuário, token e páginas
  - Agora troca automaticamente token curto por long-lived e grava o vencimento
- `POST /auth`: recebe `{ client_id, client_secret }` e retorna JWT
- `POST /posts/page/:pageId`: cria uma postagem na página
- `POST /posts/page/:pageId/bulk`: cria múltiplas postagens sequenciais
  - Caso o token de página esteja inválido/expirado (erro 190), o serviço obtém token long-lived do usuário, reobtém token da página e tenta novamente uma vez

- Webhooks (Facebook):
  - `GET /webhooks/facebook`: verificação (hub.challenge) com `FB_WEBHOOK_VERIFY_TOKEN`
  - `POST /webhooks/facebook`: recebe eventos (leads, comentários, mensagens). Valida `X-Hub-Signature-256` com `FACEBOOK_APP_SECRET` e persiste os eventos no banco (`webhook_events`)
  - `GET /webhooks/events`: lista eventos armazenados (JWT)
  - `GET /webhooks/events/{id}`: detalha evento (JWT)

### Estrutura
- `src/controllers`: controladores HTTP
- `src/services`: integração com Graph API e regras de negócio
- `src/routes`: rotas Express
- `src/shared/database`: TypeORM DataSource
- `src/users | tokens | pages`: entidades TypeORM
- `src/middlewares`: logs e tratamento de erros
- `src/clients`: entidade e serviço para clientes (sistemas) que consomem a API
- `src/webhooks` (placeholder): estrutura para futuros webhooks
  - `src/routes/webhookRoutes.ts` e `src/webhooks/facebookWebhookController.ts`
- `src/auth` (placeholder): estrutura para JWT/API Gateway

### Notas
- Logs em produção
  - Cada requisição recebe um `requestId` e os logs incluem `[id=<uuid>] [client=<clientId>::<name>]` quando autenticado via JWT.
  - Para visualizar logs no Docker/k8s: `docker logs <container>` ou via agregadores (Loki/ELK/Cloud Logging). Configure `LOG_LEVEL` para ajustar o formato do morgan se desejar.
- TypeORM `synchronize: true` para facilitar desenvolvimento (não usar em produção sem migrações)
- Tokens de usuário podem ser trocados por long-lived via `tokenService.refreshUserToken`
- JWT: defina `JWT_SECRET` e `JWT_EXPIRES_IN` no `.env`

---

Desenvolvido por [Bruno Vigo](https://www.linkedin.com/in/bruno-vigo).
