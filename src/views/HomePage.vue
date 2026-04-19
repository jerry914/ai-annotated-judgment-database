<template>
  <div class="home-page">
    <section class="hero-section">
      <p class="hero-eyebrow">AI Annotated Judgment Database</p>
      <h1 class="hero-title">裁判觀點檢索平台</h1>
      <p class="hero-body">
        整合裁判書統計分析、事實與見解檢索、AI 語意搜尋，
        提供法律研究者全方位的判決書探索工具。
      </p>
    </section>

    <hr class="divider" />

    <section class="features-section">
      <div class="feature-grid">
        <router-link
          v-for="feature in features"
          :key="feature.path"
          :to="feature.path"
          class="feature-card"
          :class="{ 'feature-card--dark': feature.dark }"
        >
          <span class="feature-num">{{ feature.num }}</span>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-desc">{{ feature.desc }}</p>
          <span class="feature-cta">前往使用 →</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      features: [
        {
          num: '01',
          title: '刑事訴訟判決資料統計',
          desc: '233,818 筆地院刑事訴訟資料，支援 25 種篩選維度、4 類視覺化圖表（熱度圖、堆疊長條、小提琴、盒鬚圖），快速掌握量刑趨勢。',
          path: '/stats',
          dark: false,
        },
        {
          num: '02',
          title: '刑事事實檢索頁面',
          desc: '依案件分類、法院、日期篩選，結合當事人資訊、主文與事實關鍵字進階搜尋，支援全文預覽與資料下載。',
          path: '/fact-search',
          dark: true,
        },
        {
          num: '03',
          title: '刑事見解檢索頁面',
          desc: '搜尋法院見解與法律論述，依法條、案件類型篩選，點選可閱讀全文，支援見解資料批次下載。',
          path: '/opinion-search',
          dark: false,
        },
        {
          num: '04',
          title: '裁判書筆記軟體',
          desc: '瀏覽單篇裁判書全文，搭配案件終結資料與 AI 見解分類標籤，提供螢光筆標註與筆記功能，支援 Word 下載。',
          path: '/judgment',
          dark: true,
        },
        {
          num: '05',
          title: 'AI 裁判書助手',
          desc: '透過 AI 語意理解，根據案件情狀描述搜尋類似事實，或輸入法律見解進行法院觀點討論與延伸。',
          path: '/discussion',
          dark: false,
        },
      ],
    }
  },
}
</script>

<style scoped>
.home-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
}

/* ── Hero ── */
.hero-section {
  padding: 2rem 0 3rem;
}
.hero-eyebrow {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: 1rem;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.15;
  color: var(--color-primary);
  margin: 0 0 1.5rem 0;
}
.hero-body {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-primary);
  max-width: 60ch;
  opacity: 0.8;
}

/* ── Divider ── */
.divider {
  border: none;
  border-top: 1px solid var(--color-muted);
  opacity: 0.25;
  margin: 0 0 3rem 0;
}

/* ── Feature Grid ── */
.features-section {
  animation: fadeIn var(--duration-slide) var(--ease-editorial) both;
  animation-delay: 100ms;
}
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}
.feature-card {
  display: block;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-decoration: none;
  color: var(--color-primary);
  box-shadow: var(--shadow-soft);
  transition: box-shadow var(--duration-fade) var(--ease-editorial),
              transform var(--duration-fade) var(--ease-editorial);
}
.feature-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  text-decoration: none;
  color: var(--color-primary);
}
.feature-card--dark {
  background: var(--color-primary);
  color: #fff;
}
.feature-card--dark:hover {
  color: #fff;
}
.feature-card--dark .feature-num {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}
.feature-card--dark .feature-desc {
  color: rgba(255, 255, 255, 0.7);
}
.feature-card--dark .feature-cta {
  color: rgba(255, 255, 255, 0.9);
}

.feature-num {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  background: var(--color-background);
  color: var(--color-muted);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
}
.feature-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 0.75rem 0;
}
.feature-desc {
  font-size: 0.9rem;
  line-height: 1.7;
  opacity: 0.7;
  margin: 0 0 1.25rem 0;
}
.feature-cta {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.03em;
}
</style>
