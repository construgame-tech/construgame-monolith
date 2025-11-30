#!/bin/bash
# =============================================================================
# Full Security Audit - Auditoria completa de segurança (~30-60 min)
# Utiliza: OWASP ZAP, Nuclei, SQLMap
# =============================================================================

set -e

TARGET_URL="${1:-http://localhost:3000}"
OPENAPI_URL="${2:-$TARGET_URL/docs-json}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Full Security Audit - Construgame API${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "Target: ${YELLOW}$TARGET_URL${NC}"
echo -e "OpenAPI: ${YELLOW}$OPENAPI_URL${NC}"
echo -e "Date: ${YELLOW}$(date)${NC}"
echo ""

mkdir -p "$REPORT_DIR"

# Verificar ferramentas instaladas
check_tool() {
    if command -v "$1" &> /dev/null || docker image inspect "$2" &> /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $1 disponível"
        return 0
    else
        echo -e "  ${YELLOW}⚠${NC} $1 não encontrado (pulando)"
        return 1
    fi
}

echo -e "${BLUE}Verificando ferramentas...${NC}"
HAS_ZAP=false
HAS_NUCLEI=false
HAS_SQLMAP=false
HAS_NIKTO=false

check_tool "zap-cli" "zaproxy/zap-stable" && HAS_ZAP=true
check_tool "nuclei" "projectdiscovery/nuclei" && HAS_NUCLEI=true
check_tool "sqlmap" "" && HAS_SQLMAP=true
check_tool "nikto" "" && HAS_NIKTO=true
echo ""

# =============================================================================
# 1. OWASP ZAP Baseline Scan
# =============================================================================
if [ "$HAS_ZAP" = true ] || docker image inspect zaproxy/zap-stable &> /dev/null 2>&1; then
    echo -e "\n${BLUE}[1/4] Executando OWASP ZAP Baseline Scan...${NC}"
    
    ZAP_REPORT="$REPORT_DIR/zap-report-$DATE.html"
    ZAP_JSON="$REPORT_DIR/zap-report-$DATE.json"
    
    # Usando Docker
    docker run --rm -v "$(pwd)/$REPORT_DIR:/zap/wrk:rw" \
        --network="host" \
        -t zaproxy/zap-stable zap-baseline.py \
        -t "$TARGET_URL" \
        -r "zap-report-$DATE.html" \
        -J "zap-report-$DATE.json" \
        -I \
        || true  # Continua mesmo com findings
    
    echo -e "  ${GREEN}✓${NC} Relatório ZAP: $ZAP_REPORT"
else
    echo -e "\n${YELLOW}[1/4] OWASP ZAP não disponível - pulando${NC}"
fi

# =============================================================================
# 2. Nuclei Scan
# =============================================================================
if [ "$HAS_NUCLEI" = true ] || docker image inspect projectdiscovery/nuclei &> /dev/null 2>&1; then
    echo -e "\n${BLUE}[2/4] Executando Nuclei Scan...${NC}"
    
    NUCLEI_REPORT="$REPORT_DIR/nuclei-report-$DATE.json"
    
    if command -v nuclei &> /dev/null; then
        nuclei -u "$TARGET_URL" \
            -t cves/ -t vulnerabilities/ -t exposures/ -t misconfiguration/ \
            -severity critical,high,medium \
            -json-export "$NUCLEI_REPORT" \
            -silent \
            || true
    else
        docker run --rm --network="host" \
            -v "$(pwd)/$REPORT_DIR:/output" \
            projectdiscovery/nuclei:latest \
            -u "$TARGET_URL" \
            -severity critical,high,medium \
            -json-export "/output/nuclei-report-$DATE.json" \
            -silent \
            || true
    fi
    
    echo -e "  ${GREEN}✓${NC} Relatório Nuclei: $NUCLEI_REPORT"
else
    echo -e "\n${YELLOW}[2/4] Nuclei não disponível - pulando${NC}"
fi

# =============================================================================
# 3. SQLMap (endpoints específicos)
# =============================================================================
if [ "$HAS_SQLMAP" = true ]; then
    echo -e "\n${BLUE}[3/4] Executando SQLMap em endpoints suspeitos...${NC}"
    
    SQLMAP_REPORT="$REPORT_DIR/sqlmap-report-$DATE.txt"
    
    # Lista de endpoints para testar (ajustar conforme sua API)
    ENDPOINTS=(
        "/api/v1/games?organizationId=1"
        "/api/v1/tasks?organizationId=1"
        "/api/v1/users?organizationId=1"
        "/api/v1/projects?organizationId=1"
    )
    
    {
        echo "SQLMap Security Scan Report"
        echo "Target: $TARGET_URL"
        echo "Date: $(date)"
        echo "========================================"
        echo ""
    } > "$SQLMAP_REPORT"
    
    for endpoint in "${ENDPOINTS[@]}"; do
        echo -e "  Testing: $endpoint"
        sqlmap -u "$TARGET_URL$endpoint" \
            --batch \
            --level=1 \
            --risk=1 \
            --timeout=10 \
            --retries=1 \
            --threads=1 \
            --output-dir="$REPORT_DIR/sqlmap" \
            2>&1 | grep -E "(vulnerable|injection|Parameter)" >> "$SQLMAP_REPORT" || true
    done
    
    echo -e "  ${GREEN}✓${NC} Relatório SQLMap: $SQLMAP_REPORT"
