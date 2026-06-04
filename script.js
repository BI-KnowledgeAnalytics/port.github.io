/* =========================================================
   Shafiq ur Rehman — Portfolio script
   - Theme toggle (light / dark / auto)
   - Footer year
   - Dashboard renderer (6 mining dashboards, all data-driven)
   - Production Tower: shift selector + tab switcher (live mockup)
   - Scroll-in animation
   ========================================================= */

(() => {
  "use strict";

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);
  else root.setAttribute("data-theme", "auto");

  document.getElementById("year").textContent = new Date().getFullYear();

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Helpers ---------- */
  const fmt = {
    n:  (v, d = 0) => (v == null ? "—" : Number(v).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d })),
    pct:(v) => (v == null ? "—" : `${v.toFixed(1)}%`),
    money: (v) => "$" + (v / 1_000_000 >= 1
      ? (v / 1_000_000).toFixed(1) + "M"
      : (v / 1_000).toFixed(0) + "K"),
  };
  const delta = (v) => v > 0 ? "up" : v < 0 ? "down" : "flat";
  const deltaArrow = (v) => v > 0 ? "▲" : v < 0 ? "▼" : "■";
  const deltaPrefix = (v) => v > 0 ? "▲ " : v < 0 ? "▼ " : "■ ";

  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k.startsWith("on") && typeof attrs[k] === "function")
        node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
    for (const c of children) {
      if (c == null) continue;
      node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
  };

  /* ---------- Chart builders ---------- */
  function barChart(data, opts = {}) {
    const { max = 200, h = 80, w = 200, labels = [], colors = [] } = opts;
    const peak = Math.max(...data, 1);
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "bar-chart");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");
    const baseLine = document.createElementNS(svgNS, "line");
    baseLine.setAttribute("x1", 0); baseLine.setAttribute("x2", w);
    baseLine.setAttribute("y1", h - 10); baseLine.setAttribute("y2", h - 10);
    baseLine.setAttribute("stroke", "currentColor"); baseLine.setAttribute("stroke-width", "0.4");
    baseLine.setAttribute("opacity", "0.25");
    svg.append(baseLine);

    const slot = w / data.length;
    data.forEach((v, i) => {
      const rect = document.createElementNS(svgNS, "rect");
      const bw = slot * 0.7;
      const bh = ((v / peak) * (h - 16)) || 0;
      const x = i * slot + (slot - bw) / 2;
      const y = h - 10 - bh;
      rect.setAttribute("x", x); rect.setAttribute("y", y);
      rect.setAttribute("width", bw); rect.setAttribute("height", Math.max(bh, 1));
      rect.setAttribute("fill", colors[i % colors.length] || "var(--c-1)");
      rect.setAttribute("rx", "1");
      svg.append(rect);

      if (labels[i]) {
        const t = document.createElementNS(svgNS, "text");
        t.setAttribute("x", i * slot + slot / 2);
        t.setAttribute("y", h - 2);
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("class", "ax");
        t.textContent = labels[i];
        svg.append(t);
      }
    });
    return svg;
  }

  function lineChart(points, opts = {}) {
    const { h = 80, w = 200, color = "var(--c-1)", fill = true, ymin, ymax } = opts;
    const vals = points.map(p => p[1]);
    const lo = ymin ?? Math.min(...vals);
    const hi = ymax ?? Math.max(...vals);
    const range = (hi - lo) || 1;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "line-chart");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("preserveAspectRatio", "none");

    const id = "g" + Math.random().toString(36).slice(2, 8);
    if (fill) {
      const defs = document.createElementNS(svgNS, "defs");
      defs.innerHTML = `
        <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>`;
      svg.append(defs);
    }

    const baseLine = document.createElementNS(svgNS, "line");
    baseLine.setAttribute("x1", 0); baseLine.setAttribute("x2", w);
    baseLine.setAttribute("y1", h - 10); baseLine.setAttribute("y2", h - 10);
    baseLine.setAttribute("stroke", "currentColor"); baseLine.setAttribute("stroke-width", "0.4");
    baseLine.setAttribute("opacity", "0.25");
    svg.append(baseLine);

    const step = w / (points.length - 1 || 1);
    const xy = points.map((p, i) => [i * step, 6 + (1 - (p[1] - lo) / range) * (h - 18)]);
    const path = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

    if (fill) {
      const area = document.createElementNS(svgNS, "path");
      area.setAttribute("d", `${path} L${w},${h - 10} L0,${h - 10} Z`);
      area.setAttribute("fill", `url(#${id})`);
      svg.append(area);
    }
    const line = document.createElementNS(svgNS, "path");
    line.setAttribute("d", path);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "1.6");
    svg.append(line);

    if (opts.showPoints) {
      xy.forEach(([x, y]) => {
        const c = document.createElementNS(svgNS, "circle");
        c.setAttribute("cx", x); c.setAttribute("cy", y);
        c.setAttribute("r", "1.4"); c.setAttribute("fill", color);
        svg.append(c);
      });
    }
    return svg;
  }

  function donut(slices) {
    const C = 2 * Math.PI * 20;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "donut");
    svg.setAttribute("viewBox", "0 0 60 60");
    const colors = ["var(--c-1)", "var(--c-2)", "var(--c-3)", "var(--c-4)", "var(--c-5)", "var(--c-6)"];
    let offset = 0;
    slices.forEach((s, i) => {
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", 30); c.setAttribute("cy", 30);
      c.setAttribute("r", 20); c.setAttribute("fill", "none");
      c.setAttribute("stroke", colors[i % colors.length]);
      c.setAttribute("stroke-width", "10");
      c.setAttribute("stroke-dasharray", `${(s.pct * C / 100).toFixed(1)} ${C.toFixed(1)}`);
      c.setAttribute("stroke-dashoffset", `${-offset}`);
      c.setAttribute("transform", "rotate(-90 30 30)");
      svg.append(c);
      offset += s.pct * C / 100;
    });
    return svg;
  }

  function miniTable(rows) {
    const wrap = el("div", { class: "mini-table" });
    rows.forEach((r, i) => {
      const cls = i === 0 ? "row head" : "row";
      const row = el("div", { class: cls });
      r.forEach(c => row.append(el("div", {}, c)));
      wrap.append(row);
    });
    return wrap;
  }

  /* ---------- Mockup renderer ---------- */
  function renderMockup(d, shiftState) {
    const wrap = el("div", { class: "mockup", role: "img", "aria-label": d.title + " mockup" });
    const tabKeys = Object.keys(d.tabs);
    const activeTab = shiftState?.tab ?? tabKeys[0];
    const activeShift = shiftState?.shift ?? "day";

    const bar = el("div", { class: "mockup-bar" });
    bar.append(el("span", { class: "mockup-tab" }, "🚚 " + d.tabTitle));
    if (d.interactive) {
      const tabs = el("div", { class: "mockup-tabs" });
      tabKeys.forEach(k => {
        const btn = el("button", {
          class: "tab-btn" + (k === activeTab ? " active" : ""),
          type: "button",
          "data-tab": k,
        }, d.tabLabels[k]);
        btn.addEventListener("click", () => {
          shiftState.tab = k;
          const parent = wrap.parentNode;
          const next = renderMockup(d, shiftState);
          parent.replaceChild(next, wrap);
        });
        tabs.append(btn);
      });
      bar.append(tabs);

      const shiftChips = el("div", { class: "mockup-tabs" });
      ["day", "night", "swing"].forEach(s => {
        const btn = el("button", {
          class: "tab-btn" + (s === activeShift ? " active" : ""),
          type: "button",
          "data-shift": s,
        }, s[0].toUpperCase() + s.slice(1));
        btn.addEventListener("click", () => {
          shiftState.shift = s;
          const parent = wrap.parentNode;
          const next = renderMockup(d, shiftState);
          parent.replaceChild(next, wrap);
        });
        shiftChips.append(btn);
      });
      bar.append(shiftChips);
    } else {
      bar.append(el("span", { class: "mockup-chip" }, d.chip1 || "FY24"));
      bar.append(el("span", { class: "mockup-chip" }, d.chip2 || "All Areas"));
    }
    wrap.append(bar);

    /* KPIs */
    const kpiData = d.interactive
      ? d.kpis[activeShift] || d.kpis.day
      : d.kpis;
    const kpiStrip = el("div", { class: "kpi-strip" });
    kpiData.forEach(k => {
      const card = el("div", { class: "kpi", "data-anim": "" });
      card.append(el("div", { class: "kpi-label" }, k.label));
      card.append(el("div", { class: "kpi-value" }, k.value));
      card.append(el("div", { class: "kpi-delta " + delta(k.d) }, deltaPrefix(k.d) + k.deltaText));
      kpiStrip.append(card);
    });
    wrap.append(kpiStrip);

    /* Tabs / Charts */
    const tabData = d.interactive
      ? d.tabs[activeTab](activeShift)
      : d.tabs[activeTab];
    tabData.rows.forEach(row => {
      const cr = el("div", { class: "chart-row" + (row.length === 1 ? " full" : "") });
      row.forEach(c => {
        const cell = el("div", { class: "chart" + (row.length === 1 ? " full" : "") });
        cell.append(el("div", { class: "chart-caption" }, c.title));
        if (c.type === "bar")     cell.append(barChart(c.data, { labels: c.labels, colors: c.colors }));
        else if (c.type === "line") cell.append(lineChart(c.data, { color: c.color, showPoints: c.points }));
        else if (c.type === "donut") {
          const wrap2 = el("div", { class: "donut-legend" });
          wrap2.append(donut(c.slices));
          const ul = el("ul", { class: "legend" });
          c.slices.forEach(s => {
            const li = el("li", {});
            const i = el("i", { style: "background:" + s.color });
            li.append(i, " " + s.label + " " + s.pct + "%");
            ul.append(li);
          });
          wrap2.append(ul);
          cell.append(wrap2);
        }
        else if (c.type === "table") cell.append(miniTable(c.rows));
        cr.append(cell);
      });
      wrap.append(cr);
    });
    return wrap;
  }

  /* ---------- Dashboard data ---------- */

  const shiftKpis = (day, night, swing) => ({ day, night, swing });

  const production = {
    id: "production",
    industry: "Production",
    interactive: true,
    title: "Production Control Tower",
    desc: "Pit-floor and dispatch view — tonnage, ore grade, truck cycles, strip ratio, by bench and shovel. Time-intel for 2-panel / 3-crew rotation.",
    stack: ["Star schema · 8 facts / dims", "Shift-aware time intel", "PI Historian tags", "Wenco dispatch events"],
    case: "Built for a 220 kt/d open-pit gold operation — flagged 3 dispatch delays that cost 1,400 t/shift in lost truck cycles.",
    tabTitle: "Production Overview",
    tabLabels: { overview: "Overview", trend: "Trend", detail: "By Bench" },
    chips: { day: "Day shift · 06:00–14:00", night: "Night shift · 14:00–22:00", swing: "Swing · 22:00–06:00" },

    kpis: shiftKpis(
      [
        { label: "Tonnage (t)",         value: "12,840", d:  1, deltaText: "+3.2% vs plan" },
        { label: "Ore grade (g/t)",     value: "1.84",   d:  1, deltaText: "+0.06 g/t" },
        { label: "Strip ratio (w:o)",   value: "2.1",    d: -1, deltaText: "−0.2 (good)" },
        { label: "Truck cycles",        value: "412",    d:  1, deltaText: "+18 vs avg" },
      ],
      [
        { label: "Tonnage (t)",         value: "11,520", d: -1, deltaText: "−4.1% vs plan" },
        { label: "Ore grade (g/t)",     value: "1.79",   d: -1, deltaText: "−0.04 g/t" },
        { label: "Strip ratio (w:o)",   value: "2.3",    d:  1, deltaText: "+0.1" },
        { label: "Truck cycles",        value: "378",    d: -1, deltaText: "−12 vs avg" },
      ],
      [
        { label: "Tonnage (t)",         value: "13,260", d:  1, deltaText: "+5.8% vs plan" },
        { label: "Ore grade (g/t)",     value: "1.91",   d:  1, deltaText: "+0.13 g/t" },
        { label: "Strip ratio (w:o)",   value: "2.0",    d: -1, deltaText: "−0.1" },
        { label: "Truck cycles",        value: "428",    d:  1, deltaText: "+22 vs avg" },
      ],
    ),

    tabs: {
      overview: (shift) => ({
        rows: [
          [
            { title: "Hourly tonnage (last 12h)", type: "line", color: "var(--c-1)",
              data: productionHourly[shift] },
            { title: "Tonnes by shovel", type: "bar", data: [3840, 2210, 2960, 2120, 1710],
              labels: ["SH-01","SH-02","SH-03","SH-04","SH-05"], colors: ["var(--c-1)","var(--c-2)","var(--c-1)","var(--c-2)","var(--c-1)"] },
          ],
          [
            { title: "Material split", type: "donut",
              slices: [
                { label: "Ore",   pct: 32, color: "var(--c-1)" },
                { label: "Waste", pct: 56, color: "var(--c-2)" },
                { label: "LG ore",pct: 8,  color: "var(--c-5)" },
                { label: "Fill",  pct: 4,  color: "var(--c-7)" },
              ]},
            { title: "Top haul routes (cycles)", type: "table", rows: [
              ["Route", "Cycles", "Avg (min)"],
              ["SH-01 → ROM-2", "112", "18.4"],
              ["SH-03 → ROM-1", "98",  "21.2"],
              ["SH-04 → WASTE-N", "76", "16.8"],
              ["SH-02 → Crusher", "54", "23.1"],
            ]},
          ],
        ],
      }),

      trend: (shift) => ({
        rows: [
          [
            { title: "Tonnage — last 14 days", type: "line", color: "var(--c-1)",
              data: trendTonnage },
            { title: "Ore grade — last 14 days (g/t)", type: "line", color: "var(--c-5)",
              data: trendGrade },
          ],
        ],
      }),

      detail: (shift) => ({
        rows: [
          [
            { title: "Tonnage by bench (t)", type: "bar", data: benchTonnes,
              labels: ["B-820","B-840","B-860","B-880","B-900","B-920","B-940","B-960"],
              colors: Array(8).fill("var(--c-1)") },
          ],
          [
            { title: "Bench × shovel matrix", type: "table", rows: [
              ["Bench", "Active shovels", "Tonnes", "Grade"],
              ["B-820", "SH-01, SH-04", "3,840", "1.92"],
              ["B-860", "SH-02, SH-05", "2,210", "1.71"],
              ["B-880", "SH-03, SH-01", "2,960", "1.85"],
              ["B-900", "SH-04, SH-02", "2,120", "1.78"],
            ]},
          ],
        ],
      }),
    },
  };

  const fleet = {
    id: "fleet",
    industry: "Fleet & Maintenance",
    title: "Fleet Equipment OEE",
    desc: "Availability, MTBF, MTTR, and fuel L/t by equipment class. RLS-scoped by site area. Downtime Pareto with auto-classified causes.",
    stack: ["SAP PM integration", "Telematics (Cat VisionLink)", "Downtime Pareto", "OEE waterfall"],
    case: "Replaced a 4-tab Excel pack used at morning meetings; cut supervisor prep time from 45 min to under 5.",
    tabTitle: "Fleet OEE",
    chip1: "FY24 MTD",
    chip2: "All sites · all classes",

    kpis: [
      { label: "Availability",   value: "88.2%", d:  1, deltaText: "+1.4 pp" },
      { label: "MTBF (h)",       value: "42.6",  d:  1, deltaText: "+3.1 h" },
      { label: "MTTR (h)",       value: "3.8",   d: -1, deltaText: "−0.6 h" },
      { label: "Fuel L/ton",     value: "1.92",  d: -1, deltaText: "−0.08 L/t" },
    ],

    tabs: {
      overview: {
        rows: [
          [
            { title: "Downtime by cause (h, last 30d)", type: "bar",
              data: [124, 96, 78, 64, 52, 41, 38, 30, 22, 18],
              labels: ["Tire","Engine","Hyd","Brakes","Trsm","Elec","Struc","Fuel","Other","Sched"],
              colors: ["var(--c-4)","var(--c-1)","var(--c-2)","var(--c-1)","var(--c-2)","var(--c-2)","var(--c-2)","var(--c-1)","var(--c-2)","var(--c-3)"] },
            { title: "Availability by class (%)", type: "line", color: "var(--c-1)",
              data: classAvail, points: true },
          ],
          [
            { title: "Idle vs productive (h/day)", type: "bar",
              data: [4.2, 3.6, 5.1, 3.2, 4.8, 3.9],
              labels: ["Haul","Shovel","Drill","Loader","Dozer","Grader"],
              colors: ["var(--c-5)","var(--c-1)","var(--c-5)","var(--c-1)","var(--c-5)","var(--c-1)"] },
            { title: "Top 10 offenders (hauls)", type: "table", rows: [
              ["Unit", "Class", "Avail.", "Cycles"],
              ["HT-118", "CAT 793", "76%", "412"],
              ["HT-204", "CAT 789", "81%", "398"],
              ["SH-12", "P&H 4100", "84%", "184"],
              ["DR-08", "Pit Viper", "86%", "92"],
            ]},
          ],
        ],
      },
    },
  };

  const drillBlast = {
    id: "drill",
    industry: "Drill & Blast",
    title: "Drill & Blast Performance",
    desc: "Hole depth, powder factor, fragmentation, and cost per metre. Pattern compliance and explosive-type mix. Blasted-tonnes reconciliation against dispatch.",
    stack: ["Drill nav. exports", "Blast design SW", "Image-analysis fragment.", "Cost-per-metre"],
    case: "Caught a 12% over-blast on Bench 880 by comparing powder factor to design — saved $48K in explosives that month.",
    tabTitle: "Drill & Blast",
    chip1: "MTD · 38 blasts",
    chip2: "All patterns",

    kpis: [
      { label: "Avg powder factor",   value: "0.82",   d:  1, deltaText: "kg/m³ · −0.04" },
      { label: "Avg hole depth",      value: "16.4 m", d:  1, deltaText: "+0.6 m" },
      { label: "Fragmentation (P80)", value: "21 cm",  d: -1, deltaText: "−3 cm" },
      { label: "Cost / metre",        value: "$148",   d: -1, deltaText: "−$6" },
    ],

    tabs: {
      overview: {
        rows: [
          [
            { title: "Powder factor by blast (kg/m³)", type: "line", color: "var(--c-1)",
              data: drillBlastSeries, points: true },
            { title: "Explosive type mix", type: "donut",
              slices: [
                { label: "ANFO",     pct: 62, color: "var(--c-1)" },
                { label: "Emulsion", pct: 28, color: "var(--c-5)" },
                { label: "Bulk emulsion", pct: 8, color: "var(--c-2)" },
                { label: "Initiation",pct: 2, color: "var(--c-4)" },
              ]},
          ],
          [
            { title: "Blasts by bench", type: "bar",
              data: [9, 7, 6, 5, 4, 3, 2, 2],
              labels: ["B-820","B-840","B-860","B-880","B-900","B-920","B-940","B-960"],
              colors: Array(8).fill("var(--c-1)") },
            { title: "Pattern compliance", type: "table", rows: [
              ["Pattern", "Holes", "Compliance"],
              ["7×7 m", "184", "97%"],
              ["6×6 m", "120", "94%"],
              ["8×8 m", "96",  "88%"],
              ["Buffer", "44",  "100%"],
            ]},
          ],
        ],
      },
    },
  };

  const plant = {
    id: "plant",
    industry: "Mineral Processing",
    title: "Mineral Processing Plant",
    desc: "Crusher, SAG mill, ball mill, recovery and concentrate grade. Hourly PI Historian tag-based — sub-minute granularity. Recovery as a weighted calc, not an average.",
    stack: ["PI Historian tags", "Hourly reconciliation", "Recovery waterfall", "Reagent mg/L"],
    case: "Replaced a daily Excel roll-up with an hourly view — operators spotted a 2% recovery drift within 4 hours instead of 24.",
    tabTitle: "Processing Plant",
    chip1: "Live · last 24h",
    chip2: "Crusher → Concentrate",

    kpis: [
      { label: "Throughput",      value: "412 t/h", d:  1, deltaText: "+8 t/h" },
      { label: "Recovery",        value: "91.4%",   d:  1, deltaText: "+0.6 pp" },
      { label: "Mill power",      value: "18.6 kWh/t", d: -1, deltaText: "−0.4 kWh/t" },
      { label: "Concentrate grade", value: "118 g/t",  d:  1, deltaText: "+4 g/t" },
    ],

    tabs: {
      overview: {
        rows: [
          [
            { title: "Hourly throughput vs target (t/h)", type: "line", color: "var(--c-1)",
              data: plantThroughput, points: true },
            { title: "Recovery waterfall (%)", type: "bar",
              data: [92.1, -1.4, 0.8, -0.6, 0.5],
              labels: ["Feed","Crusher","SAG","Ball","Conc"],
              colors: ["var(--c-1)","var(--c-4)","var(--c-3)","var(--c-4)","var(--c-3)"] },
          ],
          [
            { title: "Reagent consumption (g/t)", type: "bar",
              data: [620, 180, 95, 38, 22],
              labels: ["NaCN","Lime","CuSO₄","PbNO₃","Other"],
              colors: ["var(--c-5)","var(--c-2)","var(--c-5)","var(--c-2)","var(--c-2)"] },
            { title: "Shift performance", type: "table", rows: [
              ["Shift", "Throughput", "Recovery"],
              ["Day 06:00", "4,128 t", "91.6%"],
              ["Night 14:00", "3,940 t", "91.2%"],
              ["Swing 22:00", "4,210 t", "91.8%"],
              ["MTD avg",   "12,278 t/d", "91.4%"],
            ]},
          ],
        ],
      },
    },
  };

  const shec = {
    id: "shec",
    industry: "SHEC & Safety",
    title: "SHEC & Safety",
    desc: "TRIFR, LTIFR, HiPo, critical-control compliance. Incident Pareto with auto-classification, JHA completion %, days-since-LTI counter.",
    stack: ["Incident DB", "JHA mobile app", "ISO 45001 KPIs", "Days-since-LTI"],
    case: "Replaced a monthly safety PDF — supervisors see weekly trends and HiPo before the safety meeting, not after.",
    tabTitle: "Safety Dashboard",
    chip1: "YTD",
    chip2: "All sites · all contractors",

    kpis: [
      { label: "TRIFR",     value: "1.84",   d: -1, deltaText: "−0.32 vs PY" },
      { label: "LTIFR",     value: "0.42",   d: -1, deltaText: "−0.18 vs PY" },
      { label: "Days since LTI", value: "127", d: 1, deltaText: "+18 d" },
      { label: "Critical-control %", value: "94.2", d: 1, deltaText: "+1.8 pp" },
    ],

    tabs: {
      overview: {
        rows: [
          [
            { title: "Monthly TRIFR — last 12 mo", type: "line", color: "var(--c-4)",
              data: trifrSeries, points: true },
            { title: "Incident type mix", type: "donut",
              slices: [
                { label: "First aid",    pct: 48, color: "var(--c-2)" },
                { label: "Recordable",   pct: 22, color: "var(--c-5)" },
                { label: "Lost-time",    pct: 9,  color: "var(--c-4)" },
                { label: "Near miss",    pct: 21, color: "var(--c-1)" },
              ]},
          ],
          [
            { title: "JHAs completed vs planned", type: "bar",
              data: jhaSeries, labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
              colors: Array(8).fill("var(--c-3)") },
            { title: "Top incident causes", type: "table", rows: [
              ["Cause", "Count", "HiPo"],
              ["Slip/trip", "12", "2"],
              ["Lifting", "9", "3"],
              ["Vehicle", "8", "4"],
              ["Hot work", "6", "1"],
            ]},
          ],
        ],
      },
    },
  };

  const cost = {
    id: "cost",
    industry: "Cost & Budget",
    title: "Mine Cost & Budget",
    desc: "Unit cost ($/ton, $/oz AISC), OPEX vs budget, contractor spend, capex burn. Numerator/denominator from different fact tables — bridged on date + site.",
    stack: ["Bridge finance ↔ dispatch", "AISC roll-up", "Contractor KPIs", "Capex burn"],
    case: "Surfaced $0.42/oz AISC variance in contractor haulage — one renegotiated contract recovered $1.1M / yr.",
    tabTitle: "Cost & Budget",
    chip1: "YTD",
    chip2: "vs Budget · all sites",

    kpis: [
      { label: "OPEX / ton",    value: "$14.80", d: -1, deltaText: "−$0.60 vs budget" },
      { label: "AISC / oz",     value: "$1,124",  d: -1, deltaText: "−$18" },
      { label: "Contractor OPEX", value: "$8.2M",  d:  1, deltaText: "+$0.4M vs plan" },
      { label: "Capex burn",    value: "62%",     d:  0, deltaText: "On track" },
    ],

    tabs: {
      overview: {
        rows: [
          [
            { title: "OPEX cost waterfall ($/ton)", type: "bar",
              data: [6.2, 3.1, 1.8, 2.4, 0.8, 0.5],
              labels: ["Mining","Processing","G&A","Contractor","Diesel","Other"],
              colors: ["var(--c-1)","var(--c-2)","var(--c-2)","var(--c-5)","var(--c-4)","var(--c-2)"] },
            { title: "Variance vs budget — by area", type: "donut",
              slices: [
                { label: "Favourable", pct: 58, color: "var(--c-3)" },
                { label: "On plan",    pct: 24, color: "var(--c-2)" },
                { label: "Unfavourable", pct: 18, color: "var(--c-4)" },
              ]},
          ],
          [
            { title: "Contractor spend by category", type: "bar",
              data: [2.4, 1.8, 1.4, 1.1, 0.9, 0.6],
              labels: ["Haulage","Drill","Maintenance","Catering","Security","Other"],
              colors: ["var(--c-5)","var(--c-5)","var(--c-2)","var(--c-2)","var(--c-2)","var(--c-2)"] },
            { title: "Top cost variances", type: "table", rows: [
              ["Area", "Actual", "Budget", "Var"],
              ["Haulage", "$3.4M", "$3.0M", "+13%"],
              ["Diesel",  "$1.8M", "$1.6M", "+12%"],
              ["Maintenance","$1.1M","$1.3M","−15%"],
              ["Processing","$2.0M","$2.1M","−5%"],
            ]},
          ],
        ],
      },
    },
  };

  /* ---------- Chart series data ---------- */
  const productionHourly = {
    day:   [["00",0],["01",0],["02",0],["03",0],["04",0],["05",0],["06",420],["07",1120],["08",1480],["09",1620],["10",1740],["11",1820],["12",1680],["13",1820],["14",1280],["15",0],["16",0],["17",0],["18",0],["19",0],["20",0],["21",0],["22",0],["23",0]],
    night: [["00",0],["01",0],["02",0],["03",0],["04",0],["05",0],["06",0],["07",0],["08",0],["09",0],["10",0],["11",0],["12",0],["13",0],["14",820],["15",1620],["16",1720],["17",1780],["18",1820],["19",1740],["20",1620],["21",1520],["22",880],["23",0]],
    swing: [["00",420],["01",1120],["02",1620],["03",1740],["04",1820],["05",1680],["06",780],["07",0],["08",0],["09",0],["10",0],["11",0],["12",0],["13",0],["14",0],["15",0],["16",0],["17",0],["18",0],["19",0],["20",0],["21",0],["22",1320],["23",1820]],
  };
  const trendTonnage = Array.from({ length: 14 }, (_, i) => ["d" + i, 22000 + Math.round(Math.sin(i / 2) * 2400 + Math.random() * 1200)]);
  const trendGrade   = Array.from({ length: 14 }, (_, i) => ["d" + i, 1.82 + Math.sin(i / 3) * 0.12]);
  const benchTonnes  = [4200, 3800, 3200, 4100, 3600, 2900, 2400, 1800];
  const classAvail   = Array.from({ length: 12 }, (_, i) => ["m" + i, 84 + Math.sin(i / 2) * 4 + (i > 8 ? 2 : 0)]);
  const drillBlastSeries = Array.from({ length: 16 }, (_, i) => ["b" + i, 0.78 + (Math.random() - 0.4) * 0.1]);
  const plantThroughput = Array.from({ length: 24 }, (_, i) => ["h" + i, 380 + Math.sin(i / 3) * 40 + Math.random() * 30]);
  const trifrSeries = Array.from({ length: 12 }, (_, i) => ["m" + i, 2.4 - i * 0.05 + (Math.random() - 0.5) * 0.3]);
  const jhaSeries   = [62, 78, 84, 92, 88, 95, 102, 98];

  /* ---------- Render ---------- */
  const grid = document.getElementById("dashboard-grid");
  if (grid) {
    const dashboards = [production, fleet, drillBlast, plant, shec, cost];
    dashboards.forEach(d => {
      const card = el("article", { class: "dashboard", "data-anim": "", "data-industry": d.id });
      const head = el("header", { class: "dashboard-head" });
      const meta = el("div", { class: "dashboard-meta" });
      const tag = el("span", { class: "industry-tag" + (d.interactive ? " interactive" : "") },
        (d.interactive ? "● " : "") + d.industry);
      meta.append(tag, el("h3", { class: "dashboard-title" }, d.title));
      head.append(meta,
        el("p", { class: "dashboard-desc" }, d.desc),
        el("ul", { class: "dashboard-stack" },
          ...d.stack.map(s => el("li", {}, s))),
        el("p", { class: "dashboard-case" }, "Case: " + d.case));
      card.append(head);
      const state = { shift: "day", tab: Object.keys(d.tabs)[0] };
      card.append(renderMockup(d, state));
      grid.append(card);
    });
  }

  /* ---------- Scroll-in animation ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll("[data-anim]").forEach(n => io.observe(n));
})();
