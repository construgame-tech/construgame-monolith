---
applyTo: "domain/**/*.ts"
---

# Domain Layer Guidelines

## Architecture
- **Pure functions only** - no classes, no side effects
- **Framework agnostic** - no NestJS imports, no Drizzle imports
- **Business logic only** - no infrastructure concerns

## File Structure
```
domain/{domain-name}/
├── entities/           # Types + factory functions
├── repositories/       # Repository interfaces (NOT implementations)
└── use-cases/          # Pure functions with Input/Output types
```

## Entity Pattern
```typescript
// ✅ Correct entity pattern
export type GameEntity = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly status: 'ACTIVE' | 'PAUSED' | 'DONE';
  readonly archived?: boolean;
};

// Factory function with defaults
export const createGameEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
  status?: 'ACTIVE' | 'PAUSED' | 'DONE';
}): GameEntity => ({
  ...props,
  status: props.status ?? 'ACTIVE',
  archived: false,
});

// ❌ Wrong - no classes in domain
export class GameEntity {
  constructor(public id: string, public name: string) {}
}
```

## Repository Interface Pattern
```typescript
// ✅ Correct repository interface
export interface IGameRepository {
  save(game: GameEntity): Promise<void>;
  findById(organizationId: string, gameId: string): Promise<GameEntity | null>;
  findByOrganizationId(organizationId: string): Promise<GameEntity[]>;
  delete(organizationId: string, gameId: string): Promise<void>;
}

// ❌ Wrong - implementation details in domain
export interface IGameRepository {
  executeQuery(sql: string): Promise<any>;  // Too low-level
}
```

## Use Case Pattern
```typescript
// ✅ Correct use case pattern
export interface CreateGameInput {
  readonly organizationId: string;
  readonly projectId: string;
  readonly name: string;
  readonly startDate?: string;
}

export interface CreateGameOutput {
  readonly game: GameEntity;
}

export const createGame = async (
  input: CreateGameInput,
  repository: IGameRepository,
): Promise<CreateGameOutput> => {
  const gameId = randomUUID();
  
  const game = createGameEntity({
    id: gameId,
    organizationId: input.organizationId,
    name: input.name,
    projectId: input.projectId,
    startDate: input.startDate,
  });

  await repository.save(game);

  return { game };
};

// ❌ Wrong - use case as class
export class CreateGameUseCase {
  execute(input: CreateGameInput) {}
}
```

## Validation in Domain
```typescript
// ✅ Domain validation (business rules)
const validateGameDates = (
  startDate: string,
  endDate: string,
): Result<void, ValidationError> => {
  if (new Date(startDate) > new Date(endDate)) {
    return {
      success: false,
      error: { code: 'INVALID_DATES', message: 'Start date must be before end date' },
    };
  }
  return { success: true, data: undefined };
};

// ❌ Technical validation belongs in infrastructure/DTOs
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

## Dependencies
- **NEVER import** from `@nestjs/*`
- **NEVER import** from `drizzle-orm`
- **NEVER import** from `@infrastructure/*`
- **ONLY import** from other domain modules
- **Use** standard Node.js libs (crypto, path, etc.)

```typescript
// ✅ Allowed imports
import { randomUUID } from 'crypto';
import type { GameEntity } from '../entities/game.entity';
import type { IGameRepository } from '../repositories/game.repository.interface';

// ❌ Forbidden imports
import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm';
import { GameRepository } from '@infrastructure/repositories/game.repository';
```

## Error Handling in Domain
```typescript
// ✅ Return Result types instead of throwing
type DomainError = {
  readonly code: string;
  readonly message: string;
};

type Result<T, E = DomainError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const updateGame = async (
  input: UpdateGameInput,
  repository: IGameRepository,
): Promise<Result<GameEntity>> => {
  const existingGame = await repository.findById(input.organizationId, input.gameId);
  
  if (!existingGame) {
    return {
      success: false,
      error: { code: 'GAME_NOT_FOUND', message: 'Game not found' },
    };
  }

  const updatedGame = { ...existingGame, ...input };
  await repository.save(updatedGame);

  return { success: true, data: updatedGame };
};

// ❌ Don't throw exceptions in domain
export const updateGame = async (...) => {
  throw new NotFoundException('Game not found');  // NestJS dependency!
};
```

## Testing Domain Use Cases
```typescript
// ✅ Pure function testing - no framework needed
describe('createGame use case', () => {
  it('should create game with default status', async () => {
    const mockRepository: IGameRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };

    const result = await createGame(
      { organizationId: 'org-1', projectId: 'proj-1', name: 'Game' },
      mockRepository
    );

    expect(result.game.status).toBe('ACTIVE');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
```

## Language Rules
- **Code**: English (variables, functions, types)
- **Comments**: Portuguese (when absolutely necessary)
- **Business terms**: Keep original language if domain-specific

```typescript
// ✅ Correct
export type KaizenEntity = {  // Domain term in original language
  readonly id: string;
  readonly organizationId: string;
  readonly type: 'MEJORA' | 'INNOVACION';  // Business terms
};

// Comentário em português explicando regra de negócio complexa
export const calculateKaizenPoints = (...) => {
  // implementation
};
```
