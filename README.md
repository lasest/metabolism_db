# Metabolic Activity Database Browser

A static web application (frontend only) for exploring Seahorse respirometry
data: OCR/ECAR of monocytes, T cells, THP-1 and Jurkat cells exposed to
fullerenol C60(OH)24.

Data: `data/metabolism_db.json` — a flat array of records; each record is a
biological replicate (D1–D4 for primary cells, R1–R4 for cell lines) with
individual measurement values, n, mean and standard deviation.

## Running locally

```bash
npm install
npm start
```

Then open http://localhost:3000 (the port is printed to the console).

## Funding

This research was funded by the Russian Science Foundation, grant number
24-15-00432. https://rscf.ru/project/24-15-00432/.
