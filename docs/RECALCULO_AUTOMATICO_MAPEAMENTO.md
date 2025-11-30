# Mapeamento de Arquivos - Recálculo Automático

Este documento lista TODOS os arquivos que precisam ser alterados/criados para implementar o recálculo automático de pontos.

## 🔴 CRÍTICO - Arquivos que DEVEM ser alterados

### Schema (Drizzle) - Migrations

| Arquivo | Alteração | Prioridade |
|---------|-----------|------------|
| `infrastructure/database/schemas/game.schema.ts` | Adicionar `locked`, `lockedBy`, `lockedAt` | ALTA |
| `infrastructure/database/schemas/task-manager.schema.ts` | Remover `.notNull()` de `rewardPoints` | ALTA |
| `infrastructure/database/schemas/task.schema.ts` | Remover `.notNull()` de `rewardPoints` | ALTA |
| `infrastructure/database/schemas/kpi.schema.ts` | Adicionar `autoPointsEnabled`, `totalKpiPoints` (opcional) | MÉDIA |

### Entidades de Domínio

| Arquivo | Alteração | Impacto |
|---------|-----------|---------|
| `domain/game/entities/game.entity.ts` | Adicionar campos `locked`, `lockedBy`, `lockedAt` | ALTO |
| `domain/task-manager/entities/task-manager.entity.ts` | `rewardPoints: number` → `rewardPoints?: number` | ALTO |
| `domain/task/entities/task.entity.ts` | `rewardPoints: number` → `rewardPoints?: number` | ALTO |

### Repositórios

| Arquivo | Alteração | Impacto |
|---------|-----------|---------|
| `infrastructure/repositories/game.repository.ts` | Adicionar `lockGame()`, `unlockGame()` | MÉDIO |
| `infrastructure/repositories/task.repository.ts` | Lidar com `rewardPoints` undefined | MÉDIO |
| `infrastructure/repositories/task-manager.repository.ts` | Lidar com `rewardPoints` undefined | MÉDIO |

### DTOs

| Arquivo | Alteração |
|---------|-----------|
| `modules/task/dto/create-task.dto.ts` | `@IsNotEmpty() rewardPoints!: number` → `@IsOptional() rewardPoints?: number` |
| `modules/task/dto/update-task.dto.ts` | Já é opcional, OK |
| `modules/task/dto/task-response.dto.ts` | `rewardPoints!: number` → `rewardPoints?: number` |
| `modules/task-manager/task-manager.controller.ts` | DTOs inline: `rewardPoints: number` → `rewardPoints?: number` |

### Controllers

| Arquivo | Alteração |
|---------|-----------|
| `modules/task/task.controller.ts` | Adicionar validação condicional por modo |
| `modules/task-manager/task-manager.controller.ts` | Adicionar validação condicional por modo |
| `modules/game/game.controller.ts` | Adicionar endpoints de lock/unlock/recalculate |

### Services

| Arquivo | Alteração |
|---------|-----------|
| `modules/task-update/task-update.service.ts` | Guard para `rewardPoints` undefined em `creditTaskPoints()` |
| `modules/game/game.service.ts` | Adicionar métodos para lock/unlock |

### Helpers/Cálculos

| Arquivo | Alteração |
|---------|-----------|
| `domain/task/helpers/calculate-task-progress.ts` | Guard para `rewardPoints` undefined |

---

## 🟡 ARQUIVOS A CRIAR

### Domínio

```
domain/game-points/use-cases/recalculate-game-points.ts
domain/kpi/helpers/get-operation-mode.ts
```

### Infraestrutura

```
infrastructure/database/schemas/game-kpi-config.schema.ts  (opcional)
infrastructure/repositories/game-kpi-config.repository.ts  (opcional)
```

### Módulos

```
modules/game/recalculation.service.ts
modules/game/recalculation.service.spec.ts
modules/game/dto/lock-game.dto.ts
modules/game/dto/recalculate-points.dto.ts
```

---

## 📊 Arquivos de Teste Impactados

| Arquivo | Tipo de Atualização |
|---------|---------------------|
| `test/modules/task/task.e2e-spec.ts` | Atualizar para `rewardPoints` opcional |
| `test/modules/task-manager/task-manager.e2e-spec.ts` | Atualizar para `rewardPoints` opcional |
| `test/modules/game-manager/game-manager.e2e-spec.ts` | Atualizar para `rewardPoints` opcional |
| `test/modules/task-update/task-update.e2e-spec.ts` | Adicionar casos com `rewardPoints` undefined |
| `domain/task-manager/entities/task-manager.entity.spec.ts` | Atualizar testes |
| `domain/task/entities/task.entity.spec.ts` | Atualizar testes |
| `domain/game-points/use-cases/credit-team-task-points.spec.ts` | Guard para undefined |

