import type {
  JobRoleEntity,
  JobRoleVariant,
} from "@domain/job-role/entities/job-role.entity";
import { ApiProperty } from "@nestjs/swagger";

export class JobRoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [Object] })
  variants: JobRoleVariant[];

  @ApiProperty({ required: false })
  updatedBy?: string;

  @ApiProperty({ required: false })
  updatedAt?: string;

  @ApiProperty({ required: false })
  createdAt?: string;

  @ApiProperty({ required: false })
  createdBy?: string;

  @ApiProperty()
  sequence: number;

  static fromEntity(entity: JobRoleEntity): JobRoleResponseDto {
    const dto = new JobRoleResponseDto();
    dto.id = entity.id;
    dto.organizationId = entity.organizationId;
    dto.name = entity.name;
    dto.variants = entity.variants;
    dto.updatedBy = entity.updatedBy;
    dto.updatedAt = entity.updatedAt;
    dto.createdAt = entity.createdAt;
    dto.createdBy = entity.createdBy;
    return dto;
  }
}
