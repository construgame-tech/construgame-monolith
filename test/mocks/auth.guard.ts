// Mock Auth Guard for E2E tests
// Always allows requests through without requiring authentication

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Mock user data - simulate authenticated user
    request.user = {
      id: "test-user-id",
      email: "test@example.com",
      organizationId: "test-org-id",
      role: "admin",
    };

    return true; // Always allow
  }
}
