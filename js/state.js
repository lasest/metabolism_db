export const state = {
  data: [],
  cellType: null,
  exposure: null,
  parameter: "basal_OCR",
  replicates: new Set(),
  groupBy: "replicate",
  plotType: "scatter",
  logY: false
};

export const PALETTE = ["#2563eb", "#ea580c", "#059669", "#9333ea"];
export const PARAM_ORDER = ["basal_OCR", "max_OCR", "SRC", "basal_ECAR", "max_ECAR", "comp_ECAR"];
export const CELL_ORDER = ["monocytes", "thp", "tcells", "jurkat"];
