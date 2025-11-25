import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateOrgConfigDto } from "./dto/create-org-config.dto";
import { OrgConfigResponseDto } from "./dto/org-config-response.dto";
import { UpdateOrgConfigDto } from "./dto/update-org-config.dto";
import { OrgConfigService } from "./org-config.service";

@ApiTags("Organization Config")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/config")
export class OrgConfigController {
  constructor(
    @Inject(OrgConfigService)
    private readonly service: OrgConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create organization config" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateOrgConfigDto,
  ) {
    const config = await this.service.create(organizationId, dto);
    return OrgConfigResponseDto.fromEntity(config);
  }

  @Get()
  @ApiOperation({ summary: "Get organization config" })
  async findByOrganization(@Param("organizationId") organizationId: string) {
    const config = await this.service.findByOrganization(organizationId);
    return OrgConfigResponseDto.fromEntity(config);
  }

  @Put()
  @ApiOperation({ summary: "Update organization config" })
  async update(
    @Param("organizationId") organizationId: string,
    @Body() dto: UpdateOrgConfigDto,
  ) {
    const config = await this.service.update(organizationId, dto);
    return OrgConfigResponseDto.fromEntity(config);
  }
}
