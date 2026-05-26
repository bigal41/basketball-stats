import type { Game, Player, PlayerGameStat, StatLine } from '../types';

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

export const getPlayerStatsForGame = (
  stats: PlayerGameStat[],
  gameId: string,
): PlayerGameStat[] => stats.filter((stat) => stat.gameId === gameId);

export const getPlayerStatsForPlayer = (
  stats: PlayerGameStat[],
  playerId: string,
): PlayerGameStat[] => stats.filter((stat) => stat.playerId === playerId);

export const sortGamesByDate = (games: Game[]): Game[] =>
  [...games].sort((left, right) => left.date.localeCompare(right.date));

export const buildPlayerLookup = (players: Player[]): Map<string, Player> =>
  new Map(players.map((player) => [player.id, player]));

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
