const PRECISE_POSITIONS = {
  10: "G",
  20: "DC",
  21: "DL",
  30: "MD",
  31: "MO",
  40: "A",
};

export class Player {
  playerId;
  lastName;
  firstName;

  position; // 1 gardien, 2 defenseur, 3 milieu, 4 attaquant
  precisePosition; // 10 G, 20 DC, 21 DL, 30 MD, 31 MO, 40 ATT

  rating;
  bonusRating;
  isAverageRating = false;
  isLiveRating = false;

  goals;
  mpgGoals;
  ownGoals;
  canceledGoals;
  savedGoals;

  isCaptain = false;
  isSubstitute = false;
  substitued;

  clubId;

  constructor (playerData = {}) {
    this.playerId = playerData.playerId;
    this.lastName = playerData.lastName;
    this.firstName = playerData.firstName;

    this.position = playerData.position;
    this.precisePosition = playerData.precisePosition || PRECISE_POSITIONS[playerData.ultraPosition];

    this.rating = playerData.rating || undefined;
    this.bonusRating = isNaN(playerData.bonusRating) ? 0 : playerData.bonusRating;

    this.goals = playerData.goals || 0;
    this.mpgGoals = playerData.mpgGoals || 0;
    this.ownGoals = playerData.ownGoals || 0;
    this.canceledGoals = playerData.canceledGoals || 0;
    this.savedGoals = playerData.savedGoals || 0;

    this.isCaptain = playerData.isCaptain || false;
    this.isSubstitute = playerData.isSubstitute || false;
    this.substitued = playerData.substitued || undefined;
    this.isAverageRating = playerData.isAverageRating || false;
    this.isLiveRating = playerData.isLiveRating || false;

    this.clubId = playerData.clubId;
  }

  isBacker = () => {
    return this.position === 2;
  };

  /**
   * Renvoi le score total du joueur en comptant son bonus
   * @returns {number} score
   */
  getTotalScore = () => {
    return this.rating + this.bonusRating;
  };

  toString = () => {
    return `${this.playerId} - ${this.lastName} - note: ${this.rating} - bonus: ${this.bonusRating} - Goals: ${this.goals} - capitaine: ${this.isCaptain}`;
  };
}