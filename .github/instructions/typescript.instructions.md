---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Guidelines

## Core Principles
- **Explicit return types** on all functions and methods
- **No `any` types** - use `unknown` with type guards
- **Prefer `type` over `interface`** (except for class implementations)
- **Strict null checks** - handle null/undefined explicitly
- **SOLID principles** - especially Single Responsibility and Dependency Inversion

## Type Safety
```typescript
// ✅ Correct - Type for data structure
type UserData = {
  id: string;
  email: string;
};

// ✅ Correct - Interface for class contracts
interface IUserRepository {
  findById(id: string): Promise<UserData | null>;
  save(user: UserData): Promise<void>;
}

// ✅ Always explicit return types
async getUserById(id: string): Promise<UserData | null> {
  return await this.repository.findById(id);
}

// ❌ Wrong - Missing return type
function getUser(id: string) {
  return this.repository.findById(id);
}
```

## Type Guards
```typescript
// ✅ Use type guards instead of assertions
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

if (isString(data)) {
  // TypeScript knows data is string here
}

// ❌ Avoid type assertions
const data = someValue as string;
```

## SOLID Principles in NestJS

### Single Responsibility Principle
```typescript
// ✅ Each class has one responsibility
@Injectable()
export class GameService {
  constructor(private readonly gameRepository: GameRepository) {}
  
  async create(dto: CreateGameDto): Promise<GameEntity> {
    return await createGame(dto, this.gameRepository);
  }
}

@Injectable()
export class GameRepository implements IGameRepository {
  constructor(@Inject(DRIZZLE_CONNECTION) private readonly db: DrizzleDB) {}
  
  async save(game: GameEntity): Promise<void> {
    // Only database operations
  }
}

// ❌ Wrong - Service doing database work
@Injectable()
export class GameService {
  async create(dto: CreateGameDto): Promise<GameEntity> {
    await this.db.insert(games).values(dto); // Should be in repository!
  }
}
```

### Dependency Inversion Principle
```typescript
// ✅ Depend on abstractions (interfaces)
export interface IGameRepository {
  save(game: GameEntity): Promise<void>;
  findById(id: string): Promise<GameEntity | null>;
}

@Injectable()
export class GameService {
  constructor(private readonly gameRepository: IGameRepository) {}
}

// ❌ Wrong - Depending on concrete implementation
@Injectable()
export class GameService {
  constructor(private readonly drizzleDb: DrizzleDB) {}
}
```

### Open/Closed Principle
```typescript
// ✅ Open for extension, closed for modification
interface INotificationSender {
  send(message: string, recipient: string): Promise<void>;
}

@Injectable()
export class EmailNotificationSender implements INotificationSender {
  async send(message: string, recipient: string): Promise<void> {
    // Email implementation
  }
}

@Injectable()
export class SmsNotificationSender implements INotificationSender {
  async send(message: string, recipient: string): Promise<void> {
    // SMS implementation
  }
}

@Injectable()
export class NotificationService {
  constructor(private readonly senders: INotificationSender[]) {}
  
  async notifyAll(message: string, recipient: string): Promise<void> {
    await Promise.all(this.senders.map(s => s.send(message, recipient)));
  }
}
```

## Optional Chaining & Nullish Coalescing
```typescript
// ✅ Use ?. and ??
const userName = user?.profile?.name ?? 'Anonymous';

// ❌ Avoid manual null checks
const userName = user && user.profile && user.profile.name || 'Anonymous';
```

## Generic Types
```typescript
// ✅ Use generics for reusable code
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

const fetchData = async <T>(url: string): Promise<Result<T>> => {
  // implementation
};

// Usage
const result = await fetchData<UserData>('/api/users');
```

## Naming Conventions
- **camelCase**: variables, functions, parameters, methods
- **PascalCase**: classes, types, interfaces, enums
- **UPPER_CASE**: constants, enum values
- **I-prefix**: interfaces for repositories/contracts (IGameRepository)
- **Private fields**: Use TypeScript `private` keyword, not underscore

