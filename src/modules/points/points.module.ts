import { DatabaseModule } from "@infrastructure/database/database.module";
import { Module } from "@nestjs/common";
import { PointsController } from "./points.controller";
import { PointsService } from "./points.service";

@Module({
  imports: [DatabaseModule],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
