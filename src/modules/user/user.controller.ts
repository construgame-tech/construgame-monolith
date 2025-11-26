import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SuperuserGuard } from "../auth/superuser.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserService } from "./user.service";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const result = await this.userService.create(createUserDto);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id") id: string): Promise<UserResponseDto> {
    try {
      const result = await this.userService.findById(id);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put(":id")
  @ApiOperation({ summary: "Update user" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.update(id, updateUserDto);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete user" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 204, description: "User deleted" })
  async remove(@Param("id") id: string, @Body() _body?: any): Promise<void> {
    try {
      await this.userService.delete(id);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(":id/activate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Activate user" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async activate(
    @Param("id") id: string,
    @Body() _body?: any,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.activate(id);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Post(":id/superuser")
  @UseGuards(SuperuserGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Make user a superuser (superuser only)" })
  @ApiParam({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({
    status: 403,
    description: "Forbidden - Only superusers can access this resource",
  })
  async makeSuperuser(
    @Param("id") id: string,
    @Body() _body?: any,
  ): Promise<UserResponseDto> {
    try {
      const result = await this.userService.makeSuperuser(id);
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get("by-email/:email")
  @ApiOperation({ summary: "Get user by email" })
  @ApiParam({ name: "email", example: "john@example.com" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findByEmail(@Param("email") email: string): Promise<UserResponseDto> {
    try {
      const result = await this.userService.findByEmail(email);
      if (!result.user) {
        throw new NotFoundException("User not found");
      }
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get("by-phone/:phone")
  @ApiOperation({ summary: "Get user by phone" })
  @ApiParam({ name: "phone", example: "+5511999999999" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findByPhone(@Param("phone") phone: string): Promise<UserResponseDto> {
    try {
      const result = await this.userService.findByPhone(phone);
      if (!result.user) {
        throw new NotFoundException("User not found");
      }
      return UserResponseDto.fromEntity(result.user);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
