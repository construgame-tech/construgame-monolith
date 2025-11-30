#!/bin/bash
# =============================================================================
# Teste BOLA (Broken Object Level Authorization) / IDOR
# =============================================================================
# Testa se Usuário A consegue acessar recursos do Usuário B
# Esta é a vulnerabilidade #1 do OWASP API Top 10
# =============================================================================

set -e

BASE_URL="${1:-http://localhost:3000}"
REPORT_DIR="security-tests/reports"
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/bola-report-$DATE.md"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$REPORT_DIR"

# Carregar tokens
TOKEN_A_FILE="security-tests/tokens/user-a.token"
TOKEN_B_FILE="security-tests/tokens/user-b.token"

if [ ! -f "$TOKEN_A_FILE" ] || [ ! -f "$TOKEN_B_FILE" ]; then
    echo -e "${RED}ERRO:${NC} Tokens não encontrados!"
    echo ""
    echo "Execute primeiro: ./security-tests/scripts/setup-pentest-users.sh"
    echo "E salve os tokens JWT nos arquivos:"
    echo "  - $TOKEN_A_FILE"
    echo "  - $TOKEN_B_FILE"
    exit 1
fi

TOKEN_A=$(cat "$TOKEN_A_FILE" | tr -d '\n')
TOKEN_B=$(cat "$TOKEN_B_FILE" | tr -d '\n')

# IDs das organizações de teste
ORG_A="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
ORG_B="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
USER_A="11111111-1111-1111-1111-111111111111"
USER_B="22222222-2222-2222-2222-222222222222"

# Contadores
VULNS_FOUND=0
TESTS_PASSED=0

# Função para testar BOLA
test_bola() {
    local description=$1
    local endpoint=$2
    local method=$3
    local body=$4
    
    # Construir URL substituindo placeholders
    local url_a=$(echo "$endpoint" | sed "s/{orgId}/$ORG_A/g" | sed "s/{userId}/$USER_A/g")
    local url_b=$(echo "$endpoint" | sed "s/{orgId}/$ORG_B/g" | sed "s/{userId}/$USER_B/g")
    
    echo -e "  Testando: $description"
    
    # User A tenta acessar recurso do User B
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /tmp/bola_response.txt -w "%{http_code}" \
            -H "Authorization: Bearer $TOKEN_A" \
            "$BASE_URL$url_b" 2>/dev/null)
    else
        response=$(curl -s -o /tmp/bola_response.txt -w "%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $TOKEN_A" \
            -H "Content-Type: application/json" \
            -d "$body" \
            "$BASE_URL$url_b" 2>/dev/null)
    fi
    
    body_response=$(cat /tmp/bola_response.txt 2>/dev/null)
    
    # Se retornar 200 ou 201, é BOLA!
    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "    ${RED}❌ VULNERÁVEL!${NC} User A acessou recurso de Org B (HTTP $response)"
        ((VULNS_FOUND++))
        
        # Registrar no relatório
        echo "" >> "$REPORT_FILE"
        echo "### 🔴 BOLA em: $description" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Endpoint:** \`$method $url_b\`" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Descrição:** Usuário da Organização A conseguiu acessar recurso da Organização B" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "**Resposta:** HTTP $response" >> "$REPORT_FILE"
        echo '```json' >> "$REPORT_FILE"
        echo "$body_response" | head -20 >> "$REPORT_FILE"
        echo '```' >> "$REPORT_FILE"
        
    elif [ "$response" = "403" ] || [ "$response" = "401" ] || [ "$response" = "404" ]; then
        echo -e "    ${GREEN}✓ PROTEGIDO${NC} (HTTP $response)"
        ((TESTS_PASSED++))
    else
        echo -e "    ${YELLOW}? Resposta inesperada${NC} (HTTP $response)"
    fi
}

# Inicializa relatório
cat > "$REPORT_FILE" << EOF
# 🔐 Relatório de Teste BOLA/IDOR

**Data:** $(date)
**Target:** $BASE_URL

---

## Sobre BOLA

Broken Object Level Authorization (BOLA), também conhecido como IDOR (Insecure Direct Object Reference), 
é a vulnerabilidade #1 do OWASP API Security Top 10.

Ocorre quando a API permite que um usuário acesse recursos de outro usuário/organização 
apenas manipulando IDs na URL ou body.

---

## Cenário de Teste

- **Organização A:** $ORG_A (Usuário: $USER_A)
- **Organização B:** $ORG_B (Usuário: $USER_B)
- **Teste:** Usuário A tenta acessar recursos da Organização B

---

## Resultados

