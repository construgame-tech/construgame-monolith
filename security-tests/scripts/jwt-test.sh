#!/bin/bash
# =============================================================================
# Teste de Manipulação JWT
# =============================================================================
# Testa diversas técnicas de bypass JWT comuns
# =============================================================================

set -e

BASE_URL="${1:-http://localhost:3000}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/jwt-report-$DATE.md"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$REPORT_DIR"

VULNS_FOUND=0
TESTS_PASSED=0

# Endpoint protegido para testar
PROTECTED_ENDPOINT="/api/v1/organization"

test_jwt() {
    local description=$1
    local token=$2
    local expected_fail=$3
    
    echo -e "  Testando: $description"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $token" \
        "$BASE_URL$PROTECTED_ENDPOINT" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        if [ "$expected_fail" = "true" ]; then
            echo -e "    ${RED}❌ VULNERÁVEL!${NC} Token aceito indevidamente (HTTP $response)"
            ((VULNS_FOUND++))
            
            echo "" >> "$REPORT_FILE"
            echo "### 🔴 $description" >> "$REPORT_FILE"
            echo "Token aceito quando deveria ser rejeitado" >> "$REPORT_FILE"
            echo "**Response:** HTTP $response" >> "$REPORT_FILE"
        else
            echo -e "    ${GREEN}✓ OK${NC} (HTTP $response)"
            ((TESTS_PASSED++))
        fi
    else
        if [ "$expected_fail" = "true" ]; then
            echo -e "    ${GREEN}✓ REJEITADO${NC} (HTTP $response)"
            ((TESTS_PASSED++))
        else
            echo -e "    ${YELLOW}? Resposta:${NC} HTTP $response"
        fi
    fi
}

# Inicializa relatório
cat > "$REPORT_FILE" << EOF
# 🔑 Relatório de Teste JWT

**Data:** $(date)
**Target:** $BASE_URL

---

## Testes Realizados

