import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

/**
 * Guard que valida se o usuário tem acesso à organização requisitada.
 *
 * Verifica se o organizationId do request (param, query ou body) está
 * presente nos roles do usuário autenticado.
 *
 * Uso:
 * @UseGuards(JwtAuthGuard, OrganizationAccessGuard)
 */
@Injectable()
export class OrganizationAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Usuário não autenticado");
    }

    // Superuser tem acesso a tudo
    if (user.userType === "superuser") {
      return true;
    }

    // Extrair organizationId do request (param > query > body)
    const organizationId =
      request.params?.organizationId ||
      request.params?.orgId ||
      request.query?.organizationId ||
      request.query?.orgId ||
      request.body?.organizationId ||
      request.body?.orgId;

    // Se não há organizationId no request, permite (outros guards validarão)
    if (!organizationId) {
      return true;
    }

    // Verificar se o usuário pertence à organização
    const userOrganizations: string[] =
      user.roles?.map((r: { organizationId: string }) => r.organizationId) ||
      [];

    if (!userOrganizations.includes(organizationId)) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar esta organização",
      );
    }

    return true;
  }
}
