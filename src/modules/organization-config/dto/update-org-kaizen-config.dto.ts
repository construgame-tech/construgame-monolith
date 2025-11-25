import { PartialType } from "@nestjs/swagger";
import { CreateOrgKaizenConfigDto } from "./create-org-kaizen-config.dto";

export class UpdateOrgKaizenConfigDto extends PartialType(
  CreateOrgKaizenConfigDto,
) {}
