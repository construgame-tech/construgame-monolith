# Testes de Carga - Construgame API

## Instalação do k6

```bash
# Linux (snap)
sudo snap install k6

# Linux (apt)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# macOS
brew install k6

# Windows
choco install k6
```

## Executando os Testes

### 1. Subir a API localmente (simulando t3.small)

```bash
# Build da imagem
docker build -f Dockerfile.monolith -t construgame-api .

# Rodar com limites de CPU/RAM (simula t3.small: 2 vCPU, 2GB RAM)
docker run -d \
  --name construgame-load-test \
  --cpus="2" \
  --memory="2g" \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  construgame-api
```

### 2. Smoke Test (verificar se funciona)

```bash
k6 run load-tests/scenarios/smoke-test.js
```

### 3. Load Test (carga normal)

```bash
# Com variáveis de ambiente
API_URL=http://localhost:3000/api/v1 \
ORG_ID=sua-org-id \
k6 run load-tests/scenarios/api-load-test.js
```

### 4. Stress Test (encontrar limite)

```bash
k6 run load-tests/scenarios/stress-test.js
```

## Interpretando Resultados

### Métricas Importantes

| Métrica | Bom | Aceitável | Ruim |
|---------|-----|-----------|------|
| **http_req_duration (P95)** | < 200ms | < 500ms | > 1000ms |
| **http_req_failed** | < 0.1% | < 1% | > 5% |
| **http_reqs (rate)** | > 200/s | > 100/s | < 50/s |

### Recomendação de Instância

| Requests/s sustentados | Instância Recomendada | Custo ~mensal |
|------------------------|----------------------|---------------|
| < 50/s | t3.micro | $8 |
| 50-150/s | t3.small | $15 |
| 150-300/s | t3.medium | $30 |
| > 300/s | t3.large ou scaling | $60+ |

## Exportar Resultados

```bash
# JSON detalhado
k6 run --out json=results.json load-tests/scenarios/stress-test.js

# CSV
k6 run --out csv=results.csv load-tests/scenarios/stress-test.js
```
