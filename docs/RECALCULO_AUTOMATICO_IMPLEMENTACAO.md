# Recálculo Automático de Pontos - Plano de Implementação

## 📋 Resumo Executivo

Este documento detalha o que precisa ser implementado para o novo modo de jogo **"Recálculo Automático de Pontos"**, adaptando a análise original (escrita para microserviços) ao monolito NestJS atual.

### Problema a Resolver

Atualmente, o campo `rewardPoints` em `TaskManager` é copiado para cada `Task` filha, causando problemas quando equipes diferentes geram quantidades diferentes de tarefas (Ex: TaskManager com 100 pontos e recorrência semanal gera 4 tasks para Equipe A e 8 tasks para Equipe B - ambas com 100 pontos cada, distorcendo a competição).

### Solução Proposta

Criar um **modo de operação automático** onde:
1. `rewardPoints` em `TaskManager` e `Task` se torna **opcional**
2. Os pontos são calculados **automaticamente** com base na configuração do KPI
3. Um mecanismo de **lock** no Game previne edições durante o recálculo
4. Uma função de **batch recalculation** recalcula todos os pontos do jogo

---

## 🔍 Análise do Estado Atual (Monolito)

### Entidades Afetadas

| Entidade | Arquivo | Campo `rewardPoints` | Estado Atual |
|----------|---------|---------------------|--------------|
| TaskManager | `domain/task-manager/entities/task-manager.entity.ts` | `rewardPoints: number` | **Obrigatório** |
| TaskManager Schema | `infrastructure/database/schemas/task-manager.schema.ts` | `rewardPoints: real().notNull()` | **Obrigatório** |
| Task | `domain/task/entities/task.entity.ts` | `rewardPoints: number` | **Obrigatório** |
| Task Schema | `infrastructure/database/schemas/task.schema.ts` | `rewardPoints: integer().notNull()` | **Obrigatório** |
| Game | `domain/game/entities/game.entity.ts` | N/A | ❌ Não tem campos de lock |
| Game Schema | `infrastructure/database/schemas/game.schema.ts` | N/A | ❌ Não tem campos de lock |

### DTOs Afetados

| DTO | Arquivo | Campo | Estado |
|-----|---------|-------|--------|
| CreateTaskDto | `modules/task/dto/create-task.dto.ts` | `@IsNotEmpty() rewardPoints!: number` | **Obrigatório** |
| UpdateTaskDto | `modules/task/dto/update-task.dto.ts` | `rewardPoints?: number` | Opcional |
| BatchTaskDto | `modules/task/dto/batch-task.dto.ts` | `rewardPoints?: string` | Opcional |
| TaskManagerController | `modules/task-manager/task-manager.controller.ts` | `rewardPoints: number` (inline) | **Obrigatório** |

### Configuração de KPI (já existe base)

```typescript
// domain/kpi/entities/kpi.entity.ts
export interface KpiEntity {
  id: string;
  organizationId: string;
  name: string;
  type: string;        // Tipo do KPI
  kpiType?: string;    // Subtipo
  photo?: string;
}

// infrastructure/database/schemas/kpi.schema.ts
export const kpis = pgTable("kpis", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit"),
  type: text("type"),
  kpiType: text("kpi_type"),
  photo: text("photo"),
  sequence: integer("sequence").notNull().default(0),
});
```

**⚠️ FALTA:** Campo para indicar modo de operação (`manualPoints` ou `autoPoints`) no KPI ou em uma configuração de jogo.

---

## 📦 Alterações Necessárias por Camada

### 1. Camada de Domínio (`domain/`)

#### 1.1 Entidade Game - Adicionar campos de lock

```typescript
// domain/game/entities/game.entity.ts

export interface GameEntity {
  // ... campos existentes ...
  
  // NOVOS CAMPOS para lock
  locked?: boolean;          // Jogo travado para recálculo
  lockedBy?: string;         // ID do usuário que travou
  lockedAt?: string;         // Timestamp ISO do lock
}
```

#### 1.2 Entidade TaskManager - rewardPoints opcional

```typescript
// domain/task-manager/entities/task-manager.entity.ts

export interface TaskManagerEntity {
  // ... outros campos ...
  rewardPoints?: number;  // Alterar de number para number | undefined
}
```

#### 1.3 Entidade Task - rewardPoints opcional

```typescript
// domain/task/entities/task.entity.ts

export interface TaskEntity {
  // ... outros campos ...
  rewardPoints?: number;  // Alterar de number para number | undefined
}
```

#### 1.4 Novo Use Case: Recalcular Pontos do Jogo

