import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  const mockUserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByPhone: vi.fn(),
    save: vi.fn(),
    updateAuthCodeOnly: vi.fn(),
    saveWithoutEvents: vi.fn(),
  };

  const mockMemberRepository = {
    findByUserId: vi.fn(),
  };

  const mockJwtService = {
    sign: vi.fn(),
    verify: vi.fn(),
  };

  const mockEmailService = {
    sendRecoverPasswordEmail: vi.fn(),
    sendWelcomeEmail: vi.fn(),
  };

  const mockSmsService = {
    sendSms: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: "UserRepository",
          useValue: mockUserRepository,
        },
        {
          provide: "MemberRepository",
          useValue: mockMemberRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: "EmailService",
          useValue: mockEmailService,
        },
        {
          provide: "SmsService",
          useValue: mockSmsService,
        },
      ],
    })
      .overrideProvider(AuthService)
      .useFactory({
        factory: () => {
          return {
            refreshWebToken: vi.fn(),
            refreshAppToken: vi.fn(),
            ssoMicrosoft: vi.fn(),
            validateUser: vi.fn(),
            loginWeb: vi.fn(),
            loginApp: vi.fn(),
          };
        },
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
