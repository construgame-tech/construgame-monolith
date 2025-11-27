import type {
  MemberEntity,
  MemberRole,
} from "@domain/member/entities/member.entity";
import { ApiProperty } from "@nestjs/swagger";

export class MemberResponseDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ enum: ["owner", "admin", "manager", "player", "financial"] })
  role: MemberRole;

  @ApiProperty({ required: false })
  sectorId?: string;

  @ApiProperty({ required: false })
  sector?: string;

  @ApiProperty({ required: false })
  position?: string;

  @ApiProperty()
  sequence: number;

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
}
