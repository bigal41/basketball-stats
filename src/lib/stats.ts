import type { Game, Player, PlayerGameStat, StatLine } from '../types';

export type StatsMode = 'real' | 'estimated';

export interface DisplayPlayerGameStat extends PlayerGameStat {
  isEstimated: boolean;
}

export interface StatCoverage {
  completedGames: number;
  statBackedGames: number;
  missingStatGames: number;
}

const statKeys = ['pts', 'reb', 'ast', 'fgm', 'fga', 'tpm', 'tpa', 'stl', 'blk'] as const;

const emptyStatLine = (): StatLine => ({
  pts: 0,
  reb: 0,
  ast: 0,
  fgm: 0,
  fga: 0,
  tpm: 0,
  tpa: 0,
  stl: 0,
  blk: 0,
});

export const sumStatLines = (stats: PlayerGameStat[]): StatLine =>
  stats.reduce<StatLine>((totals, stat) => ({
    pts: totals.pts + stat.pts,
    reb: totals.reb + stat.reb,
    ast: totals.ast + stat.ast,
    fgm: totals.fgm + stat.fgm,
    fga: totals.fga + stat.fga,
    tpm: totals.tpm + stat.tpm,
    tpa: totals.tpa + stat.tpa,
    stl: totals.stl + stat.stl,
    blk: totals.blk + stat.blk,
  }), emptyStatLine());

export const averageStatLine = (stats: PlayerGameStat[]): StatLine => {
  if (stats.length === 0) {
    return emptyStatLine();
  }

  const totals = sumStatLines(stats);

  return {
    pts: totals.pts / stats.length,
    reb: totals.reb / stats.length,
    ast: totals.ast / stats.length,
    fgm: totals.fgm / stats.length,
    fga: totals.fga / stats.length,
    tpm: totals.tpm / stats.length,
    tpa: totals.tpa / stats.length,
    stl: totals.stl / stats.length,
    blk: totals.blk / stats.length,
  };
};

export const calculatePercentage = (made: number, attempts: number): number =>
  attempts === 0 ? 0 : made / attempts;

export const formatPercentage = (value: number): string => `${(value * 100).toFixed(1)}%`;

export const formatAverage = (value: number): string => value.toFixed(1);

export const getCompletedGames = (games: Game[]): Game[] =>
  games.filter((game) => game.status === 'completed');

export const getRegularSeasonGames = (games: Game[]): Game[] =>
  games.filter((game) => (game.gameType ?? 'regular') === 'regular');

export const getCompletedRegularSeasonGames = (games: Game[]): Game[] =>
  getCompletedGames(getRegularSeasonGames(games));

export const getRecord = (games: Game[]): { wins: number; losses: number } =>
  getCompletedGames(games).reduce(
    (record, game) => {
      const didWin = (game.teamScore ?? 0) > (game.oppScore ?? 0);

      return didWin
        ? { wins: record.wins + 1, losses: record.losses }
        : { wins: record.wins, losses: record.losses + 1 };
    },
    { wins: 0, losses: 0 },
  );

export const formatRecord = ({ wins, losses }: { wins: number; losses: number }): string =>
  `${wins}-${losses}`;

export const getPlayerStatsForGame = <T extends PlayerGameStat>(
  stats: T[],
  gameId: string,
): T[] => stats.filter((stat) => stat.gameId === gameId);

export const getPlayerStatsForPlayer = <T extends PlayerGameStat>(
  stats: T[],
  playerId: string,
): T[] => stats.filter((stat) => stat.playerId === playerId);

export const getStatCoverage = (games: Game[], stats: PlayerGameStat[]): StatCoverage => {
  const completedGames = getCompletedGames(games);
  const completedGameIds = new Set(completedGames.map((game) => game.id));
  const statBackedGameIds = new Set(
    stats.filter((stat) => completedGameIds.has(stat.gameId)).map((stat) => stat.gameId),
  );

  return {
    completedGames: completedGames.length,
    statBackedGames: statBackedGameIds.size,
    missingStatGames: completedGames.length - statBackedGameIds.size,
  };
};

export const getStatsForMode = (
  games: Game[],
  players: Player[],
  stats: PlayerGameStat[],
  mode: StatsMode,
): DisplayPlayerGameStat[] => {
  const completedGames = getCompletedGames(games);
  const completedGameIds = new Set(completedGames.map((game) => game.id));
  const completedStats = stats
    .filter((stat) => completedGameIds.has(stat.gameId))
    .map((stat) => ({ ...stat, isEstimated: false }));

  if (mode === 'real') {
    return completedStats;
  }

  const statBackedGameIds = new Set(completedStats.map((stat) => stat.gameId));
  const statBackedGames = completedGames.filter((game) => statBackedGameIds.has(game.id));

  if (statBackedGames.length === 0) {
    return completedStats;
  }

  const historicalTeamTotals = sumStatLines(completedStats);
  const historicalPlayerTotals = new Map(
    players.map((player) => [
      player.id,
      sumStatLines(getPlayerStatsForPlayer(completedStats, player.id)),
    ]),
  );
  const missingGames = completedGames.filter((game) => !statBackedGameIds.has(game.id));
  const estimatedStats = missingGames.flatMap((game) =>
    estimateStatsForGame(
      game,
      getAvailablePlayersForGame(game, players),
      historicalTeamTotals,
      historicalPlayerTotals,
      statBackedGames.length,
    ),
  );

  return [...completedStats, ...estimatedStats];
};

