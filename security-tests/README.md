# Auditoria de Segurança - Construgame API

## Ferramentas Recomendadas

### 1. OWASP ZAP (Principal)
Scanner automatizado de vulnerabilidades web.

```bash
# Instalação via Docker (recomendado)
docker pull zaproxy/zap-stable

# Ou instalação local
# Linux
sudo snap install zaproxy --classic

# macOS
brew install --cask owasp-zap
```

### 2. Nuclei
Scanner baseado em templates, muito rápido.

```bash
# Linux/macOS
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Ou via Docker
docker pull projectdiscovery/nuclei:latest
```

### 3. SQLMap
Especializado em SQL Injection.

```bash
# Linux
sudo apt install sqlmap

# macOS
brew install sqlmap

# Via pip
pip install sqlmap
```

### 4. Nikto
Scanner de web server.

```bash
# Linux
sudo apt install nikto

# macOS
brew install nikto
```

---

## Executando Auditorias

### Smoke Security Test (Rápido - 5 min)

```bash
./security-tests/scripts/smoke-security.sh http://localhost:3000
```

### Full Security Audit (Completo - 30-60 min)

```bash
./security-tests/scripts/full-audit.sh http://localhost:3000
```

### Scan com OpenAPI/Swagger

```bash
./security-tests/scripts/openapi-scan.sh http://localhost:3000/docs-json
```

---

## Relatórios

Os relatórios são gerados em `security-tests/reports/`:

| Arquivo | Descrição |
|---------|-----------|
| `zap-report-{date}.html` | Relatório visual OWASP ZAP |
| `nuclei-report-{date}.json` | Vulnerabilidades Nuclei |
| `sqlmap-report-{date}.txt` | Testes SQL Injection |
| `consolidated-{date}.md` | Relatório consolidado |

---

## Cronograma Sugerido

| Frequência | Tipo de Teste | Automatizado? |
|------------|---------------|---------------|
| A cada PR | Smoke Security | ✅ CI/CD |
| Semanal | OWASP ZAP Baseline | ✅ Cron |
| Mensal | Full Audit | ⚠️ Semi-auto |
| Trimestral | Pentest Manual | ❌ Manual |

---

## Integração CI/CD (GitHub Actions)

Veja `.github/workflows/security-audit.yml` para execução automatizada.

---

## Checklist OWASP API Security Top 10

- [ ] **API1:2023** - Broken Object Level Authorization (BOLA)
- [ ] **API2:2023** - Broken Authentication
- [ ] **API3:2023** - Broken Object Property Level Authorization
- [ ] **API4:2023** - Unrestricted Resource Consumption
- [ ] **API5:2023** - Broken Function Level Authorization
- [ ] **API6:2023** - Unrestricted Access to Sensitive Business Flows
- [ ] **API7:2023** - Server Side Request Forgery (SSRF)
- [ ] **API8:2023** - Security Misconfiguration
- [ ] **API9:2023** - Improper Inventory Management
- [ ] **API10:2023** - Unsafe Consumption of APIs
