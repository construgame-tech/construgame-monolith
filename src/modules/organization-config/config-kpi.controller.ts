import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import { CreateKpiDto } from "@modules/kpi/dto/create-kpi.dto";
import { KpiResponseDto } from "@modules/kpi/dto/kpi-response.dto";
import { UpdateKpiDto } from "@modules/kpi/dto/update-kpi.dto";
import { KpiService } from "@modules/kpi/kpi.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

/**
 * Controller para rotas de KPI no path de configuração da organização
 * Wrapper sobre o KpiService existente
 */
@ApiTags("Config")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/config/kpi")
export class ConfigKpiController {
  constructor(
    @Inject(KpiService)
    private readonly kpiService: KpiService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List organization KPIs" })
  async findAll(
    @Param("organizationId") _organizationId: string,
  ): Promise<{ items: KpiResponseDto[] }> {
    // Por enquanto retorna todos os KPIs, mas pode ser filtrado por organização no futuro
    const kpis = await this.kpiService.listAll();
    return { items: kpis.map(KpiResponseDto.fromEntity) };
  }

  @Post()
  @ApiOperation({ summary: "Create organization KPI" })
  async create(
    @Param("organizationId") _organizationId: string,
    @Body() dto: CreateKpiDto,
  ): Promise<KpiResponseDto> {
    const kpi = await this.kpiService.createKpi(dto);
    return KpiResponseDto.fromEntity(kpi);
  }

  @Put(":kpiId")
  @ApiOperation({ summary: "Update organization KPI" })
  async update(
    @Param("organizationId") _organizationId: string,
    @Param("kpiId") kpiId: string,
    @Body() dto: UpdateKpiDto,
  ): Promise<KpiResponseDto> {
    const kpi = await this.kpiService.updateKpi({ kpiId, ...dto });
    return KpiResponseDto.fromEntity(kpi);
  }

  @Delete(":kpiId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete organization KPI" })
  async delete(
    @Param("organizationId") _organizationId: string,
    @Param("kpiId") kpiId: string,
  ): Promise<void> {
    await this.kpiService.deleteKpi(kpiId);
  }
}
