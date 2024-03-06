<template>
  <div class="main-container">
    <nav class="container md-6">
      <div class="text-center">
        <div v-if="$route.path!='/'" class="back-btn">
          <router-link to="/">回搜尋頁</router-link>
        </div>
        <div class="col">
          <strong>裁判書資訊結構化（涵攝及見解）資料庫 － {{ page_name }}</strong>
        </div>
      </div>
    </nav>
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
  }
}
</script>
<style>
body {
  background-color: #fffcf1 !important;
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
  min-height: calc( 100vh - 120px );
}
</style>
