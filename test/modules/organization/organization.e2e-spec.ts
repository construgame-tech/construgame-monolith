import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
	createToken,
	deleteRequest,
	faker,
	getRequest,
	postRequest,
	putRequest,
} from "../../helpers";
import { closeTestApp, setupTestApp } from "../../setup";

describe("OrganizationController (e2e)", () => {
	let app: INestApplication;
	let authToken: string;
	let userId: string;
	let organizationId: string;

	beforeAll(async () => {
		app = await setupTestApp();
		userId = faker.uuid();
		organizationId = faker.uuid();
		authToken = createToken(userId, organizationId, ["owner"]);
	});

	afterAll(async () => {
		await closeTestApp();
	});

	describe("POST /api/v1/organizations", () => {
		it("should create a new organization", async () => {
			// Arrange
			const organizationData = {
				ownerId: authToken,
				name: "Construgame Obras",
				tradeName: "Construgame",
				cnpj: "12.345.678/0001-90",
				email: "contato@construgame.com",
				phone: "+55 11 99999-9999",
			};

			// Act
			const response = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: organizationData,
			});

			console.log(
				"Response status:",
				response.statusCode,
				"Body:",
				JSON.stringify(response.body),
			);

			// Assert
			expect(response.statusCode).toBe(201);
			expect(response.body).toMatchObject({
				id: expect.any(String),
				name: organizationData.name,
			});
		});

		it("should create organization with minimal data", async () => {
			// Arrange
			const organizationData = {
				ownerId: userId,
				name: "Construtora Mínima",
			};

			// Act
			const response = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: organizationData,
			});

			// Assert
			expect(response.statusCode).toBe(201);
			expect(response.body.name).toBe(organizationData.name);
		});

		it("should return 400 when required fields are missing", async () => {
			// Arrange
			const invalidData = {
				tradeName: "Sem Nome",
			};

			// Act
			const response = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: invalidData,
			});

			// Assert
			expect(response.statusCode).toBe(400);
		});

		it("should return 401 when no auth token is provided", async () => {
			// Arrange
			const organizationData = {
				name: "Test Org",
				cnpj: "12.345.678/0001-90",
			};

			// Act
			const response = await postRequest(app, "/api/v1/organizations", {
				body: organizationData,
			});

			// Assert
			expect(response.statusCode).toBe(401);
		});
	});

	describe("GET /api/v1/organizations/:id", () => {
		it("should get an organization by id", async () => {
			// Arrange - Create organization first
			const createResponse = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: {
					name: "Org para Consulta",
					cnpj: "11.222.333/0001-44",
				},
			});

			const orgId = createResponse.body.id;

			// Act
			const response = await getRequest(app, `/api/v1/organizations/${orgId}`, {
				token: authToken,
			});

			// Assert
			expect(response.statusCode).toBe(200);
			expect(response.body).toMatchObject({
				id: orgId,
				name: "Org para Consulta",
				cnpj: "11.222.333/0001-44",
			});
		});

		it("should return 404 when organization does not exist", async () => {
			// Arrange
			const nonExistentId = faker.uuid();

			// Act
			const response = await getRequest(
				app,
				`/api/v1/organizations/${nonExistentId}`,
				{
					token: authToken,
				},
			);

			// Assert
			expect(response.statusCode).toBe(404);
		});
	});

	describe("GET /api/v1/organizations", () => {
		it("should list all organizations", async () => {
			// Arrange - Create at least 2 organizations
			await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: { name: "Org List 1", cnpj: "11.111.111/0001-11" },
			});

			await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: { name: "Org List 2", cnpj: "22.222.222/0001-22" },
			});

			// Act
			const response = await getRequest(app, "/api/v1/organizations", {
				token: authToken,
			});

			// Assert
			expect(response.statusCode).toBe(200);
			expect(response.body.items).toBeInstanceOf(Array);
			expect(response.body.items.length).toBeGreaterThanOrEqual(2);
		});
	});

	describe("PUT /api/v1/organizations/:id", () => {
		it("should update an organization", async () => {
			// Arrange - Create organization
			const createResponse = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: {
					name: "Org Original",
					cnpj: "33.333.333/0001-33",
					email: "original@test.com",
				},
			});

			const orgId = createResponse.body.id;

			// Act
			const response = await putRequest(app, `/api/v1/organizations/${orgId}`, {
				token: authToken,
				body: {
					name: "Org Atualizada",
					email: "atualizada@test.com",
					phone: "+55 11 98888-8888",
				},
			});

			// Assert
			expect(response.statusCode).toBe(200);
			expect(response.body.name).toBe("Org Atualizada");
			expect(response.body.email).toBe("atualizada@test.com");
			expect(response.body.phone).toBe("+55 11 98888-8888");
		});

		it("should return 404 when updating non-existent organization", async () => {
			// Arrange
			const nonExistentId = faker.uuid();

			// Act
			const response = await putRequest(
				app,
				`/api/v1/organizations/${nonExistentId}`,
				{
					token: authToken,
					body: { name: "Test" },
				},
			);

			// Assert
			expect(response.statusCode).toBe(404);
		});
	});

	describe("DELETE /api/v1/organizations/:id", () => {
		it("should delete an organization", async () => {
			// Arrange - Create organization
			const createResponse = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: {
					name: "Org para Deletar",
					cnpj: "44.444.444/0001-44",
				},
			});

			const orgId = createResponse.body.id;

			// Act
			const response = await deleteRequest(
				app,
				`/api/v1/organizations/${orgId}`,
				{
					token: authToken,
				},
			);

			// Assert
			expect(response.statusCode).toBe(200);

			// Verify it was deleted
			const getResponse = await getRequest(
				app,
				`/api/v1/organizations/${orgId}`,
				{
					token: authToken,
				},
			);

			expect(getResponse.statusCode).toBe(404);
		});

		it("should return 404 when deleting non-existent organization", async () => {
			// Arrange
			const nonExistentId = faker.uuid();

			// Act
			const response = await deleteRequest(
				app,
				`/api/v1/organizations/${nonExistentId}`,
				{
					token: authToken,
				},
			);

			// Assert
			expect(response.statusCode).toBe(404);
		});
	});

	describe("Integration Tests", () => {
		it("should handle complete organization lifecycle", async () => {
			// Arrange & Act - Create
			const createResponse = await postRequest(app, "/api/v1/organizations", {
				token: authToken,
				body: {
					ownerId: userId,
					name: "Lifecycle Org",
					tradeName: "Lifecycle",
					email: "lifecycle@test.com",
					phone: "+55 11 97777-7777",
				},
			});

			expect(createResponse.statusCode).toBe(201);
			const orgId = createResponse.body.id;

			// Act - Get
			const getResponse = await getRequest(
				app,
				`/api/v1/organizations/${orgId}`,
				{
					token: authToken,
				},
			);

			expect(getResponse.statusCode).toBe(200);
			expect(getResponse.body.name).toBe("Lifecycle Org");

			// Act - Update
			const updateResponse = await putRequest(
				app,
				`/api/v1/organizations/${orgId}`,
				{
					token: authToken,
					body: {
						name: "Updated Lifecycle Org",
						email: "updated@test.com",
					},
				},
			);

			expect(updateResponse.statusCode).toBe(200);
			expect(updateResponse.body.name).toBe("Updated Lifecycle Org");

			// Act - Delete
			const deleteResponse = await deleteRequest(
				app,
				`/api/v1/organizations/${orgId}`,
				{
					token: authToken,
				},
			);

			expect(deleteResponse.statusCode).toBe(200);
		});
	});
});
