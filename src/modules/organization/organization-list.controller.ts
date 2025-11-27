import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SuperuserGuard } from "../auth/superuser.guard";
import { OrganizationListItemDto } from "./dto/organization-list-item.dto";

@ApiTags("organizations")
@ApiBearerAuth("JWT-auth")
@Controller("organization")
export class OrganizationListController {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  @Get("all")
  @UseGuards(JwtAuthGuard, SuperuserGuard)
  @ApiOperation({
    summary: "List all organizations (superuser only)",
    description:
      "Returns a list of all organizations. Only superusers can access this endpoint.",
  })
  @ApiResponse({
    status: 200,
    description: "List of all organizations",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Only superusers can access this resource",
  })
  async listAllOrganizations(): Promise<{ items: OrganizationListItemDto[] }> {
    const organizations = await this.organizationRepository.findAll();

    return {
      items: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        photo: org.photo,
        ownerId: org.ownerId,
      })),
    };
  }
}
