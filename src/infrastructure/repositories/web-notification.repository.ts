import {
  WebNotificationEntity,
  WebNotificationStatus,
} from "@domain/notification/entities/web-notification.entity";
import {
  IWebNotificationRepository,
  WebNotificationListResult,
} from "@domain/notification/repositories/web-notification.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { webNotifications } from "../database/schemas/web-notification.schema";

@Injectable()
export class WebNotificationRepository implements IWebNotificationRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(notification: WebNotificationEntity): Promise<void> {
    const notificationData = {
      id: notification.id,
      userId: notification.userId,
      organizationId: notification.organizationId,
      status: notification.status,
      type: notification.type,
      createdDate: notification.createdDate,
      kaizenCompletedData: notification.kaizenCompletedData || null,
    };

    // Upsert: insert or update if exists
    await this.db
      .insert(webNotifications)
      .values(notificationData)
      .onConflictDoUpdate({
        target: webNotifications.id,
        set: notificationData,
      });
  }

  async findById(
    notificationId: string,
  ): Promise<WebNotificationEntity | null> {
    const result = await this.db
      .select()
      .from(webNotifications)
      .where(eq(webNotifications.id, notificationId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByUser(
    organizationId: string,
    userId: string,
    status?: WebNotificationStatus,
  ): Promise<WebNotificationListResult> {
    const conditions = [
      eq(webNotifications.userId, userId),
      eq(webNotifications.organizationId, organizationId),
    ];

    if (status) {
      conditions.push(eq(webNotifications.status, status));
    }

    const result = await this.db
      .select()
      .from(webNotifications)
      .where(and(...conditions))
      .orderBy(desc(webNotifications.createdDate));

    return {
      notifications: result.map((row) => this.mapToEntity(row)),
    };
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<WebNotificationEntity[]> {
    const result = await this.db
      .select()
      .from(webNotifications)
      .where(
        and(
          eq(webNotifications.userId, userId),
          eq(webNotifications.organizationId, organizationId),
        ),
      )
      .orderBy(desc(webNotifications.createdDate));

    return result.map((row) => this.mapToEntity(row));
  }

  async markAsRead(
    userId: string,
    organizationId: string,
    notificationIds: string[],
  ): Promise<void> {
    // Update all notifications matching the IDs
    for (const id of notificationIds) {
      await this.db
        .update(webNotifications)
        .set({ status: "READ" })
        .where(
          and(
            eq(webNotifications.id, id),
            eq(webNotifications.userId, userId),
            eq(webNotifications.organizationId, organizationId),
          ),
        );
    }
  }

  private mapToEntity(
    row: typeof webNotifications.$inferSelect,
  ): WebNotificationEntity {
    return {
      id: row.id,
      userId: row.userId,
      organizationId: row.organizationId,
      status: row.status,
      type: row.type,
      createdDate: row.createdDate,
      kaizenCompletedData: row.kaizenCompletedData || undefined,
    };
  }
}
