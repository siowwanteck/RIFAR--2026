import {
  confirmRecommendedAction,
  getApiPayload,
  getDashboardState,
  getRecommendedActions,
} from "./services/mockApi.js";

export function buildDashboardState() {
  return getDashboardState();
}

export function getActionStatus(actionId) {
  return getRecommendedActions().find((item) => item.id === actionId)?.status ?? "unknown";
}

export function confirmAction(actionId) {
  return confirmRecommendedAction(actionId);
}

export { getApiPayload };
