import { SetMetadata } from '@nestjs/common';

/**
 * Decorator para marcar métodos que invalidam cache
 * 
 * @example
 * @InvalidateCache('games')
 * async create(dto: CreateGameDto) { ... }
 * 
 * @example
 * @InvalidateCache(['games', 'projects']) // invalida múltiplas entidades
 * async updateProject(...) { ... }
 */
export const INVALIDATE_CACHE_KEY = 'invalidate_cache';

export const InvalidateCache = (...entityTypes: string[]) =>
  SetMetadata(INVALIDATE_CACHE_KEY, entityTypes);

/**
 * Constantes para os tipos de entidade (evita typos)
 */
export const CacheEntityTypes = {
  GAMES: 'games',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  TASK_UPDATES: 'task-updates',
  MEMBERS: 'members',
  TEAMS: 'teams',
  KAIZENS: 'kaizens',
  KAIZEN_IDEAS: 'kaizen-ideas',
  LEAGUES: 'leagues',
  KPIS: 'kpis',
  NOTIFICATIONS: 'notifications',
  ORGANIZATION_CONFIG: 'organization-config',
  JOB_ROLES: 'job-roles',
  KAIZEN_TYPES: 'kaizen-types',
  PROJECT_DIARY: 'project-diary',
  PROJECT_PLANNING: 'project-planning',
  TASK_TEMPLATES: 'task-templates',
  FINANCIAL_PRIZES: 'financial-prizes',
} as const;

export type CacheEntityType = (typeof CacheEntityTypes)[keyof typeof CacheEntityTypes];
