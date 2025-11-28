# Sistema de Cache com DynamoDB

## Arquitetura

```
┌─────────────┐     Cache HIT      ┌─────────────┐
│   Cliente   │ ─────────────────► │  DynamoDB   │
└─────────────┘                    └─────────────┘
       │                                  │
       │ Cache MISS                       │
       ▼                                  │
┌─────────────┐                           │
│   Service   │                           │
└─────────────┘                           │
       │                                  │
       │ Query                            │
       ▼                                  │
┌─────────────┐     Salva Cache    ┌──────┴──────┐
│  PostgreSQL │ ─────────────────► │  DynamoDB   │
└─────────────┘                    └─────────────┘
```

## Fluxo de Dados

### READ (Get/List)
```
1. Verifica cache → HIT → Retorna dados do cache
                  → MISS → Busca no PostgreSQL
                         → Salva no DynamoDB
                         → Retorna dados
```

### CREATE/UPDATE/DELETE
```
1. Executa operação no PostgreSQL
2. Invalida cache relacionado no DynamoDB
3. Próximo READ vai buscar dados frescos
```

## Estrutura da Tabela DynamoDB

```
Table: construgame-cache

Primary Key:
  - pk (Partition Key): "entityType:organizationId"  
  - sk (Sort Key): "identifier"

Attributes:
  - data: JSON stringified dos dados
  - ttl: Unix timestamp para expiração
  - entityType: tipo da entidade (para GSI)
  - organizationId: ID da organização (para GSI)
  - tags: array de tags para invalidação
  - createdAt: timestamp de criação

GSI: gsi-invalidation
  - pk: entityType
  - sk: organizationId
  → Permite invalidar todos os caches de um tipo por organização
```

## Uso nos Services

### Exemplo: GameService com Cache

```typescript
import { Injectable } from '@nestjs/common';
import { DynamoCacheService, CacheEntityTypes } from '@infrastructure/services/cache';
import { GameRepository } from '@infrastructure/repositories/game.repository';

@Injectable()
export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly cache: DynamoCacheService,
  ) {}

  // READ - Usa cache
  async findByOrganizationId(organizationId: string) {
    const cacheKey = this.cache.buildKey(CacheEntityTypes.GAMES, organizationId, 'list');
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.gameRepository.findByOrganizationId(organizationId),
      { ttlSeconds: 3600 } // 1 hora
    );
  }

  async findById(organizationId: string, gameId: string) {
    const cacheKey = this.cache.buildKey(CacheEntityTypes.GAMES, organizationId, gameId);
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.gameRepository.findById(organizationId, gameId),
      { ttlSeconds: 3600 }
    );
  }

  // CREATE - Invalida cache
  async create(dto: CreateGameDto) {
    const game = await createGame(dto, this.gameRepository);
    
    // Invalida a lista de games da organização
    await this.cache.invalidateByEntity(CacheEntityTypes.GAMES, dto.organizationId);
    
    return game;
  }

  // UPDATE - Invalida cache específico + lista
  async update(organizationId: string, gameId: string, dto: UpdateGameDto) {
    const game = await updateGame({ ...dto, id: gameId }, this.gameRepository);
    
    // Invalida cache do game específico E a lista
    await Promise.all([
      this.cache.delete(this.cache.buildKey(CacheEntityTypes.GAMES, organizationId, gameId)),
      this.cache.invalidateByEntity(CacheEntityTypes.GAMES, organizationId),
    ]);
    
    return game;
  }

  // DELETE - Invalida cache
  async delete(organizationId: string, gameId: string) {
    await this.gameRepository.delete(organizationId, gameId);
    
    await this.cache.invalidateByEntity(CacheEntityTypes.GAMES, organizationId);
  }
}
```

## TTL Recomendados por Tipo de Dado

| Entidade | TTL | Motivo |
|----------|-----|--------|
| Organization Config | 24h | Muda raramente |
| Job Roles | 12h | Muda raramente |
| Kaizen Types | 12h | Muda raramente |
| Games (lista) | 1h | Muda ocasionalmente |
| Projects (lista) | 30min | Muda com frequência |
| Tasks (lista) | 15min | Muda frequentemente |
| Members (lista) | 1h | Muda ocasionalmente |
| Notifications | 5min | Muda muito |

## Configuração na AWS

### Criar Tabela DynamoDB (via Console ou CLI)

```bash
aws dynamodb create-table \
  --table-name construgame-cache \
  --attribute-definitions \
    AttributeName=pk,AttributeType=S \
    AttributeName=sk,AttributeType=S \
    AttributeName=entityType,AttributeType=S \
    AttributeName=organizationId,AttributeType=S \
  --key-schema \
    AttributeName=pk,KeyType=HASH \
    AttributeName=sk,KeyType=RANGE \
  --global-secondary-indexes \
    '[{
      "IndexName": "gsi-invalidation",
      "KeySchema": [
        {"AttributeName": "entityType", "KeyType": "HASH"},
        {"AttributeName": "organizationId", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "KEYS_ONLY"},
      "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
    }]' \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Environment,Value=production

# Habilitar TTL
aws dynamodb update-time-to-live \
  --table-name construgame-cache \
  --time-to-live-specification Enabled=true,AttributeName=ttl
```

### Variáveis de Ambiente

```env
CACHE_ENABLED=true
CACHE_TABLE_NAME=construgame-cache
AWS_REGION=us-east-1
```

## Monitoramento

### Métricas Importantes

- **Cache Hit Rate**: % de requests servidos pelo cache
- **Cache Miss Rate**: % de requests que foram ao banco
- **Latência GET**: tempo médio de leitura do cache
- **Invalidations/min**: frequência de invalidações

### Logs

O serviço loga:
- `Cache HIT: {key}` - quando encontra no cache
- `Cache MISS: {key}` - quando não encontra
- `Cache SET: {key}` - quando salva
- `Cache INVALIDATED: {entity}:{org}` - quando invalida

## Custos Estimados

DynamoDB On-Demand (pay-per-request):
- **Leitura**: $0.25 per milhão de requests
- **Escrita**: $1.25 per milhão de requests
- **Storage**: $0.25 per GB/mês

Para uma aplicação com ~10k requests/dia:
- ~300k reads/mês = ~$0.08
- ~50k writes/mês = ~$0.06
- Storage ~1GB = $0.25
- **Total: ~$0.40/mês** 🎉

## Troubleshooting

### Cache não está funcionando
1. Verificar `CACHE_ENABLED=true`
2. Verificar permissões IAM
3. Verificar se a tabela existe
4. Checar logs de erro

### Dados desatualizados
1. Verificar se invalidação está sendo chamada
2. Checar TTL do item
3. Forçar invalidação manual se necessário

### Performance ruim
1. Verificar se índice GSI está sendo usado
2. Considerar aumentar provisioned capacity
3. Verificar tamanho dos itens (limite 400KB)
