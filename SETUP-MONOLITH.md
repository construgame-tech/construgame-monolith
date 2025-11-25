# 🚀 Setup Rápido - Monolito Construgame

Guia passo-a-passo para rodar o monolito localmente.

## ⚡ Setup em 5 Minutos

### 1. Preparar arquivos de configuração

```bash
# Copiar package.json e tsconfig
cp package-monolith.json package.json
cp tsconfig-monolith.json tsconfig.json

# Copiar .env
cp .env.monolith.example .env
```

### 2. Instalar dependências

```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install
```

### 3. Subir banco de dados

```bash
# Subir PostgreSQL com Docker
docker-compose -f docker-compose-monolith.yml up -d postgres

# Aguardar estar pronto (5-10 segundos)
sleep 10
```

### 4. Rodar migrations

```bash
# Executar migrations do banco
npm run db:migrate
```

### 5. Iniciar aplicação

```bash
# Modo desenvolvimento
npm run start:dev
```

### 6. Testar 🎉

Abra seu navegador em:

- **Swagger UI**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🐳 Usando Docker Compose (Recomendado)

Tudo em um comando:

```bash
# Subir API + PostgreSQL juntos
docker-compose -f docker-compose-monolith.yml up

# Ou em background
docker-compose -f docker-compose-monolith.yml up -d

# Ver logs
docker-compose -f docker-compose-monolith.yml logs -f api
```

Aguarde alguns segundos e acesse http://localhost:3000/docs

## 🧪 Testando a API

### Via Swagger (Mais Fácil)

1. Acesse http://localhost:3000/docs
2. Clique em qualquer endpoint (ex: `POST /api/v1/games`)
3. Clique em "Try it out"
4. Preencha os dados de exemplo
5. Clique em "Execute"

### Via cURL

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Criar um game
curl -X POST http://localhost:3000/api/v1/games \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Meu Primeiro Jogo",
    "status": "ACTIVE"
  }'

# Listar games
curl http://localhost:3000/api/v1/games?organizationId=550e8400-e29b-41d4-a716-446655440000
```

### Via Postman/Insomnia

Importe o endpoint base: `http://localhost:3000/api/v1`

Ou importe a spec do Swagger: http://localhost:3000/docs-json

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Iniciar em modo watch (hot reload)
npm run start:dev

# Ver logs formatados
npm run start:dev | pino-pretty

# Build para produção
npm run build

# Rodar build de produção
npm run start:prod
```

### Database

```bash
# Abrir Drizzle Studio (GUI para o banco)
npm run db:studio
# Acesse http://localhost:4983

# Gerar nova migration (após alterar schemas)
npm run db:generate

# Ver status das migrations
npm run db:migrate
```

### Docker

```bash
# Ver status dos containers
docker-compose -f docker-compose-monolith.yml ps

# Parar tudo
docker-compose -f docker-compose-monolith.yml down

# Reiniciar apenas a API
docker-compose -f docker-compose-monolith.yml restart api

# Rebuild da API
docker-compose -f docker-compose-monolith.yml up -d --build api

# Limpar tudo (CUIDADO: apaga dados!)
docker-compose -f docker-compose-monolith.yml down -v
```

## 🔍 Verificando se está funcionando

### 1. Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "database": "connected"
}
```

### 2. API Info

```bash
curl http://localhost:3000/api/v1/info
```

Resposta esperada:
```json
{
  "name": "Construgame API Monolith",
  "version": "1.0.0",
  "description": "NestJS + Drizzle ORM + PostgreSQL"
}
```

### 3. Swagger UI

Abra http://localhost:3000/docs

Deve ver a documentação completa da API.

## ❌ Troubleshooting

### Erro: "Cannot connect to database"

```bash
# Verificar se Postgres está rodando
docker-compose -f docker-compose-monolith.yml ps postgres

# Se não estiver, subir novamente
docker-compose -f docker-compose-monolith.yml up -d postgres

# Verificar logs
docker-compose -f docker-compose-monolith.yml logs postgres
```

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar o processo
kill -9 <PID>

# Ou usar outra porta no .env
echo "PORT=3001" >> .env
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Ou com pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Migration failed"

```bash
# Dropar banco e recriar
docker-compose -f docker-compose-monolith.yml down postgres
docker volume rm construgame-api_postgres_data
docker-compose -f docker-compose-monolith.yml up -d postgres

# Aguardar 10 segundos
sleep 10

# Rodar migrations novamente
npm run db:migrate
```

## 📊 Estrutura do Banco de Dados

Após as migrations, você terá estas tabelas:

- `games` - Jogos/competições
- `tasks` - Tarefas
- `organizations` - Organizações
- `users` - Usuários
- (mais tabelas conforme implementamos módulos)

### Conectar ao banco manualmente

```bash
# Usando psql
docker exec -it construgame-postgres psql -U construgame -d construgame

# Ver tabelas
\dt

# Query exemplo
SELECT * FROM games LIMIT 10;
```

### Usando Drizzle Studio

```bash
npm run db:studio
```

Acesse http://localhost:4983 para uma GUI bonita do banco.

## 🎯 Próximos Passos

Agora que está rodando:

1. ✅ Testar endpoints do Game no Swagger
2. ✅ Criar alguns games de teste
3. ✅ Explorar o código em `src/modules/game/`
4. ⬜ Implementar outros módulos (Task, User, etc)
5. ⬜ Adicionar autenticação JWT
6. ⬜ Criar testes

## 📚 Recursos

- **Documentação NestJS**: https://docs.nestjs.com
- **Documentação Drizzle**: https://orm.drizzle.team
- **Documentação Swagger**: https://swagger.io/docs/

## 💬 Dúvidas?

Se algo não funcionar, verifique:

1. Docker está rodando?
2. Postgres está healthy? (`docker-compose ps`)
3. Migrations rodaram? (`npm run db:migrate`)
4. Porta 3000 está livre?
5. Node.js 20+ instalado?

---

**Boa sorte! 🚀**