EOF

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  TESTE DE MANIPULAÇÃO JWT${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# =============================================================================
# 1. ALGORITHM CONFUSION
# =============================================================================
echo -e "\n${BLUE}[1/5] ALGORITHM CONFUSION${NC}"
echo -e "-------------------------------------------"

# JWT com algorithm: none
# Header: {"alg":"none","typ":"JWT"}
# Payload: {"sub":"admin","role":"admin"}
NONE_TOKEN="eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9."
test_jwt "Algorithm 'none'" "$NONE_TOKEN" "true"

# JWT com algorithm: None (case variation)
NONE_TOKEN2="eyJhbGciOiJOb25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9."
test_jwt "Algorithm 'None' (case variation)" "$NONE_TOKEN2" "true"

# JWT com algorithm: NONE
NONE_TOKEN3="eyJhbGciOiJOT05FIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9."
test_jwt "Algorithm 'NONE' (uppercase)" "$NONE_TOKEN3" "true"

# JWT com algorithm: nOnE (mixed case)
NONE_TOKEN4="eyJhbGciOiJuT25FIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9."
test_jwt "Algorithm 'nOnE' (mixed case)" "$NONE_TOKEN4" "true"

# =============================================================================
# 2. SIGNATURE BYPASS
# =============================================================================
echo -e "\n${BLUE}[2/5] SIGNATURE BYPASS${NC}"
echo -e "-------------------------------------------"

# JWT sem assinatura (removida)
NO_SIG_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9"
test_jwt "Token sem assinatura" "$NO_SIG_TOKEN" "true"

# JWT com assinatura vazia
EMPTY_SIG_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9."
test_jwt "Token com assinatura vazia" "$EMPTY_SIG_TOKEN" "true"

# JWT com assinatura inválida
INVALID_SIG_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.invalidsignature"
test_jwt "Token com assinatura inválida" "$INVALID_SIG_TOKEN" "true"

# JWT com assinatura de outro secret (key confusion)
WRONG_KEY_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiJ9.dHF0sSR3HXiXXS45Ql9NkTJnW8x3BZjHNf7WMbmPSFk"
test_jwt "Token assinado com secret diferente" "$WRONG_KEY_TOKEN" "true"

# =============================================================================
# 3. EXPIRATION BYPASS
# =============================================================================
echo -e "\n${BLUE}[3/5] EXPIRATION BYPASS${NC}"
echo -e "-------------------------------------------"

# JWT expirado (exp: 2020-01-01)
# Payload: {"sub":"admin","exp":1577836800}
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTU3NzgzNjgwMH0.invalid"
test_jwt "Token expirado (2020-01-01)" "$EXPIRED_TOKEN" "true"

# JWT sem exp (should be rejected)
# Payload: {"sub":"admin"}
NO_EXP_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiJ9.invalid"
test_jwt "Token sem claim 'exp'" "$NO_EXP_TOKEN" "true"

# JWT com exp negativo
# Payload: {"sub":"admin","exp":-1}
NEGATIVE_EXP_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6LTF9.invalid"
test_jwt "Token com exp negativo" "$NEGATIVE_EXP_TOKEN" "true"

# =============================================================================
# 4. CLAIM INJECTION
# =============================================================================
echo -e "\n${BLUE}[4/5] CLAIM INJECTION${NC}"
echo -e "-------------------------------------------"

# JWT com role admin injetado
# Payload: {"sub":"user","role":"admin","admin":true}
ADMIN_INJECT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwicm9sZSI6ImFkbWluIiwiYWRtaW4iOnRydWV9.invalid"
test_jwt "Token com role admin injetado" "$ADMIN_INJECT_TOKEN" "true"

# JWT com organizationId diferente
# Payload: {"sub":"user","organizationId":"00000000-0000-0000-0000-000000000000"}
ORG_INJECT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyIiwib3JnYW5pemF0aW9uSWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAifQ.invalid"
test_jwt "Token com organizationId injetado" "$ORG_INJECT_TOKEN" "true"

# =============================================================================
# 5. FORMAT BYPASS
# =============================================================================
echo -e "\n${BLUE}[5/5] FORMAT BYPASS${NC}"
echo -e "-------------------------------------------"

# Token malformado
test_jwt "Token malformado (string simples)" "not-a-jwt" "true"

# Token com apenas header
test_jwt "Token apenas header" "eyJhbGciOiJIUzI1NiJ9" "true"

# Token com espaços
test_jwt "Token com espaços" "eyJhbGciOiJIUzI1NiJ9 . eyJ0ZXN0IjoiMSJ9 . sig" "true"

# Token vazio
test_jwt "Token vazio" "" "true"

# Token com null bytes
test_jwt "Token com caracteres especiais" "eyJhbGciOiJIUzI1NiJ9%00.eyJ0ZXN0IjoiMSJ9.sig" "true"

# =============================================================================
# TESTES ADICIONAIS
# =============================================================================
echo -e "\n${BLUE}[EXTRA] TESTES DE HEADER${NC}"
echo -e "-------------------------------------------"

echo -e "  Testando: Header Authorization sem 'Bearer'"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.sig" \
    "$BASE_URL$PROTECTED_ENDPOINT" 2>/dev/null)
if [ "$response" = "200" ]; then
    echo -e "    ${RED}❌ VULNERÁVEL!${NC} Token aceito sem prefix Bearer"
    ((VULNS_FOUND++))
else
    echo -e "    ${GREEN}✓ REJEITADO${NC} (HTTP $response)"
    ((TESTS_PASSED++))
fi

echo -e "  Testando: Bearer lowercase"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: bearer eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.sig" \
    "$BASE_URL$PROTECTED_ENDPOINT" 2>/dev/null)
if [ "$response" = "200" ]; then
    echo -e "    ${YELLOW}? Token aceito com 'bearer' lowercase${NC}"
else
    echo -e "    ${GREEN}✓${NC} (HTTP $response)"
    ((TESTS_PASSED++))
fi

echo -e "  Testando: Token em Cookie"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Cookie: token=eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.sig" \
    "$BASE_URL$PROTECTED_ENDPOINT" 2>/dev/null)
echo -e "    ${GREEN}ℹ${NC} Cookie auth: HTTP $response"

echo -e "  Testando: Token em X-Auth-Token"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-Auth-Token: eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoiMSJ9.sig" \
    "$BASE_URL$PROTECTED_ENDPOINT" 2>/dev/null)
echo -e "    ${GREEN}ℹ${NC} X-Auth-Token: HTTP $response"

# =============================================================================
# RESUMO
# =============================================================================
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}  RESUMO DO TESTE JWT${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "  ${GREEN}✓ Testes passaram:${NC} $TESTS_PASSED"
echo -e "  ${RED}❌ Vulnerabilidades:${NC} $VULNS_FOUND"
echo ""

# Adicionar resumo ao relatório
cat >> "$REPORT_FILE" << EOF

---

## Resumo

| Resultado | Quantidade |
|-----------|------------|
| ✅ Rejeitado (correto) | $TESTS_PASSED |
| ❌ Aceito (vulnerável) | $VULNS_FOUND |

---

## Recomendações JWT

1. **Validar algorithm**: Sempre especificar algoritmos aceitos (HS256, RS256)
2. **Verificar signature**: Nunca pular validação de assinatura
3. **Validar exp**: Sempre verificar expiração
4. **Não aceitar 'none'**: Rejeitar tokens com algorithm none
5. **Usar secret forte**: Mínimo 256 bits, idealmente gerado aleatoriamente
6. **Rotacionar secrets**: Trocar secrets periodicamente
7. **Validar claims**: Verificar todos os claims necessários (iss, aud, sub)

EOF

echo -e "Relatório salvo em: ${GREEN}$REPORT_FILE${NC}"

if [ "$VULNS_FOUND" -gt 0 ]; then
    echo -e "\n${RED}⚠️  VULNERABILIDADES JWT ENCONTRADAS!${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ JWT parece estar configurado corretamente.${NC}"
    exit 0
fi
