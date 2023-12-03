<template>
  <div class="container">
    <!-- First Row: Search Query and Statistical Results -->
    <div class="row">
      <div class="col-md-6">
        <div class="fw-bolder my-1 py-1">搜尋條件</div>
        <div class="d-flex flex-row">
          <div>裁判資訊：</div>
          <div class="px-2 pb-2" v-html="searchQuery.jud_info"></div>
        </div>
        <div class="d-flex flex-row">
          <div>基本資訊：</div>
          <div class="px-2 pb-2" v-html="searchQuery.basic_info"></div>
        </div>
        <div class="d-flex flex-row">
          <div>裁判內文：</div>
          <div class="px-2 pb-2" v-html="searchQuery.content"></div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="fw-bolder my-1 py-1">查詢結果</div>
        <div v-for="count in resultCount" :key="count.name">共計 <strong class="text-decoration-underline">{{ count.count }}</strong> {{ count.unit }}{{ count.name }}</div>
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-light-green">下載搜尋結果</button>
      </div>
    </div>

    <!-- Second Row: Filters -->
    <div class="row mt-1">
      <div class="col-12">
        <div class="fw-bolder my-1 py-1">顯示條件</div>
        <div>{{ searchItems.join(' ') }}</div>
      </div>
    </div>

    <!-- Third Row: Data Tables -->
    <div class="row mt-3 mb-5">
      <!-- 裁判內文 Table -->
      <div v-if="mode!='default'" class="col-md-6">
        <div class="fw-bolder mt-1 py-2 rounded-3 text-center custom-gray">涵攝/見解/心證</div>
        <div class="rounded-3 border" style="overflow: hidden;">
          <table class="table table-bordered custom-adjust-table">
            <thead>
              <tr class="text-center">
                <th colspan="3">{{ mode }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
                <td>{{ item.full_jud }}</td>
                <td>{{ item.sentence_kind }}</td>
                <td>{{ item.sentence }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- 裁判資訊 Table -->
      <div :class="mode=='default'?'col-md-5':'col-md-6'">
        <div class="fw-bolder mt-1 py-2 rounded-3 text-center custom-blue">裁判資訊</div>
        <div class="rounded-3 border" style="overflow: hidden;">
          <table class="table table-bordered custom-adjust-table">
            <thead>
              <tr class="text-center">
                <th>序號</th>
                <th>裁判字號(URL)</th>
                <th>案件別</th>
                <th>法院別</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
                <td class="text-center">{{ item.num }}</td>
                <td><a :href="item.jid_url">{{ item.jid }}</a></td>
                <td>{{ item.case_kind }}</td>
                <td>{{ item.court }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 基本資訊 Table -->
      <div v-if="mode=='default'" class="col-md-3">
        <div class="fw-bolder mt-1 py-2 rounded-3 text-center custom-gray">基本資訊</div>
        <div class="rounded-3 border" style="overflow: hidden;">
          <table class="table table-bordered custom-adjust-table">
            <thead>
              <tr class="text-center">
                <th>法官</th>
                <th>被告</th>
                <th>上訴人</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
                <td>{{ item.judger }}</td>
                <td>{{ item.defendant }}</td>
                <td>{{ item.appeal }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 裁判內文 Table -->
      <div v-if="mode=='default'" class="col-md-4">
        <div class="fw-bolder mt-1 py-2 rounded-3 text-center custom-gray">裁判內文</div>
        <div class="rounded-3 border" style="overflow: hidden;">
          <table class="table table-bordered custom-adjust-table">
            <thead>
              <tr class="text-center">
                <th>涵攝</th>
                <th>見解</th>
                <th>心證</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
                <td>{{ item.full_jud }}</td>
                <td>{{ item.sentence_kind }}</td>
                <td>{{ item.sentence }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import testSearchResults from '../../data/test_searchResults.json'

export default {
  data() {
    return {
      mode: 'default', // default, sentence_kind
      searchQuery: {
        jud_info: '',
        basic_info: '',
        content: ''
      },
      searchItems: [],
      searchConfig: {
        jud_info: [{range: '案件別', name:'case_kind'}, {range: '全文搜尋', name:'full_jud'}],
        basic_info: [{range: '法官', name:'judger'}, {range: '辯護人(律師)', name:'defentdent'}, {range: '被告', name:'sued'}],
        content: [{range: '涵攝', name:'sentence_type'}, {range: '見解', name:'sentence_type'}, {range: '心證', name:'sentence_type'}, {range: '', name:'sentence'}]
      },
      searchResults: [],
      nextPageUrl: '',
      resultCount: []
    };
  },
  created() {
    // Call the method to fetch data when component is created
    this.fetchData()
    this.initSearchQuery()
  },
  methods: {
    initSearchQuery() {
      const urlQueryParams = this.$route.query
      for (const [category, params] of Object.entries(this.searchConfig)) {
        this.searchQuery[category] = ''

        // Check each parameter in the category
        params.forEach(param => {
          // If the range matches a URL query parameter, add it to the searchQuery under the appropriate category and name
          if (urlQueryParams[param.name] !== undefined) {
            if (param.name == 'sentence') {
              this.mode = urlQueryParams['sentence_kind']
              this.searchItems.push(urlQueryParams['sentence_kind'])
              this.searchQuery[category] += (urlQueryParams['sentence_kind'] + ':' + urlQueryParams[param.name] + '<br>')
            }
            else {
              this.searchItems.push(param.range)
              this.searchQuery[category] += (param.range + ':' + urlQueryParams[param.name]) + '<br>'
            }
          }
        })
      }
    },
    fetchData() {
      // Replace with the actual API call
      // This is a placeholder for fetching data from an API
      const apiResponse = testSearchResults
      this.searchResults = apiResponse.data
      this.nextPageUrl = apiResponse.nextPageUrl
      this.resultCount = apiResponse.summary
    }
  }
};
</script>

<style>
.btn-light-green {
  background-color: #14AE5C !important;
  color: #fff !important;
  border: #0d8a47 1px solid !important;
  padding: 10px 30px !important;
  font-weight: bolder;
}
.custom-gray {
  background-color: #D7D7D7;
  border: #ACACAC 1px solid !important;
}
.custom-blue {
  background-color: #BDE3FF;
  border: #97B6CC 1px solid !important;
}
td {
  min-height: 75px;
  height: 75px;
  padding: 30px 10px !important;
}
.custom-adjust-table {
  width: calc( 100% + 2px ) !important;
  transform: translateX(-1px);
}
</style>