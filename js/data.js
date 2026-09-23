import { state, CELL_ORDER } from "./state.js";

export async function loadDatabase() {
  const response = await fetch("data/metabolism_db.json");
  return response.json();
}

export function recordsFor(cellType, exposure, parameter) {
  return state.data.filter(
    (r) =>
      r.cell_type === cellType &&
      r.exposure_time === exposure &&
      (!parameter || r.parameter_name === parameter)
  );
}

export function availableCellTypes() {
  const present = new Set(state.data.map((r) => r.cell_type));
  return CELL_ORDER.filter((ct) => present.has(ct));
}

export function getExposures(cellType) {
  return [...new Set(state.data.filter((r) => r.cell_type === cellType).map((r) => r.exposure_time))].sort((a, b) => a - b);
}

export function getReplicates(cellType, exposure) {
  return [...new Set(recordsFor(cellType, exposure).map((r) => r.replicate))].sort();
}
