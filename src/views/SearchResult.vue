<template>
  <div class="container">
    <!-- First Row: Search Query and Statistical Results -->
    <div class="row">
      <div class="col-md-6">
        <div class="fw-bolder my-1 py-1">搜尋條件</div>
        <div>
          <div class="pb-1 ">裁判資訊：</div>
          <div class="d-flex flex-row">
            <div class="px-2 pb-1">{{ formData.courtType.type }}: {{ formData.courtType.query }}</div>
            <div class="px-2 pb-1">{{ formData.refereeDate.type }}: {{ formData.refereeDate.query }}</div>
          </div>
        </div>
        <div class="pb-1">
          <div>基本資訊：</div>
          <div class="d-flex flex-row">
            <div class="px-2 pb-1" v-for="info in formData.searchFields" :key="info.name">{{ info.type }}: {{ info.query }}</div>
          </div> 
        </div>
        <div class="pb-1">
          <div>裁判內文：{{ poolOptions[poolKeyword.query].type }}</div>
          <div class="px-2 pb-2">{{poolKeyword.keyword}}</div>
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

    <!-- Third Row: Data Tables -->
    <div class="row mt-3 mb-5">
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
                <th>{{ poolOptions[poolKeyword.query].type }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
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
      searchItems: [],
      formData: {
        courtType: {type: '法院別', name: 'court_type', query: ''},
        refereeDate: {type: '裁判日期', name: 'referee_date', query: ''},
        searchFields: {
          case_kind: {type: '案件別', name:'case_kind', query: ''},
          judger: {type: '法官（全名）', name:'judger', query: ''},
          defentdent: {type: '辯護人（全名）', name:'defentdent', query: ''},
          prosecutor: {type: '檢察官（全名）', name:'prosecutor', query: ''},
        }
      },
      poolOptions: {
        sub: {type: '涵攝', query: 'sub'},
        op: {type: '見解', query: 'op'},
        ft:  {type: '心證', query: 'ft'}
      },
      poolKeyword: {
        name: 'pool', query: 'op', keyword: ''
      },
      searchResults: [],
      nextPageUrl: '',
      resultCount: []
    };
  },
  created() {
    // Call the method to fetch data when component is created
    this.fetchData()
    this.reverseUrlToFormData()
  },
  methods: {
    // Function to update a specific field in formData
    updateFormDataField(fieldName, queryValue) {
      if (this.formData[fieldName]) {
        this.formData[fieldName].query = queryValue;
      } else if (this.formData.searchFields[fieldName]) {
        this.formData.searchFields[fieldName].query = queryValue;
      }
    },
    // Main function to reverse URL to formData and poolKeyword
    reverseUrlToFormData() {
      const urlParams = new URLSearchParams(window.location.search);

      // Define a mapping of URL parameters to formData fields
      const paramToFieldMap = {
        courtType: 'courtType',
        refereeDate: 'refereeDate',
        case_kind: 'case_kind',
        judger: 'judger',
        defentdent: 'defentdent',
        prosecutor: 'prosecutor'
      };

      // Iterate over each URL parameter and update formData
      for (const [param, field] of Object.entries(paramToFieldMap)) {
        this.updateFormDataField(field, urlParams.get(param) || '');
      }

      // Update poolKeyword separately
      this.poolKeyword.query = urlParams.get('pool') || '';
      this.poolKeyword.keyword = urlParams.get('keyword') || '';
    },
    fetchData() {
      // Replace with the actual API call
      // This is a placeholder for fetching data from an API
      const apiResponse = testSearchResults
      this.searchResults = apiResponse.data
      this.nextPageUrl = apiResponse.nextPageUrl
      this.resultCount = apiResponse.summary

      // 網址格式  ex: keywords=人格&&心理, pool=(op=見解, sub=涵攝, ft=心證)  
      // http://127.0.0.1:3000/search/<keywords>?pool=op
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