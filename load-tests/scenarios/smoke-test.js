import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, defaultHeaders, defaultThresholds, loadStages } from '../k6-config.js';

/**
 * Smoke Test - Teste básico para verificar se a API está funcionando
 * 
 * Executar: k6 run load-tests/scenarios/smoke-test.js
 * Com env: API_URL=http://sua-api.com k6 run load-tests/scenarios/smoke-test.js
 */

export const options = {
  stages: loadStages.smoke,
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`, { headers: defaultHeaders });
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
