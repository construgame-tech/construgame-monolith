import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { GenerateAuthCodeDto } from "./dto/generate-auth-code.dto";
import { LoginWebDto } from "./dto/login-web.dto";
import { RecoverPasswordDto } from "./dto/recover-password.dto";
import { ValidateAuthCodeDto } from "./dto/validate-auth-code.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post("web/token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password (Web)" })
  @ApiResponse({ status: 200, description: "Return JWT access token" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async loginWeb(@Body() loginDto: LoginWebDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return this.authService.loginWeb(user);
  }

  @Post("generate-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generate authentication code for phone login (App)",
  })
  @ApiResponse({
    status: 200,
    description: "Auth code generated and sent via SMS",
  })
  @ApiResponse({ status: 400, description: "Invalid phone number" })
  async generateAuthCode(@Body() generateDto: GenerateAuthCodeDto) {
    return this.authService.generatePhoneAuthCode(generateDto.phone);
  }

  @Post("app/token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with phone and auth code (App)" })
  @ApiResponse({ status: 200, description: "Return JWT access token" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async loginApp(@Body() validateDto: ValidateAuthCodeDto) {
    return this.authService.loginApp(validateDto.phone, validateDto.authCode);
  }

  @Post("recover-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password recovery code" })
  @ApiResponse({
    status: 200,
    description: "Recovery code sent if email exists",
  })
  async recoverPassword(@Body() recoverDto: RecoverPasswordDto) {
    return this.authService.recoverPassword(recoverDto.email);
  }

  @Post("web/password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Change password with recovery code" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid recovery code or user not found",
  })
  async changePassword(@Body() changeDto: ChangePasswordDto) {
    return this.authService.changePassword(
      changeDto.userId,
      changeDto.code,
      changeDto.password,
    );
  }
}