```typescript
// domain/game-points/use-cases/recalculate-game-points.ts

export interface RecalculateGamePointsInput {
  gameId: string;
  organizationId: string;
  userId: string;  // Quem está executando o recálculo
}

export interface RecalculateGamePointsOutput {
  tasksRecalculated: number;
  kpisProcessed: number;
  totalPointsDistributed: number;
}
```

#### 1.5 Novo Helper: Determinar Modo de Operação

```typescript
// domain/kpi/helpers/get-operation-mode.ts

export type KpiOperationMode = 'manual' | 'auto';

export const getKpiOperationMode = (kpiConfig: KpiConfig): KpiOperationMode => {
  return kpiConfig.autoPointsEnabled ? 'auto' : 'manual';
};
```

---

### 2. Camada de Infraestrutura (`infrastructure/`)

#### 2.1 Schema Game - Adicionar colunas de lock

```typescript
// infrastructure/database/schemas/game.schema.ts

export const games = pgTable("games", {
  // ... colunas existentes ...
  
  // NOVAS COLUNAS
  locked: integer("locked").$type<0 | 1>().default(0),
  lockedBy: uuid("locked_by"),
  lockedAt: timestamp("locked_at"),
});
```

**Migration necessária:**
```sql
ALTER TABLE games ADD COLUMN locked INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN locked_by UUID;
ALTER TABLE games ADD COLUMN locked_at TIMESTAMP;
```

#### 2.2 Schema TaskManager - rewardPoints nullable

```typescript
// infrastructure/database/schemas/task-manager.schema.ts

// Alterar de:
rewardPoints: real("reward_points").notNull(),

// Para:
rewardPoints: real("reward_points"),  // Remove .notNull()
```

**Migration necessária:**
```sql
ALTER TABLE task_managers ALTER COLUMN reward_points DROP NOT NULL;
```

#### 2.3 Schema Task - rewardPoints nullable

```typescript
// infrastructure/database/schemas/task.schema.ts

// Alterar de:
rewardPoints: integer("reward_points").notNull(),

// Para:
rewardPoints: integer("reward_points"),  // Remove .notNull()
```

**Migration necessária:**
```sql
ALTER TABLE tasks ALTER COLUMN reward_points DROP NOT NULL;
```

#### 2.4 Novo: ConfigKpi Schema (ou alterar kpis)

**Opção A**: Adicionar coluna em `kpis`:
```sql
ALTER TABLE kpis ADD COLUMN auto_points_enabled BOOLEAN DEFAULT false;
ALTER TABLE kpis ADD COLUMN total_kpi_points INTEGER;
```

**Opção B**: Criar tabela de configuração por jogo-KPI:
```sql
CREATE TABLE game_kpi_configs (
  id UUID PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES games(id),
  kpi_id UUID NOT NULL REFERENCES kpis(id),
  auto_points_enabled BOOLEAN DEFAULT false,
  total_kpi_points INTEGER,
  UNIQUE(game_id, kpi_id)
);
```

**Recomendação**: Opção B - mais flexível, permite configuração por jogo.

---

### 3. Camada de Aplicação (`modules/`)

#### 3.1 DTOs - Tornar rewardPoints opcional

```typescript
// modules/task/dto/create-task.dto.ts

// Alterar de:
@IsNotEmpty()
@IsNumber()
rewardPoints!: number;

// Para:
@IsOptional()
@IsNumber()
rewardPoints?: number;
```

```typescript
// modules/task-manager/task-manager.controller.ts

// Nas classes inline, alterar:
rewardPoints?: number;  // Opcional em CreateTaskManagerDto e UpdateTaskManagerDto
```

#### 3.2 Validação Condicional

Implementar validação que verifica:
- Se modo `manual` → `rewardPoints` é obrigatório
- Se modo `auto` → `rewardPoints` deve ser ignorado/undefined

```typescript
// modules/task/task.controller.ts

async create(dto: CreateTaskDto) {
  const game = await this.gameService.findById(dto.gameId);
  const kpiConfig = await this.kpiConfigService.findByGameAndKpi(dto.gameId, dto.kpiId);
  
  const isAutoMode = kpiConfig?.autoPointsEnabled ?? false;
  
  if (!isAutoMode && dto.rewardPoints === undefined) {
    throw new BadRequestException('rewardPoints é obrigatório no modo manual');
  }
  
  // Se modo auto, ignora rewardPoints do DTO
  const finalRewardPoints = isAutoMode ? undefined : dto.rewardPoints;
  
  // ... resto da criação
}
```

