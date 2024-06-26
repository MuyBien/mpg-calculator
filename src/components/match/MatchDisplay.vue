<template>
  <div :id="`${liveData.id}-parent`" class="accordion">
    <div class="accordion-item">
      <h2 class="accordion-header">
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          :data-bs-target="`#${liveData.id}-more-infos`"
          aria-expanded="true"
          :aria-controls="`${liveData.id}-more-infos`"
        >
          <score-line-display :home-team="liveData.home" :away-team="liveData.away" :score="[liveData.home.score, liveData.away.score]" />
        </button>
      </h2>
      <div
        :id="`${liveData.id}-more-infos`"
        ref="collapseElement"
        class="accordion-collapse collapse"
        :data-bs-parent="`#${liveData.id}-parent`"
      >
        <div class="accordion-body row match-details-wrapper">
          <match-placeholder v-if="!match" />
          <div v-else>
            <h3 class="title do-not-share">
              Résultat calculé :
            </h3>
            <h6 class="subtitle do-not-share">
              Après réalisation des remplacements tactiques et obligatoires, calcul des buts MPG et application des bonus.
            </h6>
            <h2 class="only-print">
              {{ leagueName }}
            </h2>
            <p v-if="isResultProbabilities" class="only-print mb-3">
              Score sans application du bonus Chapron Rouge
            </p>

            <section class="team_jerseys">
              <div class="team_jersey team_jersey--home" :style="{ 'backgroundImage': `url(${liveData.home.jerseyUrl}`}" />
              <div class="team_jersey team_jersey--away" :style="{ 'backgroundImage': `url(${liveData.away.jerseyUrl}`}" />
            </section>

            <section class="match-details">
              <score-display :match="resultMatch" />
              <scorers-display :match="resultMatch" class="mt-3" />

              <match-progress :match="resultMatch" class="match-details__progress do-not-share mb-3" />

              <div v-if="!isTournament" class="row mt-3">
                <bonus-selector
                  :team="match.homeTeam"
                  class="col-6"
                  @change-bonus="updateHomeTeamBonus"
                />
                <bonus-selector
                  :team="match.awayTeam"
                  class="col-6 away-bonus"
                  reverse-display
                  @change-bonus="updateAwayTeamBonus"
                />
              </div>

              <a class="show-players do-not-share" @click="openModal">
                <span>Afficher les joueurs</span>
                <info-icon />
              </a>

              <div v-if="isResultProbabilities && match" class="mt-3">
                <scores-list-display :match="match" />
              </div>

              <display-tournament-result v-if="isTournament" :match="resultMatch" class="mt-3" />

              <footer class="only-print">
                <p>Généré le {{ lastUpdate }}</p>
                <div>
                  <img alt="Logo MPG" src="/src/assets/logo.png">
                  Calculé par mpg-calculator.fr
                </div>
              </footer>

              <p class="rating-disclaimer alert alert-warning mt-3 do-not-share" role="alert">
                Attention, les notes des joueurs peuvent varier jusqu'à 7h après la fin de leur match et donc faire évoluer le résultat.
              </p>
            </section>

            <section class="sharing">
              <share-match :id="liveData.id" class="do-not-share" />
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>

  <match-details-display
    v-if="resultMatch"
    :match="resultMatch"
    :show="showMatchDetails"
    @close="closeModal"
  >
    <template #title>
      <score-line-display
        :home-team="liveData.home"
        :away-team="liveData.away"
        :score="resultMatch.score"
      />
    </template>
  </match-details-display>
</template>

<script setup>
import { useMPG } from "@/use/useMPG";
import { Collapse } from "bootstrap";
import { computed, onMounted, onUpdated, ref } from "vue";

import { calculateFinalMatch } from "@/utils/match/resultMatchCalculator.js";

import BonusSelector from "@/components/bonus/BonusSelector.vue";
import InfoIcon from "@/components/icons/InfoIcon.vue";
import MatchDetailsDisplay from "@/components/match/MatchDetailsDisplay.vue";
import MatchPlaceholder from "@/components/match/MatchPlaceholder.vue";
import MatchProgress from "@/components/match/MatchProgress.vue";
import ScorersDisplay from "@/components/player/ScorersDisplay.vue";
import ScoreDisplay from "@/components/score/ScoreDisplay.vue";
import ScoreLineDisplay from "@/components/score/ScoreLineDisplay.vue";
import ScoresListDisplay from "@/components/score/ScoresListDisplay.vue";
import ShareMatch from "@/components/share/ShareMatch.vue";
import DisplayTournamentResult from "@/components/tournaments/DisplayTournamentResult.vue";

import { Match } from "@/models/match/Match";

const props = defineProps({
  leagueName: {
    type: String,
    required: true,
  },
  liveData: {
    type: Object,
    required: true,
  },
  isTournament: {
    type: Boolean,
    default: false,
  },
});

