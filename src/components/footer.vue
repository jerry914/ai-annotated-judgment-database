<template>
  <footer class="footer">
    <div class="footer-inner">
      <span class="footer-contact">
        <div>聯絡我們：aifr.general@gmail.com</div>
        <div>意見回饋：<a href="https://shorturl.at/W9rDw" target="_blank">https://shorturl.at/W9rDw</a></div>
      </span>
      <span class="footer-copy">©copyright Artificial Intelligence for Fundamental Research (AIFR) Group</span>
      <div class="footer-logos">
        <img src="@/assets/logo_nthu.png" width="200" height="40" alt="" loading="lazy" />
        <img src="@/assets/icon.png" width="80" height="45" alt="" loading="lazy" />
      </div>
    </div>
  </footer>
</template>
<script>
export default { name: 'my-footer' }
</script>
<style scoped>
.footer {
  margin-top: var(--spacing-section);
  width: 100%;
  padding: 1.5rem 2rem;
  background: var(--color-surface);
  border-top: 1px solid rgba(0,0,0,0.06);
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.footer-contact {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--color-muted);
}
.footer-contact a {
  color: var(--color-accent-alt);
  text-decoration: none;
}
.footer-contact a:hover { text-decoration: underline; }
.footer-copy {
  font-size: 0.8rem;
  color: var(--color-muted);
  max-width: 550px;
}
.footer-logos {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
@media (max-width: 768px) {
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
