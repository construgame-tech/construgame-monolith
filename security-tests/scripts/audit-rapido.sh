#!/bin/bash
# =============================================================================
# Audit Rápido - Consolidado
# =============================================================================
# Roda todos os testes de segurança importantes em sequência
# Timeout de 2 minutos por teste
# =============================================================================

set -e

BASE_URL="${1:-http://localhost:3000}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)
FINAL_REPORT="$REPORT_DIR/audit-consolidado-$DATE.md"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$REPORT_DIR"

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       AUDIT DE SEGURANÇA CONSOLIDADO - Construgame API       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Target: ${YELLOW}$BASE_URL${NC}"
echo -e "Report: ${YELLOW}$FINAL_REPORT${NC}"
echo ""

# Inicializa relatório
cat > "$FINAL_REPORT" << EOF
# 🔒 Audit de Segurança Consolidado - Construgame API

**Data:** $(date)
**Target:** $BASE_URL

---

## Sumário de Testes

EOF

# Contadores globais
TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_WARN=0

# =============================================================================
# 1. TESTE DE CONECTIVIDADE
# =============================================================================
echo -e "${BLUE}[1/6] Verificando conectividade...${NC}"
if curl -s --max-time 5 "$BASE_URL/api/v1/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} API acessível"
    ((TOTAL_PASS++))
else
    echo -e "  ${RED}✗${NC} API não responde!"
    echo "❌ API não acessível em $BASE_URL" >> "$FINAL_REPORT"
    exit 1
fi

# =============================================================================
# 2. HEADERS DE SEGURANÇA
# =============================================================================
echo -e "\n${BLUE}[2/6] Headers de Segurança${NC}"
echo -e "-------------------------------------------"

HEADERS=$(curl -sI --max-time 5 "$BASE_URL/api/v1/health" 2>/dev/null)

check_header() {
    local name=$1
    local pattern=$2
    if echo "$HEADERS" | grep -qi "$pattern"; then
        echo -e "  ${GREEN}✓${NC} $name"
        ((TOTAL_PASS++))
        echo "✅ $name presente" >> "$FINAL_REPORT"
    else
        echo -e "  ${RED}✗${NC} $name ausente"
        ((TOTAL_FAIL++))
        echo "❌ $name ausente" >> "$FINAL_REPORT"
    fi
}

echo "" >> "$FINAL_REPORT"
echo "### Headers de Segurança" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

check_header "X-Content-Type-Options" "x-content-type-options"
check_header "X-Frame-Options" "x-frame-options"
check_header "Strict-Transport-Security" "strict-transport-security"
check_header "Content-Security-Policy" "content-security-policy"
check_header "Cache-Control" "cache-control"

# X-Powered-By NÃO deve estar presente
if echo "$HEADERS" | grep -qi "x-powered-by"; then
    echo -e "  ${RED}✗${NC} X-Powered-By exposto!"
    ((TOTAL_FAIL++))
    echo "❌ X-Powered-By exposto (information disclosure)" >> "$FINAL_REPORT"
else
    echo -e "  ${GREEN}✓${NC} X-Powered-By oculto"
    ((TOTAL_PASS++))
    echo "✅ X-Powered-By oculto" >> "$FINAL_REPORT"
fi

# =============================================================================
# 3. AUTENTICAÇÃO
# =============================================================================
echo -e "\n${BLUE}[3/6] Autenticação${NC}"
echo -e "-------------------------------------------"

echo "" >> "$FINAL_REPORT"
echo "### Autenticação" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Endpoint público deve retornar 200
PUB_RESP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/api/v1/health" 2>/dev/null)
if [ "$PUB_RESP" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} /health público (200)"
    ((TOTAL_PASS++))
    echo "✅ /health público (esperado)" >> "$FINAL_REPORT"
fi

# Endpoint protegido deve retornar 401
PROT_RESP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/api/v1/organization" 2>/dev/null)
if [ "$PROT_RESP" = "401" ]; then
    echo -e "  ${GREEN}✓${NC} /organization protegido (401)"
    ((TOTAL_PASS++))
    echo "✅ /organization requer autenticação (401)" >> "$FINAL_REPORT"
else
    echo -e "  ${RED}✗${NC} /organization retornou $PROT_RESP (esperado 401)"
    ((TOTAL_FAIL++))
    echo "❌ /organization retornou $PROT_RESP ao invés de 401" >> "$FINAL_REPORT"
fi

# Testar mais endpoints protegidos
for endpoint in "/api/v1/games" "/api/v1/tasks" "/api/v1/users"; do
    resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL$endpoint" 2>/dev/null)
    if [ "$resp" = "401" ]; then
        echo -e "  ${GREEN}✓${NC} $endpoint protegido (401)"
        ((TOTAL_PASS++))
    else
        echo -e "  ${RED}✗${NC} $endpoint retornou $resp"
        ((TOTAL_FAIL++))
        echo "❌ $endpoint retornou $resp (esperado 401)" >> "$FINAL_REPORT"
    fi
done

# =============================================================================
# 4. JWT MANIPULATION
# =============================================================================
echo -e "\n${BLUE}[4/6] JWT Security${NC}"
echo -e "-------------------------------------------"

echo "" >> "$FINAL_REPORT"
echo "### JWT Security" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# JWT none algorithm
NONE_JWT="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiJ9."
resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "Authorization: Bearer $NONE_JWT" \
    "$BASE_URL/api/v1/organization" 2>/dev/null)
