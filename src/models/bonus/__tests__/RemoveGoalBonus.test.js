import { describe, it, expect, beforeEach } from "vitest";
import { RemoveGoalBonus } from "../RemoveGoalBonus";
import { Team } from "@/models/teams/Team";
import { Player } from "@/models/players/Player";

describe("Le bonus RemoveGoalBonus", () => {

  let team, opponentTeam;
  beforeEach(() => {
    team = new Team({
      pitchPlayers: [
        new Player({
          playerId: "player1",
          goals: 0,
          mpgGoals: 0,
        }),
        new Player({
          playerId: "player2",
          goals: 0,
          mpgGoals: 0,
        }),
      ],
    });

    opponentTeam = new Team({
      pitchPlayers: [
        new Player({
          playerId: "opponent1",
          goals: 1,
          mpgGoals: 0,
          canceledGoals: 0,
        }),
        new Player({
          playerId: "opponent2",
          goals: 0,
          mpgGoals: 1,
          canceledGoals: 0,
        }),
      ],
    });
  });

  it("annule un but du premier marqueur réel dans l'équipe adverse", () => {
    const bonus = new RemoveGoalBonus();
    bonus.apply(team, opponentTeam);

    expect(opponentTeam.pitchPlayers.find(p => p.playerId === "opponent1").canceledGoals).toBe(1);
    expect(opponentTeam.pitchPlayers.find(p => p.playerId === "opponent2").canceledGoals).toBe(0);
  });

  it("annule un but du premier marqueur MPG dans l'équipe adverse", () => {
    opponentTeam.pitchPlayers[0].goals = 0;
    const bonus = new RemoveGoalBonus();
    bonus.apply(team, opponentTeam);

    expect(opponentTeam.pitchPlayers.find(p => p.playerId === "opponent1").canceledGoals).toBe(0);
    expect(opponentTeam.pitchPlayers.find(p => p.playerId === "opponent2").canceledGoals).toBe(1);
  });
});