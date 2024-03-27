<template>
<div class="container mt-4">
    <div class="team-section">
    <h2 class="page-title">開發團隊</h2>
    <h3 class="intro-title">資訊技術與資料處理</h3>
    <ul class="team-list">
        <li>遲佑成 (清華大學跨院國際博士班學位學程)</li>
        <li>黃千翔 (清華大學跨院國際博士班學位學程)</li>
        <li>林雲貂 (清華大學跨院國際博士班學位學程)</li>
    </ul>
    </div>

    <div class="team-section">
    <h3 class="intro-title">網站設計</h3>
    <ul class="team-list">
        <li>何捷睿 (清華大學服務科學研究所)</li>
    </ul>
    </div>

    <div class="team-section">
    <h3 class="intro-title">指導教授</h3>
    <ul class="team-list">
        <li>連孟琦教授 (國立清華大學科技法律研究所)</li>
        <li>王道維教授 (國立清華大學物理系/人文社會AI應用與發展研究中心/學務處諮商中心)</li>
    </ul>
    </div>
    <div style="height: 50px;"></div>
</div>

</template>

<script>
export default {
  data() {
    return {
    }
  },
  computed: {
   
  }  
}
</script>

<style scoped>
.team-section {
    margin: 60px 40px 40px 40px;
}
.team-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
}
.team-list {
    list-style: none;
    padding: 0;
}
.team-list li {
    margin-bottom: 5px;
}
.team-role {
    font-weight: bold;
    margin-top: 15px;
}
</style>