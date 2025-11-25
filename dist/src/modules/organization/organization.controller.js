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
exports.OrganizationController = void 0;
const organization_1 = require("../../../domain/organization");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_response_dto_1 = require("./dto/organization-response.dto");
let OrganizationController = class OrganizationController {
    organizationRepository;
    constructor(organizationRepository) {
        this.organizationRepository = organizationRepository;
        console.log("OrganizationController constructed with repo:", !!this.organizationRepository, "instance:", this.organizationRepository?.instanceId);
    }
    async create(createOrganizationDto) {
        console.log("Controller.create called with repo:", !!this.organizationRepository);
        try {
            const result = await (0, organization_1.createOrganization)(createOrganizationDto, this.organizationRepository);
            return organization_response_dto_1.OrganizationResponseDto.fromEntity(result.organization);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async findOne(id) {
        try {
            const result = await (0, organization_1.getOrganization)({ organizationId: id }, this.organizationRepository);
            return organization_response_dto_1.OrganizationResponseDto.fromEntity(result.organization);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    async findAll() {
        try {
            const result = await (0, organization_1.listOrganizations)({}, this.organizationRepository);
            return result.organizations.map((org) => organization_response_dto_1.OrganizationResponseDto.fromEntity(org));
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async update(id, updateOrganizationDto) {
        try {
            const result = await (0, organization_1.updateOrganization)({ organizationId: id, ...updateOrganizationDto }, this.organizationRepository);
            return organization_response_dto_1.OrganizationResponseDto.fromEntity(result.organization);
        }
        catch (error) {
            if (error.message.includes("not found")) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async remove(id) {
        try {
            await (0, organization_1.deleteOrganization)({ organizationId: id }, this.organizationRepository);
        }
        catch (error) {
            if (error.message.includes("not found")) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new organization" }),
    (0, swagger_1.ApiResponse)({ status: 201, type: organization_response_dto_1.OrganizationResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get organization by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_response_dto_1.OrganizationResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Organization not found" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List all organizations" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [organization_response_dto_1.OrganizationResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update organization" }),
    (0, swagger_1.ApiParam)({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" }),
    (0, swagger_1.ApiResponse)({ status: 200, type: organization_response_dto_1.OrganizationResponseDto }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Function]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: "Delete organization" }),
    (0, swagger_1.ApiParam)({ name: "id", example: "123e4567-e89b-12d3-a456-426614174000" }),
    (0, swagger_1.ApiResponse)({ status: 204, description: "Organization deleted" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationController.prototype, "remove", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, swagger_1.ApiTags)("organizations"),
    (0, swagger_1.ApiBearerAuth)("JWT-auth"),
    (0, common_1.Controller)("organizations"),
    __metadata("design:paramtypes", [Function])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map