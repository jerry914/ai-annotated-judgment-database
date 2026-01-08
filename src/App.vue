<template>
  <div class="main-container">
    <div class="notification-bar">
      本系統AI助手的功能正在進行更新與硬體升級，暫時無法運作，還請見諒。
    </div>
    <div class="jump-bar" :style="backgroundStyle"></div>
    <div class="menu-bar">
      <ul class="menu">
        <li class="tab" :class="$route.path=='/'?'active tab':''"><router-link to="/">首頁與AI助手</router-link></li>
        <li class="tab" :class="$route.path=='/search'?'active':''"><router-link to="/search">檢索平台</router-link></li>
        <li class="tab" :class="$route.path=='/about'?'active':''"><router-link to="/about">
          <template v-if="windowWidth < 400">
            使用說明
          </template>
          <template v-else>使用說明與技術簡介</template>
        </router-link></li>
        <li class="tab" :class="$route.path=='/members'?'active':''"><router-link to="/members">開發團隊</router-link></li>
      </ul>
    </div>

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
      page_name: "搜尋頁面",
      windowWidth: window.innerWidth
    }
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
  },
  beforeUnmount() { 
    window.removeEventListener('resize', this.onResize); 
  },
  computed: {
    backgroundStyle() {
      // const imagePath = require('@/assets/裁判觀點檢索平台.png');
      // const imagePath = require('@/assets/裁判觀點檢索平台2.png');
      const imagePath = require('@/assets/banner.png');
      return {
        backgroundImage: `url(${imagePath})`
      };
    }
  },
  methods: {
    onResize() {
      this.windowWidth = window.innerWidth
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
.page-title {
  text-align: center;
  margin: 30px;
}
.intro-title {
  font-size: 1.75rem;
  font-weight: 500;
  line-height: 2rem;
  margin: 40px 0 20px 0;
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
  min-height: calc( 100vh - 100px );
}
.notification-bar {
  background-color: #ffcdd9;
  border-bottom: 1px solid #ea688d;
  color: #9c0000;
  padding: 12px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;
}
.jump-bar {
  height: 120px;
  background-color: #000;
  background-size: 960px 140px;
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

.menu-bar {
  background-color: #e9eef7; /* Light blue background */
  display: flex;
  justify-content: center; /* Center menu items horizontally */
  padding: 10px 0; /* Padding on top and bottom */
}

.menu {
  list-style-type: none;
  display: flex;
  margin: 0;
  padding: 0;
  width: 580px;
}

.menu .tab {
  flex-grow: 1;
  text-align: center;
}

.menu .tab a {
  display: block;
  padding: 5px 20px;
  text-decoration: none;
  color: #333;
  background-color: #e9eef7;
  border-radius: 5px; /* Optional: rounded corners */
  transition: background-color 0.3s; /* Smooth transition for hover effect */
  text-decoration: none !important;
  width: fit-content;
}

.menu .tab a:hover {
  background-color: #d1d8e8; /* Lighter blue on hover */
}

.active a {
  background-color: #cad2e0 !important; /* Active tab color */
}

/* RWD: Stacking tabs for smaller screens */
@media (max-width: 768px) {
  .menu .tab {
    flex-basis: 100%; /* Each tab takes full width */
    margin-bottom: 5px; /* Add space between stacked tabs */
    width: 100%;
  }
  .menu .tab a {
    padding: 5px 10px;
    width: 100%;
  }
}

</style>