---

## 🔍 Grep Detalhado - Onde `rewardPoints` é usado

### Em Validação (Crítico - precisam ser condicionais)

```bash
# CreateTaskDto - ALTERAR
src/modules/task/dto/create-task.dto.ts:42:  rewardPoints!: number;

# TaskManagerController inline DTOs - ALTERAR
src/modules/task-manager/task-manager.controller.ts:174:  rewardPoints: number;
src/modules/task-manager/task-manager.controller.ts:245:  rewardPoints: number;
```

### Em Cálculos (Guard necessário)

```bash
# TaskUpdateService.creditTaskPoints - ADICIONAR GUARD
src/modules/task-update/task-update.service.ts:183:      task.rewardPoints,

# Função calculatePointsToCredit - NÃO TRATA UNDEFINED!
# Arquivo: domain/task/helpers/calculate-task-progress.ts
# Linha: export const calculatePointsToCredit = (rewardPoints: number, ...)
# ⚠️ Precisa ser: rewardPoints?: number e retornar 0 se undefined
```

**Código atual que precisa de guard:**
```typescript
// domain/task/helpers/calculate-task-progress.ts - ATUAL
export const calculatePointsToCredit = (
  rewardPoints: number,  // ❌ Não aceita undefined
  progressPercent: number,
): number => {
  if (progressPercent <= 0) return 0;
  const cappedPercent = Math.min(progressPercent, 100);
  return Math.round((cappedPercent / 100) * rewardPoints);
};

// DEVE SER:
export const calculatePointsToCredit = (
  rewardPoints: number | undefined,  // ✅ Aceita undefined
  progressPercent: number,
): number => {
  if (rewardPoints === undefined || rewardPoints <= 0) return 0;  // ✅ Guard
  if (progressPercent <= 0) return 0;
  const cappedPercent = Math.min(progressPercent, 100);
  return Math.round((cappedPercent / 100) * rewardPoints);
};
```

### Em Respostas (Atualizar tipo)

```bash
# Response DTOs - TORNAR OPCIONAL NO TIPO
src/modules/task/dto/task-response.dto.ts:23:  rewardPoints!: number;
```

---

## 📋 Ordem de Execução Recomendada

### Sprint 1: Fundação (2-3 dias)

1. [ ] Criar migration para alterar schemas
2. [ ] Atualizar entidades de domínio (Game, Task, TaskManager)
3. [ ] Atualizar schemas Drizzle
4. [ ] Aplicar migration: `pnpm db:generate && pnpm db:migrate`

### Sprint 2: Repositórios e DTOs (2 dias)

5. [ ] Atualizar repositórios (lidar com undefined)
6. [ ] Atualizar DTOs (tornar rewardPoints opcional)
7. [ ] Atualizar testes unitários básicos

### Sprint 3: Lógica de Negócio (3-4 dias)

8. [ ] Criar `RecalculationService`
9. [ ] Implementar lock/unlock de game
10. [ ] Implementar algoritmo de recálculo
11. [ ] Adicionar guards nos serviços existentes

### Sprint 4: Endpoints e Integração (2 dias)

12. [ ] Criar endpoints REST
13. [ ] Implementar validação condicional
14. [ ] Documentar no Swagger

### Sprint 5: Testes e Qualidade (2-3 dias)

15. [ ] Testes unitários completos
16. [ ] Testes E2E
17. [ ] Testes de regressão (modo manual deve continuar funcionando)

---

## 🔧 Comandos Úteis

```bash
# Verificar todos os usos de rewardPoints
grep -rn "rewardPoints" src/ domain/ --include="*.ts" | wc -l

# Gerar migration após alterar schemas
pnpm db:generate

# Verificar migration gerada
cat drizzle/migrations/*.sql | tail -50

# Aplicar migration
pnpm db:migrate

# Rodar testes após alterações
pnpm test

# Verificar erros de tipagem
pnpm tsc --noEmit
```

---

## ⚠️ Checklist de Validação

Antes de considerar a implementação completa, validar:

- [ ] Jogos existentes continuam funcionando (modo manual)
- [ ] Criar task SEM rewardPoints lança erro no modo manual
- [ ] Criar task SEM rewardPoints funciona no modo auto
- [ ] Lock de game previne edições
- [ ] Recálculo distribui pontos corretamente
- [ ] Pontos de usuários/times são recalculados
- [ ] Testes E2E passam para ambos os modos
- [ ] Documentação Swagger atualizada
