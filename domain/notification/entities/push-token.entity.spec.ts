import { describe, expect, it } from "vitest";
import {
  createPushTokenEntity,
  type PlatformType,
  validatePushToken,
} from "./push-token.entity";

describe("PushTokenEntity", () => {
  describe("createPushTokenEntity", () => {
    const validInput = {
      userId: "user-123",
      pushToken: "ExponentPushToken[abc123]",
      platformEndpoint:
        "arn:aws:sns:us-east-1:123456789:endpoint/GCM/app/token",
    };

    it("should create entity with required fields", () => {
      const token = createPushTokenEntity(validInput);

      expect(token.userId).toBe("user-123");
      expect(token.pushToken).toBe("ExponentPushToken[abc123]");
      expect(token.platformEndpoint).toBe(
        "arn:aws:sns:us-east-1:123456789:endpoint/GCM/app/token",
      );
    });

    it("should create entity without platformType by default", () => {
      const token = createPushTokenEntity(validInput);

      expect(token.platformType).toBeUndefined();
    });

    it("should create entity with android platform", () => {
      const input = {
        ...validInput,
        platformType: "android" as PlatformType,
      };

      const token = createPushTokenEntity(input);

      expect(token.platformType).toBe("android");
    });

    it("should create entity with ios platform", () => {
      const input = {
        ...validInput,
        platformType: "ios" as PlatformType,
      };

      const token = createPushTokenEntity(input);

      expect(token.platformType).toBe("ios");
    });
  });

  describe("validatePushToken", () => {
    it("should not throw for valid token", () => {
      expect(() => validatePushToken("valid-token")).not.toThrow();
    });

    it("should throw for empty string", () => {
      expect(() => validatePushToken("")).toThrow("Push token cannot be empty");
    });

    it("should throw for whitespace-only string", () => {
      expect(() => validatePushToken("   ")).toThrow(
        "Push token cannot be empty",
      );
    });

    it("should throw for string with tabs and newlines", () => {
      expect(() => validatePushToken("\t\n")).toThrow(
        "Push token cannot be empty",
      );
    });

    it("should not throw for token with leading/trailing spaces", () => {
      expect(() => validatePushToken("  valid-token  ")).not.toThrow();
    });

    it("should handle various valid token formats", () => {
      const validTokens = [
        "ExponentPushToken[abc123]",
        "FCM_token_12345",
        "apns-device-token-xyz",
        "a",
        "123",
      ];

      for (const token of validTokens) {
        expect(() => validatePushToken(token)).not.toThrow();
      }
    });
  });
});
