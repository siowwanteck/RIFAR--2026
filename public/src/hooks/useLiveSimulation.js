import {
  confirmRecommendedAction,
  getDashboardState,
  stepSimulation,
  undoRecommendedAction,
} from "../services/mockApi.js";

export function createLiveSimulation({ intervalMs = 3000, onUpdate }) {
  let selectedScenarioKey = "NOW";
  let timerId;

  function emit(options = {}, state = getDashboardState(selectedScenarioKey, options)) {
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

  function refresh() {
    emit();
  }

  function confirm(actionId) {
    confirmRecommendedAction(actionId);
    emit();
  }

  function undo(actionId) {
    undoRecommendedAction(actionId);
    emit();
  }

  return { start, stop, setScenario, confirm, undo, refresh };
}
