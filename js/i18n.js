const STORAGE_KEY = "metab-db-lang";

let currentLang = localStorage.getItem(STORAGE_KEY) || "en";

const I18N = {
    ru: {
        appTitle:
            "Метаболическая активность клеток иммунной системы при воздействии фуллеренола C<sub>60</sub>(OH)<sub>24</sub>",
        appSubtitle:
            "Данные по интенсивности метаболизма (OCR/ECAR), полученные на анализаторе Seahorse XFe96, для моноцитов и Т-клеток человека, а также клеточных линий THP-1 и Jurkat.",
        filtersTitle: "Фильтры",
        cellType: "Тип клеток",
        exposureTime: "Время экспозиции",
        parameter: "Параметр",
        replicates: "Реплики",
        groupBy: "Группировка",
        groupNone: "Без группировки",
        groupReplicate: "По повторностям",
        groupConcentration: "По концентрациям",
        plotType: "Тип графика",
        plotScatter: "Точки",
        plotBox: "Бокс-плот",
        plotBar: "Столбчатая диаграмма (среднее ± ст. откл.)",
        plotLine: "Линия",
        plotHintNone: "Сводные диаграммы требуют группировки по концентрациям или повторностям",
        logY: "Логарифмическая ось Y",
        exportCsv: "Экспорт в CSV",
        exportPng: "Сохранить в PNG",
        tableTitle: "Записи",
        statusShown: "Показано записей: {records} (измерений: {measurements})",
        colReplicate: "Реплика",
        colN: "n",
        colMean: "Среднее",
        colStd: "Ст. откл.",
        colValues: "Значения лунок",
        colWell: "Лунка",
        colValue: "Значение",
        rowPooled: "Группа (повторностей: {k})",
        cellTypes: { monocytes: "Моноциты", tcells: "Т-клетки", thp: "THP-1", jurkat: "Jurkat" },
        parameters: {
            basal_OCR: "Базовый OCR",
            max_OCR: "Максимальный OCR",
            SRC: "Резерв дыхательной цепи (SRC)",
            basal_ECAR: "Базовый ECAR",
            max_ECAR: "Максимальный ECAR",
            comp_ECAR: "Компенсаторный ECAR",
        },
        units: { OCR: "пмоль/мин", ECAR: "м-pH/мин" },
        hoursUnit: "ч",
        concControl: "Контроль",
        xaxisTitle: "Концентрация фуллеренола C<sub>60</sub>(OH)<sub>24</sub>, мкг/мл",
        legendReplicates: "Повторности:",
        yaxisTitle: "{param}, {unit}",
        chartTitle: "{param} · {cell}, {exposure} ч",
        hoverMean: "среднее",
        footer: "© 2026 ПФИЦ УрО РАН · База данных «Метаболическая активность клеток иммунной системы при воздействии фуллеренола C<sub>60</sub>(OH)<sub>24</sub>»",
        funding:
            'Исследование выполнено при поддержке гранта РНФ № 24-15-00432, <a href="https://rscf.ru/project/24-15-00432/" target="_blank" rel="noopener">https://rscf.ru/project/24-15-00432/</a>.',
    },
    en: {
        appTitle:
            "Metabolic activity of immune system cells under fullerenol C<sub>60</sub>(OH)<sub>24</sub> exposure",
        appSubtitle:
            "Seahorse XFe96 respiratory data (OCR/ECAR) for monocytes, T cells, THP-1 and Jurkat cells measured after incubation with fullerenol nanoparticles.",
        filtersTitle: "Filters",
        cellType: "Cell type",
        exposureTime: "Exposure time",
        parameter: "Parameter",
        replicates: "Replicates",
        groupBy: "Group by",
        groupNone: "No grouping",
        groupReplicate: "By replicate",
        groupConcentration: "By concentration",
        plotType: "Plot type",
        plotScatter: "Points",
        plotBox: "Box plot",
        plotBar: "Bars (mean ± SD)",
        plotLine: "Dose-response line",
        plotHintNone: "Summary plots require grouping by concentration or replicate",
        logY: "Logarithmic Y axis",
        exportCsv: "Export CSV",
        exportPng: "Save PNG",
        tableTitle: "Records",
        statusShown: "Records shown: {records} (measurements: {measurements})",
        colReplicate: "Replicate",
        colN: "n",
        colMean: "Mean",
        colStd: "SD",
        colValues: "Well values",
        colWell: "Well",
        colValue: "Value",
        rowPooled: "Group (replicates: {k})",
        cellTypes: { monocytes: "Monocytes", tcells: "T cells", thp: "THP-1", jurkat: "Jurkat" },
        parameters: {
            basal_OCR: "Basal OCR",
            max_OCR: "Maximal OCR",
            SRC: "Spare respiratory capacity (SRC)",
            basal_ECAR: "Basal ECAR",
            max_ECAR: "Maximal ECAR",
            comp_ECAR: "Compensatory ECAR",
        },
        units: { OCR: "pmol/min", ECAR: "mpH/min" },
        hoursUnit: "h",
        concControl: "Control",
        xaxisTitle: "Fullerenol C<sub>60</sub>(OH)<sub>24</sub> concentration, µg/mL",
        legendReplicates: "Replicates:",
        yaxisTitle: "{param}, {unit}",
        chartTitle: "{param} · {cell}, {exposure} h",
        hoverMean: "mean",
        footer: "© 2026 Perm Federal Research Center, Ural Branch of the Russian Academy of Sciences · Database “Metabolic activity of immune system cells under fullerenol C<sub>60</sub>(OH)<sub>24</sub> exposure”",
        funding:
            'This research was funded by the Russian Science Foundation, grant number 24-15-00432. <a href="https://rscf.ru/project/24-15-00432/" target="_blank" rel="noopener">https://rscf.ru/project/24-15-00432/</a>.',
    },
};

export function getLang() {
    return currentLang;
}

export function setLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
}

export function t(key, params) {
    let value = I18N[currentLang][key];
    if (value === undefined) value = I18N.ru[key];
    if (typeof value === "string" && params) {
        for (const [k, v] of Object.entries(params)) {
            value = value.split(`{${k}}`).join(v);
        }
    }
    return value;
}
