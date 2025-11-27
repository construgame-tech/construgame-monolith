import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserService } from "../user/user.service";
import { CreateMemberDto } from "./dto/create-member.dto";
import { MemberResponseDto } from "./dto/member-response.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MemberService } from "./member.service";

// Import DTOs
class ImportMemberItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: ["admin", "manager", "player", "financial"] })
  @IsEnum(["admin", "manager", "player", "financial"])
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sector?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sectorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  jobRoleVariantId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  seniority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  hoursPerDay?: number;
}

class ImportMembersBodyDto {
  @ApiProperty({ type: [ImportMemberItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportMemberItemDto)
  members: ImportMemberItemDto[];
}

@ApiTags("member")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organization/:organizationId/member")
export class MemberController {
  constructor(
    @Inject(MemberService)
    private readonly memberService: MemberService,
    private readonly userService: UserService,
  ) {}

  @Post("import")
  @ApiOperation({ summary: "Import members in bulk" })
  @ApiResponse({ status: 200, description: "Bulk import completed" })
  async importMembers(
    @Param("organizationId") organizationId: string,
    @Body() body: ImportMembersBodyDto,
  ) {
    const success: Array<{ userId: string; name: string; email: string }> = [];
    const duplicates: Array<{ name: string; email: string; reason: string }> =
      [];

    // Buscar membros existentes para verificar duplicatas
    const existingMembers =
      await this.memberService.listOrganizationMembers(organizationId);

    // Buscar os emails dos usuários existentes
    const existingUserEmails = new Set<string>();
    for (const member of existingMembers) {
      try {
        const { user } = await this.userService.findById(member.userId);
        if (user.email) {
          existingUserEmails.add(user.email.toLowerCase());
        }
      } catch {
        // Ignora usuários que não existem mais
      }
    }

    for (const memberData of body.members) {
      // Verificar duplicata por email
      if (existingUserEmails.has(memberData.email.toLowerCase())) {
        duplicates.push({
          name: memberData.name,
          email: memberData.email,
          reason: "Member with this email already exists",
        });
        continue;
      }

      try {
        // Primeiro, buscar ou criar o usuário
        let userId: string;
        const { user: existingUser } = await this.userService.findByEmail(
          memberData.email,
        );

        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Usuário não existe, criar novo
          const { user: newUser } = await this.userService.create({
            name: memberData.name,
            email: memberData.email,
            nickname: memberData.nickname,
            phone: memberData.phone,
          });
          userId = newUser.id;
        }

        // Depois, criar o membro
        await this.memberService.createMember({
          userId,
          organizationId,
          role: memberData.role as any,
          position: memberData.position,
          sector: memberData.sector,
          sectorId: memberData.sectorId,
          jobRoleId: memberData.jobRoleId,
          jobRoleVariantId: memberData.jobRoleVariantId,
          salary: memberData.salary,
          seniority: memberData.seniority,
          state: memberData.state,
          hoursPerDay: memberData.hoursPerDay,
        });

        success.push({
          userId,
          name: memberData.name,
          email: memberData.email,
        });

        existingUserEmails.add(memberData.email.toLowerCase());
      } catch (error) {
        duplicates.push({
          name: memberData.name,
          email: memberData.email,
          reason: error.message || "Failed to create member",
        });
      }
    }

    return {
      success,
      duplicates,
      summary: {
        total: body.members.length,
        imported: success.length,
        duplicated: duplicates.length,
      },
    };
  }

  @Post()
  @ApiOperation({ summary: "Create a new member (add user to organization)" })
  @ApiResponse({ status: 201, type: MemberResponseDto })
  async createMember(
    @Param("organizationId") organizationId: string,
    @Body() dto: CreateMemberDto,
  ): Promise<MemberResponseDto> {
    const member = await this.memberService.createMember({
      ...dto,
      organizationId,
    });
    return MemberResponseDto.fromEntity(member);
  }

  @Get(":userId")
  @ApiOperation({ summary: "Get member by user ID" })
  @ApiResponse({ status: 200, type: MemberResponseDto })
  async getMember(
    @Param("organizationId") organizationId: string,
    @Param("userId") userId: string,
  ): Promise<MemberResponseDto> {
    const member = await this.memberService.getMember(userId, organizationId);
    return MemberResponseDto.fromEntity(member);
  }

  @Get()
  @ApiOperation({ summary: "List all members of an organization" })
  @ApiResponse({ status: 200 })
  async listMembers(
    @Param("organizationId") organizationId: string,
  ): Promise<{ items: MemberResponseDto[] }> {
    const members =
      await this.memberService.listOrganizationMembersWithUserData(
        organizationId,
      );
    return { items: members.map(MemberResponseDto.fromMemberWithUser) };
  }

  @Patch(":userId")
  @ApiOperation({ summary: "Update member" })
  @ApiResponse({ status: 200, type: MemberResponseDto })
  async updateMember(
    @Param("organizationId") organizationId: string,
    @Param("userId") userId: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<MemberResponseDto> {
    const member = await this.memberService.updateMember({
      userId,
      organizationId,
      ...dto,
    });
    return MemberResponseDto.fromEntity(member);
  }

  @Delete(":userId")
  @HttpCode(204)
  @ApiOperation({ summary: "Remove member from organization" })
  @ApiResponse({ status: 204 })
  async deleteMember(
    @Param("organizationId") organizationId: string,
    @Param("userId") userId: string,
  ): Promise<void> {
    await this.memberService.deleteMember(userId, organizationId);
  }
}
