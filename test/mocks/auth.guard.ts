// Mock Auth Guard for E2E tests
// Checks for authorization header and allows/denies accordingly

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Check if Authorization header is present
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No authorization token provided");
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedException("Invalid authorization token");
    }

    // Mock user data - simulate authenticated user
    request.user = {
      id: "test-user-id",
      email: "test@example.com",
      organizationId: "test-org-id",
      role: "admin",
    };

    return true; // Has token = allow
  }
}
