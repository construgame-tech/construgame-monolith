# Infraestrutura - Construgame

## Scripts Disponíveis

### Cache (DynamoDB)

```bash
# Criar tabela de cache
chmod +x infra/scripts/create-cache-table.sh
./infra/scripts/create-cache-table.sh
```

## Arquitetura AWS

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Route 53   │────►│     ALB      │────►│     EC2      │    │
│  │   (DNS)      │     │ (opcional)   │     │  (Docker)    │    │
│  └──────────────┘     └──────────────┘     └──────┬───────┘    │
│                                                    │            │
│                              ┌─────────────────────┼────────┐   │
│                              │                     │        │   │
│                              ▼                     ▼        ▼   │
│                       ┌──────────┐          ┌──────────┐ ┌─────┐│
│                       │   RDS    │          │ DynamoDB │ │ S3  ││
│                       │ Postgres │          │ (Cache)  │ │     ││
│                       └──────────┘          └──────────┘ └─────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Custos Estimados (Mínimo)

| Serviço | Tipo | Custo/mês |
|---------|------|-----------|
| EC2 | t3.micro (free tier) ou t3.small | $0-15 |
| RDS | Banco adicional (já existe) | $0 |
| DynamoDB | On-Demand | ~$0.50 |
| S3 | Imagens | ~$1-5 |
| Route 53 | DNS | $0.50 |
| **Total** | | **~$2-20/mês** |

## Deploy via GitHub Actions

O deploy é feito via GitHub Actions (SSH para EC2):

1. Build da imagem Docker
2. Push para ECR (ou build direto na EC2)
3. SSH na EC2
4. Pull da nova imagem
5. Restart do container

Ver `.github/workflows/deploy.yml` (a criar).
