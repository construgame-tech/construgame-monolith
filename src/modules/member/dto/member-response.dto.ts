import type {
  MemberEntity,
  MemberRole,
  MemberWithUser,
  UserStatus,
} from "@domain/member/entities/member.entity";
import { ApiProperty } from "@nestjs/swagger";

export class MemberResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  organizationId?: string;

  @ApiProperty({ enum: ["owner", "admin", "manager", "player", "financial"] })
  role: MemberRole;

  @ApiProperty({ required: false })
  sectorId?: string;

  @ApiProperty({ required: false })
  sector?: string;

  @ApiProperty({ required: false })
  position?: string;

  @ApiProperty({ required: false })
  jobRoleId?: string;

  @ApiProperty({ required: false })
  jobRoleVariantId?: string;

  @ApiProperty({ required: false })
  salary?: number;

  @ApiProperty({ required: false })
  seniority?: string;

  @ApiProperty({ required: false })
  state?: string;

  @ApiProperty({ required: false })
  hoursPerDay?: number;

  // User fields
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  nickname?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  photo?: string;

  @ApiProperty({
    required: false,
    enum: ["WAITING_CONFIRMATION", "ACTIVE"],
  })
  status?: UserStatus;

  @ApiProperty({ required: false })
  customId?: string;

  static fromEntity(entity: MemberEntity): MemberResponseDto {
    const dto = new MemberResponseDto();
    dto.userId = entity.userId;
    dto.organizationId = entity.organizationId;
    dto.role = entity.role;
    dto.sectorId = entity.sectorId;
    dto.sector = entity.sector;
    dto.position = entity.position;
    dto.jobRoleId = entity.jobRoleId;
    dto.jobRoleVariantId = entity.jobRoleVariantId;
    dto.salary = entity.salary;
    dto.seniority = entity.seniority;
    dto.state = entity.state;
    dto.hoursPerDay = entity.hoursPerDay;
    return dto;
  }

  static fromMemberWithUser(entity: MemberWithUser): MemberResponseDto {
    const dto = new MemberResponseDto();
    dto.userId = entity.userId;
    dto.role = entity.role;
    dto.sectorId = entity.sectorId;
    dto.sector = entity.sector;
    dto.position = entity.position;
    dto.jobRoleId = entity.jobRoleId;
    dto.jobRoleVariantId = entity.jobRoleVariantId;
    dto.salary = entity.salary;
    dto.seniority = entity.seniority;
    dto.state = entity.state;
    dto.hoursPerDay = entity.hoursPerDay;
    // User fields
    dto.name = entity.name;
    dto.nickname = entity.nickname;
    dto.phone = entity.phone;
    dto.email = entity.email;
    dto.photo = entity.photo;
    dto.status = entity.status;
    dto.customId = entity.customId;
    return dto;
  }
}
