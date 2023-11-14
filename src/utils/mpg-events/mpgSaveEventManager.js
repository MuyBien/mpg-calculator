import { Match } from "@/models/match/Match";

/**
 * Renvoi un nouveau match avec les buts arrêtés par les gardien le cas échéant.
 * @param {Match} match
 * @returns {Match} - Un nouvel objet `Match` avec les buts annulés si un arrêt de but a été effectué par une des équipes.
*/
const setMpgSaves = (match) => {
  const newMatch = new Match(match);

  if (isSavingGoal(newMatch.homeTeam)) {
    cancelPlayerGoal(newMatch.awayTeam);
  }

  if (isSavingGoal(newMatch.awayTeam)) {
    cancelPlayerGoal(newMatch.homeTeam);
  }

  return newMatch;
};

const isSavingGoal = (team) => {
  return team.pitchPlayers[0].getTotalScore() >= 8;
};

const cancelPlayerGoal = (team) => {
  const firstScorer = team.pitchPlayers.find(player => player.goals > 0);
  if (firstScorer) {
    firstScorer.savedGoals += 1;
  }
};

export { setMpgSaves };