import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

/**
 * Controller para rotas globais de prêmios
 * - GET /prize - Lista prêmios globais (todos os prêmios disponíveis)
 * - GET /organization/:orgId/:resourceType/:resourceId/prize - Prêmios financeiros por recurso
 */
@ApiTags("Prize")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class GlobalPrizeController {
  /**
   * Lista prêmios globais
   * Retorna uma lista simplificada de prêmios disponíveis
   */
  @Get("prize")
  @ApiOperation({ summary: "List global prizes" })
  async listGlobalPrizes() {
    // Retorna lista vazia por padrão - pode ser expandido para buscar de todas as organizações
    // ou de uma configuração global
    return { items: [] };
  }

  /**
   * Lista prêmios financeiros por recurso
   */
  @Get("organization/:organizationId/:resourceType/:resourceId/prize")
  @ApiOperation({ summary: "List financial prizes by resource" })
  @ApiParam({ name: "organizationId", description: "Organization ID" })
  @ApiParam({
    name: "resourceType",
    description: "Type of resource",
    enum: ["organization", "project", "activity", "user", "member", "task"],
  })
  @ApiParam({ name: "resourceId", description: "Resource ID" })
  async listPrizesByResource(
    @Param("organizationId") _organizationId: string,
    @Param("resourceType") _resourceType: string,
    @Param("resourceId") _resourceId: string,
  ) {
    // Stub - retorna lista vazia
    // Implementação real deve filtrar prêmios financeiros pelo tipo de recurso
    return { items: [] };
  }
}
