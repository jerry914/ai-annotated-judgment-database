<template>
  <div class="search-page">
    <div class="search-layout">
      <!-- Left: Shared Filter Sidebar -->
      <FilterSidebar v-model="filters" :aggregations="aggregations" @submit="doSearch" @reset="resetFilters" />

      <!-- Right: Main Content -->
      <div class="search-main">
        <h1 class="page-title">刑事事實檢索頁面</h1>

        <!-- Stats Bar -->
        <StatsSummaryBar :stats="summaryStats" />

        <!-- Advanced Search -->
        <div class="advanced-section">
          <div class="adv-field">
            <label class="adv-label">當事人等基本資料</label>
            <input v-model="advFilters.basicInfo" class="adv-input" placeholder="" />
          </div>
          <div class="adv-field">
            <label class="adv-label">主文中的關鍵字</label>
            <input v-model="advFilters.syllabusKeyword" class="adv-input" placeholder="" />
          </div>
          <div class="adv-field">
            <label class="adv-label">事實關鍵字</label>
            <input v-model="advFilters.factKeyword" class="adv-input" placeholder="輸入事實關鍵字..." />
          </div>
          <button class="btn-advanced" @click="doSearch">進階篩選</button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="status-msg">搜尋中...</div>

        <!-- Results Table -->
        <div v-if="results.length > 0" class="results-section">
          <table class="results-table">
            <thead>
              <tr>
                <th>序號</th>
                <th>案號</th>
                <th>日期</th>
                <th>案件別</th>
                <th>主文</th>
                <th>事實</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in results" :key="item.esid || idx">
                <td class="cell-num">{{ idx + 1 + (page - 1) * pageSize }}</td>
                <td class="cell-case">
                  <router-link
                    v-if="extractJid(item)"
                    :to="{ name: 'judgment', params: { jid: extractJid(item) } }"
                    class="case-link"
                  >{{ item.case_num }}</router-link>
                  <span v-else>{{ item.case_num }}</span>
                </td>
                <td class="cell-date">{{ formatDate(item.jud_date) }}</td>
                <td>{{ item.case_type }}</td>
                <td class="cell-text">
                  {{ truncate(item.syllabus, 80) }}
                  <a v-if="item.syllabus && item.syllabus.length > 80" href="#" class="read-more" @click.prevent="openPreview(item, 'syllabus')">閱讀全文</a>
                </td>
                <td class="cell-text">
                  {{ truncate(item.fact_text, 100) }}
                  <a v-if="item.fact_text && item.fact_text.length > 100" href="#" class="read-more" @click.prevent="openPreview(item)">閱讀全文</a>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="pagination">
            <button :disabled="page <= 1" @click="page--; doSearch()">上一頁</button>
            <span>第 {{ page }} / {{ totalPages }} 頁（共 {{ total }} 筆）</span>
            <button :disabled="page >= totalPages" @click="page++; doSearch()">下一頁</button>
          </div>
        </div>

        <!-- No results -->
        <div v-if="!loading && searched && results.length === 0" class="status-msg">
          查無符合條件的資料。
        </div>

        <!-- Download -->
        <div v-if="results.length > 0" class="download-row">
          <button class="btn-download" @click="downloadCSV">下載事實相關資料</button>
        </div>
      </div>
    </div>

    <!-- Preview Dialog -->
    <div v-if="previewItem" class="dialog-overlay" @click.self="previewItem = null">
      <div class="dialog-box">
        <div class="dialog-header">
          <h3>{{ previewItem.case_num }}</h3>
          <button class="dialog-close" @click="previewItem = null">×</button>
        </div>
        <div class="dialog-body">
          <h4>{{ previewField === 'syllabus' ? '主文' : '事實' }}</h4>
          <p class="dialog-text">{{ previewField === 'syllabus' ? previewItem.syllabus : previewItem.fact_text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import FilterSidebar from '@/components/FilterSidebar.vue';
import StatsSummaryBar from '@/components/StatsSummaryBar.vue';

export default {
  name: 'FactSearchPage',
  components: { FilterSidebar, StatsSummaryBar },
  data() {
    return {
      filters: {},
      advFilters: { basicInfo: '', syllabusKeyword: '', factKeyword: '' },
      results: [],
      loading: false,
      searched: false,
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      previewItem: null,
      previewField: 'fact_text',
      summaryStats: [
        { label: '判決（篇數）', value: null },
        { label: '被告（人數）', value: null },
        { label: '犯罪數（筆數）', value: null },
        { label: '犯罪法條總數（條數）', value: null },
      ],
      aggregations: {},
    }
  },
  async mounted() {
    this.fetchFilteredStats();
    try {
      const resp = await axios.get('/api/stats/summary');
      const d = resp.data;
      this.summaryStats = [
        { label: '判決（篇數）', value: d.judgments },
        { label: '被告（人數）', value: d.defendants },
        { label: '犯罪數（筆數）', value: d.crimes },
        { label: '犯罪法條總數（條數）', value: d.unique_laws },
      ];
    } catch { /* stats not available */ }
    const jids = this.$route.query.jids;
    if (jids) {
      this.doSearchByJids(jids);
    }
  },
  methods: {
    buildStatsBody() {
      const body = {};
      if (this.filters.caseCategory?.length) body.case_type = this.filters.caseCategory;
      if (this.filters.courtType?.length) body.court_type = this.filters.courtType;
      if (this.filters.closingType?.length) body.end_type = this.filters.closingType;
      if (this.filters.dateFrom) body.end_yr_from = parseInt(this.filters.dateFrom);
      if (this.filters.dateTo) body.end_yr_to = parseInt(this.filters.dateTo);
      if (this.filters.defense?.length) body.defense = this.filters.defense;
      if (this.filters.procedure?.length) body.proc_type = this.filters.procedure;
      if (this.filters.probation?.length) body.prob_granted = this.filters.probation;
      if (this.filters.recidivism?.length) body.recidivist = this.filters.recidivism;
      if (this.filters.crimeArticle?.length) body.conv_law = this.filters.crimeArticle;
      if (this.filters.aggravation?.length) body.aggravation = this.filters.aggravation[0];
      if (this.filters.mitigation?.length) body.mitigation = this.filters.mitigation[0];
      return body;
    },
    async fetchFilteredStats() {
      try {
        const body = this.buildStatsBody();
        body.page = 1;
        body.size = 1;
        const resp = await axios.post('/api/stats/query', body);
        const agg = resp.data.aggregations || {};
        this.aggregations = agg;
        this.summaryStats = [
          { label: '判決（篇數）', value: agg.unique_jid?.value || 0 },
          { label: '被告（人數）', value: resp.data.meta?.total || 0 },
          { label: '犯罪數（筆數）', value: agg.total_crimes?.value || 0 },
          { label: '犯罪法條總數（條數）', value: agg.unique_laws?.value || 0 },
        ];
      } catch { /* stats not available */ }
    },
    async doSearch() {
      this.loading = true;
      this.searched = true;
      this.fetchFilteredStats();
      try {
        const params = {
          page: this.page,
          size: this.pageSize,
        };
        if (this.advFilters.basicInfo) params.basic_info = this.advFilters.basicInfo;
        if (this.advFilters.syllabusKeyword) params.syllabus = this.advFilters.syllabusKeyword;
        if (this.advFilters.factKeyword) params.prediction = this.advFilters.factKeyword;
        if (this.filters.courtType?.length) params.court_type = this.filters.courtType.join(' ');
        if (this.filters.dateFrom && this.filters.dateTo) {
          params.jud_date = `${this.filters.dateFrom}0101-${this.filters.dateTo}1231`;
        }

        const resp = await axios.get('/api/criminal', { params });
        const data = resp.data;
        if (data.fee) {
          this.results = data.fee.data || [];
          this.total = data.fee.meta?.total || 0;
          this.totalPages = data.fee.meta?.total_pages || 0;
        } else {
          this.results = [];
          this.total = 0;
        }
      } catch (e) {
        console.error('Search failed:', e);
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
    async doSearchByJids(jids) {
      this.loading = true;
      this.searched = true;
      try {
        const resp = await axios.get('/api/judgments', { params: { jids, size: 50 } });
        this.results = resp.data.data || [];
        this.total = resp.data.meta?.total || 0;
        this.totalPages = resp.data.meta?.total_pages || 0;
      } catch (e) {
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      this.filters = {};
      this.advFilters = { basicInfo: '', syllabusKeyword: '', factKeyword: '' };
      this.results = [];
      this.searched = false;
      this.page = 1;
      this.fetchFilteredStats();
    },
    formatDate(d) {
      const s = String(d);
      if (s.length === 8) return `民國${parseInt(s.slice(0,4))-1911}年${parseInt(s.slice(4,6))}月${parseInt(s.slice(6,8))}日`;
      return s;
    },
    truncate(text, len) {
      if (!text) return '';
      return text.length > len ? text.slice(0, len) + '...' : text;
    },
    extractJid(item) {
      if (item.JID) return item.JID;
      if (item.jud_url) {
        const m = item.jud_url.match(/[?&]id=([^&]+)/);
        if (m) return decodeURIComponent(m[1]);
      }
      return null;
    },
    openPreview(item, field = 'fact_text') {
      this.previewItem = item;
      this.previewField = field;
    },
    downloadCSV() {
      const header = '序號,案號,日期,案件別,主文,事實\n';
      const rows = this.results.map((r, i) =>
        [i + 1, `"${r.case_num || ''}"`, r.jud_date, `"${r.case_type || ''}"`, `"${(r.syllabus || '').replace(/"/g, '""')}"`, `"${(r.fact_text || '').replace(/"/g, '""')}"`].join(',')
      ).join('\n');
      const blob = new Blob(['\ufeff' + header + rows], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '事實檢索結果.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
  },
}
</script>

<style scoped>
.search-page { padding: 1.5rem; }
.search-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1.25rem;
  max-width: 1400px;
  margin: 0 auto;
}
@media (max-width: 900px) {
  .search-layout { grid-template-columns: 1fr; }
}
.search-main { min-width: 0; }
.page-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.25rem 0;
}

/* Advanced */
.advanced-section {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-soft);
  margin-bottom: 1.25rem;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}
@media (max-width: 900px) {
  .advanced-section { grid-template-columns: 1fr; }
}
.adv-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-muted);
  margin-bottom: 0.35rem;
}
.adv-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: var(--radius-sm);
  font-size: 14px;
  box-sizing: border-box;
}
.adv-input:focus { outline: none; border-color: var(--color-primary); }
.btn-advanced {
  padding: 8px 20px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

/* Table */
.results-section {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}
.results-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.results-table th {
  background: var(--color-primary);
  color: #fff;
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.03em;
}
.results-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  vertical-align: top;
}
.results-table tr:hover td { background: var(--color-background); }
.cell-num { width: 40px; text-align: center; color: var(--color-muted); }
.cell-date { white-space: nowrap; font-size: 12px; }
.cell-case { max-width: 180px; }
.cell-text { max-width: 250px; font-size: 12px; line-height: 1.6; }
.case-link { color: var(--color-accent-alt); text-decoration: none; font-weight: 500; }
.case-link:hover { text-decoration: underline; }
.read-more { color: var(--color-accent-alt); font-weight: 500; margin-left: 4px; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  font-size: 13px;
}
.pagination button {
  padding: 6px 16px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  font-size: 13px;
}
.pagination button:disabled { opacity: 0.4; cursor: default; }

/* Download */
.download-row {
  margin-top: 1rem;
  text-align: center;
}
.btn-download {
  padding: 10px 28px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-default);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-download:hover { box-shadow: var(--shadow-md); }

.status-msg { text-align: center; padding: 2rem; color: var(--color-muted); }

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.dialog-box {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lifted);
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
.dialog-header h3 { margin: 0; font-size: 1rem; font-weight: 700; }
.dialog-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-muted); }
.dialog-body { padding: 1.5rem; }
.dialog-body h4 { font-size: 12px; font-weight: 600; color: var(--color-muted); letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 0.75rem 0; }
.dialog-text { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
</style>
