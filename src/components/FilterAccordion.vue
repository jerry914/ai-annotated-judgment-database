<template>
  <div class="accordion-item">
    <button class="accordion-trigger" @click="open = !open">
      <span>▸ {{ label }}</span>
      <span class="accordion-icon">{{ open ? '−' : '+' }}</span>
    </button>
    <div v-show="open" class="accordion-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterAccordion',
  props: {
    label: { type: String, required: true },
  },
  data() {
    return { open: false }
  },
}
</script>

<style scoped>
.accordion-item {
  margin-bottom: 0.25rem;
}
.accordion-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 6px 0;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
}
.accordion-trigger:hover {
  color: var(--color-accent-alt);
}
.accordion-icon {
  font-size: 14px;
  color: var(--color-muted);
}
.accordion-content {
  padding: 0.5rem 0 0.5rem 0.5rem;
}
</style>
