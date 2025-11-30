#!/bin/bash
# =============================================================================
# Teste de Business Logic - Construgame Específico
# =============================================================================
# Testa vulnerabilidades de lógica de negócio específicas do Construgame
# =============================================================================

set -e

BASE_URL="${1:-http://localhost:3000}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/business-logic-report-$DATE.md"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$REPORT_DIR"

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  TESTE DE BUSINESS LOGIC - Construgame${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Token de teste (precisa ser válido)
TOKEN_FILE="security-tests/tokens/user-a.token"
if [ -f "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE" | tr -d '\n')
    AUTH_HEADER="Authorization: Bearer $TOKEN"
else
    echo -e "${YELLOW}⚠ Token não encontrado em $TOKEN_FILE${NC}"
    echo -e "${YELLOW}  Testes serão limitados a endpoints públicos${NC}"
    AUTH_HEADER=""
fi

# Inicializa relatório
cat > "$REPORT_FILE" << EOF
# 🎮 Relatório de Teste Business Logic - Construgame

**Data:** $(date)
**Target:** $BASE_URL

---

## Checklist de Vulnerabilidades de Lógica de Negócio

Estas são vulnerabilidades específicas do domínio Construgame que um pentester profissional testaria:

EOF

echo -e "\n${BLUE}[1/8] MANIPULAÇÃO DE PONTOS${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 1. Manipulação de Pontos

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  Testes que requerem autenticação:"
echo -e "  ${YELLOW}⚠${NC} Pontos negativos: Criar task/kaizen com pontos negativos"
echo -e "  ${YELLOW}⚠${NC} Overflow: Usar valores muito grandes (MAX_INT + 1)"
echo -e "  ${YELLOW}⚠${NC} Decimal: Usar 999.99 quando espera inteiro"
echo -e "  ${YELLOW}⚠${NC} Alterar pontos após aprovação"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Pontos negativos | Criar task com points: -1000 | ⏳ Manual |
| Integer overflow | Usar points: 9999999999999 | ⏳ Manual |
| Float injection | Usar points: 99.99 | ⏳ Manual |
| Retroactive change | Alterar pontos de task já aprovada | ⏳ Manual |

EOF

echo -e "\n${BLUE}[2/8] BYPASS DE FLUXO DE APROVAÇÃO${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 2. Bypass de Fluxo de Aprovação

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  Fluxo esperado: PENDING → APPROVED → COMPLETED"
echo -e "  ${YELLOW}⚠${NC} Testar: PENDING → COMPLETED (pular aprovação)"
echo -e "  ${YELLOW}⚠${NC} Testar: Auto-aprovar próprios items"
echo -e "  ${YELLOW}⚠${NC} Testar: Aprovar como user (não admin)"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Skip approval | Mudar status direto para COMPLETED | ⏳ Manual |
| Self-approve | Aprovar próprio kaizen/task | ⏳ Manual |
| Role bypass | Aprovar sem role de admin | ⏳ Manual |
| Double approve | Aprovar mesmo item duas vezes | ⏳ Manual |

EOF

echo -e "\n${BLUE}[3/8] MANIPULAÇÃO DE RANKING${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 3. Manipulação de Ranking

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  ${YELLOW}⚠${NC} Testar: Criar muitas tasks pequenas vs poucas grandes"
echo -e "  ${YELLOW}⚠${NC} Testar: Manipular datas para ganhar mais pontos"
echo -e "  ${YELLOW}⚠${NC} Testar: Race condition em pontuação simultânea"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Task spam | Muitas tasks de 1 ponto | ⏳ Manual |
| Date manipulation | Criar tasks no passado | ⏳ Manual |
| Race condition | 10 requests simultâneos | ⏳ Manual |
| Negative score | Reduzir score de outros | ⏳ Manual |

EOF

echo -e "\n${BLUE}[4/8] VAZAMENTO DE DADOS ENTRE PROJETOS${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 4. Vazamento de Dados Entre Projetos

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  ${YELLOW}⚠${NC} Testar: Acessar tasks de projeto que não participa"
echo -e "  ${YELLOW}⚠${NC} Testar: Ver ranking de projeto privado"
echo -e "  ${YELLOW}⚠${NC} Testar: Listar membros de outro projeto"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Cross-project task | GET /tasks?projectId=outro | ⏳ Manual |
| Private ranking | GET /rankings?projectId=outro | ⏳ Manual |
| Member list | GET /members?projectId=outro | ⏳ Manual |

EOF

echo -e "\n${BLUE}[5/8] MANIPULAÇÃO DE DATAS${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 5. Manipulação de Datas

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  ${YELLOW}⚠${NC} Testar: Criar task com data no passado"
echo -e "  ${YELLOW}⚠${NC} Testar: Estender deadline infinitamente"
echo -e "  ${YELLOW}⚠${NC} Testar: Marcar task como concluída antes do início"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Past creation | createdAt: 2020-01-01 | ⏳ Manual |
| Future deadline | deadline: 2099-12-31 | ⏳ Manual |
| Invalid range | startDate > endDate | ⏳ Manual |
| Timezone abuse | Usar timezone diferente | ⏳ Manual |

EOF

echo -e "\n${BLUE}[6/8] LIMITES DE RECURSOS${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 6. Limites de Recursos

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  ${YELLOW}⚠${NC} Testar: Criar mais games que o limite"
echo -e "  ${YELLOW}⚠${NC} Testar: Adicionar mais membros que permitido"
echo -e "  ${YELLOW}⚠${NC} Testar: Upload de arquivo muito grande"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Game limit | Criar games além do plano | ⏳ Manual |
| Member limit | Adicionar membros além do plano | ⏳ Manual |
| File size | Upload de 100MB | ⏳ Manual |
| Task spam | Criar 10000 tasks | ⏳ Manual |

EOF

echo -e "\n${BLUE}[7/8] PRIZE/REWARD MANIPULATION${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 7. Manipulação de Prêmios

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  ${YELLOW}⚠${NC} Testar: Resgatar prêmio sem pontos suficientes"
echo -e "  ${YELLOW}⚠${NC} Testar: Resgatar mesmo prêmio múltiplas vezes"
echo -e "  ${YELLOW}⚠${NC} Testar: Alterar valor do prêmio após criação"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Insufficient points | Resgatar com pontos insuficientes | ⏳ Manual |
| Double redemption | Resgatar prêmio duas vezes | ⏳ Manual |
| Prize value change | Alterar valor do prêmio | ⏳ Manual |
| Race condition | 2 requests simultâneos | ⏳ Manual |

EOF

echo -e "\n${BLUE}[8/8] NOTIFICAÇÕES & COMUNICAÇÃO${NC}"
echo -e "-------------------------------------------"

cat >> "$REPORT_FILE" << 'EOF'

### 8. Notificações & Comunicação

| Teste | Descrição | Status |
|-------|-----------|--------|
EOF

echo -e "  ${YELLOW}⚠${NC} Testar: Enviar notificação para user de outra org"
echo -e "  ${YELLOW}⚠${NC} Testar: Spam de notificações"
echo -e "  ${YELLOW}⚠${NC} Testar: XSS em conteúdo de notificação"
echo ""

cat >> "$REPORT_FILE" << 'EOF'
| Cross-org notify | Notificar user de outra org | ⏳ Manual |
| Notification spam | Enviar 1000 notificações | ⏳ Manual |
| XSS in content | <script>alert(1)</script> | ⏳ Manual |

EOF

# =============================================================================
# RESUMO E PRÓXIMOS PASSOS
# =============================================================================

cat >> "$REPORT_FILE" << 'EOF'

---

## Resumo

Estes testes de business logic requerem:
1. **Tokens JWT válidos** de usuários com diferentes roles
2. **Conhecimento do domínio** (fluxos de aprovação, regras de pontos)
3. **Ambiente de teste** isolado para não corromper dados

## Script de Teste Automatizado

Para automatizar estes testes, execute:

```bash
# 1. Configurar usuários de teste
./security-tests/scripts/setup-pentest-users.sh

# 2. Executar testes BOLA
./security-tests/scripts/bola-test.sh

# 3. Executar testes JWT
./security-tests/scripts/jwt-test.sh

# 4. Testes manuais via Postman/Insomnia
```

## Exemplo de Teste Manual

```bash
# Criar task com pontos negativos
curl -X POST $BASE_URL/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "...",
    "projectId": "...",
    "name": "Task Maliciosa",
    "points": -1000
  }'

# Esperado: 400 Bad Request
# Vulnerável: 201 Created
```

---

## Ferramentas Recomendadas

1. **Burp Suite Pro** - Interceptar e modificar requests
2. **Postman/Insomnia** - Testar endpoints manualmente  
3. **OWASP ZAP** - Scan automatizado
4. **sqlmap** - SQL injection automatizado
5. **jwt_tool** - Manipulação avançada de JWT

EOF

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}  CHECKLIST GERADO${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Este script gera um checklist para testes manuais."
echo -e "Os testes de business logic geralmente requerem:"
echo -e "  1. Conhecimento profundo do sistema"
echo -e "  2. Tokens válidos de diferentes roles"
echo -e "  3. Ambiente de teste isolado"
echo ""
echo -e "Relatório salvo em: ${GREEN}$REPORT_FILE${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "  1. Revise o checklist em $REPORT_FILE"
echo -e "  2. Execute testes manuais com Burp Suite ou Postman"
echo -e "  3. Documente findings no mesmo arquivo"
