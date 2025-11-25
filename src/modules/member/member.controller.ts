import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateMemberDto } from "./dto/create-member.dto";
import { MemberResponseDto } from "./dto/member-response.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MemberService } from "./member.service";

@ApiTags("members")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("organizations/:organizationId/members")
export class MemberController {
  constructor(
    @Inject(MemberService)
    private readonly memberService: MemberService,
  ) {}

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
  @ApiResponse({ status: 200, type: [MemberResponseDto] })
  async listMembers(
    @Param("organizationId") organizationId: string,
  ): Promise<MemberResponseDto[]> {
    const members =
      await this.memberService.listOrganizationMembers(organizationId);
    return members.map(MemberResponseDto.fromEntity);
  }

  @Put(":userId")
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
