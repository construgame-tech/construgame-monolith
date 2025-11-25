import { DatabaseModule } from "@infrastructure/database/database.module";
import { WebNotificationRepository } from "@infrastructure/repositories/web-notification.repository";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: "IWebNotificationRepository",
      useClass: WebNotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
