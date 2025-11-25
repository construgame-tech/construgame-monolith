import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Module } from "@nestjs/common";
import { OrganizationController } from "./organization.controller";

@Module({
  imports: [],
  controllers: [OrganizationController],
  providers: [OrganizationRepository],
  exports: [OrganizationRepository],
})
export class OrganizationModule {}
