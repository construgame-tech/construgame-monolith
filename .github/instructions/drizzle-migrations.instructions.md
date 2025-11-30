# Drizzle ORM Migrations - Guia de Boas Práticas

Este arquivo contém as instruções e boas práticas para gerenciamento de migrations usando Drizzle ORM neste projeto.

## Estrutura de Pastas

```
drizzle/
├── migrations/           # Migrations SQL geradas pelo Drizzle Kit
│   ├── 0000_initial_schema.sql
│   ├── 0001_add_new_feature.sql
│   └── meta/
│       ├── _journal.json      # Registro de todas as migrations
│       └── 0000_snapshot.json # Snapshot do schema em cada migration
└── deprecated_sql_backup/    # Arquivos SQL antigos/manuais (apenas para referência)
```

## Comandos Principais

### Gerar uma nova migration

```bash
# Gera migration a partir das diferenças entre schema TypeScript e última migration
pnpm drizzle-kit generate --name=nome_descritivo_da_mudanca
```

**Quando usar:** Após modificar qualquer arquivo em `src/infrastructure/database/schemas/`.

### Aplicar migrations

```bash
# Aplica todas as migrations pendentes ao banco de dados
pnpm drizzle-kit migrate
```

**Quando usar:** Após gerar uma nova migration ou após pull de alterações do repositório.

### Push direto (apenas desenvolvimento)

```bash
# Sincroniza schema diretamente com o banco, sem gerar arquivos de migration
pnpm drizzle-kit push
```

**Quando usar:** APENAS em desenvolvimento local para prototipagem rápida. NUNCA use em produção.

### Verificar consistência

```bash
# Verifica se há conflitos ou inconsistências nas migrations
pnpm drizzle-kit check
```

**Quando usar:** Antes de commit, especialmente após rebase/merge.

### Visualizar banco

```bash
# Abre o Drizzle Studio para visualizar e editar dados
pnpm drizzle-kit studio
```

## Workflow de Desenvolvimento

### 1. Criando uma nova tabela ou modificando schema

1. **Edite o schema TypeScript:**
   ```typescript
   // src/infrastructure/database/schemas/exemplo.schema.ts
   import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

   export const exemploTable = pgTable("exemplo", {
     id: uuid("id").primaryKey(),
     nome: text("nome").notNull(),
     createdAt: timestamp("created_at").defaultNow().notNull(),
   });
   ```

2. **Exporte no index:**
   ```typescript
   // src/infrastructure/database/schemas/index.ts
   export * from "./exemplo.schema";
   ```

3. **Gere a migration:**
   ```bash
   pnpm drizzle-kit generate --name=add_exemplo_table
   ```

4. **Revise o arquivo SQL gerado** em `drizzle/migrations/`

5. **Aplique a migration:**
   ```bash
   pnpm drizzle-kit migrate
   ```

### 2. Modificando coluna existente

```bash
# 1. Modifique o schema TypeScript
# 2. Gere a migration com nome descritivo
pnpm drizzle-kit generate --name=add_status_to_exemplo
# 3. Aplique
pnpm drizzle-kit migrate
```

## Como o Drizzle Gerencia Migrations

### _journal.json

O arquivo `drizzle/migrations/meta/_journal.json` é o **controle central** das migrations:

```json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "7",
      "when": 1764464909721,  // Timestamp da criação
      "tag": "0000_initial_schema",  // Nome do arquivo (sem .sql)
      "breakpoints": true
    }
  ]
}
```

**NUNCA edite este arquivo manualmente** - é gerenciado automaticamente pelo Drizzle Kit.

### Tabela de controle no banco

O Drizzle cria automaticamente a tabela `drizzle.__drizzle_migrations` com:
- `hash`: SHA256 do conteúdo do arquivo SQL
- `created_at`: Timestamp de quando foi aplicada

### Snapshots

Cada migration gera um snapshot JSON em `drizzle/migrations/meta/XXXX_snapshot.json` contendo o estado completo do schema. Isso permite ao Drizzle calcular as diferenças incrementais.

## Regras Importantes

### ✅ FAÇA

- **Sempre use nomes descritivos** nas migrations: `add_user_email`, `remove_deprecated_field`, `add_index_to_tasks`
- **Revise o SQL gerado** antes de aplicar, especialmente para operações destrutivas
- **Faça backup** antes de migrations em produção
- **Mantenha migrations pequenas e focadas** - uma mudança por migration
- **Use transações** - o Drizzle executa cada migration em uma transação
- **Teste localmente** antes de aplicar em staging/produção

### ❌ NÃO FAÇA

- **NUNCA crie arquivos SQL manualmente** na pasta migrations
- **NUNCA edite migrations já aplicadas** em produção
- **NUNCA delete arquivos de migration** do repositório após commit
- **NUNCA use `drizzle-kit push`** em produção
- **NUNCA edite** `_journal.json` ou snapshots manualmente
- **NUNCA execute SQL direto** para alterações de schema - use sempre migrations

## Resolução de Problemas

### Migration falha com "relation already exists"

Isso acontece quando o banco já tem a estrutura mas a migration não foi registrada:

```bash
# Verifique o hash da migration
node -e "const crypto = require('crypto'); const fs = require('fs'); console.log(crypto.createHash('sha256').update(fs.readFileSync('drizzle/migrations/0000_xxx.sql').toString()).digest('hex'));"

# Insira manualmente na tabela de controle (apenas em emergências)
psql -c "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ('hash_aqui', $(date +%s)000);"
```

### Conflito após merge/rebase

```bash
# 1. Verifique a consistência
pnpm drizzle-kit check

# 2. Se houver conflitos, pode ser necessário regenerar a última migration
# CUIDADO: só faça isso se a migration ainda não foi aplicada em produção
```

### Schema TypeScript desincronizado do banco

```bash
# Use introspect para gerar schema a partir do banco existente
pnpm drizzle-kit introspect

# O arquivo gerado pode ser usado como referência para corrigir o schema TypeScript
```

## Configuração

### drizzle.config.ts

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/infrastructure/database/schemas/*.schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://...",
  },
} satisfies Config;
```

### Variáveis de ambiente

- `DATABASE_URL`: Connection string do PostgreSQL

## Diferenças do Prisma

Se você vem do Prisma, aqui estão as principais diferenças:

| Prisma | Drizzle |
|--------|---------|
| `prisma migrate dev` | `drizzle-kit generate` + `drizzle-kit migrate` |
| `prisma migrate deploy` | `drizzle-kit migrate` |
| `prisma db push` | `drizzle-kit push` |
| `prisma studio` | `drizzle-kit studio` |
| `prisma migrate reset` | Drop + recreate DB + `drizzle-kit migrate` |
| Migrações automáticas | Precisa gerar explicitamente |
| Schema único (.prisma) | Múltiplos arquivos TypeScript |

## Referências

- [Drizzle Kit Docs](https://orm.drizzle.team/kit-docs/overview)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Kit Generate](https://orm.drizzle.team/kit-docs/commands#generate)
- [Drizzle Kit Migrate](https://orm.drizzle.team/kit-docs/commands#migrate)
