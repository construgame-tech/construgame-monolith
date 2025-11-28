import { describe, it, expect, vi } from "vitest";
import { createOrgConfig } from "./create-org-config";
import type { IOrgConfigRepository } from "../repositories/org-config.repository.interface";

describe("createOrgConfig use case", () => {
  const mockRepository: IOrgConfigRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    findByOrganizationId: vi.fn(),
  };

  it("should create org config with default values", async () => {
    const input = {
      organizationId: "org-123",
    };

    const { config } = await createOrgConfig(input, mockRepository);

    expect(config).toBeDefined();
    expect(config.organizationId).toBe("org-123");
    expect(config.missionsEnabled).toBe(true);
    expect(config.financialEnabled).toBe(false);
    expect(config.kaizensEnabled).toBe(false);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(config);
  });

  it("should create org config with custom values", async () => {
    vi.clearAllMocks();

    const input = {
      organizationId: "org-456",
      missionsEnabled: false,
      financialEnabled: true,
      kaizensEnabled: false,
      projectDiaryEnabled: true,
      missionConfig: {
        autoApproveUpdates: true,
      },
      theme: {
        menu: {
          background: "#ffffff",
          color: "#000000",
        },
      },
      auth: {
        login: {
          email: true,
          microsoftSSO: false,
        },
      },
    };

    const { config } = await createOrgConfig(input, mockRepository);

    expect(config.organizationId).toBe("org-456");
    expect(config.missionsEnabled).toBe(false);
    expect(config.financialEnabled).toBe(true);
    expect(config.kaizensEnabled).toBe(false);
    expect(config.projectDiaryEnabled).toBe(true);
    expect(config.missionConfig?.autoApproveUpdates).toBe(true);
    expect(config.theme.menu.background).toBe("#ffffff");
    expect(config.auth.login.email).toBe(true);
    expect(config.auth.login.microsoftSSO).toBe(false);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
