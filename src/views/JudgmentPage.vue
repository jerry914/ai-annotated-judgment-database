<template>
  <div class="judgment-page">
    <!-- Search Bar -->
    <div class="search-bar">
      <label class="search-label">搜尋判決書</label>
      <div class="search-input-row">
        <input v-model="searchQuery" type="text" class="search-input"
          placeholder="HLDM,107,訴,286,20200122,2"
          @keyup.enter="doSearch" />
        <button class="search-btn" @click="doSearch">搜尋</button>
      </div>
    </div>

    <div v-if="loading" class="status-msg">載入中...</div>
    <div v-if="error" class="status-msg status-error">{{ error }}</div>
    <div v-if="!jid && !loading && !error && !judgment" class="empty-state">
      <p>請從上方搜尋列輸入案號，或從其他頁面點選案號連結進入。</p>
    </div>

    <!-- Floating Toolbar -->
    <div v-if="selToolbar.show" class="sel-toolbar"
      :style="{ top: selToolbar.y + 'px', left: selToolbar.x + 'px' }">
      <button class="sel-toolbar-btn" @mousedown.prevent="confirmHighlight">+ 新增標註</button>
    </div>

    <!-- Two-Column Layout: Left Info | Center Doc + Margin Notes -->
    <div v-if="judgment" class="judgment-layout">
      <!-- Left: Case Info + Stats -->
      <aside class="case-info-panel">
        <h2 class="panel-title">案件相關資訊</h2>
        <div class="info-section">
          <h3 class="info-label">司法院裁判書網址</h3>
          <a :href="judgment.jud_url" target="_blank" class="info-link">{{ judgment.jud_url }}</a>
        </div>
        <div class="info-section" v-if="judgment.case_type">
          <h3 class="info-label">案由</h3><p class="info-value">{{ judgment.case_type }}</p>
        </div>
        <div class="info-section" v-if="judgment.court_type">
          <h3 class="info-label">法院</h3><p class="info-value">{{ judgment.court_type }}</p>
        </div>
        <div class="info-section" v-if="judgment.jud_date">
          <h3 class="info-label">裁判日期</h3><p class="info-value">{{ formatDate(judgment.jud_date) }}</p>
        </div>
        <div class="info-section" v-if="judgment.syllabus">
          <h3 class="info-label">主文</h3><p class="info-value info-value--small">{{ judgment.syllabus }}</p>
        </div>
        <div class="info-section" v-if="judgment.basic_info">
          <h3 class="info-label">當事人</h3><p class="info-value info-value--small">{{ judgment.basic_info }}</p>
        </div>

        <!-- Stats -->
        <div v-if="stats.length" class="info-section info-section--stats">
          <h3 class="info-label info-label--accent">案件終結資料</h3>
          <div v-for="(s, si) in stats" :key="si" class="stats-record" :class="{ 'stats-record--border': si > 0 }">
            <div v-if="stats.length > 1" class="stats-record-label">被告{{ s.被告序號 || si + 1 }} / 罪序{{ s.被告內罪序號 || 1 }}</div>
            <div v-if="s.案件分類" class="stat-row"><span class="stat-key">案件分類</span><span class="stat-val">{{ s.案件分類 }}</span></div>
            <div v-if="formatLaw(s)" class="stat-row"><span class="stat-key">定罪法條</span><span class="stat-val">{{ formatLaw(s) }}</span></div>
            <div v-if="s.c0_案由" class="stat-row"><span class="stat-key">案由</span><span class="stat-val">{{ s.c0_案由 }}</span></div>
            <div v-if="s.c11_罪名裁判結果" class="stat-row"><span class="stat-key">裁判結果</span><span class="stat-val">{{ s.c11_罪名裁判結果 }}</span></div>
            <div v-if="s.c11_宣告有期徒刑" class="stat-row"><span class="stat-key">有期徒刑</span><span class="stat-val">{{ formatPrison(s.c11_宣告有期徒刑) }}</span></div>
            <div v-if="s.c11_拘役日數 && s.c11_拘役日數 !== '0'" class="stat-row"><span class="stat-key">拘役日數</span><span class="stat-val">{{ s.c11_拘役日數 }}日</span></div>
            <div v-if="s.c11_得易科 && s.c11_得易科 !== '0'" class="stat-row"><span class="stat-key">得易科</span><span class="stat-val">是</span></div>
            <div v-if="s.c11_罰金金額 && s.c11_罰金金額 !== '0'" class="stat-row"><span class="stat-key">罰金金額</span><span class="stat-val">{{ s.c11_罰金金額 }}</span></div>
            <div v-if="s.c1_沒收客體" class="stat-row"><span class="stat-key">沒收客體</span><span class="stat-val">{{ s.c1_沒收客體 }}</span></div>
            <div v-if="s.c1_沒收金額 && s.c1_沒收金額 !== '0'" class="stat-row"><span class="stat-key">沒收金額</span><span class="stat-val">{{ s.c1_沒收金額 }}</span></div>
            <div v-if="s.c1_宣告緩刑 === '1'" class="stat-row"><span class="stat-key">宣告緩刑</span><span class="stat-val">是</span></div>
            <div v-if="s.c1_累犯 === '1'" class="stat-row"><span class="stat-key">累犯</span><span class="stat-val">是</span></div>
          </div>
        </div>
        <div v-if="!stats.length && judgment" class="info-section info-section--stats">
          <h3 class="info-label info-label--accent">案件終結資料</h3>
          <p class="info-value info-value--small" style="color:var(--color-muted)">尚無資料</p>
        </div>

        <div style="margin-top:1rem">
          <button class="download-btn" @click="downloadWord" style="width:100%">下載 Word</button>
        </div>
      </aside>

      <!-- Center: Document + Margin Notes -->
      <div class="doc-area" ref="docArea">
        <!-- Document -->
        <main class="judgment-text-panel" ref="docPanel" @mouseup="onTextSelect">
          <h2 class="doc-title">{{ judgment.case_num }}</h2>

          <!-- Full Text (from judicial website) -->
          <div v-if="fulltext" class="doc-body doc-body--pre" v-html="renderText(fulltext)"></div>

          <!-- Fallback: structured sections -->
          <template v-if="!fulltext">
            <div v-if="judgment.basic_info" class="doc-body doc-body--pre doc-section">{{ judgment.basic_info }}</div>
            <div v-if="judgment.syllabus" class="doc-section">
              <h3 class="doc-section-title">主文</h3>
              <div class="doc-body" v-html="renderText(judgment.syllabus)"></div>
            </div>
            <div v-if="judgment.fact_text" class="doc-section">
              <h3 class="doc-section-title">事實及理由</h3>
              <div class="doc-body doc-body--pre" v-html="renderText(judgment.fact_text)"></div>
            </div>
          </template>

          <!-- AI Opinions (always shown) -->
          <div v-if="judgment.opinions && judgment.opinions.length" class="doc-section">
            <h3 class="doc-section-title">法院見解 (AI 標註)</h3>
            <div class="opinion-flow">
              <div v-for="(op, idx) in judgment.opinions" :key="'op-'+idx"
                class="annotated-paragraph has-annotation">
                <div v-if="op.level1_label" class="annotation-bar">
                  <span class="tag tag--level1" :class="tagColorClass(op.level1_label)">{{ op.level1_label }}</span>
                  <span v-for="(val, key) in filteredLevel2(op.level2_labels)" :key="key" class="tag tag--level2">{{ formatLevel2Key(key) }}</span>
                </div>
                <p class="opinion-sentence" v-html="renderText(op.sentence)"></p>
              </div>
            </div>
          </div>
        </main>

        <!-- Margin Notes (Google Docs style) -->
        <div class="margin-col">
          <div v-if="!highlights.length" class="margin-hint">
            <div class="margin-hint-icon">&#9998;</div>
            <p class="margin-hint-text">選取判決書內文即可新增標註筆記，標註與筆記會顯示在此欄位。</p>
          </div>
          <div v-for="h in highlights" :key="h.id"
            class="margin-note" :class="{ 'margin-note--active': activeHlId === h.id }"
            :style="{ top: (h.topPx || 0) + 'px' }"
            @click="scrollToMark(h)">
            <div class="mn-connector" :style="{ top: '12px' }"></div>
            <div class="mn-quote">"{{ truncate(h.text, 35) }}"</div>
            <textarea v-model="h.comment" class="mn-input" placeholder="輸入筆記..."
              rows="2" @focus="activeHlId = h.id" @click.stop></textarea>
            <div class="mn-footer">
              <span class="mn-time">{{ fmtTime(h.ts) }}</span>
              <button class="mn-del" @click.stop="removeHl(h.id)">刪除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'JudgmentPage',
  props: { jid: { type: String, default: '' } },
  data() {
    return {
      searchQuery: '', judgment: null, stats: [], fulltext: '',
      loading: false, error: '',
      highlights: [], nextHlId: 1, activeHlId: null,
      pendingSel: null,
      selToolbar: { show: false, x: 0, y: 0 },
    }
  },
  watch: {
    jid: { immediate: true, handler(v) { if (v) { this.searchQuery = v; this.load(v); } } },
  },
  mounted() { document.addEventListener('mousedown', this.onGlobalDown); },
  beforeUnmount() { document.removeEventListener('mousedown', this.onGlobalDown); },
  methods: {
    async load(jid) {
      this.loading = true; this.error = ''; this.judgment = null;
      this.stats = []; this.fulltext = ''; this.highlights = []; this.activeHlId = null;
      this.selToolbar.show = false;
      try {
        const [jr, sr, fr] = await Promise.all([
          axios.get(`/api/judgment/${encodeURIComponent(jid)}`),
          axios.get(`/api/judgment/${encodeURIComponent(jid)}/stats`).catch(() => ({ data: { stats: [] } })),
          axios.get(`/api/judgment/${encodeURIComponent(jid)}/fulltext`).catch(() => ({ data: { fulltext: '' } })),
        ]);
        this.judgment = jr.data;
        this.stats = sr.data.stats || [];
        this.fulltext = fr.data.fulltext || '';
      } catch (e) {
        this.error = e.response?.status === 404 ? `找不到判決書：${jid}` : '載入判決書時發生錯誤。';
      } finally { this.loading = false; }
    },
    doSearch() {
      const q = this.searchQuery.trim(); if (!q) return;
      if (this.$route.params.jid !== q) this.$router.push({ name: 'judgment', params: { jid: q } });
      else this.load(q);
    },

    // Formatting
    formatDate(d) { const s = String(d); return s.length === 8 ? `${s.slice(0,4)}/${s.slice(4,6)}/${s.slice(6,8)}` : s; },
    formatLaw(s) {
      const p = [s.c11_刑事法令, s.c11_條 ? `\u00A7${s.c11_條}` : '', s.c11_項 ? `第${s.c11_項}項` : ''].filter(Boolean);
      return p.join('') || s.定罪法條 || '';
    },
    formatPrison(v) {
      const s = String(v).padStart(4,'0'), y = parseInt(s.slice(0,2)), m = parseInt(s.slice(2,4));
      const p = []; if (y) p.push(`${y}年`); if (m) p.push(`${m}月`); return p.join('') || v;
    },
    filteredLevel2(l) { if (!l) return {}; const o = {}; for (const [k,v] of Object.entries(l)) if (v==='Yes') o[k]=v; return o; },
    formatLevel2Key(k) { return k.replace(/^level2_[A-Z]\d+_/, ''); },
    fmtTime(ts) { const d = new Date(ts); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; },
    truncate(t, n) { return t.length > n ? t.slice(0, n) + '...' : t; },
    tagColorClass(l) { return l.includes('實體') ? 'tag--sub' : l.includes('程序') ? 'tag--proc' : ''; },
    escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },

    // Render text with highlight marks
    renderText(raw) {
      let t = this.escapeHtml(raw);
      for (const h of this.highlights) {
        const e = this.escapeHtml(h.text);
        if (t.includes(e)) t = t.replace(e, `<mark class="hl" data-hid="${h.id}">${e}</mark>`);
      }
      return t;
    },

    // Selection workflow
    onTextSelect() {
      const sel = window.getSelection();
      const text = sel.toString().trim();
      if (text && text.length > 2) {
        this.pendingSel = text;
        const r = sel.getRangeAt(0).getBoundingClientRect();
        this.selToolbar = { show: true, y: r.top + window.scrollY - 40, x: r.left + window.scrollX + r.width / 2 - 50 };
      }
    },
    onGlobalDown(e) {
      if (e.target.closest('.sel-toolbar') || e.target.closest('.margin-note')) return;
      this.selToolbar.show = false;
    },
    confirmHighlight() {
      if (!this.pendingSel || this.highlights.some(h => h.text === this.pendingSel)) {
        this.selToolbar.show = false; return;
      }
      const h = { id: this.nextHlId++, text: this.pendingSel, comment: '', ts: Date.now(), topPx: 0 };
      this.highlights.push(h);
      this.activeHlId = h.id;
      this.selToolbar.show = false;
      this.pendingSel = null;
      window.getSelection().removeAllRanges();
      this.$nextTick(() => this.positionNotes());
    },
    removeHl(id) {
      this.highlights = this.highlights.filter(h => h.id !== id);
      if (this.activeHlId === id) this.activeHlId = null;
      this.$nextTick(() => this.positionNotes());
    },
    scrollToMark(h) {
      this.activeHlId = h.id;
      const m = this.$el.querySelector(`mark[data-hid="${h.id}"]`);
      if (m) { m.scrollIntoView({ behavior: 'smooth', block: 'center' }); m.classList.add('hl-pulse'); setTimeout(() => m.classList.remove('hl-pulse'), 1200); }
    },
    positionNotes() {
      const panel = this.$refs.docPanel;
      if (!panel) return;
      const panelRect = panel.getBoundingClientRect();
      let lastBottom = 0;
      this.highlights.forEach(h => {
        const mark = panel.querySelector(`mark[data-hid="${h.id}"]`);
        if (mark) {
          const mr = mark.getBoundingClientRect();
          let top = mr.top - panelRect.top;
          if (top < lastBottom + 8) top = lastBottom + 8;
          h.topPx = top;
          lastBottom = top + 100;
        }
      });
    },

    // Download
    downloadWord() {
      const j = this.judgment; const title = j ? j.case_num : '裁判書';
      const lines = [title, ''];
      if (this.stats.length) {
        lines.push('== 案件終結資料 ==');
        this.stats.forEach((s, i) => {
          if (this.stats.length > 1) lines.push(`--- 罪序${i+1} ---`);
          if (this.formatLaw(s)) lines.push(`定罪法條：${this.formatLaw(s)}`);
          if (s.c11_罪名裁判結果) lines.push(`裁判結果：${s.c11_罪名裁判結果}`);
        });
        lines.push('');
      }
      lines.push('== 判決書全文 ==', this.fulltext || j?.fact_text || '');
      if (j?.opinions?.length) {
        lines.push('', '== 法院見解 (AI 標註) ==');
        j.opinions.forEach((op, i) => {
          const tags = [op.level1_label, ...Object.keys(op.level2_labels || {}).filter(k => op.level2_labels[k] === '1').map(k => k.replace('level2_', ''))].filter(Boolean).join('、');
          lines.push(`${i+1}. [${tags}]`);
          lines.push(`   ${op.sentence}`);
        });
      }
      if (this.highlights.length) {
        lines.push('', '== 標註與筆記 ==');
        this.highlights.forEach((h, i) => { lines.push(`${i+1}. 「${h.text}」`); if (h.comment) lines.push(`   筆記：${h.comment}`); });
      }
      const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a');
      a.href = url; a.download = `${title}.doc`; a.click(); URL.revokeObjectURL(url);
    },
  },
}
</script>

