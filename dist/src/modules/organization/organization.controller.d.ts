import type { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import type { CreateOrganizationDto } from "./dto/create-organization.dto";
import { OrganizationResponseDto } from "./dto/organization-response.dto";
import type { UpdateOrganizationDto } from "./dto/update-organization.dto";
export declare class OrganizationController {
    private readonly organizationRepository;
    constructor(organizationRepository: OrganizationRepository);
    create(createOrganizationDto: CreateOrganizationDto): Promise<OrganizationResponseDto>;
    findOne(id: string): Promise<OrganizationResponseDto>;
    findAll(): Promise<OrganizationResponseDto[]>;
    update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationResponseDto>;
    remove(id: string): Promise<void>;
}
