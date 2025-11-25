import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateKpiDto } from "./dto/create-kpi.dto";
import { KpiResponseDto } from "./dto/kpi-response.dto";
import { UpdateKpiDto } from "./dto/update-kpi.dto";
import { KpiService } from "./kpi.service";

@ApiTags("kpis")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("kpis")
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Post()
  @ApiOperation({ summary: "Create a new KPI" })
  @ApiResponse({ status: 201, type: KpiResponseDto })
  async createKpi(@Body() dto: CreateKpiDto): Promise<KpiResponseDto> {
    const kpi = await this.kpiService.createKpi(dto);
    return KpiResponseDto.fromEntity(kpi);
  }

  @Get(":kpiId")
  @ApiOperation({ summary: "Get KPI by ID" })
  @ApiResponse({ status: 200, type: KpiResponseDto })
  async getKpi(@Param("kpiId") kpiId: string): Promise<KpiResponseDto> {
    const kpi = await this.kpiService.getKpi(kpiId);
    return KpiResponseDto.fromEntity(kpi);
  }

  @Get()
  @ApiOperation({ summary: "List all KPIs" })
  @ApiResponse({ status: 200, type: [KpiResponseDto] })
  async listKpis(): Promise<KpiResponseDto[]> {
    const kpis = await this.kpiService.listAll();
    return kpis.map(KpiResponseDto.fromEntity);
  }

  @Put(":kpiId")
  @ApiOperation({ summary: "Update KPI" })
  @ApiResponse({ status: 200, type: KpiResponseDto })
  async updateKpi(
    @Param("kpiId") kpiId: string,
    @Body() dto: UpdateKpiDto,
  ): Promise<KpiResponseDto> {
    const kpi = await this.kpiService.updateKpi({
      kpiId,
      ...dto,
    });
    return KpiResponseDto.fromEntity(kpi);
  }

  @Delete(":kpiId")
  @ApiOperation({ summary: "Delete KPI" })
  @ApiResponse({ status: 204 })
  async deleteKpi(@Param("kpiId") kpiId: string): Promise<void> {
    await this.kpiService.deleteKpi(kpiId);
  }
}
