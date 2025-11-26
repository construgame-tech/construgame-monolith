import { randomUUID } from "node:crypto";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import jwt from "jsonwebtoken";
import request from "supertest";

export interface TestResponse<T = any> {
  statusCode: number;
  body: T;
  headers: Record<string, string>;
}

export interface TestRequest {
  token?: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
}

/**
 * Create a JWT token for testing
 */
export function createToken(
  userId: string,
  organizationId?: string,
  roles: string[] = ["user"],
  options?: { userType?: "user" | "superuser" },
): string {
  return jwt.sign(
    {
      sub: userId,
      username: `user-${userId}`,
      organizationId,
      roles,
      userType: options?.userType ?? "user",
    },
    process.env.JWT_SECRET || "dev_secret_key",
    { expiresIn: "1d" },
  );
}

/**
 * Make a GET request
 */
export async function getRequest<T = any>(
  app: NestFastifyApplication,
  url: string,
  options: TestRequest = {},
): Promise<TestResponse<T>> {
  let req = request(app.getHttpServer()).get(url);

  if (options.query) {
    req = req.query(options.query);
  }

  if (options.token) {
    req = req.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await req;

  return {
    statusCode: response.status,
    body: response.body.data || response.body,
    headers: response.headers as Record<string, string>,
  };
}

/**
 * Make a POST request
 */
export async function postRequest<T = any>(
  app: NestFastifyApplication,
  url: string,
  options: TestRequest = {},
): Promise<TestResponse<T>> {
  let req = request(app.getHttpServer()).post(url);

  if (options.query) {
    req = req.query(options.query);
  }

  if (options.token) {
    req = req.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.body) {
    req = req.send(options.body);
  }

  const response = await req;

  return {
    statusCode: response.status,
    body: response.body.data || response.body,
    headers: response.headers as Record<string, string>,
  };
}

/**
 * Make a PUT request
 */
export async function putRequest<T = any>(
  app: NestFastifyApplication,
  url: string,
  options: TestRequest = {},
): Promise<TestResponse<T>> {
  let req = request(app.getHttpServer()).put(url);

  if (options.query) {
    req = req.query(options.query);
  }

  if (options.token) {
    req = req.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.body) {
    req = req.send(options.body);
  }

  const response = await req;

  return {
    statusCode: response.status,
    body: response.body.data || response.body,
    headers: response.headers as Record<string, string>,
  };
}

/**
 * Make a DELETE request
 */
export async function deleteRequest<T = any>(
  app: NestFastifyApplication,
  url: string,
  options: TestRequest = {},
): Promise<TestResponse<T>> {
  let req = request(app.getHttpServer()).delete(url);

  if (options.query) {
    req = req.query(options.query);
  }

  if (options.token) {
    req = req.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await req;

  return {
    statusCode: response.status,
    body: response.body.data || response.body,
    headers: response.headers as Record<string, string>,
  };
}

/**
 * Generate fake data helpers
 */
export const faker = {
  uuid: () => randomUUID(),
  email: () => `test-${randomUUID()}@example.com`,
  phone: () => `+55119${Math.random().toString().slice(2, 11)}`,
  name: () => `Test User ${randomUUID().slice(0, 8)}`,
  company: () => `Test Company ${randomUUID().slice(0, 8)}`,
  cnpj: () => `${Math.random().toString().slice(2, 16)}`,
};

/**
 * Test data factories
 */
export const testData = {
  organization: (overrides = {}) => ({
    ownerId: faker.uuid(),
    name: faker.company(),
    ...overrides,
  }),

  user: (organizationId: string, overrides = {}) => ({
    name: faker.name(),
    email: faker.email(),
    phone: faker.phone(),
    organizationId,
    jobRoleId: faker.uuid(),
    ...overrides,
  }),

  project: (organizationId: string, overrides = {}) => ({
    name: `Test Project ${faker.uuid().slice(0, 8)}`,
    description: "Test project description",
    organizationId,
    startDate: new Date().toISOString().split("T")[0],
    ...overrides,
  }),

  game: (organizationId: string, overrides = {}) => ({
    name: `Test Game ${faker.uuid().slice(0, 8)}`,
    description: "Test game description",
    organizationId,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    ...overrides,
  }),

  kaizen: (projectId: string, teamId: string, overrides = {}) => ({
    projectId,
    teamId,
    title: `Test Kaizen ${faker.uuid().slice(0, 8)}`,
    description: "Test kaizen description",
    category: "quality",
    currentSituation: "Current situation",
    solution: "Proposed solution",
    ...overrides,
  }),

  task: (projectId: string, kpiId: string, overrides = {}) => ({
    projectId,
    kpiId,
    name: `Test Task ${faker.uuid().slice(0, 8)}`,
    description: "Test task description",
    ...overrides,
  }),
};
