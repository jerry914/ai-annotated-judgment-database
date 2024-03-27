<template>
  <footer class="footer">
    <div class="container">
      <span>聯絡我們：aifr.general@gmail.com</span>
      <span>©copyright Artificial Intelligence for Fundamental Research (AIFR) Group</span>
      <div class="icon-container">
        <img src="@/assets/logo_nthu.png" width="200" height="40" class="d-inline-block align-top" style="margin: 0 5px" alt="" loading="lazy" />
        <img src="@/assets/icon.png" width="80" height="45" class="d-inline-block align-top" style="margin: 0 5px" alt="" loading="lazy" />
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  name: 'my-footer',
  data() {
    return {
      backend: [],
      isLoading: false,
      errorPrompt: false,
      errorCode: '',
    };
  },
  props: {
  },
  methods: {

  },
};
</script>
<style scoped>
.footer {
  margin-top: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 10px;
  background-color: #f5f5f5;
  z-index: 1000; 
}

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.container > span, .container > div {
  margin: 5px 20px;
  vertical-align: middle;
  /* max-width: 0px; */
}

.d-inline-block {
  display: inline-block;
}

.align-top {
  vertical-align: top;
}
.icon-container {
  display: flex;
  justify-content: space-around;
}
</style>