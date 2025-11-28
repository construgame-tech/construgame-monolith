import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  QueryCommand,
  BatchWriteItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Estrutura da tabela DynamoDB:
 * 
 * Table: construgame-cache
 * - PK (Partition Key): cacheKey (ex: "games:org-123")
 * - SK (Sort Key): sortKey (ex: "list" ou "game-456")
 * - data: JSON stringified
 * - ttl: Unix timestamp para expiração automática
 * - createdAt: timestamp de criação
 * 
 * GSI: gsi-invalidation
 * - PK: entityType (ex: "games")
 * - SK: organizationId (ex: "org-123")
 * → Permite invalidar todos os caches de "games" de uma org
 */

export interface CacheEntry<T = unknown> {
  data: T;
  cachedAt: number;
  ttl: number;
}

export interface CacheOptions {
  /** TTL em segundos (default: 1 hora) */
  ttlSeconds?: number;
  /** Tags para invalidação em grupo */
  tags?: string[];
}

const DEFAULT_TTL_SECONDS = 3600; // 1 hora
const TABLE_NAME = 'construgame-cache';

@Injectable()
export class DynamoCacheService implements OnModuleInit {
  private readonly logger = new Logger(DynamoCacheService.name);
  private client: DynamoDBClient;
  private tableName: string;
  private enabled: boolean;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    this.tableName = this.configService.get<string>('CACHE_TABLE_NAME', TABLE_NAME);
    this.enabled = this.configService.get<string>('CACHE_ENABLED', 'true') === 'true';

    this.client = new DynamoDBClient({ region });
    this.logger.log(`DynamoDB Cache initialized - Table: ${this.tableName}, Enabled: ${this.enabled}`);
  }

  /**
   * Gera a chave de cache padronizada
   * @example buildKey('games', 'org-123', 'list') → "games:org-123:list"
   */
  buildKey(entityType: string, organizationId: string, identifier: string = 'list'): string {
    return `${entityType}:${organizationId}:${identifier}`;
  }

  /**
   * Busca item no cache
   * @returns null se não existir ou expirado
   */
  async get<T>(cacheKey: string): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const [pk, sk] = this.parseKey(cacheKey);

      const result = await this.client.send(
        new GetItemCommand({
          TableName: this.tableName,
          Key: marshall({ pk, sk }),
        })
      );

      if (!result.Item) {
        this.logger.debug(`Cache MISS: ${cacheKey}`);
        return null;
      }

      const item = unmarshall(result.Item);

      // Verificar TTL (DynamoDB pode demorar para deletar)
      if (item.ttl && item.ttl < Math.floor(Date.now() / 1000)) {
        this.logger.debug(`Cache EXPIRED: ${cacheKey}`);
        return null;
      }

      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return JSON.parse(item.data) as T;
    } catch (error) {
      this.logger.error(`Cache GET error: ${cacheKey}`, error);
      return null; // Falha silenciosa - continua sem cache
    }
  }

  /**
   * Salva item no cache
   */
  async set<T>(cacheKey: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.enabled) return;

    try {
      const [pk, sk] = this.parseKey(cacheKey);
      const ttlSeconds = options.ttlSeconds ?? DEFAULT_TTL_SECONDS;
      const ttl = Math.floor(Date.now() / 1000) + ttlSeconds;

      // Extrair entityType e organizationId para o GSI
      const [entityType, organizationId] = cacheKey.split(':');

      await this.client.send(
        new PutItemCommand({
          TableName: this.tableName,
          Item: marshall({
            pk,
            sk,
            data: JSON.stringify(data),
            ttl,
            entityType,
            organizationId,
            tags: options.tags ?? [],
            createdAt: new Date().toISOString(),
          }),
        })
      );

      this.logger.debug(`Cache SET: ${cacheKey} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error: ${cacheKey}`, error);
      // Falha silenciosa
    }
  }

  /**
   * Remove item específico do cache
   */
  async delete(cacheKey: string): Promise<void> {
    if (!this.enabled) return;

    try {
      const [pk, sk] = this.parseKey(cacheKey);

      await this.client.send(
        new DeleteItemCommand({
          TableName: this.tableName,
          Key: marshall({ pk, sk }),
        })
      );

      this.logger.debug(`Cache DELETE: ${cacheKey}`);
    } catch (error) {
      this.logger.error(`Cache DELETE error: ${cacheKey}`, error);
    }
  }

  /**
   * Invalida todos os caches de um entityType para uma organização
   * @example invalidateByEntity('games', 'org-123') → remove todos os caches de games da org
   */
  async invalidateByEntity(entityType: string, organizationId: string): Promise<void> {
    if (!this.enabled) return;

    try {
      // Query pelo GSI para encontrar todos os itens
      const result = await this.client.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'gsi-invalidation',
          KeyConditionExpression: 'entityType = :et AND organizationId = :oid',
          ExpressionAttributeValues: marshall({
            ':et': entityType,
            ':oid': organizationId,
          }),
        })
      );

      if (!result.Items || result.Items.length === 0) {
        this.logger.debug(`No cache to invalidate for ${entityType}:${organizationId}`);
        return;
      }

      // Batch delete (máximo 25 por batch)
      const items = result.Items.map((item) => unmarshall(item) as { pk: string; sk: string });
      const batches = this.chunkArray(items, 25);

      for (const batch of batches) {
        await this.client.send(
          new BatchWriteItemCommand({
            RequestItems: {
              [this.tableName]: batch.map((item) => ({
                DeleteRequest: {
                  Key: marshall({ pk: item.pk, sk: item.sk }),
                },
              })),
            },
          })
        );
      }

      this.logger.log(`Cache INVALIDATED: ${entityType}:${organizationId} (${items.length} items)`);
    } catch (error) {
      this.logger.error(`Cache INVALIDATE error: ${entityType}:${organizationId}`, error);
    }
  }

  /**
   * Wrapper para executar com cache
   * @example 
   * const games = await cache.getOrSet(
   *   'games:org-123:list',
   *   () => this.repository.findByOrganizationId(orgId),
   *   { ttlSeconds: 3600 }
   * );
   */
  async getOrSet<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Tentar buscar do cache
    const cached = await this.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - buscar do banco
    const data = await fetchFn();

    // Salvar no cache (async, não bloqueia)
    this.set(cacheKey, data, options).catch(() => {});

    return data;
  }

  // ========== Helpers ==========

  private parseKey(cacheKey: string): [string, string] {
    // pk = primeiras duas partes, sk = resto
    const parts = cacheKey.split(':');
    const pk = parts.slice(0, 2).join(':');
    const sk = parts.slice(2).join(':') || 'default';
    return [pk, sk];
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