/**
 * Gestion du toggle
 */
const collapseElement = ref(null);
onMounted(() => {
  Collapse.getOrCreateInstance(collapseElement.value, { toggle: false });
  collapseElement.value.addEventListener("shown.bs.collapse", () => {
    fetchMatch();
  });
});

/**
 * Match
 */
const { getLeagueMatch, getTournamentMatch } = useMPG();

const initialMatch = ref();
const fetchMatch = async () => {
  initialMatch.value = props.isTournament ? await getTournamentMatch(props.liveData.id) : await getLeagueMatch(props.liveData.id);
  homeTeamBonus.value = initialMatch.value.homeTeam.bonus;
  awayTeamBonus.value = initialMatch.value.awayTeam.bonus;
};

const match = computed(() => {
  if (! initialMatch.value) {
    return;
  }

  const newMatch = new Match(initialMatch.value);
  newMatch.homeTeam.bonus = homeTeamBonus.value;
  newMatch.awayTeam.bonus = awayTeamBonus.value;
  if (homeTeamBonus.value.value === "mirror") {
    newMatch.homeTeam.bonus = new homeTeamBonus.value.constructor(homeTeamBonus.value);
  }
  if (awayTeamBonus.value.value === "mirror") {
    newMatch.awayTeam.bonus = new awayTeamBonus.value.constructor(awayTeamBonus.value);
  }
  return newMatch;
});

const resultMatch = computed(() => {
  if (! match.value) {
    return;
  }
  return calculateFinalMatch(match.value);
});

/**
 * Gestion des bonus
 */
const homeTeamBonus = ref();
const updateHomeTeamBonus = (bonus) => {
  updateTeamBonus(homeTeamBonus, bonus, initialMatch.value.homeTeam.bonus.value);
};

const awayTeamBonus = ref();
const updateAwayTeamBonus = (bonus) => {
  updateTeamBonus(awayTeamBonus, bonus, initialMatch.value.awayTeam.bonus.value);
};

const updateTeamBonus = (teamBonus, bonus, initialBonusValue) => {
  const teamBonusUpdated = new bonus.constructor();
  if (initialBonusValue !== bonus.value && teamBonusUpdated.isLiveApplied) {
    teamBonusUpdated.isLiveApplied = false;
  }
  if (bonus.playerId) {
    teamBonusUpdated.playerId = bonus.playerId;
  }
  teamBonus.value = teamBonusUpdated;
};

/**
 * Gestion de la modale des détails du match
 */
const showMatchDetails = ref(false);
const openModal = () => {
  showMatchDetails.value = true;
  history.pushState({ modalOpen: true }, null);
};
const closeModal = () => {
  showMatchDetails.value = false;
};
onMounted(() => {
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.modalOpen) {
      closeModal();
    }
  });
});

/**
 * Propriétés du score
 */
const isResultProbabilities = computed(() => {
  return match.value.homeTeam.bonus.value === "removeRandomPlayer" || match.value.awayTeam.bonus.value === "removeRandomPlayer";
});

/**
 * Gestion de la date de MAJ des données
 */
const lastUpdate = ref(new Date().toLocaleString());
onUpdated(() => {
  lastUpdate.value = new Date().toLocaleString();
});
</script>

<style lang="scss" scoped>
li {
  list-style: none;
}
.match-details-wrapper {
  position: relative;
  overflow: hidden;
  --bs-gutter-x: 0; // override BS

  .title {
    font-size: 14px;
    text-align: left;
    margin-bottom: 0;
  }
  .subtitle {
    margin-top: 0;
    margin-bottom: 2vh;
    font-size: 13px;
    text-align: left;
    color: var(--bs-gray);
  }
  .show-players {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2vh;
    cursor: pointer;

    &__action {
      padding: 0;
    }
  }

  .team_jerseys {
    position: relative;
    z-index: 0;

    .team_jersey {
      position: absolute;
      top: -4vh;
      width: 30vw;
      height: 100vh;
      background-repeat: no-repeat;
      background-position: top right;
      z-index: 0;
      opacity: 0.1;

      &--home {
        background-position: top right;
        left: -15vw;
      }
      &--away {
        background-position: top left;
        right: -15vw;
      }
    }
  }

  .match-details, .sharing {
    position: relative;
    z-index: 1;
  }

  .match-details {
    &__progress {
      margin: 1rem 0;
    }
  }

  .rating-disclaimer {
    font-size: 13px;
  }

  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.7em;
    color: grey;
    margin-top: 20px;

    p {
      margin-bottom: 0;
    }

    img {
      width: 20px;
      margin-right: 5px;
    }
  }
}
</style>

<style lang="scss">
.only-print {
  display: none !important;
}

.to-print {
  .do-not-share {
    display: none !important;
  }
  footer.only-print {
    display: flex !important;
  }
  .only-print {
    display: block !important;
  }
}
</style>