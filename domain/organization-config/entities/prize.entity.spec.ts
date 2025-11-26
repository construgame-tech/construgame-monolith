import { describe, it, expect } from "vitest";
import {
  createPrizeEntity,
  updatePrizeEntity,
  type PrizeEntity,
} from "./prize.entity";

describe("PrizeEntity", () => {
  describe("createPrizeEntity", () => {
    const validInput = {
      id: "prize-123",
      organizationId: "org-123",
      name: "Gold Medal",
    };

    it("should create entity with required fields", () => {
      const prize = createPrizeEntity(validInput);

      expect(prize.id).toBe("prize-123");
      expect(prize.organizationId).toBe("org-123");
      expect(prize.name).toBe("Gold Medal");
    });

    it("should create entity without optional fields by default", () => {
      const prize = createPrizeEntity(validInput);

      expect(prize.description).toBeUndefined();
      expect(prize.icon).toBeUndefined();
      expect(prize.photo).toBeUndefined();
    });

    it("should create entity with description", () => {
      const input = {
        ...validInput,
        description: "Awarded for outstanding performance",
      };

      const prize = createPrizeEntity(input);

      expect(prize.description).toBe("Awarded for outstanding performance");
    });

    it("should create entity with icon", () => {
      const input = {
        ...validInput,
        icon: "🏆",
      };

      const prize = createPrizeEntity(input);

      expect(prize.icon).toBe("🏆");
    });

    it("should create entity with photo", () => {
      const input = {
        ...validInput,
        photo: "https://example.com/prize.jpg",
      };

      const prize = createPrizeEntity(input);

      expect(prize.photo).toBe("https://example.com/prize.jpg");
    });

    it("should create entity with all optional fields", () => {
      const input = {
        ...validInput,
        description: "Best prize ever",
        icon: "🥇",
        photo: "photo.png",
      };

      const prize = createPrizeEntity(input);

      expect(prize.description).toBe("Best prize ever");
      expect(prize.icon).toBe("🥇");
      expect(prize.photo).toBe("photo.png");
    });
  });

  describe("updatePrizeEntity", () => {
    const existingPrize: PrizeEntity = {
      id: "prize-123",
      organizationId: "org-123",
      name: "Original Prize",
    };

    it("should update name", () => {
      const updated = updatePrizeEntity(existingPrize, {
        name: "Updated Prize",
      });

      expect(updated.name).toBe("Updated Prize");
    });

    it("should update description", () => {
      const updated = updatePrizeEntity(existingPrize, {
        description: "New description",
      });

      expect(updated.description).toBe("New description");
    });

    it("should update icon", () => {
      const updated = updatePrizeEntity(existingPrize, {
        icon: "🎖️",
      });

      expect(updated.icon).toBe("🎖️");
    });

    it("should update photo", () => {
      const updated = updatePrizeEntity(existingPrize, {
        photo: "new-photo.jpg",
      });

      expect(updated.photo).toBe("new-photo.jpg");
    });

    it("should preserve immutable fields", () => {
      const updated = updatePrizeEntity(existingPrize, {
        name: "Updated",
      });

      expect(updated.id).toBe("prize-123");
      expect(updated.organizationId).toBe("org-123");
    });

    it("should preserve unchanged fields", () => {
      const prizeWithOptionals: PrizeEntity = {
        ...existingPrize,
        description: "Existing desc",
        icon: "🏅",
        photo: "existing.jpg",
      };

      const updated = updatePrizeEntity(prizeWithOptionals, {
        name: "Updated Name",
      });

      expect(updated.description).toBe("Existing desc");
      expect(updated.icon).toBe("🏅");
      expect(updated.photo).toBe("existing.jpg");
    });

    it("should handle multiple field updates", () => {
      const updated = updatePrizeEntity(existingPrize, {
        name: "New Name",
        description: "New desc",
        icon: "🏆",
        photo: "trophy.jpg",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.description).toBe("New desc");
      expect(updated.icon).toBe("🏆");
      expect(updated.photo).toBe("trophy.jpg");
    });
  });
});
