import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const result = appController.getHealth();

      expect(result).toBeDefined();
      expect(result.status).toBe("ok");
      expect(result.message).toBe("Construgame API is running");
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.environment).toBeDefined();
      expect(result.version).toBe("1.0.0");
    });
  });
});
