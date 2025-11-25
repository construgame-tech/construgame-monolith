import type {
  TaskChecklistItem,
  TaskEntity,
  TaskProgress,
  TaskUpdate,
} from "@domain/task/entities/task.entity";
import { ApiProperty } from "@nestjs/swagger";

export class TaskResponseDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  gameId!: string;

  @ApiProperty({ example: "active", enum: ["active", "completed"] })
  status!: string;

  @ApiProperty({ example: "Fix the roof" })
  name!: string;

  @ApiProperty({ example: 100 })
  rewardPoints!: number;

  @ApiProperty({ example: false, required: false })
  isLocked?: boolean;

  @ApiProperty({ example: "Building A", required: false })
  location?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  teamId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  userId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  kpiId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  taskManagerId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  managerId?: string;

  @ApiProperty({ example: "Description", required: false })
  description?: string;

  @ApiProperty({ example: "meters", required: false })
  measurementUnit?: string;

  @ApiProperty({ example: "100", required: false })
  totalMeasurementExpected?: string;

  @ApiProperty({ example: "https://example.com/video.mp4", required: false })
  videoUrl?: string;

  @ApiProperty({ example: "https://example.com/embed", required: false })
  embedVideoUrl?: string;

  @ApiProperty({ required: false })
  checklist?: TaskChecklistItem[];

  @ApiProperty({ example: "2023-01-01", required: false })
  startDate?: string;

  @ApiProperty({ example: "2023-01-31", required: false })
  endDate?: string;

  @ApiProperty({ required: false })
  progress?: TaskProgress;

  @ApiProperty({ required: false })
  updates?: TaskUpdate[];

  @ApiProperty({ required: false })
  pendingReviewUpdates?: {
    count: number;
    progress: number;
  };

  @ApiProperty({ example: 0 })
  sequence!: number;

  static fromEntity(entity: TaskEntity): TaskResponseDto {
    const dto = new TaskResponseDto();
    Object.assign(dto, entity);
    return dto;
  }
}
