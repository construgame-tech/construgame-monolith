import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: vi.fn(),
    loginWeb: vi.fn(),
    loginApp: vi.fn(),
    generatePhoneAuthCode: vi.fn(),
    recoverPassword: vi.fn(),
    validateRecoveryCode: vi.fn(),
    changePassword: vi.fn(),
    adminRecoverPassword: vi.fn(),
    refreshWebToken: vi.fn(),
    refreshAppToken: vi.fn(),
    ssoMicrosoft: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("refreshWebToken", () => {
    it("should refresh web token successfully", async () => {
      const mockResult = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        userId: "user-123",
        roles: [{ organizationId: "org-123", role: "admin" }],
      };

      mockAuthService.refreshWebToken.mockResolvedValue(mockResult);

      const result = await controller.refreshWebToken({
        refreshToken: "valid-refresh-token",
      });

      expect(result).toEqual(mockResult);
      expect(authService.refreshWebToken).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      mockAuthService.refreshWebToken.mockRejectedValue(
        new UnauthorizedException("Invalid or expired refresh token"),
      );

      await expect(
        controller.refreshWebToken({ refreshToken: "invalid-token" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refreshAppToken", () => {
    it("should refresh app token successfully", async () => {
      const mockResult = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        userId: "user-123",
        roles: [{ organizationId: "org-123", role: "player" }],
      };

      mockAuthService.refreshAppToken.mockResolvedValue(mockResult);

      const result = await controller.refreshAppToken({
        refreshToken: "valid-refresh-token",
      });

      expect(result).toEqual(mockResult);
      expect(authService.refreshAppToken).toHaveBeenCalledWith(
        "valid-refresh-token",
      );
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      mockAuthService.refreshAppToken.mockRejectedValue(
        new UnauthorizedException("Invalid or expired refresh token"),
      );

      await expect(
        controller.refreshAppToken({ refreshToken: "invalid-token" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("ssoMicrosoft", () => {
    it("should throw BadRequestException as SSO is not implemented", async () => {
      mockAuthService.ssoMicrosoft.mockRejectedValue(
        new BadRequestException(
          "Microsoft SSO is not yet implemented. Please use email/password login.",
        ),
      );

      await expect(
        controller.ssoMicrosoft({ code: "test-code" }),
      ).rejects.toThrow(BadRequestException);

      expect(authService.ssoMicrosoft).toHaveBeenCalledWith("test-code");
    });
  });

  describe("loginWeb", () => {
    it("should login user successfully", async () => {
      const mockUser = { id: "user-123", email: "test@test.com", name: "Test" };
      const mockLoginResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        userId: "user-123",
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.loginWeb.mockResolvedValue(mockLoginResult);

      const result = await controller.loginWeb({
        email: "test@test.com",
        password: "password123",
      });

      expect(result).toEqual(mockLoginResult);
      expect(authService.validateUser).toHaveBeenCalledWith(
        "test@test.com",
        "password123",
      );
      expect(authService.loginWeb).toHaveBeenCalledWith(mockUser);
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
        controller.loginWeb({
          email: "test@test.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
