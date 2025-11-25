# API Routes Checklist - Construgame Monolith

## ✅ Implementados

### Auth (`/api/v1/auth`)
- ✅ POST `/login-web` - Login via web (email + password)
- ✅ POST `/generate-code` - Gerar código de autenticação para app
- ✅ POST `/login-app` - Login via app (phone + auth code)
- ✅ POST `/recover-password` - Recuperar senha
- ✅ POST `/change-password` - Alterar senha

### Users (`/api/v1/users`)
- ✅ POST `/` - Criar usuário
- ✅ GET `/:id` - Buscar usuário por ID
- ✅ PUT `/:id` - Atualizar usuário
- ✅ DELETE `/:id` - Deletar usuário
- ✅ POST `/:id/activate` - Ativar usuário
- ✅ POST `/:id/superuser` - Tornar usuário superuser
- ✅ GET `/by-email/:email` - Buscar usuário por email
- ✅ GET `/by-phone/:phone` - Buscar usuário por telefone

### Organizations (`/api/v1/organizations`)
- ✅ POST `/` - Criar organização
- ✅ GET `/:id` - Buscar organização por ID
- ✅ GET `/` - Listar organizações
- ✅ PUT `/:id` - Atualizar organização
- ✅ DELETE `/:id` - Deletar organização

### Games (`/api/v1/games`)
- ✅ POST `/` - Criar game
- ✅ GET `/:id` - Buscar game por ID
- ✅ GET `/` - Listar games
- ✅ PUT `/:id` - Atualizar game
- ✅ DELETE `/:id` - Deletar game
- ✅ POST `/:id/archive` - Arquivar game
- ✅ POST `/:id/unarchive` - Desarquivar game

### Tasks (`/api/v1/games/:gameId/tasks`)
- ✅ POST `/` - Criar task
- ✅ GET `/:taskId` - Buscar task por ID
- ✅ GET `/` - Listar tasks de um game
- ✅ PUT `/:taskId` - Atualizar task
- ✅ DELETE `/:taskId` - Deletar task

---

## ❌ Faltando Implementar

### Members (`/api/v1/organizations/:organizationId/members`)
- ❌ POST `/` - Criar member (adicionar usuário à organização)
- ❌ GET `/:userId` - Buscar member específico
- ❌ GET `/` - Listar members da organização
- ❌ PUT `/:userId` - Atualizar member (role, sector, position, etc)
- ❌ DELETE `/:userId` - Remover member da organização

### Teams (`/api/v1/organizations/:organizationId/teams`)
- ❌ POST `/` - Criar team
- ❌ GET `/:teamId` - Buscar team por ID
- ❌ GET `/` - Listar teams da organização
- ❌ PUT `/:teamId` - Atualizar team
- ❌ DELETE `/:teamId` - Deletar team

### Notifications (`/api/v1/notifications`)
- ❌ GET `/web` - Listar notificações web do usuário
- ❌ POST `/web/read` - Marcar notificações como lidas
- ❌ POST `/web` - Criar notificação web

### Job Roles (`/api/v1/job-roles`)
- ❌ POST `/` - Criar job role
- ❌ GET `/:id` - Buscar job role por ID
- ❌ GET `/` - Listar job roles
- ❌ PUT `/:id` - Atualizar job role
- ❌ DELETE `/:id` - Deletar job role

### Projects (`/api/v1/organizations/:organizationId/projects`)
- ❌ POST `/` - Criar project
- ❌ GET `/:projectId` - Buscar project por ID
- ❌ GET `/` - Listar projects da organização
- ❌ PUT `/:projectId` - Atualizar project
- ❌ DELETE `/:projectId` - Deletar project

### Kaizen (`/api/v1/kaizens`)
- ❌ POST `/` - Criar kaizen
- ❌ GET `/:id` - Buscar kaizen por ID
- ❌ GET `/` - Listar kaizens
- ❌ PUT `/:id` - Atualizar kaizen
- ❌ DELETE `/:id` - Deletar kaizen
- ❌ POST `/:id/complete` - Marcar kaizen como completo

