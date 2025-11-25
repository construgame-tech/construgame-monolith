# Domain Layer

Esta pasta contém toda a lógica de negócio extraída dos microserviços, organizada seguindo Clean Architecture e Domain-Driven Design (DDD).

## Estrutura

Cada domínio segue a estrutura:

```
domain/
├── {domain-name}/
│   ├── entities/          # Modelos/tipos de domínio (regras de negócio, validações)
│   ├── repositories/      # Interfaces dos repositórios (contratos, não implementações)
│   └── use-cases/         # Casos de uso (lógica de negócio pura)
```

## Princípios

- **Programação Funcional**: Sem classes, apenas funções puras
- **Dependency Inversion**: Domain depende apenas de interfaces, não de implementações
- **Independência de Framework**: Código independente de infraestrutura (NestJS, Drizzle, etc)
- **Código em Inglês**: Nomes de variáveis e funções em inglês
- **Comentários em Português**: Documentação em português

## Domínios

### Core Business
- **game**: Jogos/competições com prêmios e KPIs
- **task**: Tarefas de jogos com progresso e checklists
- **task-update**: Submissões de progresso de tarefas
- **kaizen**: Iniciativas de melhoria contínua
- **kaizen-idea**: Sugestões de melhorias
- **project**: Projetos de construção

### Organization & People
- **organization**: Organizações/empresas
- **user**: Usuários do sistema
- **member**: Membros de organizações
- **team**: Times de trabalho

### Configuration
- **organization-config**: Configurações gerais de organizações
- **kaizen-type**: Tipos de kaizen
- **job-role**: Cargos/funções
- **kpi**: Indicadores de performance
- **prize**: Prêmios
- **sector**: Setores da organização
- **league**: Ligas competitivas

### Management
- **task-manager**: Agrupamento de tarefas
- **task-template**: Templates de tarefas
- **checklist-template**: Templates de checklists

### Points & Gamification
- **game-points**: Pontos agregados de jogos
- **task-points**: Pontos de tarefas (usuário/time/jogo)
- **kaizen-points**: Pontos de kaizen (usuário/time/jogo)

### Reporting & Planning
- **project-diary**: Diário de projetos
- **project-planning**: Planejamento de projetos (macrosteps/atividades)
- **financial-prizes**: Cálculo de prêmios financeiros

### Supporting
- **notification**: Notificações (web/push)
- **image**: Gerenciamento de imagens

## Uso com NestJS + Drizzle

Quando migrar para monolito:

1. **Schemas do Drizzle** vão para `src/infrastructure/database/schemas/`
2. **Implementações de Repositórios** vão para `src/infrastructure/repositories/`
3. **Controllers/Resolvers** chamam os use-cases do domain
4. **Domain permanece intocado** (independente de framework)
