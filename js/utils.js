import { t } from "./i18n.js";

export const el = (id) => document.getElementById(id);

export function std(values, mean) {
  if (values.length < 2) return 0;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function round2(x) {
  return Math.round(x * 100) / 100;
}

export function subToUnicode(text) {
  const digits = "₀₁₂₃₄₅₆₇₈₉";
  return text.replace(/<sub>(\d+)<\/sub>/g, (_, d) =>
    [...d].map((ch) => digits[+ch]).join("")
  );
}

export function cellLabel(ct) {
  return t("cellTypes")[ct] || ct;
}

export function paramLabel(p) {
  return t("parameters")[p] || p;
}

export function concLabel(c) {
  return c === 0 ? t("concControl") : String(c);
}

export function unitFor(parameter) {
  return parameter.includes("ECAR") ? t("units").ECAR : t("units").OCR;
}
