#!/bin/bash
# =============================================================================
# Smoke Security Test - Teste rápido de segurança (~5 minutos)
# =============================================================================

set -e

TARGET_URL="${1:-http://localhost:3000}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Smoke Security Test - Construgame API${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Target: ${YELLOW}$TARGET_URL${NC}"
echo ""

# Criar diretório de reports
mkdir -p "$REPORT_DIR"

# -----------------------------------------------------------------------------
# 1. Verificar headers de segurança
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/5] Verificando Headers de Segurança...${NC}"

HEADERS_REPORT="$REPORT_DIR/headers-$DATE.txt"

check_header() {
    local header=$1
    local url=$2
    if curl -sI "$url" | grep -qi "$header"; then
        echo -e "  ${GREEN}✓${NC} $header presente"
        return 0
    else
        echo -e "  ${RED}✗${NC} $header AUSENTE"
        return 1
    fi
}

{
    echo "Security Headers Check - $TARGET_URL"
    echo "Date: $(date)"
    echo "========================================"
    echo ""
    curl -sI "$TARGET_URL/api/v1/health" 
} > "$HEADERS_REPORT"

MISSING_HEADERS=0

check_header "X-Content-Type-Options" "$TARGET_URL/api/v1/health" || ((MISSING_HEADERS++))
check_header "X-Frame-Options" "$TARGET_URL/api/v1/health" || ((MISSING_HEADERS++))
check_header "Strict-Transport-Security" "$TARGET_URL/api/v1/health" || ((MISSING_HEADERS++))
check_header "Content-Security-Policy" "$TARGET_URL/api/v1/health" || ((MISSING_HEADERS++))
check_header "X-XSS-Protection" "$TARGET_URL/api/v1/health" || ((MISSING_HEADERS++))

# -----------------------------------------------------------------------------
# 2. Teste de Information Disclosure
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/5] Testando Information Disclosure...${NC}"

INFO_DISCLOSURE=0

# Verificar se expõe versões
if curl -sI "$TARGET_URL" | grep -qi "X-Powered-By"; then
    echo -e "  ${RED}✗${NC} X-Powered-By header expõe tecnologia"
    ((INFO_DISCLOSURE++))
else
    echo -e "  ${GREEN}✓${NC} X-Powered-By não exposto"
fi

# Verificar se expõe stack traces em erro
ERROR_RESPONSE=$(curl -s "$TARGET_URL/api/v1/nonexistent-endpoint-12345" 2>/dev/null)
if echo "$ERROR_RESPONSE" | grep -qiE "(stack|trace|at\s+\w+\.|\.ts:|\.js:)"; then
    echo -e "  ${RED}✗${NC} Stack trace exposto em erros"
    ((INFO_DISCLOSURE++))
else
    echo -e "  ${GREEN}✓${NC} Stack traces não expostos"
fi

# -----------------------------------------------------------------------------
# 3. Teste básico de SQL Injection
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/5] Testando SQL Injection básico...${NC}"

SQLI_PAYLOADS=(
    "' OR '1'='1"
    "1; DROP TABLE users--"
    "1 UNION SELECT * FROM users--"
    "' OR 1=1--"
)

SQLI_VULNERABLE=0

for payload in "${SQLI_PAYLOADS[@]}"; do
    encoded_payload=$(echo -n "$payload" | jq -sRr @uri)
    response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/v1/health?id=$encoded_payload" 2>/dev/null)
    
    # Se retornar 500, pode indicar SQL injection
    if [ "$response" = "500" ]; then
        echo -e "  ${RED}✗${NC} Possível SQLi com payload: $payload"
        ((SQLI_VULNERABLE++))
    fi
done

if [ $SQLI_VULNERABLE -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Nenhuma vulnerabilidade SQLi óbvia detectada"
fi

# -----------------------------------------------------------------------------
# 4. Teste básico de XSS
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/5] Testando XSS básico...${NC}"

XSS_PAYLOADS=(
    "<script>alert(1)</script>"
    "javascript:alert(1)"
    "<img src=x onerror=alert(1)>"
)

XSS_VULNERABLE=0

for payload in "${XSS_PAYLOADS[@]}"; do
    encoded_payload=$(echo -n "$payload" | jq -sRr @uri)
    response=$(curl -s "$TARGET_URL/api/v1/health?search=$encoded_payload" 2>/dev/null)
    
    # Se o payload aparecer não-escapado na resposta
    if echo "$response" | grep -qF "$payload"; then
        echo -e "  ${RED}✗${NC} Possível XSS refletido com payload: $payload"
        ((XSS_VULNERABLE++))
    fi
done

if [ $XSS_VULNERABLE -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Nenhuma vulnerabilidade XSS óbvia detectada"
fi

# -----------------------------------------------------------------------------
# 5. Teste de Rate Limiting
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/5] Testando Rate Limiting...${NC}"

RATE_LIMIT_OK=0
for i in {1..20}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/v1/health")
    if [ "$response" = "429" ]; then
        echo -e "  ${GREEN}✓${NC} Rate limiting ativo (429 após $i requests)"
        RATE_LIMIT_OK=1
        break
    fi
done

if [ $RATE_LIMIT_OK -eq 0 ]; then
    echo -e "  ${YELLOW}⚠${NC} Rate limiting não detectado em 20 requests rápidos"
fi

# -----------------------------------------------------------------------------
# Resumo
# -----------------------------------------------------------------------------
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  RESUMO${NC}"
echo -e "${GREEN}========================================${NC}"

TOTAL_ISSUES=$((MISSING_HEADERS + INFO_DISCLOSURE + SQLI_VULNERABLE + XSS_VULNERABLE))

echo -e "Headers ausentes: ${YELLOW}$MISSING_HEADERS${NC}"
echo -e "Information Disclosure: ${YELLOW}$INFO_DISCLOSURE${NC}"
echo -e "SQL Injection: ${YELLOW}$SQLI_VULNERABLE${NC}"
echo -e "XSS: ${YELLOW}$XSS_VULNERABLE${NC}"
echo -e ""
echo -e "Total de issues: ${YELLOW}$TOTAL_ISSUES${NC}"
echo -e ""
echo -e "Relatório de headers: ${GREEN}$HEADERS_REPORT${NC}"

if [ $TOTAL_ISSUES -gt 0 ]; then
    echo -e "\n${RED}⚠️  Foram encontradas vulnerabilidades. Execute o full-audit para mais detalhes.${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ Nenhuma vulnerabilidade crítica detectada no smoke test.${NC}"
    exit 0
fi
