import { describe, it, expect, vi, beforeEach } from "vitest";
import { markNotificationsAsRead } from "./mark-notifications-as-read";
import type { IWebNotificationRepository } from "../repositories/web-notification.repository.interface";
import type { WebNotificationEntity } from "../entities/web-notification.entity";

describe("markNotificationsAsRead use case", () => {
  let mockRepository: IWebNotificationRepository;

  const createMockNotification = (
    id: string,
    userId: string,
    organizationId: string,
  ): WebNotificationEntity => ({
    id,
    userId,
    organizationId,
    status: "UNREAD",
    type: "KAIZEN_COMPLETED",
    createdDate: new Date().toISOString(),
  });

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("should mark notifications as read", async () => {
    const notification1 = createMockNotification("notif-1", "user-123", "org-123");
    const notification2 = createMockNotification("notif-2", "user-123", "org-123");

    vi.mocked(mockRepository.findById)
      .mockResolvedValueOnce(notification1)
      .mockResolvedValueOnce(notification2);

    const input = {
      userId: "user-123",
      organizationId: "org-123",
      notificationIds: ["notif-1", "notif-2"],
    };

    const { updatedCount } = await markNotificationsAsRead(input, mockRepository);

    expect(updatedCount).toBe(2);
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: "notif-1", status: "READ" }),
    );
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: "notif-2", status: "READ" }),
    );
  });

  it("should not update notifications from different user", async () => {
    const notification = createMockNotification("notif-1", "other-user", "org-123");
    vi.mocked(mockRepository.findById).mockResolvedValue(notification);

    const input = {
      userId: "user-123",
      organizationId: "org-123",
      notificationIds: ["notif-1"],
    };

    const { updatedCount } = await markNotificationsAsRead(input, mockRepository);

    expect(updatedCount).toBe(0);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it("should not update notifications from different organization", async () => {
    const notification = createMockNotification("notif-1", "user-123", "other-org");
    vi.mocked(mockRepository.findById).mockResolvedValue(notification);

    const input = {
      userId: "user-123",
      organizationId: "org-123",
      notificationIds: ["notif-1"],
    };

    const { updatedCount } = await markNotificationsAsRead(input, mockRepository);

    expect(updatedCount).toBe(0);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it("should skip non-existent notifications", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const input = {
      userId: "user-123",
      organizationId: "org-123",
      notificationIds: ["notif-nonexistent"],
    };

    const { updatedCount } = await markNotificationsAsRead(input, mockRepository);

    expect(updatedCount).toBe(0);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