if [ "$resp" = "401" ]; then
    echo -e "  ${GREEN}✓${NC} JWT 'none' algorithm rejeitado"
    ((TOTAL_PASS++))
    echo "✅ JWT 'none' algorithm rejeitado" >> "$FINAL_REPORT"
else
    echo -e "  ${RED}✗${NC} JWT 'none' aceito! (HTTP $resp)"
    ((TOTAL_FAIL++))
    echo "❌ CRÍTICO: JWT 'none' algorithm aceito" >> "$FINAL_REPORT"
fi

# JWT expirado
EXPIRED_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxfQ.invalid"
resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "Authorization: Bearer $EXPIRED_JWT" \
    "$BASE_URL/api/v1/organization" 2>/dev/null)
if [ "$resp" = "401" ]; then
    echo -e "  ${GREEN}✓${NC} JWT expirado rejeitado"
    ((TOTAL_PASS++))
    echo "✅ JWT expirado rejeitado" >> "$FINAL_REPORT"
else
    echo -e "  ${RED}✗${NC} JWT expirado aceito! (HTTP $resp)"
    ((TOTAL_FAIL++))
    echo "❌ CRÍTICO: JWT expirado aceito" >> "$FINAL_REPORT"
fi

# JWT malformado
resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -H "Authorization: Bearer invalid.jwt.token" \
    "$BASE_URL/api/v1/organization" 2>/dev/null)
if [ "$resp" = "401" ]; then
    echo -e "  ${GREEN}✓${NC} JWT malformado rejeitado"
    ((TOTAL_PASS++))
    echo "✅ JWT malformado rejeitado" >> "$FINAL_REPORT"
else
    echo -e "  ${RED}✗${NC} JWT malformado aceito! (HTTP $resp)"
    ((TOTAL_FAIL++))
fi

# =============================================================================
# 5. SQL INJECTION
# =============================================================================
echo -e "\n${BLUE}[5/6] SQL Injection${NC}"
echo -e "-------------------------------------------"

echo "" >> "$FINAL_REPORT"
echo "### SQL Injection" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

SQLI_PAYLOADS=(
    "' OR '1'='1"
    "1; DROP TABLE users--"
    "admin'--"
)

sqli_found=false
for payload in "${SQLI_PAYLOADS[@]}"; do
    encoded=$(echo -n "$payload" | jq -sRr @uri 2>/dev/null || echo "$payload")
    resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
        "$BASE_URL/api/v1/health?id=$encoded" 2>/dev/null)
    
    if [ "$resp" = "500" ]; then
        echo -e "  ${RED}✗${NC} Possível SQLi com: $payload"
        ((TOTAL_FAIL++))
        sqli_found=true
        echo "❌ Possível SQLi: $payload causou erro 500" >> "$FINAL_REPORT"
    fi
done

if [ "$sqli_found" = false ]; then
    echo -e "  ${GREEN}✓${NC} Nenhum SQLi detectado"
    ((TOTAL_PASS++))
    echo "✅ Nenhum SQL Injection detectado" >> "$FINAL_REPORT"
fi

# =============================================================================
# 6. RATE LIMITING
# =============================================================================
echo -e "\n${BLUE}[6/6] Rate Limiting${NC}"
echo -e "-------------------------------------------"

echo "" >> "$FINAL_REPORT"
echo "### Rate Limiting" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

rate_hit=false
for i in {1..30}; do
    resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 \
        "$BASE_URL/api/v1/health" 2>/dev/null)
    if [ "$resp" = "429" ]; then
        echo -e "  ${GREEN}✓${NC} Rate limiting ativo após $i requests"
        ((TOTAL_PASS++))
        rate_hit=true
        echo "✅ Rate limiting ativo (429 após $i requests)" >> "$FINAL_REPORT"
        break
    fi
done

if [ "$rate_hit" = false ]; then
    echo -e "  ${YELLOW}⚠${NC} Rate limiting não detectado em 30 requests"
    ((TOTAL_WARN++))
    echo "⚠️ Rate limiting pode estar muito alto ou desativado" >> "$FINAL_REPORT"
fi

# =============================================================================
# RESUMO FINAL
# =============================================================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                      RESUMO FINAL                            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✓ Passou:${NC}    $TOTAL_PASS"
echo -e "  ${YELLOW}⚠ Avisos:${NC}    $TOTAL_WARN"
echo -e "  ${RED}✗ Falhou:${NC}    $TOTAL_FAIL"
echo ""

# Adicionar resumo ao relatório
cat >> "$FINAL_REPORT" << EOF

---

## Resumo

| Resultado | Quantidade |
|-----------|------------|
| ✅ Passou | $TOTAL_PASS |
| ⚠️ Avisos | $TOTAL_WARN |
| ❌ Falhou | $TOTAL_FAIL |

---

## Próximos Passos

1. Corrigir todas as falhas (❌) imediatamente
2. Avaliar avisos (⚠️) para produção
3. Executar testes BOLA com usuários reais
4. Revisar business logic manualmente

---

*Gerado automaticamente por audit-rapido.sh*
EOF

echo -e "Relatório: ${GREEN}$FINAL_REPORT${NC}"
echo ""

if [ "$TOTAL_FAIL" -gt 0 ]; then
    echo -e "${RED}⚠️  FALHAS ENCONTRADAS! Revise o relatório.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Nenhuma falha crítica encontrada.${NC}"
    exit 0
fi
