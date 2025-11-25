import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

class FinancialPrizeDetailsDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  laborCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  kpiMultiplier?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  taskPoints?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  kaizenPoints?: number;
}

export class CreateFinancialPrizeDto {
  @ApiProperty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsString()
  gameId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Period in format YYYY-MM" })
  @IsString()
  period: string;

  @ApiPropertyOptional({ type: FinancialPrizeDetailsDto })
  @IsObject()
  @IsOptional()
  details?: FinancialPrizeDetailsDto;
}
