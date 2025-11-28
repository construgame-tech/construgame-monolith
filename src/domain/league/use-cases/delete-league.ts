// Use Case: Remover uma league
import type { ILeagueRepository } from "../repositories/league.repository.interface";

export interface DeleteLeagueInput {
  organizationId: string;
  leagueId: string;
}

export const deleteLeague = async (
  input: DeleteLeagueInput,
  repository: ILeagueRepository,
): Promise<void> => {
  const league = await repository.findById(
    input.organizationId,
    input.leagueId,
  );

  if (!league) {
    throw new Error(`League not found: ${input.leagueId}`);
  }

  await repository.delete(input.organizationId, input.leagueId);
};
