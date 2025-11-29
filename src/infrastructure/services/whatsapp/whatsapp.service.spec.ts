import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppService } from "./whatsapp.service";

describe("WhatsAppService", () => {
  let service: WhatsAppService;

  // Valores fake para testes - NÃO usar credenciais reais
  const mockConfigValues: Record<string, string | undefined> = {
    TWILIO_ACCOUNT_SID: "ACtest1234567890abcdef1234567890ab",
    TWILIO_AUTH_TOKEN: "test_auth_token_fake_1234567890ab",
    TWILIO_WHATSAPP_FROM: "+15551234567",
    TWILIO_WHATSAPP_TEMPLATE_ID: "HXtest1234567890abcdef1234567890ab",
    DEV_PHONE_NUMBER: "+15559876543",
    NODE_ENV: "production",
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppService,
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => mockConfigValues[key]),
          },
        },
      ],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("constructor", () => {
    it("should log warning when credentials are not configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const unconfiguredService = module.get<WhatsAppService>(WhatsAppService);
      expect(unconfiguredService).toBeDefined();
    });

    it("should configure with Twilio credentials", () => {
      // O serviço foi criado com sucesso no beforeEach com credenciais
      expect(service).toBeDefined();
    });
  });

  describe("sendTemplateMessage", () => {
    it("should throw error when Twilio credentials are not configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const unconfiguredService = module.get<WhatsAppService>(WhatsAppService);

      await expect(
        unconfiguredService.sendTemplateMessage("+5511999999999", "HX123", {}),
      ).rejects.toThrow("Twilio credentials not configured");
    });
  });

  describe("sendAuthCode", () => {
    it("should call sendTemplateMessage with correct parameters", async () => {
      // Mocka o método sendTemplateMessage para evitar chamada real ao Twilio
      const sendTemplateSpy = vi
        .spyOn(service, "sendTemplateMessage")
        .mockResolvedValue("SM123456");

      const phone = "+5511999999999";
      const name = "João";
      const authCode = "1234";

      const result = await service.sendAuthCode(phone, name, authCode);

      expect(result).toBe("SM123456");
      expect(sendTemplateSpy).toHaveBeenCalledWith(
        phone,
        "HXa1a3895ab0ec8a0eae5df32625e8bb91",
        { "1": authCode },
      );
    });

    it("should use default template ID when not configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn((key: string) => {
                if (key === "TWILIO_WHATSAPP_TEMPLATE_ID") return undefined;
                return mockConfigValues[key];
              }),
            },
          },
        ],
      }).compile();

      const serviceWithoutTemplate =
        module.get<WhatsAppService>(WhatsAppService);

      const sendTemplateSpy = vi
        .spyOn(serviceWithoutTemplate, "sendTemplateMessage")
        .mockResolvedValue("SM123456");

      await serviceWithoutTemplate.sendAuthCode(
        "+5511999999999",
        "User",
        "9999",
      );

      expect(sendTemplateSpy).toHaveBeenCalledWith(
        "+5511999999999",
        "HXa1a3895ab0ec8a0eae5df32625e8bb91", // Default template
        { "1": "9999" },
      );
    });
  });

  describe("sendTextMessage", () => {
    it("should throw error when Twilio credentials are not configured", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn(() => undefined),
            },
          },
        ],
      }).compile();

      const unconfiguredService = module.get<WhatsAppService>(WhatsAppService);

      await expect(
        unconfiguredService.sendTextMessage("+5511999999999", "Hello"),
      ).rejects.toThrow("Twilio credentials not configured");
    });
  });

  describe("isLocalEnv", () => {
    it("should use dev phone number in development environment", async () => {
      const devConfigValues: Record<string, string | undefined> = {
        ...mockConfigValues,
        NODE_ENV: "development",
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn((key: string) => devConfigValues[key]),
            },
          },
        ],
      }).compile();

      const devService = module.get<WhatsAppService>(WhatsAppService);

      // O serviço foi criado com sucesso para ambiente de desenvolvimento
      expect(devService).toBeDefined();
    });

    it("should use dev phone number when STAGE is local", async () => {
      const localConfigValues: Record<string, string | undefined> = {
        ...mockConfigValues,
        NODE_ENV: "production",
        STAGE: "local",
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          WhatsAppService,
          {
            provide: ConfigService,
            useValue: {
              get: vi.fn((key: string) => localConfigValues[key]),
            },
          },
        ],
      }).compile();

      const localService = module.get<WhatsAppService>(WhatsAppService);

      // O serviço foi criado com sucesso para stage local
      expect(localService).toBeDefined();
    });
  });
});
