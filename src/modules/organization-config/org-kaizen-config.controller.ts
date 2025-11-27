import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateOrgKaizenConfigDto } from "./dto/create-org-kaizen-config.dto";
import { OrgKaizenConfigResponseDto } from "./dto/org-kaizen-config-response.dto";
import { UpdateOrgKaizenConfigDto } from "./dto/update-org-kaizen-config.dto";
import { OrgKaizenConfigService } from "./org-kaizen-config.service";

@ApiTags("Organization Kaizen Config")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/config/kaizen")
export class OrgKaizenConfigController {
  constructor(
    @Inject(OrgKaizenConfigService)
    private readonly service: OrgKaizenConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create kaizen config" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateOrgKaizenConfigDto,
  ) {
    const config = await this.service.create(organizationId, dto);
    return OrgKaizenConfigResponseDto.fromEntity(config);
  }

  @Get()
  @ApiOperation({ summary: "Get kaizen config" })
  async findByOrganization(@Param("organizationId") organizationId: string) {
    const config = await this.service.findByOrganization(organizationId);
    return OrgKaizenConfigResponseDto.fromEntity(config);
  }

  @Patch()
  @ApiOperation({ summary: "Update kaizen config" })
  async update(
    @Param("organizationId") organizationId: string,
    @Body() dto: UpdateOrgKaizenConfigDto,
  ) {
    const config = await this.service.update(organizationId, dto);
    return OrgKaizenConfigResponseDto.fromEntity(config);
  }
}
