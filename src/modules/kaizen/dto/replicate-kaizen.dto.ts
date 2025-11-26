import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class ReplicateKaizenDto {
  @ApiProperty({
    description: "ID of the original kaizen to replicate",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  originalKaizenId!: string;

  @ApiPropertyOptional({
    description: "ID of the author/creator of the replica",
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: "ID of the leader responsible for the replica",
  })
  @IsOptional()
  @IsUUID()
  leaderId?: string;

  @ApiPropertyOptional({
    description: "ID of the team responsible for the replica",
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;
}
