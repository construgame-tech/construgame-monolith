import type { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import type { IOrganizationRepository } from "@domain/organization/repositories/organization.repository.interface";
import type { DrizzleDB } from "../database/drizzle.provider";
export declare class OrganizationRepository implements IOrganizationRepository {
    private readonly db;
    private instanceId;
    constructor(db: DrizzleDB);
    save(organization: OrganizationEntity): Promise<void>;
    delete(organizationId: string): Promise<void>;
    findById(organizationId: string): Promise<OrganizationEntity | null>;
    findAll(): Promise<OrganizationEntity[]>;
    private mapToEntity;
}
