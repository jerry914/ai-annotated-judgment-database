<template>
  <div class="main-container">
    <div class="jump-bar" :style="backgroundStyle"></div>
    <nav class="nav-bar">
      <ul class="nav-menu">
        <li v-for="tab in tabs" :key="tab.path" class="nav-tab" :class="{ active: isActive(tab.path) }">
          <router-link :to="tab.path">{{ tab.label }}</router-link>
        </li>
      </ul>
    </nav>

    <router-view/>
  </div>
  <my-footer></my-footer>
</template>

<script>
import myFooter from './components/footer';
export default {
  components: { myFooter },
  data() {
    return {
      tabs: [
        { path: '/', label: '首頁' },
        { path: '/stats', label: '判決資料統計' },
        { path: '/fact-search', label: '事實檢索' },
        { path: '/opinion-search', label: '見解檢索' },
        { path: '/judgment', label: '裁判書筆記' },
        { path: '/discussion', label: 'AI助手' },
        { path: '/search', label: '檢索平台' },
        { path: '/about', label: '使用說明' },
        { path: '/members', label: '開發團隊' },
      ],
    }
  },
  methods: {
    isActive(path) {
      if (path === '/') return this.$route.path === '/';
      return this.$route.path.startsWith(path);
    }
  },
  computed: {
    backgroundStyle() {
      const imagePath = require('@/assets/banner.png');
      return { backgroundImage: `url(${imagePath})` };
    }
  },
}
</script>

<style>
body {
  background-color: var(--color-background) !important;
  margin: 0;
}
#app {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-primary);
}
.main-container {
  min-height: calc(100vh - 80px);
}
.jump-bar {
  height: 100px;
  background-color: #000;
  background-size: 960px 140px;
  background-position: 50% -20px;
  background-repeat: no-repeat;
}
@media (max-width: 920px) {
  .jump-bar {
    background-size: contain;
    background-position: center;
    height: 64px;
  }
}

/* ── Editorial Navigation ── */
.nav-bar {
  background-color: #000;
  display: flex;
  justify-content: center;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-menu {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  max-width: 960px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}
.nav-tab {
  flex-shrink: 0;
}
.nav-tab a {
  display: block;
  padding: 12px 18px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  transition: color var(--duration-fade) var(--ease-editorial);
  border-bottom: 2px solid transparent;
}
.nav-tab a:hover {
  color: rgba(255, 255, 255, 0.9);
}
.nav-tab.active a {
  color: #fff;
  border-bottom-color: #fff;
}
@media (max-width: 768px) {
  .nav-menu {
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .nav-tab a {
    padding: 10px 14px;
    font-size: 13px;
    white-space: nowrap;
  }
}

/* ── Page-level defaults ── */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}
.page-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}
</style>
