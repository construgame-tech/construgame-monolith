#!/bin/bash
# Script para criar a tabela de cache no DynamoDB
# Execute: ./infra/scripts/create-cache-table.sh

set -e

TABLE_NAME="${CACHE_TABLE_NAME:-construgame-cache}"
REGION="${AWS_REGION:-us-east-1}"

echo "🚀 Criando tabela DynamoDB: $TABLE_NAME"

# Criar tabela
aws dynamodb create-table \
  --table-name "$TABLE_NAME" \
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
      "Projection": {"ProjectionType": "KEYS_ONLY"}
    }]' \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" \
  --tags \
    Key=Project,Value=construgame \
    Key=Environment,Value=production \
    Key=ManagedBy,Value=script

echo "⏳ Aguardando tabela ficar ativa..."
aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"

echo "⏰ Habilitando TTL..."
aws dynamodb update-time-to-live \
  --table-name "$TABLE_NAME" \
  --time-to-live-specification Enabled=true,AttributeName=ttl \
  --region "$REGION"

echo "✅ Tabela $TABLE_NAME criada com sucesso!"
echo ""
echo "📋 Configuração:"
echo "   - Billing: On-Demand (pay-per-request)"
echo "   - TTL: Habilitado (atributo: ttl)"
echo "   - GSI: gsi-invalidation (para invalidação em massa)"
