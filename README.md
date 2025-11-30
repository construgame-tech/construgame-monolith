# Construgame API Monolith 🏗️

Monolito da API Construgame construído com **NestJS** + **Drizzle ORM** + **PostgreSQL**, seguindo Clean Architecture e Domain-Driven Design.

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- pnpm

### 1. Configurar ambiente

```bash
# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações (se necessário)
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Subir banco de dados

```bash
# Usar docker-compose para subir PostgreSQL
docker-compose up -d postgres

# Aguardar o banco estar pronto
docker-compose logs -f postgres
```

### 4. Executar migrações

```bash
# Rodar migrations
pnpm db:migrate
```

### 5. Iniciar aplicação

```bash
# Modo desenvolvimento (com hot-reload)
pnpm start:dev

# Ou usar docker-compose completo (API + Postgres)
docker-compose up
```

### 6. Acessar aplicação

- **API Base:** http://localhost:3000/api/v1
- **Swagger Docs:** http://localhost:3000/docs
- **Health Check:** http://localhost:3000/api/v1/health

---

## 📁 Estrutura do Projeto

```
construgame-monolith/
├── domain/                          # Camada de domínio (business logic puro)
│   ├── game/                        # Domain: Game
│   │   ├── entities/                # Tipos + factory functions
│   │   ├── repositories/            # Interfaces de repositório
│   │   └── use-cases/               # Funções puras de casos de uso
│   ├── task/                        # Domain: Task
│   ├── kaizen/                      # Domain: Kaizen
│   └── ...                          # +25 domínios
│
├── src/                             # Camada de aplicação (NestJS)
│   ├── main.ts                      # Entry point (Fastify)
│   ├── app.module.ts                # Root module
│   │
│   ├── common/                      # Utilitários compartilhados
│   │   ├── filters/                 # Exception filters
│   │   ├── interceptors/            # Response interceptors
│   │   └── helpers/                 # Funções auxiliares
│   │
│   ├── infrastructure/              # Camada de infraestrutura
│   │   ├── database/
│   │   │   ├── schemas/             # Schemas Drizzle (*.schema.ts)
│   │   │   ├── drizzle.provider.ts  # Drizzle connection
│   │   │   └── migrate.ts           # Script de migrations
│   │   │
│   │   ├── repositories/            # Implementações de repositório
│   │   │
│   │   └── services/                # Serviços externos
│   │       ├── storage/             # AWS S3
│   │       ├── email/               # AWS SES
│   │       └── notification/        # AWS SNS
│   │
│   └── modules/                     # Feature modules (26 módulos)
│       ├── auth/                    # Autenticação
│       ├── game/                    # Jogos
│       ├── task/                    # Tarefas
│       ├── kaizen/                  # Kaizens
│       └── ...
│
├── drizzle/                         # Migrations Drizzle
│   └── migrations/
│       ├── 0000_initial_schema.sql  # Migration inicial
│       └── meta/
│           ├── _journal.json        # Registro de migrations
│           └── *.snapshot.json      # Snapshots do schema
│
├── test/                            # Testes E2E
│   └── modules/
│
├── docker-compose.yml               # Docker compose
├── Dockerfile.monolith              # Dockerfile
├── drizzle.config.ts                # Drizzle Kit config
├── vitest.config.ts                 # Vitest config
└── nest-cli.json                    # NestJS CLI config
```

---

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
│       (Business Logic, Use Cases, Entities)              │
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
Service (orquestra use cases)
    ↓
Domain Use Case (createGame, updateTask, etc)
    ↓
Repository Interface (IGameRepository)
    ↓
Repository Implementation (Drizzle ORM)
    ↓
PostgreSQL Database
```

---

## 📚 Módulos Implementados (26 módulos)

### Core Modules

| Módulo | Descrição | Endpoints |
|--------|-----------|-----------|
| `auth` | Autenticação JWT, login, registro | `/api/v1/auth/*` |
| `game` | Jogos/competições | `/api/v1/games/*` |
| `task` | Tarefas dos jogos | `/api/v1/tasks/*` |
| `task-update` | Submissões de progresso | `/api/v1/task-updates/*` |
| `kaizen` | Iniciativas de melhoria | `/api/v1/kaizens/*` |
| `project` | Projetos de construção | `/api/v1/projects/*` |
| `user` | Usuários do sistema | `/api/v1/users/*` |
| `organization` | Organizações/empresas | `/api/v1/organizations/*` |
| `team` | Times de trabalho | `/api/v1/teams/*` |
| `member` | Membros de organização | `/api/v1/members/*` |

### Supporting Modules

| Módulo | Descrição |
|--------|-----------|
| `game-manager` | Templates de jogos recorrentes |
| `task-manager` | Templates de tarefas recorrentes |
| `task-template` | Templates de tarefas por KPI |
| `kaizen-idea` | Banco de ideias de kaizen |
| `kaizen-type` | Tipos/categorias de kaizen |
| `kpi` | Indicadores de performance |
| `job-role` | Cargos e funções |
| `league` | Ligas e rankings |
| `points` | Sistema de pontuação |
| `project-planning` | Planejamento de obras |
| `project-diary` | Diário de obra |
| `organization-config` | Configurações por organização |
| `financial-prize` | Prêmios financeiros |
| `notification` | Notificações push |
| `image` | Upload de imagens (S3) |
| `search` | Busca global |

---

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar em modo watch
pnpm start:dev

# Buildar aplicação
pnpm build

# Rodar em produção
pnpm start:prod

