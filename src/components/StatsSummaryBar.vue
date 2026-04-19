<template>
  <div class="stats-bar">
    <div class="stat-card" v-for="stat in stats" :key="stat.label">
      <span class="stat-label">{{ stat.label }}</span>
      <span class="stat-value">{{ stat.value?.toLocaleString() ?? '—' }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsSummaryBar',
  props: {
    stats: {
      type: Array,
      default: () => [
        { label: '判決（篇數）', value: null },
        { label: '被告（人數）', value: null },
        { label: '犯罪數（筆數）', value: null },
        { label: '犯罪法條總數（條數）', value: null },
      ],
    },
  },
}
</script>

<style scoped>
.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-default);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.stat-label {
  font-size: 12px;
  color: var(--color-muted);
  font-weight: 500;
}
.stat-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}
</style>