#### 3.3 Novo Service: RecalculationService

```typescript
// modules/game/recalculation.service.ts

@Injectable()
export class RecalculationService {
  async lockGame(gameId: string, userId: string): Promise<void>;
  async unlockGame(gameId: string): Promise<void>;
  async recalculateGamePoints(gameId: string): Promise<RecalculateResult>;
}
```

#### 3.4 Novo Endpoint: Recalcular Pontos

```typescript
// modules/game/game.controller.ts

@Post(':id/recalculate-points')
@ApiOperation({ summary: 'Recalcula todos os pontos do jogo (modo automático)' })
async recalculatePoints(
  @Param('id') gameId: string,
  @Query('organizationId') organizationId: string,
  @Body() dto: { userId: string }
) {
  return await this.recalculationService.recalculateGamePoints(gameId);
}
```

---

## 🔢 Algoritmo de Recálculo Automático

```typescript
async recalculateGamePoints(gameId: string): Promise<void> {
  // 1. Buscar o game e validar
  const game = await this.gameRepository.findById(gameId);
  if (!game) throw new NotFoundException();
  
  // 2. Buscar configuração de KPIs do jogo
  const gameKpis = game.kpis ?? [];
  
  for (const gameKpi of gameKpis) {
    // 3. Verificar se KPI está em modo automático
    const kpiConfig = await this.kpiConfigRepository.findByGameAndKpi(gameId, gameKpi.id);
    if (!kpiConfig?.autoPointsEnabled) continue;
    
    // 4. Buscar todas as tasks do KPI
    const tasks = await this.taskRepository.findByGameAndKpi(gameId, gameKpi.id);
    
    // 5. Calcular pontos totais do KPI (vem da config do jogo)
    const totalKpiPoints = gameKpi.points;
    
    // 6. Distribuir proporcionalmente
    const pointsPerTask = totalKpiPoints / tasks.length;
    
    // 7. Atualizar cada task com os pontos calculados
    for (const task of tasks) {
      await this.taskRepository.update(task.id, {
        rewardPoints: Math.round(pointsPerTask * 100) / 100
      });
    }
    
    // 8. Recalcular pontos de usuários/times baseado no progresso
    await this.recalculateUserPoints(gameId, gameKpi.id);
    await this.recalculateTeamPoints(gameId, gameKpi.id);
  }
}
```

---

## 📋 Checklist de Implementação

### Fase 1: Preparação de Schema (Migration) ⏱️ 4-6h

- [ ] Adicionar colunas `locked`, `locked_by`, `locked_at` na tabela `games`
- [ ] Alterar `reward_points` para nullable em `task_managers`
- [ ] Alterar `reward_points` para nullable em `tasks`
- [ ] Criar tabela `game_kpi_configs` (opcional, para configuração por jogo)
- [ ] Gerar e aplicar migration com Drizzle

### Fase 2: Atualização de Entidades (Domain) ⏱️ 4-6h

- [ ] Atualizar `GameEntity` com campos de lock
- [ ] Atualizar factories `createGameEntity` e `updateGameEntity`
- [ ] Tornar `rewardPoints` opcional em `TaskManagerEntity`
- [ ] Tornar `rewardPoints` opcional em `TaskEntity`
- [ ] Criar helper `getOperationMode()`
- [ ] Atualizar testes unitários das entidades

### Fase 3: Atualização de Schemas (Infrastructure) ⏱️ 2-4h

- [ ] Atualizar `game.schema.ts` com novos campos
- [ ] Atualizar `task-manager.schema.ts` - rewardPoints nullable
- [ ] Atualizar `task.schema.ts` - rewardPoints nullable
- [ ] Criar `game-kpi-config.schema.ts` (se usar Opção B)

### Fase 4: Atualização de Repositórios ⏱️ 4-6h

- [ ] Atualizar `GameRepository` com métodos de lock/unlock
- [ ] Atualizar `TaskRepository` para lidar com rewardPoints undefined
- [ ] Atualizar `TaskManagerRepository` para lidar com rewardPoints undefined
- [ ] Criar `GameKpiConfigRepository` (se usar Opção B)

### Fase 5: Atualização de DTOs e Validação ⏱️ 4-6h

- [ ] Atualizar `CreateTaskDto` - rewardPoints opcional
- [ ] Atualizar DTOs inline em `TaskManagerController`
- [ ] Implementar validação condicional baseada no modo
- [ ] Atualizar `TaskResponseDto` para refletir opcional

### Fase 6: Implementar RecalculationService ⏱️ 8-12h

