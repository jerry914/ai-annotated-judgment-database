<template>
  <div class="container">
    <!-- First Row: Search Query and Statistical Results -->
    <div class="row">
      <div class="col-md-9">
        <div class="fw-bolder my-1 py-1">搜尋條件</div>
        <div>
          <div class="d-flex flex-wrap">
            <div class="px-2 pb-1" v-for="info in conditionInfo" :key="info">{{ getConditionInfo(info) }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="fw-bolder my-1 py-1">查詢結果</div>
        <div v-for="count in resultCount" :key="count.name">共計 <strong class="text-decoration-underline">{{ count.count }}</strong> {{ count.unit }}{{ count.name }}</div>
      </div>
      <!-- <div class="col-md-2">
        <button type="button" class="btn btn-light-green">下載搜尋結果</button>
      </div> -->
    </div>
    <!-- Third Row: Data Tables -->
    <div class="row mt-3 mb-3">
      <!-- 裁判資訊 Table -->
      <div class="col-md-12">
        <div class="rounded-3 border">
          <table class="table table-bordered custom-adjust-table">
            <thead>
              <tr class="text-center">
                <th class="custom-blue" v-for="field in searchFields" :key="field.name">{{ field.type }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
                <td v-for="field in searchFields" :key="field.name">
                  <p style="color:rgb(138, 138, 138);" v-if="item[field.name] == null">無</p>
                  <p v-else-if="item[field.name].length > maxTextLength" class="mytooltip">
                    <span v-html="addHighlighter(field.name, item[field.name].substr(0,100))"></span>...more
                    <span class="tooltiptext" v-html="addHighlighter(field.name, item[field.name])"></span>
                  </p>
                  <p v-else v-html="addHighlighter(field.name, item[field.name])"></p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ul class="pagination justify-content-left">
      <li class="page-item" :class="pageDetial.previous_page_url=='null'?'disabled':''">
        <a class="page-link" :href="pageDetial.previous_page_url" tabindex="-1">Previous</a>
      </li>
      <li class="page-item" :class="pageDetial.next_page_url=='null'?'disabled':''">
        <a class="page-link" :href="pageDetial.next_page_url">Next</a>
      </li>
    </ul>
  </div>
</template>

<script>
// import axios from 'axios'
import testSearchResults from '../../data/api_search.json'

export default {
  data() {
    return {
      mode: 'default', // default, sentence_kind
      params: {},
      searchFields: {
        court_type: {type: '法院別', name: 'court_type', query: ''},
        jud_date: {type: '裁判日期', name: 'jud_date', query: ''},
        // case_kind: {type: '案件別', name:'case_kind', example: '詐欺', query: ''},
        basic_info: {type: '基本資料的關鍵字', name:'basic_info', example: '', query: ''},
        syllabus: {type: '主文中的關鍵字', name:'syllabus', example: '', query: ''},
        opinion: {type: '法院見解的關鍵字', name:'opinion', example: '', query: ''},
        fee: {type: '法官心證的關鍵字(限地院)', name:'fee', example: '', query: ''},
        sub: {type: '法官涵攝的關鍵字(限地院)', name:'sub', example: '', query: ''},
        jud_full: {type: '判決全文的關鍵字', name:'jud_full', example: '', query: ''},
      },
      searchResults: [],
      resultCount: [],
      pageDetial: {
        "page": 1,
        "size": 2,
        "next_page_url": "null",
        "previous_page_url": "null",
        "total_pages": 8,
        "total": 15
      },
      conditionInfo: [
        [
          "jud_date",
          "20220101-20220115"
        ],
        [
          "opinion",
          "主觀 殺人"
        ]
      ],
      maxTextLength: 100
    };
  },
  created() {
    // Call the method to fetch data when component is created
    this.fetchData()
  },
  methods: {
    getConditionInfo(info) {
      return `${this.searchFields[info[0]].type || ''}:  ${info[1]}`
    },
    addHighlighter(fieldName, rawData) {
      let keywords = null
      this.conditionInfo.forEach((condition) => {
        if (condition[0] == fieldName) {
          keywords = condition[1]
          return
        }
      })

      let result = rawData
      if(keywords) {
        keywords.split(" ").forEach((keyword) => {
        result = result.replace(keyword,`<span class="highlighter">${keyword}</span>`)
      })
      }
      return result
    },
    fetchData() {
      // Replace with the actual API call
      const urlParams = new URLSearchParams(window.location.search)

      this.params = {
        'search_method': "keyword",
        'page': '1',
        'size': '2',
        'court_type': urlParams.get('court_type') || '', 
        'jud_date': urlParams.get('jud_date') || '', 
        'basic_info': urlParams.get('basic_info') || '', 
        'syllabus': urlParams.get('syllabus') || '', 
        'opinion': urlParams.get('opinion') || '', 
        'fee': urlParams.get('fee') || '', 
        'sub': urlParams.get('sub') || '', 
        'jud_full': urlParams.get('jud_full') || ''
      }
      console.log(this.params)
      const apiResponse = testSearchResults
      this.searchResults = apiResponse.data
      this.conditionInfo = apiResponse.condition_info.available
      this.pageDetial = apiResponse.meta
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
  background-color: #BDE3FF !important;
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

.mytooltip {
  position: relative;
  cursor: pointer;
}

.mytooltip .tooltiptext {
  visibility: hidden;
  width: 40vw;
  background-color: black;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 5px 10px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1 !important;
}

.mytooltip:hover .tooltiptext {
  visibility: visible;
}
.tooltiptext .highlighter {
  background-color: rgb(170, 116, 8);
}
.highlighter {
  background-color: yellow;
}
</style>