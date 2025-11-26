import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  UserOrganizationItemDto,
  UserOrganizationsResponseDto,
} from "./dto/user-organization-response.dto";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("user")
export class UserOrganizationController {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  @Get(":userId/organization")
  @ApiOperation({ summary: "List organizations for a user" })
  @ApiParam({
    name: "userId",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({ status: 200, type: UserOrganizationsResponseDto })
  async listUserOrganizations(
    @Param("userId") userId: string,
  ): Promise<UserOrganizationsResponseDto> {
    // Busca todos os memberships do usuário
    const memberships = await this.memberRepository.findByUserId(userId);

    // Busca os dados de cada organização e monta a resposta
    const items: UserOrganizationItemDto[] = [];

    for (const membership of memberships) {
      const organization = await this.organizationRepository.findById(
        membership.organizationId,
      );

      if (organization) {
        items.push({
          id: organization.id,
          name: organization.name,
          photo: organization.photo,
          role: membership.role,
        });
      }
    }

    return { items };
  }
}
