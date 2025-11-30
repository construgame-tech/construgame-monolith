import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Trend } from "k6/metrics";
import { BASE_URL, defaultHeaders, loadStages } from "../k6-config.js";

/**
 * Load Test Completo - Testa endpoints principais da API
 *
 * Executar:
 *   k6 run load-tests/scenarios/api-load-test.js
 *   k6 run --out json=results.json load-tests/scenarios/api-load-test.js
 *
 * Com variáveis:
 *   API_URL=http://localhost:3000/api/v1 \
 *   ORG_ID=sua-org-id \
 *   API_TOKEN=seu-token \
 *   k6 run load-tests/scenarios/api-load-test.js
 */

// Métricas customizadas
const cacheHits = new Counter("cache_hits");
const cacheMisses = new Counter("cache_misses");
const dbQueryTime = new Trend("db_query_time");

// Configuração - altere conforme necessário
const ORG_ID = __ENV.ORG_ID || "test-org-id";
const PROJECT_ID = __ENV.PROJECT_ID || "test-project-id";

export const options = {
  stages: loadStages.load,
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    http_reqs: ["rate>50"],
  },
};

// Headers com auth (se necessário)
function getHeaders() {
  const headers = { ...defaultHeaders };
  if (__ENV.API_TOKEN) {
    headers["Authorization"] = `Bearer ${__ENV.API_TOKEN}`;
  }
  return headers;
}

export default function () {
  const headers = getHeaders();

  // ========== HEALTH CHECK ==========
  group("Health Check", () => {
    const res = http.get(`${BASE_URL}/health`, { headers });
    check(res, {
      "health is 200": (r) => r.status === 200,
    });
  });

  // ========== GAMES - READ (deve usar cache) ==========
  group("Games - List", () => {
    const res = http.get(`${BASE_URL}/games?organizationId=${ORG_ID}`, {
      headers,
    });
    check(res, {
      "games list is 200": (r) => r.status === 200,
      "games list < 200ms": (r) => r.timings.duration < 200,
    });

    // Verificar header de cache (se implementado)
    if (res.headers["X-Cache"] === "HIT") {
      cacheHits.add(1);
    } else {
      cacheMisses.add(1);
    }
  });

  // ========== PROJECTS - READ ==========
  group("Projects - List", () => {
    const res = http.get(`${BASE_URL}/projects?organizationId=${ORG_ID}`, {
      headers,
    });
    check(res, {
      "projects list is 200": (r) => r.status === 200,
    });
  });

  // ========== TASKS - READ ==========
  group("Tasks - List", () => {
    const res = http.get(
      `${BASE_URL}/tasks?organizationId=${ORG_ID}&projectId=${PROJECT_ID}`,
      { headers },
    );
    check(res, {
      "tasks list is 200 or 404": (r) => r.status === 200 || r.status === 404,
    });
  });

  // ========== MEMBERS - READ ==========
  group("Members - List", () => {
    const res = http.get(`${BASE_URL}/members?organizationId=${ORG_ID}`, {
      headers,
    });
    check(res, {
      "members list is 200": (r) => r.status === 200,
    });
  });

  // ========== KAIZENS - READ ==========
  group("Kaizens - List", () => {
    const res = http.get(`${BASE_URL}/kaizens?organizationId=${ORG_ID}`, {
      headers,
    });
    check(res, {
      "kaizens list is 200": (r) => r.status === 200,
    });
  });

  // Simula tempo de "pensar" do usuário entre requests
  sleep(Math.random() * 2 + 1); // 1-3 segundos
}

// Sumário ao final do teste
export function handleSummary(data) {
  console.log("\n========== RESUMO DO TESTE ==========\n");

  const reqs = data.metrics.http_reqs;
  const duration = data.metrics.http_req_duration;
  const failed = data.metrics.http_req_failed;

  console.log(`Total de Requests: ${reqs.values.count}`);
  console.log(`Requests/segundo: ${reqs.values.rate.toFixed(2)}`);
  console.log(`\nLatência:`);
  console.log(`  P50: ${duration.values.med.toFixed(2)}ms`);
  console.log(`  P95: ${duration.values["p(95)"].toFixed(2)}ms`);
  console.log(`  P99: ${duration.values["p(99)"].toFixed(2)}ms`);
  console.log(`\nTaxa de Erro: ${(failed.values.rate * 100).toFixed(2)}%`);

  return {
    stdout: "",
    "results.json": JSON.stringify(data, null, 2),
  };
}
