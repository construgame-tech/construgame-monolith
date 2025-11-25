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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const organization_1 = require("../../../domain/organization");
const common_1 = require("@nestjs/common");
let OrganizationService = class OrganizationService {
    organizationRepository;
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
    }
    async create(dto) {
        return (0, organization_1.createOrganization)(dto, this.organizationRepository);
    }
    async findById(id) {
        return (0, organization_1.getOrganization)(id, this.organizationRepository);
    }
    async findAll() {
        return (0, organization_1.listOrganizations)(this.organizationRepository);
    }
    async update(id, dto) {
        return (0, organization_1.updateOrganization)(id, dto, this.organizationRepository);
    }
    async remove(id) {
        return (0, organization_1.deleteOrganization)(id, this.organizationRepository);
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map