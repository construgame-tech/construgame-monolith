import { GameTaskPointsEntity } from "../entities/game-task-points.entity";
import { TeamTaskPointsEntity } from "../entities/team-task-points.entity";
import { UserTaskPointsEntity } from "../entities/user-task-points.entity";

export interface IUserTaskPointsRepository {
  save(points: UserTaskPointsEntity): Promise<void>;
  findByUserAndGame(
    userId: string,
    gameId: string,
  ): Promise<UserTaskPointsEntity | null>;
}

export interface ITeamTaskPointsRepository {
  save(points: TeamTaskPointsEntity): Promise<void>;
  findByTeamAndGame(
    teamId: string,
    gameId: string,
  ): Promise<TeamTaskPointsEntity | null>;
}

export interface IGameTaskPointsRepository {
  save(points: GameTaskPointsEntity): Promise<void>;
  findByGameId(gameId: string): Promise<GameTaskPointsEntity | null>;
}
