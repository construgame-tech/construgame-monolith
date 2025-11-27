import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// DTOs para o response de ranking do usuário
class UserRankingPrizeDto {
  prizeId: string;
  type: "points" | "placement";
  value: number;
}

class UserRankingPlacementDto {
  id: string;
  name: string;
  photo?: string;
  points: number;
  placement: number;
}

class UserRankingItemDto {
  prizes: UserRankingPrizeDto[];
  placements: UserRankingPlacementDto[];
}

class RankingItemDto {
  id: string;
  rankingType: "gameRanking" | "leagueRanking";
  name: string;
  status: "ACTIVE" | "DONE" | "PAUSED";
  userRanking: UserRankingItemDto;
}

class UserRankingsResponseDto {
  rankings: RankingItemDto[];
}

@ApiTags("ranking")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UserRankingController {
  @Get("organization/:organizationId/user/:userId/ranking")
  @ApiOperation({
    summary: "Get user rankings",
    description: "List of rankings the user is part of, or is responsible for",
  })
  @ApiParam({ name: "organizationId", type: String })
  @ApiParam({ name: "userId", type: String })
  @ApiResponse({ status: 200, type: UserRankingsResponseDto })
  async getUserRanking(
    @Param("organizationId") _organizationId: string,
    @Param("userId") _userId: string,
  ) {
    // Stub: retorna rankings vazios por enquanto
    return {
      rankings: [],
    };
  }
}
