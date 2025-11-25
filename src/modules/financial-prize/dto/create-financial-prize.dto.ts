import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

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
  @IsNotEmpty()
  @IsString()
  organizationId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  projectId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  gameId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Period in format YYYY-MM" })
  @IsNotEmpty()
  @IsString()
  period: string;

  @ApiPropertyOptional({ type: FinancialPrizeDetailsDto })
  @IsObject()
  @IsOptional()
  details?: FinancialPrizeDetailsDto;
}
