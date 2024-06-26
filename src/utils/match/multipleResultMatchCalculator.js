import { RemoveRandomPlayerBonus } from "@/models/bonus";
import { calculateFinalMatch } from "./resultMatchCalculator";

import { Match } from "@/models/match/Match";

const multipleResultMatchCalculator = (originalMatch) => {
  let results;
  const removePlayerBonusNumber = getRemovePlayerBonusNumber(originalMatch);

  if (removePlayerBonusNumber) {
    results = removePlayerBonusNumber === 1 ? getResultsForOneBonus(originalMatch) : getResultsForTwoBonus(originalMatch);
  }

  return results;
};

/**
 * Renvoi la liste des scores possibles avec un bonus Chapron Rouge
 * @param {Match} match
 * @returns Map
 */
const getResultsForOneBonus = (match) => {
  const matchWhithoutBonus = calculateFinalMatch(match);
  const positionsToTest = getPositionsToTestOneBonus();

  const results = [];
  positionsToTest.forEach(({ team, position }) => {
    let teamToTest;
    if (isHomeBonus(match)) {
      teamToTest = team === "team" ? matchWhithoutBonus.homeTeam : matchWhithoutBonus.awayTeam;
    } else {
      teamToTest = team === "team" ? matchWhithoutBonus.awayTeam : matchWhithoutBonus.homeTeam;
    }
    if (teamToTest.pitchPlayers[position].lastName !== "Rotaldo") {
      const matchWithPlayerReplaced = calculateWithPlayerReplaced(match, team, position);
      results.push(matchWithPlayerReplaced);
    }
  });

  return results;
};

const getResultsForTwoBonus = (match) => {
  const matchWhithoutBonus = calculateFinalMatch(match);
  const positionsToTest = getPositionsToTestTwoBonus();

  const results = [];
  positionsToTest.forEach((positions) => {
    const matchForThosePlayers = new Match(match);

    // First Rotaldo
    const { team: firstTeam, position: firstPosition } = positions[0];
    const teamToTest = firstTeam === "team" ? matchWhithoutBonus.homeTeam : matchWhithoutBonus.awayTeam;
    if (teamToTest.pitchPlayers[firstPosition].lastName === "Rotaldo") {
      return;
    }
    matchForThosePlayers.homeTeam.bonus = new RemoveRandomPlayerBonus({
      team: firstTeam,
      position: firstPosition,
    });

    // Second Rotaldo
    const { team: secondTeam, position: secondPosition } = positions[1];
    const teamToTest2 = secondTeam === "team" ? matchWhithoutBonus.homeTeam : matchWhithoutBonus.awayTeam;
    if (teamToTest2.pitchPlayers[secondPosition].lastName === "Rotaldo") {
      return;
    }
    matchForThosePlayers.awayTeam.bonus = new RemoveRandomPlayerBonus({
      team: secondTeam === "team" ? "opponentTeam" : "team", // les team et opponentTeam sont calculés par rapport à homeTeam
      position: secondPosition,
    });

    const matchWithPlayersReplaced = calculateFinalMatch(matchForThosePlayers);
    results.push(matchWithPlayersReplaced);
  });

  return results;
};

const getPositions = (teamName) => Array.from({ length: 10 }, (_, i) => ({
  team: teamName,
  position: i + 1,
}));

const getPositionsToTestOneBonus = () => [...getPositions("team"), ...getPositions("opponentTeam")];

const getPositionsToTestTwoBonus = () => {
  const positionsToTest = getPositionsToTestOneBonus();

  return positionsToTest.flatMap(position => {
    return getPositionsToTestOneBonus()
      .filter(positionToAdd => positionToAdd.team !== position.team || positionToAdd.position !== position.position)
      .map(positionToAdd => [position, positionToAdd]);
  });
};

const calculateWithPlayerReplaced = (originalMatch, team, position) => {
  const matchForThisPlayer = new Match(originalMatch);
  const newBonus = new RemoveRandomPlayerBonus({
    team,
    position,
  });
  if (isHomeBonus(matchForThisPlayer)) {
    matchForThisPlayer.homeTeam.bonus = newBonus;
  } else {
    matchForThisPlayer.awayTeam.bonus = newBonus;
  }
  return calculateFinalMatch(matchForThisPlayer);
};

const getRemovePlayerBonusNumber = (originalMatch) => {
  return Number(originalMatch.homeTeam.bonus.value === "removeRandomPlayer") + Number(originalMatch.awayTeam.bonus.value === "removeRandomPlayer");
};

const isHomeBonus = (match) => match.homeTeam.bonus.value === "removeRandomPlayer";

export { multipleResultMatchCalculator };