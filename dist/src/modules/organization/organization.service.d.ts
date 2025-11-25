import type { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import type { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import type { CreateOrganizationDto } from "./dto/create-organization.dto";
import type { UpdateOrganizationDto } from "./dto/update-organization.dto";
export declare class OrganizationService {
    private readonly organizationRepository;
    constructor(organizationRepository: OrganizationRepository);
    create(dto: CreateOrganizationDto): Promise<{
        organization: OrganizationEntity;
    }>;
    findById(id: string): Promise<OrganizationEntity | null>;
    findAll(): Promise<OrganizationEntity[]>;
    update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationEntity>;
    remove(id: string): Promise<void>;
}
