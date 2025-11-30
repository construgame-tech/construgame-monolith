import { OrganizationAccessGuard } from "@common/guards";
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  SearchResultOrganizationDto,
  SearchResultUserDto,
} from "./dto/search-result.dto";
import { SearchService } from "./search.service";

@ApiTags("search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationAccessGuard)
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get("user")
  @ApiOperation({ summary: "Search users" })
  @ApiQuery({
    name: "query",
    required: true,
    description: "Search query string",
  })
  @ApiResponse({
    status: 200,
    description: "List of matching users",
    type: [SearchResultUserDto],
  })
  async searchUsers(
    @Query("query") query: string,
  ): Promise<{ items: SearchResultUserDto[] }> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException("Query must be at least 2 characters");
    }

    const results = await this.searchService.searchUsers(query);
    return { items: results };
  }

  @Get("organization")
  @ApiOperation({ summary: "Search organizations" })
  @ApiQuery({
    name: "query",
    required: true,
    description: "Search query string",
  })
  @ApiResponse({
    status: 200,
    description: "List of matching organizations",
    type: [SearchResultOrganizationDto],
  })
  async searchOrganizations(
    @Query("query") query: string,
  ): Promise<{ items: SearchResultOrganizationDto[] }> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException("Query must be at least 2 characters");
    }

    const results = await this.searchService.searchOrganizations(query);
    return { items: results };
  }
}
