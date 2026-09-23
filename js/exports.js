import Plotly from "./plotly.js";
import { state } from "./state.js";
import { el } from "./utils.js";
import { recordsFor } from "./data.js";

export function exportCsv() {
  const records = recordsFor(state.cellType, state.exposure, state.parameter).filter((r) => state.replicates.has(r.replicate));
  let header;
  let rows;

  if (state.groupBy === "none") {
    header = ["cell_type", "fuller_concentration", "exposure_time", "parameter_name", "replicate", "well", "value"];
    rows = records.flatMap((r) => r.values.map((v, i) => [r.cell_type, r.fuller_concentration, r.exposure_time, r.parameter_name, r.replicate, i + 1, v]));
  } else {
    header = ["cell_type", "fuller_concentration", "exposure_time", "parameter_name", "replicate", "n", "mean", "std", "values"];
    rows = records.map((r) => [r.cell_type, r.fuller_concentration, r.exposure_time, r.parameter_name, r.replicate, r.n, r.mean, r.std, `"${r.values.join(" ")}"`]);
  }

  const lines = [header.join(","), ...rows.map((row) => row.join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `metabolism_${state.cellType}_${state.exposure}h_${state.parameter}${state.groupBy === "none" ? "_wells" : ""}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPng() {
  Plotly.downloadImage(el("chart"), {
    format: "png",
    width: 1280,
    height: 720,
    scale: 2,
    filename: `metabolism_${state.cellType}_${state.exposure}h_${state.parameter}`
  });
}