# Formatar código
pnpm format
```

### Database (Drizzle)

```bash
# Gerar migration após mudanças no schema
pnpm db:generate

# Ou com nome personalizado
pnpm db:generate --name=add_new_feature

# Rodar migrations
pnpm db:migrate

# Verificar consistência das migrations
pnpm db:check

# Push direto (APENAS desenvolvimento)
pnpm db:push

# Abrir Drizzle Studio (GUI para banco)
pnpm db:studio
```

### Docker

```bash
# Subir todos os serviços
docker-compose up

# Subir apenas Postgres
docker-compose up -d postgres

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Limpar volumes (CUIDADO: apaga dados)
docker-compose down -v
```

### Testes (Vitest)

```bash
# Rodar testes
pnpm test

# Rodar testes em watch mode
pnpm test:watch

# Rodar testes com UI
pnpm test:ui

# Rodar testes com coverage
pnpm test:cov
```

---

## 📖 Swagger/OpenAPI

Acesse a documentação interativa em: **http://localhost:3000/docs**

A documentação inclui:
- Todos os endpoints disponíveis
- Schemas de request/response
- Exemplos de uso
- Autenticação JWT (Bearer token)
- Try it out (testar direto no navegador)

---

## 🗄️ Database

### Tecnologia

- **PostgreSQL** como banco de dados principal
- **Drizzle ORM** para type-safe queries
- **Drizzle Kit** para gerenciamento de migrations

### Tabelas Principais (39 tabelas)

| Categoria | Tabelas |
|-----------|---------|
| **Core** | `users`, `organizations`, `projects`, `teams`, `members` |
| **Game** | `games`, `tasks`, `task_updates`, `task_managers`, `task_templates` |
| **Kaizen** | `kaizens`, `kaizen_ideas`, `kaizen_types`, `kaizen_comments` |
| **Planning** | `macrosteps`, `activities`, `macrostep_orders`, `project_diaries` |
| **Points** | `user_game_points`, `team_game_points`, `user_task_points`, etc. |
| **Config** | `organization_configs`, `kpis`, `job_roles`, `leagues` |

### Workflow de Migrations

```bash
# 1. Editar schema em src/infrastructure/database/schemas/*.schema.ts
# 2. Gerar migration
pnpm db:generate --name=descricao_da_mudanca

# 3. Revisar SQL gerado em drizzle/migrations/
# 4. Aplicar migration
pnpm db:migrate
```

Veja mais detalhes em [`.github/instructions/drizzle-migrations.instructions.md`](.github/instructions/drizzle-migrations.instructions.md)

---

## 🚢 Deploy

### Usando Docker

```bash
# Build da imagem
docker build -f Dockerfile.monolith -t construgame-api:latest .

# Rodar container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your_secret \
  construgame-api:latest
```

### Usando Docker Compose

```bash
# Subir em produção
docker-compose up -d
```

---

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | `development`, `production` |
| `PORT` | Porta da API | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret para tokens JWT | `your_jwt_secret` |
| `JWT_EXPIRATION` | Expiração do token | `7d` |
| `AWS_REGION` | Região AWS | `sa-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `...` |
| `AWS_S3_IMAGES_BUCKET` | Bucket S3 para imagens | `construgame-images` |

Veja todas as variáveis em [`.env.example`](.env.example)

---

## 🧪 Testes

O projeto usa **Vitest** para testes (não Jest).

### Tipos de Testes

- **Unit tests**: `*.spec.ts` (junto ao código fonte)
- **E2E tests**: `test/modules/**/*.e2e-spec.ts`
- **Domain tests**: `domain/**/*.spec.ts`

### Executar Testes

```bash
# Todos os testes
pnpm test

# Watch mode
pnpm test:watch

# Com cobertura
pnpm test:cov

# Interface visual
pnpm test:ui
```

---

## 📝 Convenções de Código

### Linguagem

- **Código**: Inglês (variáveis, funções, tipos)
- **Comentários**: Português

### Imports (Path Aliases)

```typescript
import { createGame } from '@domain/game';
import { GameRepository } from '@infrastructure/repositories/game.repository';
import { GameService } from '@modules/game/game.service';
import { formatDate } from '@common/helpers';
```

### Domain Layer

- Apenas **funções puras** e **tipos** (sem classes)
- Use cases são funções exportadas: `createGame()`, `updateTask()`
- Entidades são tipos + factory functions: `GameEntity`, `createGameEntity()`

### DTOs

```typescript
export class CreateGameDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Game name' })
  @IsString()
  @MinLength(3)
  name: string;
}
```

---

## 🆘 Troubleshooting

### Erro de conexão com banco

```bash
# Verificar se Postgres está rodando
docker-compose ps

# Ver logs do Postgres
docker-compose logs postgres

# Testar conexão manual
PAGER=cat psql postgresql://construgame:construgame_dev_password@localhost:5432/construgame
```

### Erro nas migrations

```bash
# Verificar consistência
pnpm db:check

# Se necessário, dropar banco e recriar (CUIDADO: apaga dados)
docker-compose down -v
docker-compose up -d postgres
pnpm db:migrate
```

### TypeScript errors

```bash
# Limpar cache e rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

---

## 📚 Documentação Adicional

- [Drizzle Migrations Guide](.github/instructions/drizzle-migrations.instructions.md)
- [Testing Guide](.github/instructions/testing.instructions.md)
- [NestJS Instructions](.github/instructions/nestjs.instructions.md)
- [Domain Instructions](.github/instructions/domain.instructions.md)

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Feito com ❤️ pela equipe Construgame**
