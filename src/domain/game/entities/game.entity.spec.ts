// Testes unitários para entidades do domínio Game
// Testando as factory functions e regras de negócio

import { describe, expect, it } from "vitest";
import {
  archiveGameEntity,
  createGameEntity,
  type GameEntity,
  type GameKpi,
  type GamePrize,
  unarchiveGameEntity,
  updateGameEntity,
} from "./game.entity";

describe("Game Entity", () => {
  describe("createGameEntity", () => {
    it("deve criar uma entidade de game com valores padrão", () => {
      const game = createGameEntity({
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game de Teste",
      });

      expect(game.id).toBe("game-123");
      expect(game.organizationId).toBe("org-123");
      expect(game.projectId).toBe("proj-123");
      expect(game.name).toBe("Game de Teste");
      expect(game.status).toBe("ACTIVE");
      expect(game.archived).toBe(false);
    });

    it("deve criar game com todos os campos opcionais", () => {
      const prizes: GamePrize[] = [
        {
          prizeId: "prize-1",
          rankingType: "player",
          type: "points",
          value: 100,
        },
      ];
      const kpis: GameKpi[] = [{ id: "kpi-1", points: 50 }];

      const game = createGameEntity({
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game Completo",
        gameManagerId: "manager-123",
        photo: "https://example.com/photo.jpg",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        managerId: "manager-456",
        responsibles: ["resp-1", "resp-2"],
        objective: "Objetivo do game",
        prizes,
        kpis,
        updateFrequency: 7,
      });

      expect(game.gameManagerId).toBe("manager-123");
      expect(game.photo).toBe("https://example.com/photo.jpg");
      expect(game.startDate).toBe("2025-01-01");
      expect(game.endDate).toBe("2025-12-31");
      expect(game.managerId).toBe("manager-456");
      expect(game.responsibles).toEqual(["resp-1", "resp-2"]);
      expect(game.objective).toBe("Objetivo do game");
      expect(game.prizes).toEqual(prizes);
      expect(game.kpis).toEqual([{ id: "kpi-1", points: 50 }]);
      expect(game.updateFrequency).toBe(7);
    });

    it("deve mapear KPIs corretamente", () => {
      const kpis: GameKpi[] = [
        { id: "kpi-1", points: 100 },
        { id: "kpi-2", points: 200 },
      ];

      const game = createGameEntity({
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game com KPIs",
        kpis,
      });

      expect(game.kpis).toHaveLength(2);
      expect(game.kpis?.[0]).toEqual({ id: "kpi-1", points: 100 });
      expect(game.kpis?.[1]).toEqual({ id: "kpi-2", points: 200 });
    });
  });

  describe("updateGameEntity", () => {
    const baseGame: GameEntity = {
      id: "game-123",
      organizationId: "org-123",
      projectId: "proj-123",
      name: "Game Original",
      status: "ACTIVE",
      archived: false,
    };

    it("deve atualizar o nome do game", () => {
      const updatedGame = updateGameEntity(baseGame, {
        name: "Nome Atualizado",
      });

      expect(updatedGame.name).toBe("Nome Atualizado");
    });

    it("deve atualizar o status do game", () => {
      const updatedGame = updateGameEntity(baseGame, {
        status: "PAUSED",
      });

      expect(updatedGame.status).toBe("PAUSED");
    });

    it("deve manter valores não alterados", () => {
      const updatedGame = updateGameEntity(baseGame, {
        name: "Novo Nome",
      });

      expect(updatedGame.id).toBe(baseGame.id);
      expect(updatedGame.organizationId).toBe(baseGame.organizationId);
      expect(updatedGame.projectId).toBe(baseGame.projectId);
      expect(updatedGame.status).toBe(baseGame.status);
    });

    it("deve atualizar múltiplos campos", () => {
      const updatedGame = updateGameEntity(baseGame, {
        name: "Novo Nome",
        status: "DONE",
        objective: "Novo objetivo",
        startDate: "2025-06-01",
        endDate: "2025-12-31",
      });

      expect(updatedGame.name).toBe("Novo Nome");
      expect(updatedGame.status).toBe("DONE");
      expect(updatedGame.objective).toBe("Novo objetivo");
      expect(updatedGame.startDate).toBe("2025-06-01");
      expect(updatedGame.endDate).toBe("2025-12-31");
    });

    it("deve atualizar prizes e kpis", () => {
      const newPrizes: GamePrize[] = [
        {
          prizeId: "new-prize",
          rankingType: "team",
          type: "placement",
          value: 1,
        },
      ];
      const newKpis: GameKpi[] = [{ id: "new-kpi", points: 500 }];

      const updatedGame = updateGameEntity(baseGame, {
        prizes: newPrizes,
        kpis: newKpis,
      });

      expect(updatedGame.prizes).toEqual(newPrizes);
      expect(updatedGame.kpis).toEqual(newKpis);
    });
  });

  describe("archiveGameEntity", () => {
    it("deve arquivar um game", () => {
      const game: GameEntity = {
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game",
        status: "ACTIVE",
        archived: false,
      };

      const archivedGame = archiveGameEntity(game);

      expect(archivedGame.archived).toBe(true);
    });

    it("deve manter outros valores ao arquivar", () => {
      const game: GameEntity = {
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game",
        status: "DONE",
        archived: false,
      };

      const archivedGame = archiveGameEntity(game);

      expect(archivedGame.id).toBe(game.id);
      expect(archivedGame.name).toBe(game.name);
      expect(archivedGame.status).toBe(game.status);
    });
  });

  describe("unarchiveGameEntity", () => {
    it("deve desarquivar um game", () => {
      const game: GameEntity = {
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Game",
        status: "ACTIVE",
        archived: true,
      };

      const unarchivedGame = unarchiveGameEntity(game);

      expect(unarchivedGame.archived).toBe(false);
    });
  });
});
