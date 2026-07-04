import {
  confirmRecommendedAction,
  getDashboardState,
  stepSimulation,
} from "../services/mockApi.js";

export function createLiveSimulation({ intervalMs = 3000, onUpdate }) {
  let selectedScenarioKey = "NOW";
  let timerId;

  function emit(state = getDashboardState(selectedScenarioKey)) {
    onUpdate(state, selectedScenarioKey);
  }

  function start() {
    emit();
    timerId = window.setInterval(() => {
      stepSimulation(intervalMs / 1000);
      emit();
    }, intervalMs);
  }

  function stop() {
    window.clearInterval(timerId);
  }

  function setScenario(key) {
    selectedScenarioKey = key;
    emit();
  }

  function confirm(actionId) {
    confirmRecommendedAction(actionId);
    emit();
  }

  return { start, stop, setScenario, confirm };
}
