# HMI Parts — Sales Intelligence Dashboard

A Next.js analytics dashboard for HMI Parts. Upload your monthly Excel cost sheets and get instant insights: revenue, margin, customer ranking, parts analysis, month-over-month comparison, and smart alerts.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and drag-drop your Excel file.

## Build for production

```bash
npm run build
npm start
```

---

## How to use

1. **Drag & drop** your `.xlsx` cost sheet onto the upload screen.
2. Load **multiple months** to unlock the Compare tab.
3. **Click any bar** in a chart to cross-filter all KPIs and charts.
4. **Click any KPI card** to open a detailed drill-down modal.
5. **Click any customer row** to see their invoice history and parts bought.
6. Use the **date range sliders** to zoom into any part of the month.
7. Use **Export Excel** to download a 4-sheet summary (Summary, Customers, Parts, Daily).
8. Use **Share** to copy a WhatsApp-ready summary to clipboard.

---

## Where to edit things

| What | Where |
|---|---|
| Brand colors, fonts, spacing | `src/app/globals.css` — edit the `:root` CSS variables |
| Alert thresholds (margin %, concentration %, etc.) | Settings panel in the app (gear icon) — persisted to localStorage |
| Chart colors | `src/lib/types.ts` → `CHART_COLORS` array |
| WhatsApp summary text | `src/lib/share.ts` → `generateWhatsAppSummary()` |

---

## How to add a new chart

1. Create `src/components/charts/YourChart.tsx` — use `ResponsiveContainer` from Recharts.
2. Accept `items: SalesItem[]` as a prop and compute your data with helpers from `src/lib/aggregations.ts`.
3. Import and place it in the relevant pane under `src/panes/`.

## How to add a new tab/pane

1. Create `src/panes/YourPane.tsx`.
2. Add an entry to the `TABS` array in `src/components/layout/TabNav.tsx`.
3. Add a render case for it in `src/components/Dashboard.tsx`.

---

## Excel file format expected

Your cost sheet should have columns (in any order):
- **DATE** — date of each sale
- **BILL NO** — invoice number
- **CUST NAME** — customer name
- **ITEM** — part name / description
- **QTY** — quantity sold
- **TOTAL** — revenue (ex-VAT)
- **MARGIN** — gross margin amount
- **COGS** — cost of goods sold
- **VAT 5%** — VAT amount

Column names are detected automatically (case-insensitive, partial match). Rows with no ITEM or zero TOTAL are skipped.

---

## Tech Stack

| Package | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Zustand + persist | State management |
| Recharts | All charts |
| Motion (Framer Motion) | UI animations (modals, tabs, cards, stagger) |
| xlsx | Excel parsing and export |

---

## Project structure

```
src/
├── app/           # layout.tsx, page.tsx, globals.css (tokens)
├── components/
│   ├── layout/    # Topbar, MonthsBar, TargetBar, TabNav, DateRangeFilter
│   ├── upload/    # UploadScreen (drag-drop)
│   ├── overview/  # KpiCard, KpiGrid, SparkCard, SparkRow
│   ├── charts/    # All Recharts chart components
│   ├── tables/    # CustomerTable, PartsTable
│   ├── modals/    # Modal shell + 6 drill-down modals
│   ├── settings/  # SettingsPanel (slide-in)
│   └── ui/        # Badge, Card, CardHeader, MarginBar, Toast, EmptyState
├── panes/         # One file per tab (Overview, Revenue, Customers, Parts, Margin, Compare, Alerts)
├── lib/           # parser.ts, aggregations.ts, share.ts, types.ts
└── store/         # dashboardStore.ts (Zustand)
```
