import Plotly from "./plotly.js";
import { t } from "./i18n.js";
import { state, PALETTE } from "./state.js";
import { el, std, round2, concLabel, unitFor, cellLabel, paramLabel } from "./utils.js";
import { recordsFor } from "./data.js";

function buildSeries(records, concentrations, forcePooled) {
  const selected = [...state.replicates];
  const series = [];

  if (state.groupBy === "concentration" || forcePooled) {
    const valuesByConc = concentrations.map(
      (c) =>
        records
          .filter((r) => r.fuller_concentration === c)
          .flatMap((r) => r.values)
    );
    const points = [];
    const meanX = [];
    const meanY = [];
    const err = [];
    valuesByConc.forEach((vals, i) => {
      vals.forEach((v) => points.push({ x: i, y: v }));
    });
    valuesByConc.forEach((vals, i) => {
      if (!vals.length) return;
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      meanX.push(i);
      meanY.push(round2(mean));
      err.push(round2(std(vals, mean)));
    });
    series.push({ name: t("rowPooled", { k: selected.length }), points, meanX, meanY, err });
    return series;
  }

  if (state.groupBy === "none") {
    selected.forEach((rep) => {
      const points = [];
      concentrations.forEach((c, i) => {
        const rec = records.find((r) => r.replicate === rep && r.fuller_concentration === c);
        if (rec) rec.values.forEach((v) => points.push({ x: i, y: v }));
      });
      series.push({ name: rep, points, meanX: [], meanY: [], err: [] });
    });
    return series;
  }

  selected.forEach((rep) => {
    const byConc = concentrations.map((c) =>
      records.find((r) => r.replicate === rep && r.fuller_concentration === c)
    );
    const points = [];
    const meanX = [];
    const meanY = [];
    const err = [];
    byConc.forEach((rec, i) => {
      if (rec) {
        rec.values.forEach((v) => points.push({ x: i, y: v }));
        meanX.push(i);
        meanY.push(rec.mean);
        err.push(rec.std);
      }
    });
    series.push({ name: rep, points, meanX, meanY, err });
  });
  return series;
}

export function renderChart() {
  const records = recordsFor(state.cellType, state.exposure, state.parameter).filter((r) => state.replicates.has(r.replicate));
  const concentrations = [...new Set(records.map((r) => r.fuller_concentration))].sort((a, b) => a - b);
  const pooled = state.groupBy === "none" && state.plotType !== "scatter";
  const byConc = state.groupBy === "concentration";
  const series = buildSeries(records, concentrations, pooled);
  const s = series.length;
  const slot = 0.72 / s;

  const noGroup = state.groupBy === "none";
  const unit = unitFor(state.parameter);
  const meanText = (sr, j) =>
    `${concLabel(concentrations[sr.meanX[j]])}<br>${sr.name}: ${sr.meanY[j]} ± ${sr.err[j]}`;

  const traces = [];

  if (state.plotType === "box") {
    series.forEach((sr, i) => {
      const color = PALETTE[i % PALETTE.length];
      traces.push({
        type: "box",
        name: sr.name,
        legendgroup: sr.name,
        offsetgroup: sr.name,
        x: sr.points.map((p) => p.x),
        y: sr.points.map((p) => p.y),
        text: sr.points.map((p) => `${concLabel(concentrations[p.x])}<br>${sr.name}`),
        hovertemplate: "%{text}<br>%{y:.2f} " + unit + "<extra></extra>",
        boxpoints: "all",
        jitter: 0.3,
        pointpos: 0,
        whiskerwidth: 0.5,
        marker: { color, size: 6, opacity: 0.45 },
        line: { color }
      });
    });
  } else if (state.plotType === "bar") {
    series.forEach((sr, i) => {
      const color = PALETTE[i % PALETTE.length];
      traces.push({
        type: "bar",
        name: sr.name,
        legendgroup: sr.name,
        offsetgroup: sr.name,
        x: sr.meanX,
        y: sr.meanY,
        text: sr.meanY.map((_, j) => meanText(sr, j)),
        hovertemplate: "%{text} " + unit + "<extra></extra>",
        marker: { color, opacity: 0.8 },
        error_y: { type: "data", array: sr.err, visible: true, color: "#1d2228", thickness: 1.5, width: 5 }
      });
    });
  } else if (state.plotType === "line") {
    series.forEach((sr, i) => {
      const color = PALETTE[i % PALETTE.length];
      traces.push({
        type: "scatter",
        mode: "lines+markers",
        name: sr.name,
        legendgroup: sr.name,
        x: sr.meanX,
        y: sr.meanY,
        text: sr.meanY.map((_, j) => meanText(sr, j)),
        hovertemplate: "%{text} " + unit + "<extra></extra>",
        line: { color, width: 2 },
        marker: { color, size: 8 },
        error_y: { type: "data", array: sr.err, visible: true, color, thickness: 1.5, width: 5 }
      });
    });
  } else {
    series.forEach((sr, i) => {
      const center = noGroup ? 0 : (i - (s - 1) / 2) * slot;
      const jitter = noGroup ? 0.18 : slot * 0.3;
      const color = PALETTE[i % PALETTE.length];

      traces.push({
        type: "scatter",
        mode: "markers",
        name: sr.name,
        legendgroup: sr.name,
        x: sr.points.map((p) => p.x + center + (Math.random() - 0.5) * 2 * jitter),
        y: sr.points.map((p) => p.y),
        text: sr.points.map((p) => `${concLabel(concentrations[p.x])}<br>${sr.name}`),
        hovertemplate: "%{text}<br>%{y:.2f} " + unit + "<extra></extra>",
        marker: { color, size: 6, opacity: 0.45 }
      });

      if (noGroup) return;

      traces.push({
        type: "scatter",
        mode: "markers",
        name: sr.name,
        legendgroup: sr.name,
        showlegend: false,
        x: sr.meanX.map((x) => x + center),
        y: sr.meanY,
        text: sr.meanY.map((m, j) => `${concLabel(concentrations[sr.meanX[j]])}<br>${sr.name}: ${m} ± ${sr.err[j]}`),
        hovertemplate: "%{text} " + unit + "<extra></extra>",
        error_y: {
          type: "data",
          array: sr.err,
          visible: true,
          color,
          thickness: 1.5,
          width: 5
        },
        marker: { color, size: 10, symbol: "diamond" }
      });
    });
  }

  const param = paramLabel(state.parameter);
  const layout = {
    title: t("chartTitle", { param, cell: cellLabel(state.cellType), exposure: state.exposure }),
    template: "plotly_white",
    font: { size: 13 },
    margin: { l: 70, r: 24, t: 60, b: 60 },
    xaxis: {
      title: { text: t("xaxisTitle") },
      tickvals: concentrations.map((_, i) => i),
      ticktext: concentrations.map(concLabel),
      zeroline: false
    },
    yaxis: {
      title: { text: t("yaxisTitle", { param, unit: unitFor(state.parameter) }) },
      type: state.logY ? "log" : "linear",
      zeroline: false
    },
    showlegend: !byConc,
    legend: {
      orientation: "h",
      y: -0.25,
      title: { text: byConc || pooled ? "" : t("legendReplicates"), side: "left" }
    },
    hovermode: "closest"
  };
  if (state.plotType === "box") layout.boxmode = "group";
  if (state.plotType === "bar") layout.barmode = "group";

  Plotly.react(el("chart"), traces, layout, {
    responsive: true,
    displaylogo: false
  });
  return { records, concentrations };
}
