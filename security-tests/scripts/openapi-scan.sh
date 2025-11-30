#!/bin/bash
# =============================================================================
# OpenAPI Security Scan - Testa todos os endpoints documentados no Swagger
# =============================================================================

set -e

OPENAPI_URL="${1:-http://localhost:3000/docs-json}"
TARGET_URL="${2:-http://localhost:3000}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  OpenAPI Security Scan - Construgame API${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "OpenAPI URL: ${YELLOW}$OPENAPI_URL${NC}"
echo -e "Target: ${YELLOW}$TARGET_URL${NC}"
echo ""

mkdir -p "$REPORT_DIR"

# Baixar OpenAPI spec
echo -e "${BLUE}Baixando especificação OpenAPI...${NC}"
OPENAPI_FILE="$REPORT_DIR/openapi-spec-$DATE.json"
curl -s "$OPENAPI_URL" > "$OPENAPI_FILE"

if [ ! -s "$OPENAPI_FILE" ]; then
    echo -e "${RED}Erro: Não foi possível baixar a especificação OpenAPI${NC}"
    exit 1
fi

echo -e "  ${GREEN}✓${NC} Especificação salva: $OPENAPI_FILE"

# Verificar se temos o ZAP disponível
if docker image inspect zaproxy/zap-stable &> /dev/null 2>&1; then
    echo -e "\n${BLUE}Executando OWASP ZAP com OpenAPI...${NC}"
    
    ZAP_REPORT="$REPORT_DIR/zap-openapi-$DATE.html"
    
    # Copiar o spec para diretório acessível pelo Docker
    cp "$OPENAPI_FILE" "$REPORT_DIR/"
    
    docker run --rm \
        -v "$(pwd)/$REPORT_DIR:/zap/wrk:rw" \
        --network="host" \
        -t zaproxy/zap-stable zap-api-scan.py \
        -t "/zap/wrk/openapi-spec-$DATE.json" \
        -f openapi \
        -r "zap-openapi-$DATE.html" \
        -w "zap-openapi-$DATE.md" \
        -I \
        || true
    
    echo -e "  ${GREEN}✓${NC} Relatório ZAP: $ZAP_REPORT"
else
    echo -e "${YELLOW}OWASP ZAP não disponível. Instalando via Docker...${NC}"
    docker pull zaproxy/zap-stable
fi

# =============================================================================
# Análise manual de endpoints
# =============================================================================
echo -e "\n${BLUE}Analisando endpoints da API...${NC}"

ENDPOINTS_REPORT="$REPORT_DIR/endpoints-analysis-$DATE.md"

{
    echo "# Análise de Endpoints - OpenAPI"
    echo ""
    echo "**Data:** $(date)"
    echo "**Fonte:** $OPENAPI_URL"
    echo ""
    echo "## Endpoints Encontrados"
    echo ""
    
    # Extrair paths do OpenAPI
    echo "| Método | Path | Autenticação | Risco |"
    echo "|--------|------|--------------|-------|"
    
    # Parse simples do OpenAPI JSON
    cat "$OPENAPI_FILE" | jq -r '
        .paths | to_entries[] | 
        .key as $path | 
        .value | to_entries[] | 
        select(.key | test("get|post|put|patch|delete")) |
        "\(.key | ascii_upcase) | \($path) | - | -"
    ' 2>/dev/null || echo "Erro ao parsear OpenAPI"
    
    echo ""
    echo "## Análise de Segurança"
    echo ""
    echo "### Endpoints sem Autenticação (Verificar)"
    echo ""
    echo "Execute o scan completo para identificar endpoints sem proteção adequada."
    echo ""
    echo "### Endpoints Sensíveis"
    echo ""
    
    # Identificar endpoints potencialmente sensíveis
    cat "$OPENAPI_FILE" | jq -r '.paths | keys[]' 2>/dev/null | while read path; do
        if echo "$path" | grep -qiE "(user|auth|password|token|admin|config|delete)"; then
            echo "- \`$path\` - **Verificar proteções**"
        fi
    done
    
} > "$ENDPOINTS_REPORT"

echo -e "  ${GREEN}✓${NC} Análise de endpoints: $ENDPOINTS_REPORT"

# =============================================================================
# Testes específicos por endpoint
# =============================================================================
echo -e "\n${BLUE}Testando endpoints críticos...${NC}"

CRITICAL_TESTS="$REPORT_DIR/critical-tests-$DATE.md"

{
    echo "# Testes de Segurança - Endpoints Críticos"
    echo ""
    echo "**Data:** $(date)"
    echo ""
    
    # Teste de autenticação
    echo "## 1. Teste de Autenticação"
    echo ""
    
    # Tentar acessar endpoints protegidos sem token
    PROTECTED_ENDPOINTS=(
        "/api/v1/games"
        "/api/v1/users"
        "/api/v1/organizations"
    )
    
    for endpoint in "${PROTECTED_ENDPOINTS[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL$endpoint" 2>/dev/null)
        if [ "$response" = "401" ] || [ "$response" = "403" ]; then
            echo "- \`$endpoint\` - ✅ Protegido (HTTP $response)"
        else
            echo "- \`$endpoint\` - ⚠️ Acessível sem auth (HTTP $response)"
        fi
    done
    
    echo ""
    echo "## 2. Teste de Autorização (BOLA/IDOR)"
    echo ""
    echo "Verifique manualmente se é possível acessar recursos de outros usuários/organizações."
    echo ""
    
    echo "## 3. Teste de Rate Limiting"
    echo ""
    
    # Teste rápido de rate limit
    RATE_LIMIT_HIT=false
    for i in {1..50}; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/v1/health")
        if [ "$response" = "429" ]; then
            echo "- Rate limit ativado após $i requests ✅"
            RATE_LIMIT_HIT=true
            break
        fi
    done
    
    if [ "$RATE_LIMIT_HIT" = false ]; then
        echo "- ⚠️ Rate limit não ativado após 50 requests rápidos"
    fi
    
} > "$CRITICAL_TESTS"

echo -e "  ${GREEN}✓${NC} Testes críticos: $CRITICAL_TESTS"

# =============================================================================
# Resumo
# =============================================================================
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}  SCAN CONCLUÍDO${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Relatórios gerados:"
ls -la "$REPORT_DIR"/*$DATE* 2>/dev/null
echo ""
echo -e "${BLUE}Revise os relatórios e implemente as correções necessárias.${NC}"
