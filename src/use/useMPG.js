import { loginErrors } from "@/constants/loginErrors";
import { matchConstructor } from "@/utils/constructors/matchConstructor";
import { setMatchPlayersAverageRating } from "@/utils/players/playersAverageRating";
import { setMatchPlayersLiveStatus } from "@/utils/players/playersLiveStatus";
import { computed, onBeforeMount, readonly, ref, watch } from "vue";

const token = ref("");
const user = ref({});
const loginEnded = ref(false);
const loginError = ref();
const liveData = ref({});

export function useMPG () {

  /**
   * Méthode de connexion à MPG
   */
  onBeforeMount(() => {
    token.value = localStorage.getItem("mpg-token");
  });
  const isConnected = computed(() => {
    return Boolean(token.value);
  });
  const signIn = async (login, password) => {
    loginError.value = undefined;
    const response = await fetch("https://api.mpg.football/user/sign-in", {
      method: "POST",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `login=${login}&password=${password}&language=fr-FR`,
    });
    const json = await response.json();
    if (json.token) {
      token.value = json.token;
      localStorage.setItem("mpg-token", json.token);
    } else {
      loginError.value = loginErrors[json.message];
    }
  };
  const resetToken = () => {
    token.value = undefined;
    localStorage.removeItem("mpg-token");
  };

  /**
   * Récupération des infos de l'utilisateur
  */
  watch(token, () => {
    if (token.value) {
      getUser();
    }
  });

  const getUser = async () => {
    const response = await fetch("https://api.mpg.football/user", {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: token.value,
      },
      body: null,
    });
    if (response.status === 200) {
      user.value = await response.json();
      loginEnded.value = true;
    } else {
      resetToken();
    }
  };
  const haveLiveRating = computed(() => {
    return user.value?.applicationsData?.mpg.gameOptions.liveRatingAvailable;
  });

  /**
   * Matches Live
   */
  watch(token, () => {
    if (token.value) {
      getLiveData();
    }
  });

  const getLiveData = async () => {
    const response = await fetch("https://api.mpg.football/live", {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: token.value,
      },
      body: null,
    });
    const data = await response.json();
    liveData.value = data;
  };

  const liveLeagues = computed(() => {
    const liveLeagues = liveData.value?.orderedLeagueDivisionItems;
    return liveLeagues ? Object.values(liveLeagues).filter(league => league.liveState) : [];
  });

  const liveTournaments = computed(() => {
    const liveTournaments = liveData.value?.orderedTournamentItems;
    return liveTournaments ? Object.values(liveTournaments).filter(tournament => tournament.liveState) : [];
  });

  /**
   * Matchs data
   */
  const getLeagueMatch = async (matchId) => {
    const response = await fetch(`https://api.mpg.football/division-match/${matchId}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: token.value,
      },
      body: null,
    });
    const matchData = await response.json();

    const [homeTeamData, awayTeamData] = await Promise.all([
      getTeamInfos(matchData.home.teamId),
      getTeamInfos(matchData.away.teamId),
    ]);

    const match = matchConstructor({
      ...matchData,
      home: {
        ...matchData.home,
        ...homeTeamData,
      },
      away: {
        ...matchData.away,
        ...awayTeamData,
      },
    });

    return setPlayersInfos(match, matchData);
  };

  const getTournamentMatch = async (matchId) => {
    const response = await fetch(`https://api.mpg.football/tournament-match/${matchId}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: token.value,
      },
      body: null,
    });
    const matchData = await response.json();
    const match = matchConstructor(matchData);
    match.isTournament = true;

    return setPlayersInfos(match, matchData);
  };

  const setPlayersInfos = async (match, matchData) => {
    const matchWithAverages = await setMatchPlayersAverageRating(match, matchData.championshipMatches, getPlayerInfos);
    const finalMatch = setMatchPlayersLiveStatus(matchWithAverages, matchData.championshipMatches);
    return finalMatch;
  };

  /**
   * Team data
   */
  const getTeamInfos = async (teamId) => {
    const response = await fetch(`https://api.mpg.football/team/${teamId}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: token.value,
      },
      body: null,
    });
    const data = await response.json();
    return {
      name: data.name,
      abbreviation: data.abbreviation,
      availableBonuses: data.availableBonuses,
    };
  };

  /**
   * Players data
   */
  const getPlayerInfos = async (playerId, championshipId, season) => {
    const response = await fetch(`https://api.mpg.football/championship-player-stats/${playerId}/${season}`, {
      method: "GET",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: token.value,
      },
      body: null,
    });
    const data = await response.json();
    const SUPERLEAGUE_ID = 7;
    if (championshipId === SUPERLEAGUE_ID) {
      championshipId = data.aggregatedChampionshipsCorrelations[SUPERLEAGUE_ID];
    }
    return data.championships[championshipId].keySeasonStats || {};
  };

  return {
    signIn,
    user: readonly(user),
    isConnected,
    loginError: readonly(loginError),
    loginEnded: readonly(loginEnded),
    haveLiveRating,
    liveLeagues,
    liveTournaments,
    getLeagueMatch,
    getTournamentMatch,
    getPlayerInfos,
  };
}