export const sortGamesByDate = (games: Game[]): Game[] =>
  [...games].sort((left, right) => left.date.localeCompare(right.date));

export const buildPlayerLookup = (players: Player[]): Map<string, Player> =>
  new Map(players.map((player) => [player.id, player]));

export const getAvailablePlayersForGame = (game: Game, players: Player[]): Player[] => {
  const absentPlayerNames = new Set((game.absentPlayerNames ?? []).map(normalizeName));
  return players.filter((player) => !absentPlayerNames.has(normalizeName(player.name)));
};

const normalizeName = (value: string): string => value.trim().toLowerCase();

export const getTeamLeaders = (
  stats: PlayerGameStat[],
  players: Player[],
  statKey: keyof Pick<StatLine, 'pts' | 'reb' | 'ast' | 'stl' | 'blk'>,
) => {
  const lookup = buildPlayerLookup(players);

  return players
    .map((player) => {
      const totals = sumStatLines(getPlayerStatsForPlayer(stats, player.id));
      return {
        player,
        value: totals[statKey],
        label: lookup.get(player.id)?.name ?? player.id,
      };
    })
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
};

const estimateStatsForGame = (
  game: Game,
  players: Player[],
  historicalTeamTotals: StatLine,
  historicalPlayerTotals: Map<string, StatLine>,
  statBackedGameCount: number,
): DisplayPlayerGameStat[] => {
  const allocations = Object.fromEntries(
    statKeys.map((statKey) => [
      statKey,
      allocateStatByShare(
        players,
        historicalPlayerTotals,
        statKey,
        getEstimatedTeamTotal(game, historicalTeamTotals, statKey, statBackedGameCount),
      ),
    ]),
  ) as Record<keyof StatLine, Map<string, number>>;

  return players.map((player) => ({
    id: `estimated_${game.id}_${player.id}`,
    seasonId: game.seasonId,
    playerId: player.id,
    gameId: game.id,
    pts: allocations.pts.get(player.id) ?? 0,
    reb: allocations.reb.get(player.id) ?? 0,
    ast: allocations.ast.get(player.id) ?? 0,
    fgm: allocations.fgm.get(player.id) ?? 0,
    fga: allocations.fga.get(player.id) ?? 0,
    tpm: allocations.tpm.get(player.id) ?? 0,
    tpa: allocations.tpa.get(player.id) ?? 0,
    stl: allocations.stl.get(player.id) ?? 0,
    blk: allocations.blk.get(player.id) ?? 0,
    isEstimated: true,
  }));
};

const getEstimatedTeamTotal = (
  game: Game,
  historicalTeamTotals: StatLine,
  statKey: keyof StatLine,
  statBackedGameCount: number,
): number => {
  if (statKey === 'pts' && typeof game.teamScore === 'number') {
    return game.teamScore;
  }

  return Math.round(historicalTeamTotals[statKey] / statBackedGameCount);
};

const allocateStatByShare = (
  players: Player[],
  historicalPlayerTotals: Map<string, StatLine>,
  statKey: keyof StatLine,
  targetTotal: number,
): Map<string, number> => {
  const allocations = new Map(players.map((player) => [player.id, 0]));

  if (targetTotal <= 0) {
    return allocations;
  }

  const historicalTotal = players.reduce(
    (total, player) => total + (historicalPlayerTotals.get(player.id)?.[statKey] ?? 0),
    0,
  );

  if (historicalTotal <= 0) {
    return allocations;
  }

  const ranked = players
    .map((player) => {
      const historicalValue = historicalPlayerTotals.get(player.id)?.[statKey] ?? 0;
      const rawValue = (historicalValue / historicalTotal) * targetTotal;
      const flooredValue = Math.floor(rawValue);

      return {
        player,
        flooredValue,
        historicalValue,
        remainder: rawValue - flooredValue,
      };
    })
    .sort((left, right) => {
      if (right.remainder !== left.remainder) {
        return right.remainder - left.remainder;
      }

      if (right.historicalValue !== left.historicalValue) {
        return right.historicalValue - left.historicalValue;
      }

      return left.player.name.localeCompare(right.player.name);
    });

  let assignedTotal = 0;
  for (const entry of ranked) {
    allocations.set(entry.player.id, entry.flooredValue);
    assignedTotal += entry.flooredValue;
  }

  let remainder = targetTotal - assignedTotal;
  let index = 0;
  while (remainder > 0 && ranked.length > 0) {
    const entry = ranked[index % ranked.length];
    allocations.set(entry.player.id, (allocations.get(entry.player.id) ?? 0) + 1);
    remainder -= 1;
    index += 1;
  }

  return allocations;
};
