import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { CreateFinancialPrizeDto } from "./dto/create-financial-prize.dto";
import { FinancialPrizeResponseDto } from "./dto/financial-prize-response.dto";
import { FinancialPrizeService } from "./financial-prize.service";

@ApiTags("Financial Prizes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FinancialPrizeController {
  constructor(
    @Inject(FinancialPrizeService)
    private readonly service: FinancialPrizeService,
  ) {}

  @Post("organizations/:organizationId/financial-prizes")
  @ApiOperation({ summary: "Create financial prize" })
  async create(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateFinancialPrizeDto,
  ) {
    const prize = await this.service.create({ ...dto, organizationId });
    return FinancialPrizeResponseDto.fromEntity(prize);
  }

  @Get("users/:userId/financial-prizes")
  @ApiOperation({ summary: "Get user financial prizes" })
  async findByUser(@Param("userId") userId: string) {
    const prizes = await this.service.findByUser(userId);
    return prizes.map(FinancialPrizeResponseDto.fromEntity);
  }

  @Get("users/:userId/games/:gameId/financial-prizes")
  @ApiOperation({ summary: "Get user financial prize by period" })
  @ApiQuery({
    name: "period",
    required: true,
    description: "Period in format YYYY-MM",
  })
  async findByUserAndPeriod(
    @Param("userId") userId: string,
    @Param("gameId") gameId: string,
    @Query("period") period: string,
  ) {
    const prize = await this.service.findByUserAndPeriod(
      userId,
      gameId,
      period,
    );
    return prize ? FinancialPrizeResponseDto.fromEntity(prize) : null;
  }

  @Get("games/:gameId/financial-prizes")
  @ApiOperation({ summary: "Get game financial prizes by period" })
  @ApiQuery({
    name: "period",
    required: true,
    description: "Period in format YYYY-MM",
  })
  async findByGameAndPeriod(
    @Param("gameId") gameId: string,
    @Query("period") period: string,
  ) {
    const prizes = await this.service.findByGameAndPeriod(gameId, period);
    return prizes.map(FinancialPrizeResponseDto.fromEntity);
  }
}
