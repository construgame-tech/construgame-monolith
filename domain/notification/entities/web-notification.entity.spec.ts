import { describe, it, expect } from "vitest";
import {
  createWebNotificationEntity,
  markWebNotificationAsRead,
  validateWebNotificationData,
  type WebNotificationEntity,
  type KaizenCompletedData,
} from "./web-notification.entity";

describe("WebNotificationEntity", () => {
  const kaizenCompletedData: KaizenCompletedData = {
    kaizenId: "kaizen-123",
    kaizenName: "Safety Improvement",
    kaizenLeaderId: "user-456",
    gameId: "game-123",
    gameName: "Game Q1",
    projectId: "proj-123",
    projectName: "Project Alpha",
  };

  describe("createWebNotificationEntity", () => {
    const validInput = {
      id: "notif-123",
      userId: "user-123",
      organizationId: "org-123",
      type: "KAIZEN_COMPLETED" as const,
      createdDate: "2025-01-15T10:00:00.000Z",
      kaizenCompletedData,
    };

    it("should create entity with required fields", () => {
      const notification = createWebNotificationEntity(validInput);

      expect(notification.id).toBe("notif-123");
      expect(notification.userId).toBe("user-123");
      expect(notification.organizationId).toBe("org-123");
      expect(notification.type).toBe("KAIZEN_COMPLETED");
      expect(notification.createdDate).toBe("2025-01-15T10:00:00.000Z");
    });

    it("should set default status to UNREAD", () => {
      const notification = createWebNotificationEntity(validInput);

      expect(notification.status).toBe("UNREAD");
    });

    it("should include kaizenCompletedData", () => {
      const notification = createWebNotificationEntity(validInput);

      expect(notification.kaizenCompletedData).toEqual(kaizenCompletedData);
    });

    it("should include optional leagueId and leagueName", () => {
      const inputWithLeague = {
        ...validInput,
        kaizenCompletedData: {
          ...kaizenCompletedData,
          leagueId: "league-123",
          leagueName: "Championship",
        },
      };

      const notification = createWebNotificationEntity(inputWithLeague);

      expect(notification.kaizenCompletedData?.leagueId).toBe("league-123");
      expect(notification.kaizenCompletedData?.leagueName).toBe("Championship");
    });

    it("should create entity without kaizenCompletedData", () => {
      const inputWithoutData = {
        id: "notif-123",
        userId: "user-123",
        organizationId: "org-123",
        type: "KAIZEN_COMPLETED" as const,
        createdDate: "2025-01-15T10:00:00.000Z",
      };

      const notification = createWebNotificationEntity(inputWithoutData);

      expect(notification.kaizenCompletedData).toBeUndefined();
    });
  });

  describe("markWebNotificationAsRead", () => {
    const existingNotification: WebNotificationEntity = {
      id: "notif-123",
      userId: "user-123",
      organizationId: "org-123",
      status: "UNREAD",
      type: "KAIZEN_COMPLETED",
      createdDate: "2025-01-15T10:00:00.000Z",
      kaizenCompletedData,
    };

    it("should change status to READ", () => {
      const updated = markWebNotificationAsRead(existingNotification);

      expect(updated.status).toBe("READ");
    });

    it("should preserve all other fields", () => {
      const updated = markWebNotificationAsRead(existingNotification);

      expect(updated.id).toBe("notif-123");
      expect(updated.userId).toBe("user-123");
      expect(updated.organizationId).toBe("org-123");
      expect(updated.type).toBe("KAIZEN_COMPLETED");
      expect(updated.createdDate).toBe("2025-01-15T10:00:00.000Z");
      expect(updated.kaizenCompletedData).toEqual(kaizenCompletedData);
    });

    it("should not change already read notification status", () => {
      const alreadyRead: WebNotificationEntity = {
        ...existingNotification,
        status: "READ",
      };

      const updated = markWebNotificationAsRead(alreadyRead);

      expect(updated.status).toBe("READ");
    });
  });

  describe("validateWebNotificationData", () => {
    it("should not throw for KAIZEN_COMPLETED with data", () => {
      expect(() =>
        validateWebNotificationData("KAIZEN_COMPLETED", kaizenCompletedData)
      ).not.toThrow();
    });

    it("should throw for KAIZEN_COMPLETED without data", () => {
      expect(() =>
        validateWebNotificationData("KAIZEN_COMPLETED", undefined)
      ).toThrow("KAIZEN_COMPLETED notification requires kaizenCompletedData");
    });

    it("should validate kaizenCompletedData structure", () => {
      const validData: KaizenCompletedData = {
        kaizenId: "k-1",
        kaizenName: "Name",
        kaizenLeaderId: "u-1",
        gameId: "g-1",
        gameName: "Game",
        projectId: "p-1",
        projectName: "Project",
      };

      expect(() =>
        validateWebNotificationData("KAIZEN_COMPLETED", validData)
      ).not.toThrow();
    });

    it("should accept minimal kaizenCompletedData", () => {
      const minimalData: KaizenCompletedData = {
        kaizenId: "k-1",
        kaizenName: "N",
        kaizenLeaderId: "u-1",
        gameId: "g-1",
        gameName: "G",
        projectId: "p-1",
        projectName: "P",
      };

      expect(() =>
        validateWebNotificationData("KAIZEN_COMPLETED", minimalData)
      ).not.toThrow();
    });
  });
});
