# Instrução: Exploração e Correção de APIs do Monolito

## Contexto
O frontend em `localhost:7777` espera respostas da API do monolito (`localhost:3000/api/v1`) com formatos específicos.
A tarefa é explorar a plataforma, identificar erros de rede (chamadas à API que falham) e corrigir o backend para manter compatibilidade máxima.

## Fluxo de Trabalho

### 1. Exploração com Playwright
- Navegar pela plataforma em `localhost:7777`
- Monitorar console e network para erros
- Identificar endpoints que falham ou retornam dados incorretos

### 2. Ao Encontrar um Erro
1. **Capturar o curl** da requisição que falhou
2. **Analisar a resposta** esperada vs recebida
3. **Localizar o endpoint** no monolito (`src/modules/`)
4. **Corrigir** o controller/service/repository conforme necessário
5. **Compilar** com `npx nest build` para validar
6. **Testar** novamente no frontend

### 3. Padrões de Correção Comuns

#### Formato de Resposta
- Arrays devem vir em `{ items: [...] }` quando paginados
- Incluir `total`, `page`, `limit` em listagens

#### Dados Enriquecidos
- Fazer JOINs para trazer dados relacionados (project, game, team, user, etc.)
- Mapear IDs para objetos com `{ id, name, photo? }`

#### DTOs e Validação
- `reviewedBy`, `submittedBy` → pegar do token JWT se não informado
- Usar `@IsOptional()` para campos que podem vir do contexto

#### JWT/Auth
- `JwtStrategy.validate()` retorna `{ userId, username, roles, userType }`
- Acessar via `@CurrentUser() user` → `user.userId` (não `user.sub`)

### 4. Credenciais de Teste
- **URL**: http://localhost:7777
- **Email**: contato@construgame.com.br
- **Senha**: Teste@1234

### 5. Endpoints Já Corrigidos
- `POST /game/:gameId/task/:taskId/update` - Task update singular
- `PUT /game/:gameId/task/:taskId/update/:updateId/approve` - Approve com reviewedBy opcional
- `GET /organization/:orgId/task/update` - Listagem enriquecida com JOINs

## Lembrete
Sempre que corrigir um endpoint, atualizar esta lista de "Endpoints Já Corrigidos" para manter o histórico.
