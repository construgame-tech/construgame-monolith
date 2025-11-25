import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
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
import { CreateKaizenTypeDto } from "./dto/create-kaizen-type.dto";
import { KaizenTypeResponseDto } from "./dto/kaizen-type-response.dto";
import { UpdateKaizenTypeDto } from "./dto/update-kaizen-type.dto";
import { KaizenTypeService } from "./kaizen-type.service";

@ApiTags("kaizen-types")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/kaizen-types")
export class KaizenTypeController {
  constructor(
    @Inject(KaizenTypeService)
    private readonly kaizenTypeService: KaizenTypeService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new kaizen type" })
  @ApiResponse({ status: 201, type: KaizenTypeResponseDto })
  async createType(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateKaizenTypeDto,
  ): Promise<KaizenTypeResponseDto> {
    const type = await this.typeService.createType({
      ...dto,
      organizationId,
    });
    return KaizenTypeResponseDto.fromEntity(type);
  }

  @Get(":typeId")
  @ApiOperation({ summary: "Get kaizen type by ID" })
  @ApiResponse({ status: 200, type: KaizenTypeResponseDto })
  async getType(
    @Param("organizationId") organizationId: string,
    @Param("typeId") typeId: string,
  ): Promise<KaizenTypeResponseDto> {
    const type = await this.typeService.getType(organizationId, typeId);
    return KaizenTypeResponseDto.fromEntity(type);
  }

  @Get()
  @ApiOperation({ summary: "List all kaizen types of an organization" })
  @ApiResponse({ status: 200, type: [KaizenTypeResponseDto] })
  async listTypes(
    @Param("organizationId") organizationId: string,
  ): Promise<KaizenTypeResponseDto[]> {
    const types = await this.typeService.listByOrganization(organizationId);
    return types.map(KaizenTypeResponseDto.fromEntity);
  }

  @Put(":typeId")
  @ApiOperation({ summary: "Update kaizen type" })
  @ApiResponse({ status: 200, type: KaizenTypeResponseDto })
  async updateType(
    @Param("organizationId") organizationId: string,
    @Param("typeId") typeId: string,
    @Body() dto: UpdateKaizenTypeDto,
  ): Promise<KaizenTypeResponseDto> {
    const type = await this.typeService.updateType({
      organizationId,
      typeId,
      ...dto,
    });
    return KaizenTypeResponseDto.fromEntity(type);
  }

  @Delete(":typeId")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete kaizen type" })
  @ApiResponse({ status: 204 })
  async deleteType(
    @Param("organizationId") organizationId: string,
    @Param("typeId") typeId: string,
  ): Promise<void> {
    await this.typeService.deleteType(organizationId, typeId);
  }
}
