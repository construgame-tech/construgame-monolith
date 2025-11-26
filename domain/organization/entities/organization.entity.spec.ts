// Testes unitários para entidades do domínio Organization
// Testando as factory functions

import { describe, expect, it } from "vitest";
import {
  createOrganizationEntity,
  incrementOrganizationSequence,
  type OrganizationEntity,
  updateOrganizationEntity,
} from "./organization.entity";

describe("Organization Entity", () => {
  describe("createOrganizationEntity", () => {
    it("deve criar uma organização com valores padrão", () => {
      const organization = createOrganizationEntity({
        id: "org-123",
        ownerId: "owner-123",
        name: "Empresa ABC",
      });

      expect(organization.id).toBe("org-123");
      expect(organization.ownerId).toBe("owner-123");
      expect(organization.name).toBe("Empresa ABC");
      expect(organization.sequence).toBe(0);
    });

    it("deve criar organização com foto", () => {
      const organization = createOrganizationEntity({
        id: "org-123",
        ownerId: "owner-123",
        name: "Empresa XYZ",
        photo: "https://example.com/org.jpg",
      });

      expect(organization.photo).toBe("https://example.com/org.jpg");
    });
  });

  describe("updateOrganizationEntity", () => {
    const baseOrg: OrganizationEntity = {
      id: "org-123",
      ownerId: "owner-123",
      name: "Organização Original",
      sequence: 0,
    };

    it("deve atualizar o nome da organização", () => {
      const updated = updateOrganizationEntity(baseOrg, {
        name: "Novo Nome",
      });

      expect(updated.name).toBe("Novo Nome");
      expect(updated.sequence).toBe(1);
    });

    it("deve atualizar a foto da organização", () => {
      const updated = updateOrganizationEntity(baseOrg, {
        photo: "new-photo.jpg",
      });

      expect(updated.photo).toBe("new-photo.jpg");
    });

    it("deve atualizar nome e foto", () => {
      const updated = updateOrganizationEntity(baseOrg, {
        name: "Nome Atualizado",
        photo: "updated-photo.jpg",
      });

      expect(updated.name).toBe("Nome Atualizado");
      expect(updated.photo).toBe("updated-photo.jpg");
    });

    it("deve manter campos não alterados", () => {
      const orgWithPhoto: OrganizationEntity = {
        ...baseOrg,
        photo: "original.jpg",
      };

      const updated = updateOrganizationEntity(orgWithPhoto, {
        name: "Apenas Nome",
      });

      expect(updated.photo).toBe("original.jpg");
      expect(updated.ownerId).toBe("owner-123");
    });

    it("deve incrementar sequence a cada atualização", () => {
      const first = updateOrganizationEntity(baseOrg, { name: "Update 1" });
      expect(first.sequence).toBe(1);

      const second = updateOrganizationEntity(first, { name: "Update 2" });
      expect(second.sequence).toBe(2);
    });
  });

  describe("incrementOrganizationSequence", () => {
    it("deve incrementar a sequence", () => {
      const org: OrganizationEntity = {
        id: "org-123",
        ownerId: "owner-123",
        name: "Org",
        sequence: 10,
      };

      const incremented = incrementOrganizationSequence(org);

      expect(incremented.sequence).toBe(11);
      expect(incremented.id).toBe(org.id);
      expect(incremented.name).toBe(org.name);
      expect(incremented.ownerId).toBe(org.ownerId);
    });
  });
});
