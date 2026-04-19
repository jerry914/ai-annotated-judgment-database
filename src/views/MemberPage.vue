<template>
  <div class="page-container">
    <h2 class="page-title">開發團隊</h2>

    <section class="team-section">
      <h3 class="section-title">資訊技術與資料處理</h3>
      <ul class="team-list">
        <li>黃千翔 (清華大學跨院國際博士班學位學程)</li>
        <li>遲佑成 (清華大學跨院國際博士班學位學程)</li>
        <li>林雲貂 (清華大學跨院國際博士班學位學程)</li>
      </ul>
    </section>

    <section class="team-section">
      <h3 class="section-title">網站設計</h3>
      <ul class="team-list">
        <li>何捷睿 (清華大學服務科學研究所)</li>
      </ul>
    </section>

    <section class="team-section">
      <h3 class="section-title">指導教授</h3>
      <ul class="team-list">
        <li>連孟琦教授 (國立清華大學科技法律研究所)</li>
        <li>王道維教授 (國立清華大學物理系/人文社會AI應用與發展研究中心/學務處諮商中心)</li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
.page-container { max-width: 900px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }
.team-section { margin-bottom: var(--spacing-block); }
.section-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  color: var(--color-primary);
}
.team-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.team-list li {
  font-size: 1rem;
  line-height: 1.8;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}
.team-list li:last-child { border-bottom: none; }
</style>
