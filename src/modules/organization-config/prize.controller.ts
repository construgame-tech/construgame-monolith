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
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreatePrizeDto } from "./dto/create-prize.dto";
import { PrizeResponseDto } from "./dto/prize-response.dto";
import { UpdatePrizeDto } from "./dto/update-prize.dto";
import { PrizeService } from "./prize.service";

@ApiTags("Prizes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/prizes")
export class PrizeController {
  constructor(
    @Inject(PrizeService)
    private readonly service: PrizeService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create prize" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreatePrizeDto,
  ) {
    const prize = await this.service.create(organizationId, dto);
    return PrizeResponseDto.fromEntity(prize);
  }

  @Get()
  @ApiOperation({ summary: "List all prizes" })
  async findAll(@Param("organizationId") organizationId: string) {
    const prizes = await this.service.findAll(organizationId);
    return prizes.map(PrizeResponseDto.fromEntity);
  }

  @Get(":prizeId")
  @ApiOperation({ summary: "Get prize by ID" })
  async findById(
    @Param("organizationId") organizationId: string,
    @Param("prizeId") prizeId: string,
  ) {
    const prize = await this.service.findById(organizationId, prizeId);
    return PrizeResponseDto.fromEntity(prize);
  }

  @Put(":prizeId")
  @ApiOperation({ summary: "Update prize" })
  async update(
    @Param("organizationId") organizationId: string,
    @Param("prizeId") prizeId: string,
    @Body() dto: UpdatePrizeDto,
  ) {
    const prize = await this.service.update(organizationId, prizeId, dto);
    return PrizeResponseDto.fromEntity(prize);
  }

  @Delete(":prizeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete prize" })
  async delete(
    @Param("organizationId") organizationId: string,
    @Param("prizeId") prizeId: string,
  ) {
    await this.service.delete(organizationId, prizeId);
  }
}