## Error Handling in NestJS

```typescript
// ✅ Use NestJS exceptions in controllers/services
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class GameService {
  async findById(id: string): Promise<GameEntity> {
    const game = await this.repository.findById(id);
    
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    
    return game;
  }
  
  async create(dto: CreateGameDto): Promise<GameEntity> {
    if (!dto.organizationId) {
      throw new BadRequestException('Organization ID is required');
    }
    
    try {
      return await createGame(dto, this.repository);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create game');
    }
  }
}

// ✅ Domain layer uses Result types (no exceptions)
type Result<T, E = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const createGame = async (
  input: CreateGameInput,
  repository: IGameRepository,
): Promise<Result<GameEntity>> => {
  if (input.startDate && input.endDate && input.startDate > input.endDate) {
    return {
      success: false,
      error: { code: 'INVALID_DATES', message: 'Start date must be before end date' },
    };
  }
  
  const game = createGameEntity(input);
  await repository.save(game);
  
  return { success: true, data: game };
};
```

## Class Design (NestJS Services/Controllers/Repositories)

```typescript
// ✅ Correct NestJS class structure
@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
  ) {}
  
  async create(dto: CreateGameDto): Promise<GameEntity> {
    // Delegate to domain use case
    return await createGame(dto, this.gameRepository);
  }
  
  async findById(organizationId: string, id: string): Promise<GameEntity> {
    const game = await this.repository.findById(organizationId, id);
    
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    
    return game;
  }
  
  // Keep methods focused and small (<30 lines)
}

// ❌ Wrong - Too many responsibilities
@Injectable()
export class GameService {
  async createGameAndNotifyUsers(dto: CreateGameDto): Promise<void> {
    // Creating game
    // Sending emails
    // Updating caches
    // Logging analytics
    // Too much in one method!
  }
}
```

## Method/Function Length
- Keep methods/functions **under 30 lines**
- Single responsibility per method
- Extract complex logic into private methods or separate functions

## Comments
- Code should be **self-documenting** with clear names
- Use JSDoc for public APIs
- Add comments only for complex business rules

```typescript
// ✅ JSDoc for public methods
/**
 * Cria um novo jogo com configurações de prêmios e KPIs
 * @param dto - Dados do jogo a ser criado
 * @returns GameEntity criado
 * @throws BadRequestException se dados inválidos
 * @throws NotFoundException se organização não existe
 */
@Post()
async create(@Body() dto: CreateGameDto): Promise<GameEntity> {
  return await this.gameService.create(dto);
}

// ✅ Comment for complex business logic
const calculatePrizeDistribution = (totalPoints: number): PrizeDistribution => {
  // Regra de negócio: Top 10% recebe 50% dos prêmios
  // Top 30% recebe 30%, restante divide 20%
  const top10Threshold = totalPoints * 0.1;
  // ...
};

// ❌ Unnecessary comment
const sum = (a: number, b: number): number => {
  return a + b;  // Add two numbers
};
```

## Export Style
```typescript
// ✅ Named exports (classes, types, functions)
export class GameService {}
export type GameEntity = { id: string };
export const createGame = (...) => {};

// ✅ Default export for modules
export default GameModule;

// ❌ Wrong - Avoid default exports for services/types
export default GameService;
```

## Dependency Injection Best Practices

```typescript
// ✅ Constructor injection with readonly
@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly notificationService: NotificationService,
    @Inject('CONFIG') private readonly config: ConfigType,
  ) {}
}

// ❌ Wrong - Property injection
@Injectable()
export class GameService {
  @Inject()
  private gameRepository: GameRepository;
}

// ❌ Wrong - Mutable dependencies
@Injectable()
export class GameService {
  constructor(private gameRepository: GameRepository) {}
}
```
