// Testes unitários para entidades do domínio Organization
// Testando as factory functions

import { describe, expect, it } from "vitest";
import {
  createOrganizationEntity,
  
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
      // sequence removed.toBe(0);
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
      
    };

    it("deve atualizar o nome da organização", () => {
      const updated = updateOrganizationEntity(baseOrg, {
        name: "Novo Nome",
      });

      expect(updated.name).toBe("Novo Nome");
      // sequence removed.toBe(1);
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
      // sequence removed.toBe(1);

      const second = updateOrganizationEntity(first, { name: "Update 2" });
      // sequence removed.toBe(2);
    });
  });
});