else
    echo -e "\n${YELLOW}[3/4] SQLMap não disponível - pulando${NC}"
fi

# =============================================================================
# 4. Nikto Scan
# =============================================================================
if [ "$HAS_NIKTO" = true ]; then
    echo -e "\n${BLUE}[4/4] Executando Nikto Scan...${NC}"
    
    NIKTO_REPORT="$REPORT_DIR/nikto-report-$DATE.html"
    
    nikto -h "$TARGET_URL" \
        -Format htm \
        -output "$NIKTO_REPORT" \
        -Tuning 123bde \
        -timeout 10 \
        || true
    
    echo -e "  ${GREEN}✓${NC} Relatório Nikto: $NIKTO_REPORT"
else
    echo -e "\n${YELLOW}[4/4] Nikto não disponível - pulando${NC}"
fi

# =============================================================================
# Gerar Relatório Consolidado
# =============================================================================
echo -e "\n${BLUE}Gerando relatório consolidado...${NC}"

CONSOLIDATED_REPORT="$REPORT_DIR/consolidated-$DATE.md"

{
    echo "# Relatório de Auditoria de Segurança"
    echo ""
    echo "**Target:** $TARGET_URL"
    echo "**Data:** $(date)"
    echo "**Auditor:** Automated Security Scan"
    echo ""
    echo "---"
    echo ""
    echo "## Resumo Executivo"
    echo ""
    echo "| Ferramenta | Status | Relatório |"
    echo "|------------|--------|-----------|"
    
    [ -f "$REPORT_DIR/zap-report-$DATE.html" ] && echo "| OWASP ZAP | ✅ Executado | [HTML](zap-report-$DATE.html) |" || echo "| OWASP ZAP | ⏭️ Pulado | - |"
    [ -f "$REPORT_DIR/nuclei-report-$DATE.json" ] && echo "| Nuclei | ✅ Executado | [JSON](nuclei-report-$DATE.json) |" || echo "| Nuclei | ⏭️ Pulado | - |"
    [ -f "$REPORT_DIR/sqlmap-report-$DATE.txt" ] && echo "| SQLMap | ✅ Executado | [TXT](sqlmap-report-$DATE.txt) |" || echo "| SQLMap | ⏭️ Pulado | - |"
    [ -f "$REPORT_DIR/nikto-report-$DATE.html" ] && echo "| Nikto | ✅ Executado | [HTML](nikto-report-$DATE.html) |" || echo "| Nikto | ⏭️ Pulado | - |"
    
    echo ""
    echo "---"
    echo ""
    echo "## Vulnerabilidades Encontradas"
    echo ""
    
    # Parsear resultados do ZAP se existir
    if [ -f "$REPORT_DIR/zap-report-$DATE.json" ]; then
        echo "### OWASP ZAP Findings"
        echo ""
        echo '```json'
        cat "$REPORT_DIR/zap-report-$DATE.json" | head -100
        echo '```'
        echo ""
    fi
    
    # Parsear resultados do Nuclei se existir
    if [ -f "$REPORT_DIR/nuclei-report-$DATE.json" ]; then
        echo "### Nuclei Findings"
        echo ""
        echo '```json'
        cat "$REPORT_DIR/nuclei-report-$DATE.json" 2>/dev/null || echo "Nenhuma vulnerabilidade crítica encontrada."
        echo '```'
        echo ""
    fi
    
    echo "---"
    echo ""
    echo "## Recomendações"
    echo ""
    echo "1. Revisar todos os findings de severidade HIGH e CRITICAL"
    echo "2. Implementar headers de segurança ausentes"
    echo "3. Validar e sanitizar todos os inputs de usuário"
    echo "4. Implementar rate limiting adequado"
    echo "5. Revisar configurações de CORS"
    echo ""
    echo "---"
    echo ""
    echo "## Próximos Passos"
    echo ""
    echo "- [ ] Analisar cada vulnerabilidade encontrada"
    echo "- [ ] Priorizar correções por severidade"
    echo "- [ ] Implementar correções"
    echo "- [ ] Re-executar scan para validar correções"
    
} > "$CONSOLIDATED_REPORT"

echo -e "  ${GREEN}✓${NC} Relatório consolidado: $CONSOLIDATED_REPORT"

# =============================================================================
# Resumo Final
# =============================================================================
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}  AUDITORIA CONCLUÍDA${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Relatórios gerados em: ${YELLOW}$REPORT_DIR/${NC}"
echo ""
ls -la "$REPORT_DIR"/*$DATE* 2>/dev/null || echo "Nenhum relatório gerado"
echo ""
echo -e "${BLUE}Próximo passo: Analisar os relatórios e priorizar correções.${NC}"