EOF

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  TESTE BOLA/IDOR - Construgame API${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Org A: ${YELLOW}$ORG_A${NC}"
echo -e "Org B: ${YELLOW}$ORG_B${NC}"
echo ""

# =============================================================================
# TESTES DE LEITURA (GET)
# =============================================================================
echo -e "\n${BLUE}[1/4] TESTES DE LEITURA (GET)${NC}"
echo -e "-------------------------------------------"

# Organização
test_bola "GET Organização de outro tenant" \
    "/api/v1/organization/{orgId}" \
    "GET"

# Projetos
test_bola "GET Projetos de outro tenant" \
    "/api/v1/projects?organizationId={orgId}" \
    "GET"

# Games
test_bola "GET Games de outro tenant" \
    "/api/v1/games?organizationId={orgId}" \
    "GET"

# Tasks
test_bola "GET Tasks de outro tenant" \
    "/api/v1/tasks?organizationId={orgId}" \
    "GET"

# KPIs
test_bola "GET KPIs de outro tenant" \
    "/api/v1/kpis?organizationId={orgId}" \
    "GET"

# Kaizens
test_bola "GET Kaizens de outro tenant" \
    "/api/v1/kaizens?organizationId={orgId}" \
    "GET"

# Members
test_bola "GET Members de outro tenant" \
    "/api/v1/members?organizationId={orgId}" \
    "GET"

# Teams
test_bola "GET Teams de outro tenant" \
    "/api/v1/teams?organizationId={orgId}" \
    "GET"

# Users
test_bola "GET Users de outro tenant" \
    "/api/v1/users?organizationId={orgId}" \
    "GET"

# =============================================================================
# TESTES DE CRIAÇÃO (POST)
# =============================================================================
echo -e "\n${BLUE}[2/4] TESTES DE CRIAÇÃO (POST)${NC}"
echo -e "-------------------------------------------"

test_bola "POST Criar projeto em outro tenant" \
    "/api/v1/projects" \
    "POST" \
    "{\"organizationId\":\"$ORG_B\",\"name\":\"Projeto Malicioso\"}"

test_bola "POST Criar game em outro tenant" \
    "/api/v1/games" \
    "POST" \
    "{\"organizationId\":\"$ORG_B\",\"projectId\":\"fake-id\",\"name\":\"Game Malicioso\"}"

test_bola "POST Criar task em outro tenant" \
    "/api/v1/tasks" \
    "POST" \
    "{\"organizationId\":\"$ORG_B\",\"projectId\":\"fake-id\",\"name\":\"Task Maliciosa\"}"

test_bola "POST Criar kaizen em outro tenant" \
    "/api/v1/kaizens" \
    "POST" \
    "{\"organizationId\":\"$ORG_B\",\"projectId\":\"fake-id\",\"description\":\"Kaizen Malicioso\"}"

# =============================================================================
# TESTES DE MODIFICAÇÃO (PUT/PATCH)
# =============================================================================
echo -e "\n${BLUE}[3/4] TESTES DE MODIFICAÇÃO (PUT/PATCH)${NC}"
echo -e "-------------------------------------------"

test_bola "PUT Atualizar organização de outro tenant" \
    "/api/v1/organization/$ORG_B" \
    "PUT" \
    "{\"name\":\"Organização Hackeada\"}"

test_bola "PATCH Atualizar projeto de outro tenant" \
    "/api/v1/projects/$ORG_B-fake-project" \
    "PATCH" \
    "{\"organizationId\":\"$ORG_B\",\"name\":\"Projeto Hackeado\"}"

# =============================================================================
# TESTES DE DELEÇÃO (DELETE)
# =============================================================================
echo -e "\n${BLUE}[4/4] TESTES DE DELEÇÃO (DELETE)${NC}"
echo -e "-------------------------------------------"

# Cuidado: estes testes podem deletar dados se vulneráveis!
echo -e "  ${YELLOW}⚠${NC} Testes de DELETE são destrutivos"
echo -e "  ${YELLOW}⚠${NC} Execute apenas em ambiente de teste"
echo ""

# Comentado por segurança - descomente se precisar testar DELETE
# test_bola "DELETE Projeto de outro tenant" \
#     "/api/v1/projects/fake-project-id?organizationId=$ORG_B" \
#     "DELETE"

# =============================================================================
# RESUMO
# =============================================================================
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}  RESUMO DO TESTE BOLA${NC}"
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
| ✅ Protegido | $TESTS_PASSED |
| ❌ Vulnerável | $VULNS_FOUND |

---

## Recomendações

1. **Sempre validar organizationId**: Verificar se o usuário pertence à organização antes de permitir acesso
2. **Usar guards de autorização**: Implementar guards que validam ownership dos recursos
3. **Não confiar em IDs do cliente**: O organizationId deve vir do token JWT, não do body/query
4. **Testar regularmente**: Executar este teste a cada release

---

## Exemplo de Correção

\`\`\`typescript
// ❌ VULNERÁVEL: Confia no organizationId do request
async findAll(@Query('organizationId') orgId: string) {
  return this.repository.findByOrganization(orgId);
}

// ✅ SEGURO: Usa organizationId do token JWT
async findAll(@CurrentUser() user: UserEntity) {
  return this.repository.findByOrganization(user.organizationId);
}
\`\`\`

EOF

echo -e "Relatório salvo em: ${GREEN}$REPORT_FILE${NC}"

if [ "$VULNS_FOUND" -gt 0 ]; then
    echo -e "\n${RED}⚠️  VULNERABILIDADES BOLA ENCONTRADAS!${NC}"
    echo -e "${RED}   Corrija antes de ir para produção!${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ Nenhuma vulnerabilidade BOLA detectada.${NC}"
    exit 0
fi
