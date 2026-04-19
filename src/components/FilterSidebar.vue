<template>
  <aside class="filter-sidebar">
    <div class="filter-header">
      <h2 class="filter-title">篩選條件</h2>
      <div class="filter-actions">
        <button class="btn-submit" @click="$emit('submit')">送出篩選</button>
        <button class="btn-reset" @click="$emit('reset')">重置</button>
      </div>
    </div>

    <!-- 案件資訊 -->
    <div class="filter-group">
      <h3 class="group-label">案件資訊</h3>

      <div class="filter-item">
        <label class="item-label">案件分類</label>
        <div class="chip-group">
          <button
            v-for="ct in caseCategories"
            :key="ct"
            class="chip"
            :class="{ 'chip--active': filters.caseCategory.includes(ct) }"
            @click="toggleFilter('caseCategory', ct)"
          >{{ ct }}</button>
        </div>
      </div>

      <div class="filter-item">
        <label class="item-label">終結年月（區間）</label>
        <div class="date-range">
          <select v-model="filters.dateFrom" class="filter-select">
            <option value="">最早</option>
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
          <span class="date-sep">～</span>
          <select v-model="filters.dateTo" class="filter-select">
            <option value="">最晚</option>
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <FilterAccordion label="法院別">
        <div class="chip-group">
          <button
            v-for="ct in courtTypes"
            :key="ct"
            class="chip"
            :class="{ 'chip--active': filters.courtType.includes(ct) }"
            @click="toggleFilter('courtType', ct)"
          >{{ ct }}</button>
        </div>
      </FilterAccordion>

      <FilterAccordion label="全案終結情形">
        <div class="chip-group">
          <button
            v-for="ct in closingTypes"
            :key="ct"
            class="chip"
            :class="{ 'chip--active': filters.closingType.includes(ct) }"
            @click="toggleFilter('closingType', ct)"
          >{{ ct }}</button>
        </div>
      </FilterAccordion>
    </div>

    <!-- 被告資訊 -->
    <div class="filter-group">
      <h3 class="group-label">被告資訊</h3>
      <FilterAccordion v-for="item in defendantFilters" :key="item.key" :label="item.label">
        <div class="chip-group">
          <button
            v-for="opt in item.options"
            :key="opt"
            class="chip"
            :class="{ 'chip--active': (filters[item.key] || []).includes(opt) }"
            @click="toggleFilter(item.key, opt)"
          >{{ opt }}</button>
        </div>
      </FilterAccordion>
    </div>

    <!-- 罪刑資訊 -->
    <div class="filter-group">
      <h3 class="group-label">罪刑資訊</h3>
      <FilterAccordion v-for="item in crimeFilters" :key="item.key" :label="item.label">
        <div class="chip-group">
          <button
            v-for="opt in item.options"
            :key="opt"
            class="chip"
            :class="{ 'chip--active': (filters[item.key] || []).includes(opt) }"
            @click="toggleFilter(item.key, opt)"
          >{{ opt }}</button>
        </div>
      </FilterAccordion>
    </div>
  </aside>
</template>

<script>
import FilterAccordion from './FilterAccordion.vue';

export default {
  name: 'FilterSidebar',
  components: { FilterAccordion },
  props: {
    modelValue: { type: Object, default: () => ({}) },
    aggregations: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue', 'submit', 'reset'],
  data() {
    return {
      yearOptions: Array.from({ length: 15 }, (_, i) => 107 + i),
    }
  },
  computed: {
    caseCategories() { return this.bucketsToKeys('by_case_type'); },
    courtTypes() { return this.bucketsToKeys('by_court_type'); },
    closingTypes() { return this.bucketsToKeys('by_end_type'); },
    defendantFilters() {
      return [
        { key: 'defense', label: '辯護及代理', options: this.bucketsToKeys('by_defense') },
        { key: 'procedure', label: '裁判程序', options: this.bucketsToKeys('by_procedure') },
        { key: 'probation', label: '宣告緩刑', options: this.bucketsToKeys('by_probation') },
        { key: 'recidivism', label: '累犯', options: this.bucketsToKeys('by_recidivism') },
      ];
    },
    crimeFilters() {
      return [
        { key: 'crimeArticle', label: '定罪法條', options: this.bucketsToKeys('by_conv_law') },
        { key: 'verdictResult', label: '罪名裁判結果', options: this.bucketsToKeys('by_verdict_result') },
      ];
    },
    filters: {
      get() {
        return {
          caseCategory: [],
          dateFrom: '',
          dateTo: '',
          courtType: [],
          closingType: [],
          defense: [],
          procedure: [],
          probation: [],
          recidivism: [],
          crimeArticle: [],
          aggravation: [],
          mitigation: [],
          ...this.modelValue,
        };
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
  },
  methods: {
    bucketsToKeys(aggName) {
      const buckets = this.aggregations?.[aggName]?.buckets;
      return buckets ? buckets.map(b => b.key) : [];
    },
    toggleFilter(key, value) {
      const arr = [...(this.filters[key] || [])];
      const idx = arr.indexOf(value);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      this.filters = { ...this.filters, [key]: arr };
    },
  },
}
</script>

<style scoped>
.filter-sidebar {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-soft);
  font-size: 13px;
  overflow-y: auto;
  max-height: calc(100vh - 80px);
  position: sticky;
  top: 56px;
}
.filter-header {
  margin-bottom: 1.25rem;
}
.filter-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
}
.filter-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-submit {
  flex: 1;
  padding: 8px 0;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-submit:hover { box-shadow: var(--shadow-md); }
.btn-reset {
  padding: 8px 16px;
  background: var(--color-background);
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
}

.filter-group {
  margin-bottom: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.group-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
}
.filter-item {
  margin-bottom: 0.75rem;
}
.item-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-muted);
  margin-bottom: 0.4rem;
}
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.chip {
  padding: 4px 10px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  color: var(--color-primary);
  transition: all var(--duration-fade) var(--ease-editorial);
}
.chip:hover {
  background: var(--color-background);
}
.chip--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.date-sep { color: var(--color-muted); }
.filter-select {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13px;
}
</style>
