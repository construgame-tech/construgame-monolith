// Domain Layer - Centralized Business Logic
// Exporta todos os domínios do sistema
//
// Organizado seguindo Clean Architecture e DDD
// - Programação funcional (sem classes)
// - Código em inglês, comentários em português
// - Independente de framework/infraestrutura

// === Core Business Domains ===

// Game: Jogos/competições com prêmios e KPIs
export * as Game from "./game";
// Kaizen: Iniciativas de melhoria contínua
export * as Kaizen from "./kaizen";
// Project: Projetos de construção
export * as Project from "./project";
// Task: Tarefas de jogos com progresso e checklists
export * as Task from "./task";
// Task Update: Submissões de progresso de tarefas
export * as TaskUpdate from "./task-update";

// === Organization & People ===

// Member: Membros de organizações
export * as Member from "./member";
// Organization: Organizações/empresas
export * as Organization from "./organization";
// Team: Times de trabalho
export * as Team from "./team";
// User: Usuários do sistema
export * as User from "./user";

// === Configuration Domains ===

// Job Role: Cargos/funções
export * as JobRole from "./job-role";
// Kaizen Idea: Sugestões de melhorias
export * as KaizenIdea from "./kaizen-idea";
// Kaizen Type: Tipos/categorias de kaizen
export * as KaizenType from "./kaizen-type";
// KPI: Indicadores de performance
export * as KPI from "./kpi";
// League: Ligas competitivas
export * as League from "./league";
// Organization Config: Configurações gerais de organizações, prêmios, setores
export * as OrganizationConfig from "./organization-config";
// Task Manager: Agrupamento de tarefas
export * as TaskManager from "./task-manager";
// Task Template: Templates de tarefas reutilizáveis
export * as TaskTemplate from "./task-template";

// === Points & Gamification ===

// Game Points: Pontos totais agregados de games
export * as GamePoints from "./game-points";

// Kaizen Points: Pontos de kaizen (user/team/game)
export * as KaizenPoints from "./kaizen-points";
// Task Points: Pontos de tarefas (user/team/game)
export * as TaskPoints from "./task-points";

// === Planning & Financial ===

// Financial Prizes: Cálculo de prêmios financeiros
export * as FinancialPrizes from "./financial-prizes";
// Project Planning: Planejamento de projetos (macrosteps, atividades)
export * as ProjectPlanning from "./project-planning";

// === Supporting Domains ===

// Image: Gerenciamento de uploads de imagens
export * as Image from "./image";
// Notification: Notificações (web/push)
export * as Notification from "./notification";
// Project Diary: Diário de projetos
export * as ProjectDiary from "./project-diary";
