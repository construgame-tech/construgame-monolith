/**
 * Configuração base para testes de carga com k6
 * 
 * Instalação: brew install k6 (mac) ou snap install k6 (linux)
 * Executar: k6 run load-tests/scenarios/smoke-test.js
 */

export const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

export const defaultHeaders = {
  'Content-Type': 'application/json',
  // Adicionar Authorization se necessário
  // 'Authorization': `Bearer ${__ENV.API_TOKEN}`,
};

// Thresholds padrão - a API deve atender esses requisitos
export const defaultThresholds = {
  // 95% das requests devem completar em menos de 500ms
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  // Taxa de erro menor que 1%
  http_req_failed: ['rate<0.01'],
  // Pelo menos 100 req/s
  http_reqs: ['rate>100'],
};

// Cenários de carga progressiva
export const loadStages = {
  // Smoke test - verificar se funciona
  smoke: [
    { duration: '1m', target: 5 },   // 5 usuários por 1 min
  ],
  
  // Load test - carga normal esperada
  load: [
    { duration: '2m', target: 20 },  // ramp up
    { duration: '5m', target: 20 },  // steady
    { duration: '2m', target: 0 },   // ramp down
  ],
  
  // Stress test - encontrar limite
  stress: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '5m', target: 150 },
    { duration: '5m', target: 0 },
  ],
  
  // Spike test - picos repentinos
  spike: [
    { duration: '1m', target: 10 },
    { duration: '30s', target: 200 }, // spike!
    { duration: '1m', target: 10 },
    { duration: '30s', target: 200 }, // spike!
    { duration: '2m', target: 0 },
  ],
};
