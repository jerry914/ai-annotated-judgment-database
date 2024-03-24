<template>
  <div class="main-container">
    <div class="jump-bar" :style="backgroundStyle"></div>
    <router-view/>
  </div>
  <my-footer></my-footer>
  <!-- <div class="mt-2 text-center" style="z-index:-1;">©copyright Artificial Intelligence for Fundamental Research (AIFR) Group</div> -->
</template>

<script>
import myFooter from './components/footer';
export default {
  components: {
    myFooter
  },
  data() {
    return {
      page_name: "搜尋頁面"
    }
  },
  computed: {
    backgroundStyle() {
      // const imagePath = require('@/assets/裁判觀點檢索平台.png');
      // const imagePath = require('@/assets/裁判觀點檢索平台2.png');
      const imagePath = require('@/assets/裁判觀點檢索平台2黑白.png');
      return {
        backgroundImage: `url(${imagePath})`
      };
    }
  }
}
</script>
<style>
body {
  background-color: #ffffff !important;
}
#app {
  font-family: "Noto Sans TC", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #0b0b0b;
}

nav {
  margin: 25px;
  padding: 10px;
  cursor: default;
  background-color: #ffcd29;
  border: 1px #cca421 solid;
  border-radius: 8px;
}

nav a {
  font-weight: bold;
}
.page-container {
  margin: 20px 0 40px 0;
}
.back-btn {
  float: left;
  border: #b6a3cc 1px solid;
  background-color: #e4ccff;
  padding: 10px 20px;
  transform: translate(-13px, -11px);
  border-radius: 8px;
}
.back-btn a {
  text-decoration: none !important;
  color: #000;
  font-weight: 400 !important;
}
.main-container {
  min-height: calc( 90vh - 90px );
}
.jump-bar {
  width: 100vw;
  height: 120px;
  background-color: #000;
  background-size: 810px 180px;
  background-position: 50% -20px;
  background-repeat: no-repeat;
}

@media (max-width: 920px) {
  .jump-bar {
    background-size: contain;
    background-position: center;
    height: 80px;
  }
}
</style>
