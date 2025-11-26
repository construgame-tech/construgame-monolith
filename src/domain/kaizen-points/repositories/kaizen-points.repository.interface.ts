import { GameKaizenPointsEntity } from "../entities/game-kaizen-points.entity";
import { TeamKaizenPointsEntity } from "../entities/team-kaizen-points.entity";
import { UserKaizenPointsEntity } from "../entities/user-kaizen-points.entity";

export interface IUserKaizenPointsRepository {
  save(points: UserKaizenPointsEntity): Promise<void>;
  findByUserAndGame(
    userId: string,
    gameId: string,
  ): Promise<UserKaizenPointsEntity | null>;
}

export interface ITeamKaizenPointsRepository {
  save(points: TeamKaizenPointsEntity): Promise<void>;
  findByTeamAndGame(
    teamId: string,
    gameId: string,
  ): Promise<TeamKaizenPointsEntity | null>;
}

export interface IGameKaizenPointsRepository {
  save(points: GameKaizenPointsEntity): Promise<void>;
  findByGameId(gameId: string): Promise<GameKaizenPointsEntity | null>;
}
