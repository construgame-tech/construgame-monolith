# Construgame API Monolith 🏗️

Monolito da API Construgame construído com **NestJS** + **Drizzle ORM** + **PostgreSQL**, seguindo Clean Architecture e Domain-Driven Design.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- pnpm (ou npm)

### 1. Configurar ambiente

```bash
# Copiar arquivo de ambiente
cp .env.monolith.example .env

# Editar .env com suas configurações (se necessário)
```

### 2. Instalar dependências

```bash
# Copiar package.json do monolito
cp package-monolith.json package.json
cp tsconfig-monolith.json tsconfig.json

# Instalar dependências
pnpm install
```

### 3. Subir banco de dados

```bash
# Usar docker-compose para subir PostgreSQL
docker-compose -f docker-compose-monolith.yml up -d postgres

# Aguardar o banco estar pronto (health check)
docker-compose -f docker-compose-monolith.yml logs -f postgres
```

### 4. Executar migrações

```bash
# Gerar migrations (se houver mudanças no schema)
npm run db:generate

# Rodar migrations
npm run db:migrate
```

### 5. Iniciar aplicação

```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Ou usar docker-compose completo (API + Postgres)
docker-compose -f docker-compose-monolith.yml up
```

### 6. Acessar aplicação

- **API Base:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/docs
- **Health Check:** http://localhost:3000/api/v1/health

## 📁 Estrutura do Projeto

```
construgame-api/
├── domain/                          # Camada de domínio (business logic)
│   ├── game/                        # Domain: Game
│   │   ├── entities/                # Entidades de domínio
│   │   ├── repositories/            # Interfaces de repositório
│   │   ├── use-cases/               # Casos de uso
│   │   └── index.ts
│   ├── task/                        # Domain: Task
│   ├── user/                        # Domain: User
│   └── ...                          # Outros 25+ domínios
│
├── src/                             # Camada de aplicação (NestJS)
│   ├── main.ts                      # Entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── common/                      # Utilitários compartilhados
│   │   ├── filters/                 # Exception filters
│   │   └── interceptors/            # Response interceptors
│   │
│   ├── infrastructure/              # Camada de infraestrutura
│   │   ├── database/
│   │   │   ├── schemas/             # Schemas Drizzle
│   │   │   │   ├── game.schema.ts
│   │   │   │   ├── task.schema.ts
│   │   │   │   └── ...
│   │   │   ├── migrations/          # Migrations SQL
│   │   │   ├── drizzle.provider.ts  # Drizzle connection
│   │   │   ├── database.module.ts
│   │   │   └── migrate.ts
│   │   │
│   │   └── repositories/            # Implementações de repositório
│   │       ├── game.repository.ts
│   │       └── ...
│   │
│   └── modules/                     # Feature modules
│       ├── game/                    # Game module
│       │   ├── game.module.ts
│       │   ├── game.controller.ts
│       │   └── dto/
│       ├── task/                    # Task module
│       └── ...
│
├── docker-compose-monolith.yml      # Docker compose
├── Dockerfile.monolith              # Dockerfile
├── package-monolith.json            # Dependencies
├── tsconfig-monolith.json           # TypeScript config
├── drizzle.config.ts                # Drizzle config
└── nest-cli.json                    # NestJS CLI config
```

## 🏛️ Arquitetura

