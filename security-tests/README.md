# 🔐 Security Tests - Construgame API

Suite completa de testes de segurança para a API Construgame.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura](#estrutura)
- [Quick Start](#quick-start)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Testes BOLA/IDOR](#testes-bolaidor)
- [Relatórios](#relatórios)
- [CI/CD](#cicd)

## 🎯 Visão Geral

Esta suite implementa testes de segurança baseados no OWASP API Security Top 10:

| # | Vulnerabilidade | Script |
|---|----------------|--------|
| 1 | BOLA (Broken Object Level Authorization) | `bola-test.sh` |
| 2 | Broken Authentication | `jwt-test.sh` |
| 3 | Excessive Data Exposure | `pentest.sh` |
| 4 | Lack of Resources & Rate Limiting | `pentest.sh` |
| 5 | Broken Function Level Authorization | `bola-test.sh` |
| 6 | Mass Assignment | `business-logic-test.sh` |
| 7 | Security Misconfiguration | `smoke-security.sh` |
| 8 | Injection | `pentest.sh` |
| 9 | Improper Assets Management | `smoke-security.sh` |
| 10 | Insufficient Logging & Monitoring | Manual |

## 📁 Estrutura

\`\`\`
security-tests/
├── README.md                    # Este arquivo
├── scripts/
│   ├── smoke-security.sh        # Testes rápidos (~5 min)
│   ├── full-audit.sh            # Audit completo com ZAP, Nuclei (~30 min)
│   ├── openapi-scan.sh          # Scan baseado no OpenAPI
│   ├── pentest.sh               # Pentest automatizado
│   ├── jwt-test.sh              # Testes de manipulação JWT
│   ├── bola-test.sh             # Testes BOLA/IDOR (requer tokens)
│   ├── business-logic-test.sh   # Checklist de business logic
│   └── setup-pentest-users.sh   # Setup de usuários para BOLA
├── tokens/                      # Tokens JWT para testes (gitignored)
├── reports/                     # Relatórios gerados (gitignored)
└── zap-rules.tsv               # Regras customizadas para ZAP
\`\`\`

## 🚀 Quick Start

\`\`\`bash
# 1. API deve estar rodando
npm run start:dev &

# 2. Smoke test (5 min)
./security-tests/scripts/smoke-security.sh http://localhost:3000

# 3. Pentest automatizado
./security-tests/scripts/pentest.sh http://localhost:3000

# 4. Teste JWT
./security-tests/scripts/jwt-test.sh http://localhost:3000
\`\`\`

## 📜 Scripts Disponíveis

### 1. Smoke Security
Testes rápidos: headers, SQLi básico, XSS, rate limiting.

### 2. Pentest Automatizado
Pentest completo: autenticação, SQLi avançado, JWT, rate limiting bypass.

### 3. Teste JWT
Testes de manipulação JWT: algorithm confusion, signature bypass, expiration.

### 4. Full Audit
Audit com ZAP, Nuclei, SQLMap, Nikto.

### 5. Business Logic
Checklist específico do Construgame: pontos, aprovação, ranking.

## 🔒 Testes BOLA/IDOR

\`\`\`bash
# 1. Setup usuários
./security-tests/scripts/setup-pentest-users.sh

# 2. Salvar tokens
echo "TOKEN_A" > security-tests/tokens/user-a.token
echo "TOKEN_B" > security-tests/tokens/user-b.token

# 3. Executar
./security-tests/scripts/bola-test.sh http://localhost:3000
\`\`\`

## 📊 Relatórios

Salvos em \`security-tests/reports/\`:
- \`pentest-report-*.md\` - Pentest automatizado
- \`jwt-report-*.md\` - Testes JWT
- \`bola-report-*.md\` - Testes BOLA
- \`zap-*.html\` - OWASP ZAP

## 🔄 CI/CD

Workflow em \`.github/workflows/security-audit.yml\`:
- PR: Smoke test
- Weekly: Full audit
- Manual: Via dispatch

## ⚠️ Aviso Legal

Apenas para ambientes de desenvolvimento/staging.
Nunca execute em produção sem autorização.
