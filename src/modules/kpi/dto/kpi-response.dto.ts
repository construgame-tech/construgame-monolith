import type { KpiEntity } from "@domain/kpi/entities/kpi.entity";
import { ApiProperty } from "@nestjs/swagger";

export class KpiResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false, description: "KPI type: task or kaizen" })
  kpiType?: string;

  @ApiProperty({ required: false })
  photo?: string;

  static fromEntity(entity: KpiEntity): KpiResponseDto {
    const dto = new KpiResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.kpiType = entity.kpiType;
    dto.photo = entity.photo;
    return dto;
  }
}
