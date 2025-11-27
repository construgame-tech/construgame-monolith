import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateSectorDto } from "./dto/create-sector.dto";
import { SectorResponseDto } from "./dto/sector-response.dto";
import { UpdateSectorDto } from "./dto/update-sector.dto";
import { SectorService } from "./sector.service";

@ApiTags("Sectors")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/config/sector")
export class SectorController {
  constructor(
    @Inject(SectorService)
    private readonly service: SectorService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create sector" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateSectorDto,
  ) {
    const sector = await this.service.create(organizationId, dto);
    return SectorResponseDto.fromEntity(sector);
  }

  @Get()
  @ApiOperation({ summary: "List all sectors" })
  async findAll(@Param("organizationId") organizationId: string) {
    const sectors = await this.service.findAll(organizationId);
    return { items: sectors.map(SectorResponseDto.fromEntity) };
  }

  @Get(":sectorId")
  @ApiOperation({ summary: "Get sector by ID" })
  async findById(
    @Param("organizationId") organizationId: string,
    @Param("sectorId") sectorId: string,
  ) {
    const sector = await this.service.findById(organizationId, sectorId);
    return SectorResponseDto.fromEntity(sector);
  }

  @Patch(":sectorId")
  @ApiOperation({ summary: "Update sector" })
  async update(
    @Param("organizationId") organizationId: string,
    @Param("sectorId") sectorId: string,
    @Body() dto: UpdateSectorDto,
  ) {
    const sector = await this.service.update(organizationId, sectorId, dto);
    return SectorResponseDto.fromEntity(sector);
  }

  @Delete(":sectorId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete sector" })
  async delete(
    @Param("organizationId") organizationId: string,
    @Param("sectorId") sectorId: string,
  ) {
    await this.service.delete(organizationId, sectorId);
  }
}