### Kaizen Ideas (`/api/v1/kaizen-ideas`)
- ❌ POST `/` - Criar kaizen idea
- ❌ GET `/:id` - Buscar kaizen idea por ID
- ❌ GET `/` - Listar kaizen ideas
- ❌ PUT `/:id` - Atualizar kaizen idea
- ❌ DELETE `/:id` - Deletar kaizen idea

### Leagues (`/api/v1/leagues`)
- ❌ POST `/` - Criar league
- ❌ GET `/:id` - Buscar league por ID
- ❌ GET `/` - Listar leagues
- ❌ PUT `/:id` - Atualizar league
- ❌ DELETE `/:id` - Deletar league

### Financial Prizes (`/api/v1/financial-prizes`)
- ❌ POST `/` - Criar financial prize
- ❌ GET `/:id` - Buscar financial prize por ID
- ❌ GET `/` - Listar financial prizes
- ❌ PUT `/:id` - Atualizar financial prize
- ❌ DELETE `/:id` - Deletar financial prize

### Task Updates (`/api/v1/task-updates`)
- ❌ POST `/` - Criar task update
- ❌ GET `/` - Listar task updates
- ❌ GET `/:id` - Buscar task update por ID

### Organization Config (`/api/v1/organizations/:organizationId/config`)
- ❌ GET `/` - Buscar configurações da organização
- ❌ PUT `/` - Atualizar configurações da organização

### Images (`/api/v1/images`)
- ❌ POST `/upload` - Upload de imagem para S3
- ❌ GET `/presigned-url` - Gerar URL pré-assinada

### Task Templates (`/api/v1/task-templates`)
- ❌ POST `/` - Criar template de task
- ❌ GET `/:id` - Buscar template por ID
- ❌ GET `/` - Listar templates
- ❌ PUT `/:id` - Atualizar template
- ❌ DELETE `/:id` - Deletar template

### KPIs (`/api/v1/kpis`)
- ❌ POST `/` - Criar KPI
- ❌ GET `/:id` - Buscar KPI por ID
- ❌ GET `/` - Listar KPIs
- ❌ PUT `/:id` - Atualizar KPI
- ❌ DELETE `/:id` - Deletar KPI

### Task Manager (`/api/v1/task-managers`)
- ❌ Endpoints relacionados a gerenciamento de tasks

### Points (Game Points, Kaizen Points, Task Points)
- ❌ GET `/game-points` - Listar pontos de game
- ❌ GET `/kaizen-points` - Listar pontos de kaizen
- ❌ GET `/task-points` - Listar pontos de task

### Project Diary (`/api/v1/project-diaries`)
- ❌ POST `/` - Criar entrada de diário
- ❌ GET `/` - Listar entradas de diário
- ❌ GET `/:id` - Buscar entrada por ID
- ❌ PUT `/:id` - Atualizar entrada
- ❌ DELETE `/:id` - Deletar entrada

### Project Planning (`/api/v1/project-plannings`)
- ❌ POST `/` - Criar planejamento
- ❌ GET `/` - Listar planejamentos
- ❌ GET `/:id` - Buscar planejamento por ID
- ❌ PUT `/:id` - Atualizar planejamento
- ❌ DELETE `/:id` - Deletar planejamento

---

## 📊 Resumo

**Implementados:** 5 módulos (Auth, Users, Organizations, Games, Tasks)  
**Total de rotas implementadas:** ~30 rotas

**Faltando:** ~16 módulos  
**Total de rotas faltando:** ~80-100 rotas (estimativa)

---

## 🎯 Prioridades Sugeridas

1. **Members & Teams** - Essencial para gestão de pessoas
2. **Notifications** - Comunicação com usuários
3. **Projects** - Core do sistema
4. **Kaizen & Kaizen Ideas** - Funcionalidade principal
5. **Images** - Upload de arquivos
6. **Organization Config** - Configurações
7. **Job Roles** - Gestão de cargos
8. **Leagues & Financial Prizes** - Gamificação
9. **Task Updates** - Histórico de alterações
10. **Pontos (Game/Kaizen/Task)** - Sistema de pontuação
11. **KPIs, Task Templates, Project Diary, Project Planning** - Features avançadas
