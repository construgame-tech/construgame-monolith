# Deprecated SQL Files Backup

Esta pasta contém arquivos SQL e migrations que foram usados durante a migração inicial do projeto
e não devem mais ser utilizados.

## Por que esses arquivos existem?

Durante o desenvolvimento inicial, algumas migrations foram criadas manualmente ou de forma 
desorganizada. Em 29/11/2025, o sistema de migrations foi reorganizado e uma migration inicial
limpa (`0000_initial_schema.sql`) foi gerada a partir do schema TypeScript atual.

## Conteúdo

- `create-kaizens-table.sql` - Script SQL manual antigo
- `create-missing-tables.sql` - Script SQL manual antigo
- `create-missing-tables-complete.sql` - Script SQL manual antigo
- `MISSING-TABLES-SUMMARY.md` - Documentação antiga
- `old_drizzle_migrations/` - Migrations antigas do Drizzle (desorganizadas)
- `old_migrations/` - Migrations antigas da pasta src/infrastructure

## Posso deletar esta pasta?

Sim, após confirmar que o banco de dados está funcionando corretamente com as novas migrations,
você pode deletar esta pasta com segurança:

```bash
rm -rf drizzle/deprecated_sql_backup
```

## Não use esses arquivos!

Esses arquivos são mantidos apenas para referência histórica. Para qualquer alteração no banco,
use o workflow correto do Drizzle:

1. Modifique o schema TypeScript em `src/infrastructure/database/schemas/`
2. Execute `pnpm drizzle-kit generate --name=sua_mudanca`
3. Execute `pnpm drizzle-kit migrate`
