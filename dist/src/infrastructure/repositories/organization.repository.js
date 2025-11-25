"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRepository = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_provider_1 = require("../database/drizzle.provider");
const organization_schema_1 = require("../database/schemas/organization.schema");
let OrganizationRepository = class OrganizationRepository {
    db;
    instanceId = Math.random().toString(36).substring(7);
    constructor(db) {
        this.db = db;
        console.log(`OrganizationRepository[${this.instanceId}] constructed with db:`, !!this.db);
    }
    async save(organization) {
        console.log(`OrganizationRepository[${this.instanceId}].save called with db:`, !!this.db);
        const orgData = {
            id: organization.id,
            ownerId: organization.ownerId,
            name: organization.name,
            photo: organization.photo || null,
            sequence: organization.sequence,
            updatedAt: new Date(),
        };
        await this.db.insert(organization_schema_1.organizations).values(orgData).onConflictDoUpdate({
            target: organization_schema_1.organizations.id,
            set: orgData,
        });
    }
    async delete(organizationId) {
        await this.db
            .delete(organization_schema_1.organizations)
            .where((0, drizzle_orm_1.eq)(organization_schema_1.organizations.id, organizationId));
    }
    async findById(organizationId) {
        const result = await this.db
            .select()
            .from(organization_schema_1.organizations)
            .where((0, drizzle_orm_1.eq)(organization_schema_1.organizations.id, organizationId))
            .limit(1);
        if (!result.length) {
            return null;
        }
        return this.mapToEntity(result[0]);
    }
    async findAll() {
        const result = await this.db.select().from(organization_schema_1.organizations);
        return result.map((row) => this.mapToEntity(row));
    }
    mapToEntity(row) {
        return {
            id: row.id,
            ownerId: row.ownerId,
            name: row.name,
            photo: row.photo || undefined,
            sequence: row.sequence,
        };
    }
};
exports.OrganizationRepository = OrganizationRepository;
exports.OrganizationRepository = OrganizationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_provider_1.DRIZZLE_CONNECTION)),
    __metadata("design:paramtypes", [Object])
], OrganizationRepository);
//# sourceMappingURL=organization.repository.js.map