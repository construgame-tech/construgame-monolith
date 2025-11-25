import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as in main.ts
    app.setGlobalPrefix("api/v1");

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/health (GET) should return health status", () => {
    return request(app.getHttpServer())
      .get("/api/v1/health")
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe("ok");
        expect(res.body.message).toBe("Construgame API is running");
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.uptime).toBeGreaterThanOrEqual(0);
        expect(res.body.environment).toBe("test");
        expect(res.body.version).toBe("1.0.0");
      });
  });
});
