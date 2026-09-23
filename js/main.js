import { getLang, setLang, t } from "./i18n.js";
import { state, PARAM_ORDER } from "./state.js";
import { el, subToUnicode, cellLabel, paramLabel } from "./utils.js";
import { loadDatabase, availableCellTypes, getExposures, getReplicates } from "./data.js";
import { renderChart } from "./chart.js";
import { renderTable } from "./table.js";
import { exportCsv, exportPng } from "./exports.js";

function syncSelections() {
  const exposures = getExposures(state.cellType);
  if (!exposures.includes(state.exposure)) state.exposure = exposures[0];

  const reps = getReplicates(state.cellType, state.exposure);
  const available = new Set(reps);
  state.replicates = new Set([...state.replicates].filter((r) => available.has(r)));
  if (!state.replicates.size) state.replicates = new Set(reps);
}

function onCellTypeOrExposureChange() {
  syncSelections();
  renderAll();
}

function renderAll() {
  document.documentElement.lang = getLang();
  document.title = subToUnicode(t("appTitle"));

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = t(node.dataset.i18n);
    if (value.includes("<")) node.innerHTML = value;
    else node.textContent = value;
  });

  el("lang-ru").classList.toggle("active", getLang() === "ru");
  el("lang-en").classList.toggle("active", getLang() === "en");

  renderStaticSelects();
  renderChartAndTable();
}

function renderStaticSelects() {
  el("cell-type").innerHTML = availableCellTypes()
    .map((ct) => `<option value="${ct}"${ct === state.cellType ? " selected" : ""}>${cellLabel(ct)}</option>`)
    .join("");

  const exposures = getExposures(state.cellType);
  if (!exposures.includes(state.exposure)) state.exposure = exposures[0];
  el("exposure").innerHTML = exposures
    .map((e) => `<option value="${e}"${e === state.exposure ? " selected" : ""}>${e} ${t("hoursUnit")}</option>`)
    .join("");

  el("parameter").innerHTML = PARAM_ORDER.map(
    (p) => `<option value="${p}"${p === state.parameter ? " selected" : ""}>${paramLabel(p)}</option>`
  ).join("");
}

function renderReplicateBoxes() {
  const reps = getReplicates(state.cellType, state.exposure);
  el("replicate-boxes").innerHTML = reps
    .map((rep) => {
      const checked = state.replicates.has(rep) ? " checked" : "";
      return `<label><input type="checkbox" value="${rep}"${checked}> ${rep}</label>`;
    })
    .join("");
  el("replicate-boxes").querySelectorAll("input").forEach((box) => {
    box.addEventListener("change", () => {
      if (box.checked) state.replicates.add(box.value);
      else state.replicates.delete(box.value);
      renderChartAndTable();
    });
  });
}

function renderChartAndTable() {
  renderReplicateBoxes();
  const { records } = renderChart();
  const rows = renderTable(records);
  el("status").textContent = t("statusShown", {
    records: rows,
    measurements: records.reduce((acc, r) => acc + r.values.length, 0)
  });
}

function bindStaticControls() {
  document.querySelectorAll("#lang-ru, #lang-en").forEach((btn) => {
    btn.addEventListener("click", () => {
      setLang(btn.id === "lang-ru" ? "ru" : "en");
      renderAll();
    });
  });

  el("group-by").addEventListener("change", (e) => {
    state.groupBy = e.target.value;
    syncPlotAvailability();
    renderChartAndTable();
  });

  el("plot-type").addEventListener("change", (e) => {
    state.plotType = e.target.value;
    renderChartAndTable();
  });

  el("log-y").addEventListener("change", (e) => {
    state.logY = e.target.checked;
    renderChart();
  });

  el("export-csv").addEventListener("click", exportCsv);
  el("export-png").addEventListener("click", exportPng);
}

function bindDataControls() {
  el("cell-type").addEventListener("change", (e) => {
    state.cellType = e.target.value;
    onCellTypeOrExposureChange();
  });

  el("exposure").addEventListener("change", (e) => {
    state.exposure = Number(e.target.value);
    onCellTypeOrExposureChange();
  });

  el("parameter").addEventListener("change", (e) => {
    state.parameter = e.target.value;
    renderChartAndTable();
  });
}

function syncPlotAvailability() {
  const none = state.groupBy === "none";
  el("plot-type").querySelectorAll("option").forEach((opt) => {
    opt.disabled = none && opt.value !== "scatter";
  });
  if (none && state.plotType !== "scatter") {
    state.plotType = "scatter";
    el("plot-type").value = "scatter";
  }
  el("plot-hint").hidden = !none;
}

function syncStaticControls() {
  el("group-by").value = state.groupBy;
  el("plot-type").value = state.plotType;
  el("log-y").checked = state.logY;
  syncPlotAvailability();
}

async function bootstrap() {
  bindStaticControls();
  syncStaticControls();
  state.data = await loadDatabase();
  bindDataControls();
  state.cellType = availableCellTypes()[0];
  syncSelections();
  renderAll();
}

bootstrap();
