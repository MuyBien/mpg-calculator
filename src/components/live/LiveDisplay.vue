<template>
  <section class="matches-live">
    <no-live-disclaimer v-if="!liveLeagues.length && !liveTournaments.length" />
    <section v-else>
      <h2>Matchs en live</h2>
      <header>
        <live-options v-model:options="options" />
        <legend-display />
      </header>
      <ul>
        <li v-for="liveLeague in liveLeagues" :key="liveLeague.leagueId" class="division">
          <league-display :league="liveLeague" :show-all="options.showAllMatches" />
        </li>
      </ul>
      <ul>
        <li v-for="liveTournament in liveTournaments" :key="liveTournament.tournamentId" class="division">
          <tournament-display :tournament="liveTournament" />
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup>
import { ref, watchEffect } from "vue";

import LiveOptions from "@/components/live/LiveOptions.vue";
import TournamentDisplay from "@/components/tournaments/TournamentDisplay.vue";
import NoLiveDisclaimer from "@/components/disclaimers/NoLiveDisclaimer.vue";
import LeagueDisplay from "@/components/leagues/LeagueDisplay.vue";
import LegendDisplay from "@/components/legend/LegendDisplay.vue";

import { useMPG } from "@/use/useMPG";

/**
 * Matches
 */
const { liveLeagues, liveTournaments } = useMPG();

/**
 * Options
 */
const options = ref();
options.value = JSON.parse(localStorage.getItem("options")) || { showAllMatches: true };
watchEffect(() => {
  localStorage.setItem("options", JSON.stringify(options.value));
});
</script>

<style lang="scss" scoped>
h2 {
  text-align: center;
}
ul {
  padding: 0;
  text-align: center;
}

.matches-live {
  width: 95%;
  max-width: 800px;
}
.division {
  list-style: none;
  margin: 4vh 0;
}
</style>