import {
	createOrganization,
	deleteOrganization,
	getOrganization,
	listOrganizations,
	updateOrganization,
} from "@domain/organization";
import type { OrganizationEntity } from "@domain/organization/entities/organization.entity";
import type { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Injectable } from "@nestjs/common";
import type { CreateOrganizationDto } from "./dto/create-organization.dto";
import type { UpdateOrganizationDto } from "./dto/update-organization.dto";

@Injectable()
export class OrganizationService {
	constructor(
		private readonly organizationRepository: OrganizationRepository,
	) {}

	async create(
		dto: CreateOrganizationDto,
	): Promise<{ organization: OrganizationEntity }> {
		return createOrganization(dto, this.organizationRepository);
	}

	async findById(id: string): Promise<OrganizationEntity | null> {
		return getOrganization(id, this.organizationRepository);
	}

	async findAll(): Promise<OrganizationEntity[]> {
		return listOrganizations(this.organizationRepository);
	}

	async update(
		id: string,
		dto: UpdateOrganizationDto,
	): Promise<OrganizationEntity> {
		return updateOrganization(id, dto, this.organizationRepository);
	}

	async remove(id: string): Promise<void> {
		return deleteOrganization(id, this.organizationRepository);
	}
}