### Clean Architecture + DDD

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│        (Controllers, DTOs, Swagger Decorators)           │
│              src/modules/*/controller.ts                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│            (Business Logic, Use Cases)                   │
│                   domain/*/use-cases/                    │
│                   domain/*/entities/                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│         (Database, Repositories, External APIs)          │
│            src/infrastructure/repositories/              │
│             src/infrastructure/database/                 │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de uma Requisição

```
HTTP Request
    ↓
Controller (@Get, @Post, etc)
    ↓
DTO Validation (class-validator)
    ↓
Domain Use Case (createGame, updateGame, etc)
    ↓
Repository Interface (IGameRepository)
    ↓
Repository Implementation (GameRepository + Drizzle)
    ↓
PostgreSQL Database
```

## 📚 Módulos Implementados

### ✅ Game Module (Completo)

Endpoints disponíveis:

- `POST /api/v1/games` - Criar jogo
- `GET /api/v1/games/:id` - Buscar jogo por ID
- `GET /api/v1/games?organizationId=...` - Listar jogos da organização
- `GET /api/v1/games?projectId=...` - Listar jogos do projeto
- `PUT /api/v1/games/:id` - Atualizar jogo
- `DELETE /api/v1/games/:id` - Deletar jogo
- `POST /api/v1/games/:id/archive` - Arquivar jogo
- `POST /api/v1/games/:id/unarchive` - Desarquivar jogo

### 📋 Próximos Módulos (Seguir o mesmo padrão)

- Task Module
- User Module
- Organization Module
- Team Module
- Project Module
- Kaizen Module
- E mais 20+ domínios...

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar em modo watch
npm run start:dev

# Buildar aplicação
npm run build

# Rodar em produção
npm run start:prod
```

### Database

```bash
# Gerar migration após mudanças no schema
npm run db:generate

# Rodar migrations
npm run db:migrate

# Abrir Drizzle Studio (GUI para banco)
npm run db:studio
```

### Docker

```bash
# Subir todos os serviços
docker-compose -f docker-compose-monolith.yml up

# Subir apenas Postgres
docker-compose -f docker-compose-monolith.yml up postgres

# Ver logs
docker-compose -f docker-compose-monolith.yml logs -f

# Parar tudo
docker-compose -f docker-compose-monolith.yml down

# Limpar volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose-monolith.yml down -v
```

### Testes

```bash
# Rodar testes unitários
npm run test

# Rodar testes em watch mode
npm run test:watch

# Rodar testes com coverage
npm run test:cov
```

## 📖 Swagger/OpenAPI

Acesse a documentação interativa em: http://localhost:3000/docs

A documentação inclui:
- Todos os endpoints disponíveis
- Schemas de request/response
- Exemplos de uso
- Autenticação JWT (Bearer token)
- Try it out (testar direto no navegador)

## 🔐 Autenticação

A API usa JWT Bearer tokens. Para testar endpoints protegidos:

1. Faça login (endpoint a ser implementado)
2. Copie o token JWT
3. No Swagger, clique em "Authorize"
4. Cole o token: `Bearer {seu-token-aqui}`

## 🗄️ Database Schema

### Tabelas Principais

- **games** - Jogos/competições
- **tasks** - Tarefas dos jogos
- **users** - Usuários do sistema
- **organizations** - Organizações/empresas
- **teams** - Times de trabalho
- **projects** - Projetos de construção
- **task_updates** - Submissões de progresso
- **kaizens** - Iniciativas de melhoria

### Migrações

As migrações são geradas automaticamente pelo Drizzle baseado nos schemas:

```bash
# Gerar migration
npm run db:generate

# Arquivo gerado em: src/infrastructure/database/migrations/
```

## 🚢 Deploy

### Usando Docker

```bash
# Build da imagem
docker build -f Dockerfile.monolith -t construgame-api:latest .

# Rodar container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  construgame-api:latest
```

### Usando Docker Compose (Produção)

```bash
# Subir tudo em produção
docker-compose -f docker-compose-monolith.yml up -d
```

## 🔍 Diferenças do Serverless Atual

### Antes (Microserviços Serverless)
- 32 serviços independentes
- DynamoDB (NoSQL)
- Event-driven com SNS/SQS
- AWS Lambda
- Lógica misturada com infraestrutura

### Agora (Monolito NestJS)
- 1 aplicação unificada
- PostgreSQL (SQL)
- REST API tradicional
- Container Docker
- **Lógica de negócio 100% reutilizada** (domain/)

## 💡 Próximos Passos

1. **Implementar módulos restantes** (Task, User, Organization, etc)
2. **Adicionar autenticação JWT completa**
3. **Implementar testes unitários e e2e**
4. **Adicionar cache (Redis)**
5. **Implementar rate limiting**
6. **Adicionar monitoring/observability**
7. **CI/CD pipeline**

## 📝 Contribuindo

Ao adicionar novos módulos, siga o padrão do Game Module:

1. Criar schema Drizzle em `src/infrastructure/database/schemas/`
2. Criar repository em `src/infrastructure/repositories/`
3. Criar module em `src/modules/{name}/`
4. Criar DTOs com validação e Swagger
5. Criar controller usando domain use-cases
6. Registrar module no `app.module.ts`

## 🆘 Troubleshooting

### Erro de conexão com banco

```bash
# Verificar se Postgres está rodando
docker-compose -f docker-compose-monolith.yml ps

# Ver logs do Postgres
docker-compose -f docker-compose-monolith.yml logs postgres

# Testar conexão manual
psql postgresql://construgame:construgame_dev_password@localhost:5432/construgame
```

### Erro nas migrations

```bash
# Dropar banco e recriar (CUIDADO: apaga dados)
docker-compose -f docker-compose-monolith.yml down -v
docker-compose -f docker-compose-monolith.yml up -d postgres
npm run db:migrate
```

### TypeScript errors

```bash
# Limpar cache e rebuild
rm -rf dist node_modules
pnpm install
npm run build
```

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Feito com ❤️ pela equipe Construgame**
