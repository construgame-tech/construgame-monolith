import { DatabaseModule } from "@infrastructure/database/database.module";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Module } from "@nestjs/common";
import { OrganizationController } from "./organization.controller";
import { OrganizationListController } from "./organization-list.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController, OrganizationListController],
  providers: [OrganizationRepository],
  exports: [OrganizationRepository],
})
export class OrganizationModule {}
