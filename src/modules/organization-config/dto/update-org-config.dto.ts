import { PartialType } from "@nestjs/swagger";
import { CreateOrgConfigDto } from "./create-org-config.dto";

export class UpdateOrgConfigDto extends PartialType(CreateOrgConfigDto) {}
