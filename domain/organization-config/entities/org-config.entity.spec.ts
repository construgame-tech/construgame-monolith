import { describe, expect, it } from "vitest";
import {
  createOrgConfigEntity,
  type OrgConfigEntity,
  updateOrgConfigEntity,
} from "./org-config.entity";

describe("OrgConfigEntity", () => {
  describe("createOrgConfigEntity", () => {
    it("should create entity with only organizationId", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
      });

      expect(config.organizationId).toBe("org-123");
    });

    it("should set default values for feature flags", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
      });

      expect(config.missionsEnabled).toBe(true);
      expect(config.financialEnabled).toBe(false);
      expect(config.kaizensEnabled).toBe(false);
      expect(config.projectDiaryEnabled).toBe(false);
    });

    it("should set default mission config", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
      });

      expect(config.missionConfig).toEqual({
        autoApproveUpdates: false,
      });
    });

    it("should set default theme", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
      });

      expect(config.theme).toEqual({
        menu: {
          background: "#1976d2",
          color: "#ffffff",
        },
      });
    });

    it("should set default auth config", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
      });

      expect(config.auth).toEqual({
        login: {
          email: true,
          microsoftSSO: false,
        },
      });
    });

    it("should set sequence to 0", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
      });

      expect(config.sequence).toBe(0);
    });

    it("should override default feature flags", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
        missionsEnabled: false,
        financialEnabled: true,
        kaizensEnabled: true,
        projectDiaryEnabled: true,
      });

      expect(config.missionsEnabled).toBe(false);
      expect(config.financialEnabled).toBe(true);
      expect(config.kaizensEnabled).toBe(true);
      expect(config.projectDiaryEnabled).toBe(true);
    });

    it("should accept custom mission config", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
        missionConfig: {
          autoApproveUpdates: true,
        },
      });

      expect(config.missionConfig?.autoApproveUpdates).toBe(true);
    });

    it("should accept custom theme", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
        theme: {
          menu: {
            background: "#ff0000",
            color: "#000000",
          },
        },
      });

      expect(config.theme.menu.background).toBe("#ff0000");
      expect(config.theme.menu.color).toBe("#000000");
    });

    it("should accept custom auth config", () => {
      const config = createOrgConfigEntity({
        organizationId: "org-123",
        auth: {
          login: {
            email: false,
            microsoftSSO: true,
          },
        },
      });

      expect(config.auth.login.email).toBe(false);
      expect(config.auth.login.microsoftSSO).toBe(true);
    });
  });

  describe("updateOrgConfigEntity", () => {
    const existingConfig: OrgConfigEntity = {
      organizationId: "org-123",
      missionsEnabled: true,
      financialEnabled: false,
      kaizensEnabled: false,
      projectDiaryEnabled: false,
      missionConfig: { autoApproveUpdates: false },
      theme: { menu: { background: "#1976d2", color: "#ffffff" } },
      auth: { login: { email: true, microsoftSSO: false } },
      sequence: 0,
    };

    it("should update missionsEnabled", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        missionsEnabled: false,
      });

      expect(updated.missionsEnabled).toBe(false);
    });

    it("should update financialEnabled", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        financialEnabled: true,
      });

      expect(updated.financialEnabled).toBe(true);
    });

    it("should update kaizensEnabled", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        kaizensEnabled: true,
      });

      expect(updated.kaizensEnabled).toBe(true);
    });

    it("should update projectDiaryEnabled", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        projectDiaryEnabled: true,
      });

      expect(updated.projectDiaryEnabled).toBe(true);
    });

    it("should update missionConfig", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        missionConfig: { autoApproveUpdates: true },
      });

      expect(updated.missionConfig?.autoApproveUpdates).toBe(true);
    });

    it("should update theme", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        theme: { menu: { background: "#333333", color: "#eeeeee" } },
      });

      expect(updated.theme.menu.background).toBe("#333333");
      expect(updated.theme.menu.color).toBe("#eeeeee");
    });

    it("should update auth", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        auth: { login: { email: false, microsoftSSO: true } },
      });

      expect(updated.auth.login.email).toBe(false);
      expect(updated.auth.login.microsoftSSO).toBe(true);
    });

    it("should increment sequence", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        missionsEnabled: false,
      });

      expect(updated.sequence).toBe(1);
    });

    it("should preserve organizationId", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        missionsEnabled: false,
      });

      expect(updated.organizationId).toBe("org-123");
    });

    it("should preserve unchanged fields", () => {
      const updated = updateOrgConfigEntity(existingConfig, {
        financialEnabled: true,
      });

      expect(updated.missionsEnabled).toBe(true);
      expect(updated.kaizensEnabled).toBe(false);
    });

    it("should handle multiple updates", () => {
      const first = updateOrgConfigEntity(existingConfig, {
        financialEnabled: true,
      });
      const second = updateOrgConfigEntity(first, {
        kaizensEnabled: true,
      });

      expect(second.financialEnabled).toBe(true);
      expect(second.kaizensEnabled).toBe(true);
      expect(second.sequence).toBe(2);
    });
  });
});