<style scoped>
.judgment-page { max-width: 1600px; margin: 0 auto; padding: 1.5rem; }

/* Search */
.search-bar { margin-bottom: 1.5rem; }
.search-label { display: block; font-size: 13px; font-weight: 500; color: var(--color-muted); margin-bottom: 0.5rem; }
.search-input-row { display: flex; gap: 0.5rem; }
.search-input { flex: 1; padding: 10px 16px; border: none; border-radius: var(--radius-default); background: var(--color-surface); box-shadow: var(--shadow-soft); font-size: 15px; }
.search-input:focus { outline: none; box-shadow: var(--shadow-md); }
.search-btn { padding: 10px 24px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-default); font-size: 14px; font-weight: 600; cursor: pointer; }
.status-msg { text-align: center; padding: 3rem; color: var(--color-muted); }
.status-error { color: var(--color-accent); }
.empty-state { text-align: center; padding: 4rem 2rem; color: var(--color-muted); }

/* Floating toolbar */
.sel-toolbar { position: absolute; z-index: 100; background: #222; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,.3); padding: 4px; }
.sel-toolbar::after { content:''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top-color: #222; }
.sel-toolbar-btn { background: none; border: none; color: #fff; font-size: 13px; font-weight: 600; padding: 6px 14px; cursor: pointer; white-space: nowrap; }

/* Layout: left info + doc area */
.judgment-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.25rem; align-items: start; }
@media (max-width: 1024px) { .judgment-layout { grid-template-columns: 1fr; } }

/* Left Panel */
.case-info-panel { background: var(--color-surface); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-soft); position: sticky; top: 60px; max-height: calc(100vh - 80px); overflow-y: auto; }
.panel-title { font-size: 1rem; font-weight: 700; margin: 0 0 1.25rem 0; color: var(--color-primary); }
.info-section { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(0,0,0,.06); }
.info-section:last-child { border-bottom: none; }
.info-label { font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase; color: var(--color-muted); margin: 0 0 .35rem; }
.info-label--accent { color: var(--color-accent-alt, #4338ca); font-size: 12px; }
.info-value { font-size: 14px; line-height: 1.6; margin: 0; word-break: break-all; }
.info-value--small { font-size: 13px; line-height: 1.7; }
.info-link { font-size: 13px; color: var(--color-accent-alt); word-break: break-all; text-decoration: none; }
.info-link:hover { text-decoration: underline; }
.download-btn { padding: 8px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }

/* Stats */
.info-section--stats { border-top: 2px solid rgba(0,0,0,.1); padding-top: 1rem; margin-top: .5rem; }
.stats-record { margin-bottom: .5rem; }
.stats-record--border { border-top: 1px dashed rgba(0,0,0,.12); padding-top: .5rem; margin-top: .5rem; }
.stats-record-label { font-size: 11px; font-weight: 600; color: var(--color-muted); margin-bottom: .25rem; }
.stat-row { display: flex; justify-content: space-between; align-items: baseline; padding: 2px 0; gap: .5rem; }
.stat-key { font-size: 12px; color: var(--color-muted); white-space: nowrap; }
.stat-val { font-size: 13px; font-weight: 500; text-align: right; word-break: break-all; }

/* Doc area: document + margin notes side by side */
.doc-area { position: relative; display: flex; align-items: flex-start; }
.judgment-text-panel { flex: 1; min-width: 0; background: var(--color-surface); border-radius: var(--radius-lg); padding: 2rem 2.5rem; box-shadow: var(--shadow-soft); min-height: 400px; margin-right: 260px; }
.margin-col { position: absolute; top: 0; right: 0; width: 240px; }
.margin-hint { padding: 1.25rem 1rem; background: var(--color-surface); border-radius: var(--radius-default); box-shadow: var(--shadow-soft); text-align: center; }
.margin-hint-icon { font-size: 1.5rem; margin-bottom: .5rem; opacity: .5; }
.margin-hint-text { font-size: 13px; line-height: 1.7; color: var(--color-muted); margin: 0; }

/* Document */
.doc-title { font-size: 1.2rem; font-weight: 700; text-align: center; margin: 0 0 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(0,0,0,.08); }
.doc-section { margin-bottom: 1.5rem; }
.doc-section-title { font-size: 14px; font-weight: 700; letter-spacing: .15em; margin: 0 0 .75rem; }
.doc-body { font-size: 15px; line-height: 1.85; cursor: text; user-select: text; }
.doc-body--pre { white-space: pre-wrap; }

/* AI annotations */
.opinion-flow { display: flex; flex-direction: column; gap: .75rem; }
.annotated-paragraph { padding: .75rem 1rem; border-radius: 0 6px 6px 0; }
.annotated-paragraph.has-annotation { border-left: 3px solid #6366f1; background: rgba(99,102,241,.04); }
.annotation-bar { display: flex; flex-wrap: wrap; gap: .3rem; margin-bottom: .4rem; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.tag--level1 { background: var(--color-primary); color: #fff; }
.tag--sub { background: #4338ca; color: #fff; }
.tag--proc { background: #0369a1; color: #fff; }
.tag--level2 { background: rgba(0,0,0,.07); }
.opinion-sentence { font-size: 14px; line-height: 1.8; margin: 0; cursor: text; user-select: text; }

/* Highlights */
:deep(.hl) { background: #fef08a; padding: 1px 2px; border-radius: 2px; cursor: pointer; }
:deep(.hl.hl-pulse) { animation: pulse 1.2s ease; }
@keyframes pulse { 0%,100% { background: #fef08a; } 30% { background: #fbbf24; } }

/* Margin notes (Google Docs style) */
.margin-note {
  position: absolute; width: 220px;
  background: #fffef5; border: 1px solid #e5e2d0; border-left: 3px solid #fbbf24;
  border-radius: 0 6px 6px 0; padding: 8px 10px; font-size: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08); cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.margin-note--active { border-left-color: #6366f1; box-shadow: 0 2px 8px rgba(99,102,241,.15); }
.mn-connector {
  position: absolute; left: -24px; width: 20px; height: 1px;
  background: #e5e2d0;
}
.mn-quote { font-size: 11px; color: #92400e; font-style: italic; margin-bottom: 6px; line-height: 1.4; }
.mn-input { width: 100%; border: 1px solid #e5e2d0; background: #fff; border-radius: 3px; padding: 4px 6px; font-size: 12px; font-family: var(--font-body); resize: none; box-sizing: border-box; }
.mn-input:focus { outline: none; border-color: #6366f1; }
.mn-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.mn-time { font-size: 10px; color: #999; }
.mn-del { background: none; border: none; font-size: 11px; color: #999; cursor: pointer; padding: 0; }
.mn-del:hover { color: #dc2626; }
</style>
