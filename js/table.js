import { t } from "./i18n.js";
import { state } from "./state.js";
import { el, std, round2, cellLabel, paramLabel, concLabel } from "./utils.js";

export function renderTable(records) {
  const shown = records.filter((r) => state.replicates.has(r.replicate));
  const thead = el("records").querySelector("thead");
  const tbody = el("records").querySelector("tbody");

  if (state.groupBy === "none") {
    thead.innerHTML = `<tr>
      <th>${t("colReplicate")}</th>
      <th>${t("cellType")}</th>
      <th>${t("xaxisTitle")}</th>
      <th>${t("exposureTime")}</th>
      <th>${t("parameter")}</th>
      <th>${t("colWell")}</th>
      <th>${t("colValue")}</th>
    </tr>`;
    tbody.innerHTML = shown
      .flatMap((r) =>
        r.values.map(
          (v, i) => `<tr>
            <td>${r.replicate}</td>
            <td>${cellLabel(r.cell_type)}</td>
            <td>${concLabel(r.fuller_concentration)}</td>
            <td>${r.exposure_time} ${t("hoursUnit")}</td>
            <td>${paramLabel(r.parameter_name)}</td>
            <td>${i + 1}</td>
            <td>${v}</td>
          </tr>`
        )
      )
      .join("");
    return shown.reduce((acc, r) => acc + r.values.length, 0);
  }

  if (state.groupBy === "concentration") {
    thead.innerHTML = `<tr>
      <th>${t("cellType")}</th>
      <th>${t("xaxisTitle")}</th>
      <th>${t("exposureTime")}</th>
      <th>${t("parameter")}</th>
      <th>${t("colN")}</th>
      <th>${t("colMean")}</th>
      <th>${t("colStd")}</th>
      <th>${t("colValues")}</th>
    </tr>`;
    const groups = new Map();
    shown.forEach((r) => {
      if (!groups.has(r.fuller_concentration)) groups.set(r.fuller_concentration, []);
      groups.get(r.fuller_concentration).push(r);
    });
    tbody.innerHTML = [...groups.entries()]
      .map(([conc, recs]) => {
        const values = recs.flatMap((r) => r.values);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return `<tr>
          <td>${cellLabel(state.cellType)}</td>
          <td>${concLabel(conc)}</td>
          <td>${state.exposure} ${t("hoursUnit")}</td>
          <td>${paramLabel(state.parameter)}</td>
          <td>${values.length}</td>
          <td>${round2(mean)}</td>
          <td>${round2(std(values, mean))}</td>
          <td class="values">${values.join(", ")}</td>
        </tr>`;
      })
      .join("");
    return groups.size;
  }

  thead.innerHTML = `<tr>
    <th>${t("colReplicate")}</th>
    <th>${t("cellType")}</th>
    <th>${t("xaxisTitle")}</th>
    <th>${t("exposureTime")}</th>
    <th>${t("parameter")}</th>
    <th>${t("colN")}</th>
    <th>${t("colMean")}</th>
    <th>${t("colStd")}</th>
    <th>${t("colValues")}</th>
  </tr>`;

  const rows = shown.map(
    (r) => `<tr>
      <td>${r.replicate}</td>
      <td>${cellLabel(r.cell_type)}</td>
      <td>${concLabel(r.fuller_concentration)}</td>
      <td>${r.exposure_time} ${t("hoursUnit")}</td>
      <td>${paramLabel(r.parameter_name)}</td>
      <td>${r.n}</td>
      <td>${r.mean}</td>
      <td>${r.std}</td>
      <td class="values">${r.values.join(", ")}</td>
    </tr>`
  );

  tbody.innerHTML = rows.join("");
  return shown.length;
}
