import {
  Controller,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserService } from "./user.service";

/**
 * @deprecated Este controller foi substituído pelo UserSingularController.
 * Todas as rotas de /user agora estão em user-singular.controller.ts
 */
@ApiTags("user")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("user-legacy")
export class UserController {
  constructor(private readonly userService: UserService) {}
}