- [ ] Criar `RecalculationService` em `modules/game/`
- [ ] Implementar `lockGame()` e `unlockGame()`
- [ ] Implementar `recalculateGamePoints()`
- [ ] Implementar lógica de distribuição proporcional
- [ ] Implementar recálculo de pontos de usuários/times

### Fase 7: Novos Endpoints ⏱️ 4-6h

- [ ] Endpoint `POST /games/:id/lock`
- [ ] Endpoint `POST /games/:id/unlock`
- [ ] Endpoint `POST /games/:id/recalculate-points`
- [ ] Endpoint para configurar modo do KPI (manual/auto)

### Fase 8: Atualização de Services Existentes ⏱️ 6-8h

- [ ] `TaskUpdateService.creditTaskPoints()` - lidar com undefined rewardPoints
- [ ] `TaskService.create()` - validação condicional
- [ ] `TaskManagerController.create()` - validação condicional
- [ ] `GameManagerService` - propagar modo de operação

### Fase 9: Testes ⏱️ 8-10h

- [ ] Testes unitários para novas entidades
- [ ] Testes unitários para RecalculationService
- [ ] Testes E2E para novos endpoints
- [ ] Testes E2E para validação condicional
- [ ] Testes de regressão para modo manual (comportamento atual)

### Fase 10: Documentação ⏱️ 2-4h

- [ ] Documentar novos endpoints no Swagger
- [ ] Atualizar README com novo modo de operação
- [ ] Criar guia de uso para frontend

---

## ⏱️ Estimativa Total

| Fase | Descrição | Horas |
|------|-----------|-------|
| 1 | Preparação de Schema | 4-6h |
| 2 | Atualização de Entidades | 4-6h |
| 3 | Atualização de Schemas | 2-4h |
| 4 | Atualização de Repositórios | 4-6h |
| 5 | DTOs e Validação | 4-6h |
| 6 | RecalculationService | 8-12h |
| 7 | Novos Endpoints | 4-6h |
| 8 | Atualização Services | 6-8h |
| 9 | Testes | 8-10h |
| 10 | Documentação | 2-4h |
| **TOTAL** | | **46-68h** |

**Estimativa em dias**: 6-9 dias úteis (considerando 8h/dia)

---

## 🚨 Pontos de Atenção

### Backward Compatibility

O modo manual (atual) deve continuar funcionando sem alterações para jogos existentes:
- Jogos existentes = modo manual por padrão
- Novos jogos = podem escolher modo
- `rewardPoints` continua obrigatório no modo manual

### Riscos

1. **Dados existentes**: Tasks com `rewardPoints = NULL` podem quebrar cálculos existentes
   - **Mitigação**: Adicionar guards em `calculatePointsToCredit()` para retornar 0 se undefined

2. **Concorrência**: Lock do game durante recálculo
   - **Mitigação**: Timeout de lock (ex: 5 minutos) + cleanup automático

3. **Performance**: Recálculo de jogos grandes
   - **Mitigação**: Implementar em batch com progress tracking

### Coexistência de Modos

O sistema deve suportar:
- Jogos com todos os KPIs em modo manual
- Jogos com todos os KPIs em modo automático  
- Jogos híbridos (alguns KPIs manual, outros automático)

---

## 📁 Arquivos a Serem Criados

```
domain/
├── game-points/
│   └── use-cases/
│       └── recalculate-game-points.ts     ← NOVO
├── kpi/
│   └── helpers/
│       └── get-operation-mode.ts          ← NOVO

infrastructure/
├── database/
│   └── schemas/
│       └── game-kpi-config.schema.ts      ← NOVO (opcional)
├── repositories/
│   └── game-kpi-config.repository.ts      ← NOVO (opcional)

modules/
├── game/
│   ├── recalculation.service.ts           ← NOVO
│   └── recalculation.service.spec.ts      ← NOVO
├── kpi/
│   └── dto/
│       └── kpi-config.dto.ts              ← NOVO

drizzle/
└── migrations/
    └── XXXX_add_auto_points_feature.sql   ← NOVO
```

---

## 📝 Próximos Passos Recomendados

1. **Validar escopo** com stakeholders
2. **Criar branch** `feature/auto-points-recalculation`
3. **Começar pela Fase 1** (migrations) - baixo risco, prepara a base
4. **Implementar feature flag** para habilitar/desabilitar gradualmente
5. **Deploy em staging** para testes antes de produção

---

*Documento gerado em: 2025-01-22*
*Baseado na análise dos docs em: `/recalculo-automatico/`*
