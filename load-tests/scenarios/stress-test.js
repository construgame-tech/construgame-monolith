import { check, group, sleep } from "k6";
import http from "k6/http";
import { BASE_URL, defaultHeaders, loadStages } from "../k6-config.js";

/**
 * Stress Test - Encontra o limite da API
 *
 * Objetivo: Descobrir quantos requests/segundo a API aguenta antes de degradar
 *
 * Executar:
 *   docker run -d --cpus="2" --memory="2g" -p 3000:3000 construgame-api
 *   k6 run load-tests/scenarios/stress-test.js
 */

const ORG_ID = __ENV.ORG_ID || "test-org-id";

export const options = {
  stages: loadStages.stress,
  thresholds: {
    // Mais permissivo para stress test - queremos ver onde quebra
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.10"], // até 10% de erro aceitável
  },
};

function getHeaders() {
  const headers = { ...defaultHeaders };
  if (__ENV.API_TOKEN) {
    headers["Authorization"] = `Bearer ${__ENV.API_TOKEN}`;
  }
  return headers;
}

export default function () {
  const headers = getHeaders();

  // Mix de endpoints para simular uso real
  const endpoints = [
    { weight: 30, fn: () => http.get(`${BASE_URL}/health`, { headers }) },
    {
      weight: 25,
      fn: () =>
        http.get(`${BASE_URL}/games?organizationId=${ORG_ID}`, { headers }),
    },
    {
      weight: 20,
      fn: () =>
        http.get(`${BASE_URL}/projects?organizationId=${ORG_ID}`, { headers }),
    },
    {
      weight: 15,
      fn: () =>
        http.get(`${BASE_URL}/members?organizationId=${ORG_ID}`, { headers }),
    },
    {
      weight: 10,
      fn: () =>
        http.get(`${BASE_URL}/kaizens?organizationId=${ORG_ID}`, { headers }),
    },
  ];

  // Selecionar endpoint baseado no peso
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const endpoint of endpoints) {
    cumulative += endpoint.weight;
    if (random <= cumulative) {
      const res = endpoint.fn();
      check(res, {
        "status is 2xx or 4xx": (r) => r.status < 500,
        "response time < 2s": (r) => r.timings.duration < 2000,
      });
      break;
    }
  }

  // Menos sleep para estressar mais
  sleep(Math.random() * 0.5);
}

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration;
  const reqs = data.metrics.http_reqs;
  const failed = data.metrics.http_req_failed;

  console.log("\n========== STRESS TEST RESULTS ==========\n");
  console.log(`📊 Requests/segundo máximo: ${reqs.values.rate.toFixed(2)}`);
  console.log(`⏱️  Latência P95: ${duration.values["p(95)"].toFixed(2)}ms`);
  console.log(`⏱️  Latência P99: ${duration.values["p(99)"].toFixed(2)}ms`);
  console.log(`❌ Taxa de erro: ${(failed.values.rate * 100).toFixed(2)}%`);
  console.log("\n🎯 RECOMENDAÇÃO:");

  const rate = reqs.values.rate;
  if (rate > 200 && failed.values.rate < 0.01) {
    console.log("   t3.micro provavelmente suficiente");
  } else if (rate > 100 && failed.values.rate < 0.05) {
    console.log("   t3.small recomendado");
  } else if (rate > 50) {
    console.log("   t3.medium recomendado");
  } else {
    console.log("   Verificar otimizações na API ou usar t3.large");
  }

  return {
    "stress-results.json": JSON.stringify(data, null, 2),
  };
}
