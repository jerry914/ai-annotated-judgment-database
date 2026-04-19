<template>
  <div class="stats-page">
    <div class="stats-layout">
      <FilterSidebar v-model="filters" @submit="doQuery" @reset="resetFilters" />

      <div class="stats-main">
        <div class="stats-header">
          <h1 class="page-title">⚖️ 刑事訴訟判決資料統計</h1>
          <div class="header-actions">
            <button class="btn-action" @click="downloadCSV">⬇ 下載精準匹配</button>
            <button class="btn-action btn-action--secondary" @click="doQuery">重新載入</button>
          </div>
        </div>

        <div class="filter-summary">🔍 {{ filterSummaryText }}</div>

        <StatsSummaryBar :stats="summaryStats" />

        <div v-if="loading" class="status-msg">查詢中...</div>

        <!-- 2×2 Charts Grid -->
        <div v-if="!loading && hasData" class="chart-grid">

          <!-- Chart 1: Heatmap -->
          <div class="chart-card">
            <div class="chart-title">案件結構熱度圖</div>
            <div class="chart-sub">案件分類 × 終結情形</div>
            <div v-if="!heatmap.xLabels.length" class="no-data">查詢後顯示</div>
            <div v-else style="overflow-x:auto">
              <table class="heatmap">
                <thead><tr><th style="width:100px"></th><th v-for="x in heatmap.xLabels" :key="x">{{ x }}</th></tr></thead>
                <tbody><tr v-for="(y, yi) in heatmap.yLabels" :key="y">
                  <td class="hm-label">{{ y }}</td>
                  <td v-for="(x, xi) in heatmap.xLabels" :key="x"
                    :title="`${y} × ${x}：${heatmap.matrix[yi][xi]} 件`"
                    :style="{ background: hmColor(heatmap.matrix[yi][xi], heatmap.max), color: (heatmap.matrix[yi][xi] / (heatmap.max||1)) > 0.5 ? '#fff' : '#111' }"
                    class="hm-cell">{{ heatmap.matrix[yi][xi] || '' }}</td>
                </tr></tbody>
              </table>
            </div>
          </div>

          <!-- Chart 2: Stacked Bar -->
          <div class="chart-card">
            <div class="chart-title">法條量刑結構堆疊圖</div>
            <div class="chart-sub">適用加重減輕類型分布</div>
            <div v-if="!stackBars.length" class="no-data">查詢後顯示</div>
            <template v-else>
              <svg :viewBox="`0 0 600 ${stackBars.length * 32 + 40}`" width="100%" preserveAspectRatio="xMinYMin meet">
                <template v-for="(row, ri) in stackBars" :key="ri">
                  <text :x="124" :y="ri * 32 + 22" text-anchor="end" font-size="11" fill="#111" font-weight="500">{{ row.law.length > 16 ? row.law.slice(0,16)+'…' : row.law }}</text>
                  <rect v-for="(seg, si) in row.segs" :key="si" :x="seg.x" :y="ri * 32 + 8" :width="Math.max(0, seg.w)" height="20" :fill="seg.fill" rx="2">
                    <title>{{ seg.label }}：{{ seg.count }} 件（{{ seg.pct }}%）</title>
                  </rect>
                  <text :x="582" :y="ri * 32 + 22" font-size="10" fill="#6b7280">n={{ row.total }}</text>
                </template>
                <text v-for="p in [0,25,50,75,100]" :key="p" :x="130 + p/100*440" :y="stackBars.length * 32 + 30" text-anchor="middle" font-size="10" fill="#6b7280">{{ p }}%</text>
              </svg>
              <div class="legend-row">
                <div v-for="(cat, ci) in AG_MIT_CATS" :key="cat" class="legend-item">
                  <span class="legend-dot" :style="{ background: PALETTE[ci] }"></span>{{ cat }}
                </div>
              </div>
            </template>
          </div>

          <!-- Chart 3: Violin (simplified as dot+range) -->
          <div class="chart-card">
            <div class="chart-title">法條有期徒刑分布小提琴圖</div>
            <div class="chart-sub">拘役日數分布、平均值與中位數</div>
            <div v-if="!violinData.length" class="no-data">查詢後顯示</div>
            <template v-else>
              <svg :viewBox="`0 0 700 ${violinData.length * 80 + 60}`" width="100%" preserveAspectRatio="xMinYMin meet">
                <!-- Tick lines -->
                <template v-for="t in violinTicks" :key="t.val">
                  <line :x1="t.x" :x2="t.x" y1="20" :y2="violinData.length * 80 + 10" stroke="#e5e7eb" stroke-dasharray="3 3" />
                  <text :x="t.x" :y="violinData.length * 80 + 30" text-anchor="middle" font-size="11" fill="#374151" font-weight="600">{{ t.label }}</text>
                </template>
                <text :x="400" :y="violinData.length * 80 + 50" text-anchor="middle" font-size="12" fill="#6b7280">拘役日數</text>
                <template v-for="(d, di) in violinData" :key="di">
                  <text :x="144" :y="di * 80 + 54" text-anchor="end" font-size="13" fill="#111" font-weight="600">{{ d.law.length > 12 ? d.law.slice(0,12)+'…' : d.law }}</text>
                  <line :x1="150" :x2="650" :y1="di * 80 + 50" :y2="di * 80 + 50" stroke="#f1f5f9" />
                  <!-- Range bar -->
                  <rect :x="d.minX" :y="di * 80 + 40" :width="Math.max(2, d.maxX - d.minX)" height="20" rx="4" fill="rgba(79,134,247,0.18)" stroke="rgba(79,134,247,0.5)" />
                  <!-- Median line -->
                  <line :x1="d.medX" :x2="d.medX" :y1="di * 80 + 36" :y2="di * 80 + 64" stroke="#D9A93A" stroke-width="2.4" />
                  <!-- Mean dot -->
                  <circle :cx="d.meanX" :cy="di * 80 + 50" r="5" fill="#35B679" stroke="#fff" stroke-width="2" />
                  <text :x="Math.min(640, d.meanX + 10)" :y="di * 80 + 40" font-size="11" fill="#059669" font-weight="700">平均 {{ d.meanLabel }}</text>
                  <text :x="Math.min(640, d.medX + 10)" :y="di * 80 + 64" font-size="11" fill="#B8860B" font-weight="700">中位 {{ d.medLabel }}</text>
                  <text x="656" :y="di * 80 + 54" font-size="11" fill="#374151" font-weight="600">n={{ d.n }}</text>
                </template>
              </svg>
            </template>
          </div>

          <!-- Chart 4: Box-Whisker -->
          <div class="chart-card">
            <div class="chart-title">法條有期徒刑盒鬚圖</div>
            <div class="chart-sub">中位數、四分位距與離群值</div>
            <div v-if="!boxData.length" class="no-data">查詢後顯示</div>
            <template v-else>
              <svg :viewBox="`0 0 700 ${boxData.length * 80 + 80}`" width="100%" preserveAspectRatio="xMinYMin meet">
                <template v-for="t in boxTicks" :key="t.val">
                  <line :x1="t.x" :x2="t.x" y1="20" :y2="boxData.length * 80 + 10" stroke="#e5e7eb" stroke-dasharray="3 3" />
                  <text :x="t.x" :y="boxData.length * 80 + 30" text-anchor="middle" font-size="11" fill="#374151" font-weight="600">{{ t.label }}</text>
                </template>
                <line x1="150" x2="650" :y1="boxData.length * 80 + 10" :y2="boxData.length * 80 + 10" stroke="#9ca3af" />
                <text :x="400" :y="boxData.length * 80 + 50" text-anchor="middle" font-size="12" fill="#6b7280">拘役日數</text>
                <template v-for="(d, di) in boxData" :key="di">
                  <text :x="144" :y="di * 80 + 54" text-anchor="end" font-size="13" fill="#111" font-weight="600">{{ d.law.length > 12 ? d.law.slice(0,12)+'…' : d.law }}</text>
                  <line :x1="150" :x2="650" :y1="di * 80 + 50" :y2="di * 80 + 50" stroke="#f1f5f9" />
                  <!-- Whisker line -->
                  <line :x1="d.wlX" :x2="d.whX" :y1="di * 80 + 50" :y2="di * 80 + 50" stroke="#111" stroke-width="1.8" />
                  <line :x1="d.wlX" :x2="d.wlX" :y1="di * 80 + 40" :y2="di * 80 + 60" stroke="#111" stroke-width="1.8" />
                  <line :x1="d.whX" :x2="d.whX" :y1="di * 80 + 40" :y2="di * 80 + 60" stroke="#111" stroke-width="1.8" />
                  <!-- Box -->
                  <rect :x="d.q1X" :y="di * 80 + 38" :width="Math.max(2, d.q3X - d.q1X)" height="24" rx="4" :fill="d.color" opacity="0.85" stroke="#111" stroke-width="1" />
                  <!-- Median line -->
                  <line :x1="d.medX" :x2="d.medX" :y1="di * 80 + 38" :y2="di * 80 + 62" stroke="#111" stroke-width="2.4" />
                  <!-- Labels -->
                  <text :x="Math.min(640, d.q3X + 12)" :y="di * 80 + 38" font-size="11" fill="#111" font-weight="700">中位 {{ d.medLabel }}</text>
                  <text :x="Math.min(640, d.q3X + 12)" :y="di * 80 + 68" font-size="11" fill="#374151">IQR {{ d.iqrLabel }}</text>
                </template>
              </svg>
              <div class="legend-row" style="margin-top:8px">
                <div v-for="(cat, ci) in AG_MIT_CATS" :key="cat" class="legend-item">
                  <span class="legend-dot" :style="{ background: PALETTE[ci] }"></span>{{ cat }}
                </div>
                <div class="legend-item"><span style="width:12px;height:2px;background:#111;display:inline-block"></span>中位數</div>
              </div>
            </template>
          </div>
        </div>

        <!-- Data Table -->
        <div v-if="!loading && tableData.length" class="table-section">
          <div class="table-header-row">
            <span class="section-title">判決書列表</span>
            <span class="table-meta">第 {{ page }} / {{ totalPages }} 頁（共 {{ total.toLocaleString() }} 筆）</span>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead><tr>
                <th>序號</th><th>裁判書ID</th><th>法院別</th><th>案由</th><th>案件分類</th><th>定罪法條</th><th>終結年月</th><th>終結情形</th>
              </tr></thead>
              <tbody>
                <tr v-for="(row, idx) in tableData" :key="row._id || idx">
                  <td class="cell-num">{{ idx + 1 + (page - 1) * pageSize }}</td>
                  <td><router-link v-if="row['裁判書ID']" :to="{ name: 'judgment', params: { jid: row['裁判書ID'] } }" class="case-link">{{ row['裁判書ID'] }}</router-link></td>
                  <td>{{ row['c0_法院別'] }}</td>
                  <td>{{ row['c0_案由'] }}</td>
                  <td><span class="cls-badge" :style="clsBadgeStyle(row['案件分類'])">{{ row['案件分類'] }}</span></td>
                  <td>{{ row['定罪法條'] }}</td>
                  <td>{{ row['c0_終結年'] }}/{{ row['c0_終結月'] }}</td>
                  <td>{{ row['c0_全案終結情形'] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <button :disabled="page <= 1" @click="page--; doQuery()">‹ 上一頁</button>
            <button :disabled="page >= totalPages" @click="page++; doQuery()">下一頁 ›</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import FilterSidebar from '@/components/FilterSidebar.vue';
import StatsSummaryBar from '@/components/StatsSummaryBar.vue';

const AG_MIT_CATS = ['無加重無減輕', '僅有加重法條', '僅有減輕法條', '有加重有減輕'];
const PALETTE = ['#4F86F7', '#F28C52', '#35B679', '#D9A93A'];
const CLS_CLR = { '一人一罪': '#4F86F7', '一人多罪': '#D9A93A', '多人一罪': '#F28C52', '多人多罪': '#E45C5C', '無罪名資料': '#888' };

export default {
  name: 'StatsPage',
  components: { FilterSidebar, StatsSummaryBar },
  data() {
    return {
      AG_MIT_CATS,
      PALETTE,
      filters: {},
      loading: false,
      page: 1,
      pageSize: 50,
      total: 0,
      totalPages: 0,
      tableData: [],
      aggregations: {},
      summaryStats: [
        { label: '判決（篇數）', value: null },
        { label: '被告（人數）', value: null },
        { label: '犯罪數（筆數）', value: null },
        { label: '犯罪法條總數（條數）', value: null },
      ],
    }
  },
  computed: {
    hasData() { return Object.keys(this.aggregations).length > 0; },
    filterSummaryText() {
      const parts = [];
      if (this.filters.caseCategory?.length) parts.push(`案件分類: ${this.filters.caseCategory.join('+')}`);
      if (this.filters.courtType?.length) parts.push(`法院: ${this.filters.courtType.join('+')}`);
      return parts.length ? `篩選條件：${parts.join('，')}` : '所選條件：全部案件';
    },
    heatmap() {
      const agg = this.aggregations.heatmap_case_x_end?.buckets;
      if (!agg?.length) return { xLabels: [], yLabels: [], matrix: [], max: 0 };
      const endCounts = {};
      agg.forEach(caseBucket => {
        (caseBucket.by_end?.buckets || []).forEach(endBucket => {
          endCounts[endBucket.key] = (endCounts[endBucket.key] || 0) + endBucket.doc_count;
        });
      });
      const xLabels = Object.entries(endCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);
      const yLabels = agg.map(b => b.key);
      let max = 0;
      const matrix = yLabels.map(y => {
        const caseBucket = agg.find(b => b.key === y);
        const endMap = {};
        (caseBucket?.by_end?.buckets || []).forEach(b => { endMap[b.key] = b.doc_count; });
        return xLabels.map(x => { const v = endMap[x] || 0; if (v > max) max = v; return v; });
      });
      return { xLabels, yLabels, matrix, max };
    },
    stackBars() {
      const agg = this.aggregations.law_stack?.buckets;
      if (!agg?.length) return [];
      const LM = 130, barW = 440;
      return agg.map(b => {
        const total = b.doc_count;
        const hasAgg = b.has_aggravation?.doc_count || 0;
        const hasMit = b.has_mitigation?.doc_count || 0;
        const both = Math.min(hasAgg, hasMit);
        const onlyAgg = hasAgg - both;
        const onlyMit = hasMit - both;
        const none = Math.max(0, total - onlyAgg - onlyMit - both);
        const counts = [none, onlyAgg, onlyMit, both];
        let accX = LM;
        const segs = AG_MIT_CATS.map((cat, i) => {
          const w = total > 0 ? (counts[i] / total) * barW : 0;
          const x = accX; accX += w;
          return { x, w, fill: PALETTE[i], label: cat, count: counts[i], pct: total > 0 ? Math.round(counts[i] / total * 100) : 0 };
        });
        return { law: b.key, total, segs };
      });
    },
    violinData() {
      const agg = this.aggregations.law_stack?.buckets;
      if (!agg?.length) return [];
      const plotL = 150, plotR = 650, plotW = plotR - plotL;
      const allMax = Math.max(...agg.map(b => b.detention_stats?.max || 0), 1);
      return agg.filter(b => b.detention_stats?.count > 0).map(b => {
        const s = b.detention_stats;
        const p = b.detention_percentiles?.values || {};
        const scale = v => plotL + (Math.max(0, v) / allMax) * plotW;
        return {
          law: b.key, n: s.count,
          minX: scale(s.min || 0), maxX: scale(s.max || 0),
          meanX: scale(s.avg || 0), medX: scale(p['50.0'] || 0),
          meanLabel: (s.avg || 0).toFixed(1), medLabel: String(Math.round(p['50.0'] || 0)),
        };
      });
    },
    violinTicks() {
      const agg = this.aggregations.law_stack?.buckets;
      if (!agg?.length) return [];
      const allMax = Math.max(...agg.map(b => b.detention_stats?.max || 0), 1);
      const step = this.niceStep(allMax, 6);
      const ticks = [];
      for (let v = 0; v <= allMax + step; v += step) {
        ticks.push({ val: v, x: 150 + (v / allMax) * 500, label: String(Math.round(v)) });
      }
      return ticks;
    },
    boxData() {
      const agg = this.aggregations.law_stack?.buckets;
      if (!agg?.length) return [];
      const plotL = 150, plotR = 650, plotW = plotR - plotL;
      const allMax = Math.max(...agg.map(b => {
        const p = b.detention_percentiles?.values || {};
        return p['100.0'] || b.detention_stats?.max || 0;
      }), 1);
      return agg.filter(b => b.detention_stats?.count > 0).map((b) => {
        const p = b.detention_percentiles?.values || {};
        const q1 = p['25.0'] || 0, med = p['50.0'] || 0, q3 = p['75.0'] || 0;
        const iqr = q3 - q1;
        const wl = Math.max(0, q1 - 1.5 * iqr), wh = Math.min(allMax, q3 + 1.5 * iqr);
        const scale = v => plotL + (Math.max(0, v) / allMax) * plotW;
        const hasAgg = b.has_aggravation?.doc_count || 0;
        const hasMit = b.has_mitigation?.doc_count || 0;
        let colorIdx = 0;
        if (hasAgg > hasMit) colorIdx = 1;
        else if (hasMit > hasAgg) colorIdx = 2;
        else if (hasAgg > 0 && hasMit > 0) colorIdx = 3;
        return {
          law: b.key, n: b.doc_count,
          q1X: scale(q1), medX: scale(med), q3X: scale(q3),
          wlX: scale(wl), whX: scale(wh),
          color: PALETTE[colorIdx],
          medLabel: String(Math.round(med)), iqrLabel: String(Math.round(iqr)),
        };
      });
    },
    boxTicks() { return this.violinTicks; },
  },
  mounted() { this.fetchSummary(); },
  methods: {
    niceStep(max, target) {
      const raw = max / target;
      const mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const residual = raw / mag;
      let step;
      if (residual <= 1.5) step = mag;
      else if (residual <= 3) step = 2 * mag;
      else if (residual <= 7) step = 5 * mag;
      else step = 10 * mag;
      return Math.max(1, step);
    },
    hmColor(val, max) {
      if (!val) return 'transparent';
      const ratio = Math.min(val / (max || 1), 1);
      return `rgba(79,134,247,${0.08 + ratio * 0.82})`;
    },
    clsBadgeStyle(cls) {
      const c = CLS_CLR[cls] || '#888';
      return { background: c + '18', color: c, padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: '600' };
    },
    async fetchSummary() {
      try {
        const resp = await axios.get('/api/stats/summary');
        const d = resp.data;
        this.summaryStats = [
          { label: '判決（篇數）', value: d.judgments },
          { label: '被告（人數）', value: d.defendants },
          { label: '犯罪數（筆數）', value: d.crimes },
          { label: '犯罪法條總數（條數）', value: d.unique_laws },
        ];
      } catch { /* not available yet */ }
    },
    async doQuery() {
      this.loading = true;
      try {
        const body = { page: this.page, size: this.pageSize };
        if (this.filters.caseCategory?.length) body.case_type = this.filters.caseCategory;
        if (this.filters.courtType?.length) body.court_type = this.filters.courtType;
        if (this.filters.closingType?.length) body.end_type = this.filters.closingType;
        if (this.filters.dateFrom) body.end_yr_from = parseInt(this.filters.dateFrom);
        if (this.filters.dateTo) body.end_yr_to = parseInt(this.filters.dateTo);
        const resp = await axios.post('/api/stats/query', body);
        this.tableData = resp.data.data || [];
        this.total = resp.data.meta?.total || 0;
        this.totalPages = resp.data.meta?.total_pages || 0;
        this.aggregations = resp.data.aggregations || {};
        const agg = resp.data.aggregations || {};
        this.summaryStats = [
          { label: '判決（篇數）', value: agg.unique_jid?.value || 0 },
          { label: '總筆數', value: resp.data.meta?.total || 0 },
          { label: '犯罪數（筆數）', value: agg.total_crimes?.value || 0 },
          { label: '犯罪法條總數（條數）', value: agg.unique_laws?.value || 0 },
        ];
      } catch (e) { console.error('Stats query failed:', e); }
      finally { this.loading = false; }
    },
    resetFilters() {
      this.filters = {};
      this.tableData = [];
      this.aggregations = {};
      this.page = 1;
      this.fetchSummary();
    },
    downloadCSV() {
      if (!this.tableData.length) return;
      const keys = Object.keys(this.tableData[0]).filter(k => k !== '_id');
      const header = keys.join(',') + '\n';
      const rows = this.tableData.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = '統計資料匹配結果.csv'; a.click(); URL.revokeObjectURL(url);
    },
  },
}
</script>

<style scoped>
.stats-page { padding: 1.5rem; }
.stats-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.25rem; max-width: 1400px; margin: 0 auto; }
@media (max-width: 900px) { .stats-layout { grid-template-columns: 1fr; } }
.stats-main { min-width: 0; }
.stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem; }
.page-title { font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; margin: 0; }
.header-actions { display: flex; gap: 0.5rem; }
.btn-action { padding: 7px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; cursor: pointer; }
.btn-action:hover { box-shadow: var(--shadow-md); }
.btn-action--secondary { background: var(--color-background); color: var(--color-primary); }
.filter-summary { font-size: 12px; color: #1e3a5f; margin-bottom: 1rem; padding: 8px 12px; background: #f0f4ff; border: 1px solid #c7d7f5; border-radius: 8px; }

/* Charts */
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
@media (max-width: 1100px) { .chart-grid { grid-template-columns: 1fr; } }
.chart-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px 18px; min-height: 300px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); min-width: 0; overflow: hidden; }
.chart-title { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 3px; }
.chart-sub { font-size: 10px; color: #6b7280; margin-bottom: 10px; }
.no-data { height: 200px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 13px; }

/* Heatmap */
.heatmap { width: 100%; border-collapse: separate; border-spacing: 3px; table-layout: fixed; }
.heatmap th { font-size: 9px; color: #374151; text-align: center; word-break: break-word; line-height: 1.3; font-weight: 500; padding: 3px 2px; }
.hm-label { font-size: 10px; color: #374151; text-align: right; padding-right: 6px; font-weight: 500; }
.hm-cell { height: 36px; border-radius: 5px; border: 1px solid #dbe3f1; text-align: center; font-size: 9px; font-weight: 700; }

/* Legend */
.legend-row { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 6px; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #374151; }
.legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

/* Table */
.table-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.table-header-row { padding: 12px 18px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
.section-title { font-size: 14px; font-weight: 700; }
.table-meta { font-size: 12px; color: #6b7280; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.data-table th { background: var(--color-primary); color: #fff; padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; white-space: nowrap; }
.data-table td { padding: 7px 10px; border-bottom: 1px solid rgba(0,0,0,0.05); vertical-align: top; }
.data-table tr:hover td { background: #fafafa; }
.cell-num { text-align: center; color: #9ca3af; width: 36px; }
.case-link { color: #4A90E2; text-decoration: none; font-size: 10px; font-family: monospace; }
.case-link:hover { text-decoration: underline; }
.cls-badge { white-space: nowrap; }
.pagination { display: flex; justify-content: center; gap: 0.75rem; padding: 12px; }
.pagination button { padding: 5px 14px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; font-size: 12px; font-weight: 500; }
.pagination button:disabled { color: #cbd5e1; cursor: default; }
.status-msg { text-align: center; padding: 3rem; color: #9ca3af; }
</style>
