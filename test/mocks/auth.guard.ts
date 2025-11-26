// Mock Auth Guard for E2E tests
// Checks for authorization header and decodes JWT to get user data

import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import jwt from "jsonwebtoken";

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

    try {
      // Decode JWT to get user data (verify with test secret)
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "dev_secret_key",
      ) as any;

      // Set user data from JWT payload
      request.user = {
        id: decoded.sub,
        userId: decoded.sub,
        username: decoded.username,
        email: decoded.email || `${decoded.username}@test.com`,
        organizationId: decoded.organizationId,
        roles: decoded.roles || ["user"],
        userType: decoded.userType || "user",
      };

      return true;
    } catch {
      throw new UnauthorizedException("Invalid authorization token");
    }
  }
}
