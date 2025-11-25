import { DatabaseModule } from "@infrastructure/database/database.module";
import { OrgConfigRepository } from "@infrastructure/repositories/org-config.repository";
import { OrgKaizenConfigRepository } from "@infrastructure/repositories/org-kaizen-config.repository";
import { PrizeRepository } from "@infrastructure/repositories/prize.repository";
import { SectorRepository } from "@infrastructure/repositories/sector.repository";
import { Module } from "@nestjs/common";
import { OrgConfigController } from "./org-config.controller";
import { OrgConfigService } from "./org-config.service";
import { OrgKaizenConfigController } from "./org-kaizen-config.controller";
import { OrgKaizenConfigService } from "./org-kaizen-config.service";
import { PrizeController } from "./prize.controller";
import { PrizeService } from "./prize.service";
import { SectorController } from "./sector.controller";
import { SectorService } from "./sector.service";

@Module({
  imports: [DatabaseModule],
  controllers: [
    OrgConfigController,
    SectorController,
    PrizeController,
    OrgKaizenConfigController,
  ],
  providers: [
    OrgConfigService,
    SectorService,
    PrizeService,
    OrgKaizenConfigService,
    {
      provide: "IOrgConfigRepository",
      useClass: OrgConfigRepository,
    },
    {
      provide: "ISectorRepository",
      useClass: SectorRepository,
    },
    {
      provide: "IPrizeRepository",
      useClass: PrizeRepository,
    },
    {
      provide: "IOrgKaizenConfigRepository",
      useClass: OrgKaizenConfigRepository,
    },
  ],
  exports: [
    OrgConfigService,
    SectorService,
    PrizeService,
    OrgKaizenConfigService,
  ],
})
export class OrganizationConfigModule {}
