import { RemoveRandomPlayerBonus } from "@/models/bonus/RemoveRandomPlayerBonus";
import { Bonus } from "./Bonus";

export class MirrorBonus extends Bonus {

  noEffectWith = [RemoveRandomPlayerBonus, MirrorBonus];

  constructor () {
    super({
      name: "Miroir",
      value: "mirror",
      icon: "/img/bonus-images/mirror.png",
      description: "Le bonus de ton adversaire se retourne contre lui.",
      timing: "beforeAll",
      isLiveApplied: false,
    });
  }

  apply (team, opponentTeam) {
    if (this.noEffectWith.includes(opponentTeam.bonus)) {
      return;
    }

    // Si le bonus est liveApplied il faut le désappliquer
    if (opponentTeam.bonus.isLiveApplied) {
      opponentTeam.bonus.revert(opponentTeam); // TODO
    }

    team.bonus.apply = opponentTeam.bonus.apply;
    team.bonus.timing = opponentTeam.bonus.timing;
    team.bonus.isLiveApplied = false;

    opponentTeam.bonus.isLiveApplied = true;
  }
}