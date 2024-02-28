<template>
  <div class="container" v-loading="loading">
    <!-- First Row: Search Query and Statistical Results -->
    <div class="row">
      <div class="col-md-9">
        <div class="fw-bolder my-1 py-1">搜尋條件</div>
        <div>
          <div class="d-flex flex-wrap">
            <!-- <div class="px-2 pb-1" v-for="info in conditionInfo" :key="info">{{ info }}</div> -->
            <div class="px-2 pb-1" v-for="info in conditionInfo" :key="info">{{ getConditionInfo(info) }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="fw-bolder my-1 py-1">查詢結果</div>
        <div v-for="count in resultCount" :key="count.name">
          <template v-if="count.count!=0">
            共計 <strong class="text-decoration-underline">{{ count.count }}</strong> {{ count.unit }}{{ count.name }}
          </template>
        </div>
      </div>
      <!-- <div class="col-md-2">
        <button type="button" class="btn btn-light-green">下載搜尋結果</button>
      </div> -->
    </div>

    <el-pagination
      v-model="pageDetial.page"
      :page-size="pageDetial.size"
      :page-sizes="[10, 50, 100, 200]"
      :total="pageDetial.total"
      background
      layout="total, sizes, prev, pager, next"
      @size-change="handlePageSize"
      @current-change="handlePageChange"
    />
    <!-- Third Row: Data Tables -->
    <div class="row mt-3 mb-3">
      <!-- 裁判資訊 Table -->
      <div class="col-md-12">
        <div class="rounded-3 border">
          <table class="table table-bordered custom-adjust-table">
            <thead>
              <tr class="text-center">
                <template v-for="field in searchFields" :key="field.name">
                  <th class="custom-blue" v-if="checkQueryEnable(field.name)">{{ field.type }}</th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in searchResults" :key="index">
                <template v-for="field in searchFields" :key="field.name" >
                  <td v-if="checkQueryEnable(field.name)" :style="field.name=='basic_info'?'min-width: 250px;':''">
                    <template v-if="field.name == 'case_num'">
                      <a :href="item['jud_url']" target="_blank">{{ item['case_num'] }}</a>
                    </template>
                    <template v-else>
                      <p style="color:rgb(138, 138, 138);" v-if="item[field.name] == null">無</p>
                      <p v-else-if="item[field.name].length > maxTextLength" class="mytooltip" @click="openDialog(addHighlighter(field.name, item[field.name]))">
                        <span v-html="addHighlighter(field.name, item[field.name].substr(0,100))"></span>...more
                        <span class="tooltiptext">點擊閱讀全文</span>
                      </p>
                      <p v-else v-html="addHighlighter(field.name, item[field.name])"></p>
                    </template>
                </td>
                </template>
              </tr>
              <tr v-if="searchResults.length == 0">
                <td class="no-found-cell" colspan="8">查無資料
                </td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      width="60%"
      style="max-height: 80vh; overflow: scroll;"
      :before-close="handleClose"
    >
      <span v-html="dialogText"></span>
    </el-dialog>
    <el-pagination
      v-model="pageDetial.page"
      :page-size="pageDetial.size"
      :page-sizes="[10, 50, 100, 200]"
      :total="pageDetial.total"
      background
      layout="total, sizes, prev, pager, next"
      @size-change="handlePageChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script>
import axios from 'axios'
// import testSearchResults from '../../data/api_search.json'

export default {
  data() {
    return {
      loading: true,
      mode: 'default', // default, sentence_kind
      params: {},
      searchFields: {
        court_type: {type: '法院', name: 'court_type'},
        case_num: {type: '案號', name: 'case_num'},
        jud_date: {type: '日期', name: 'jud_date'},
        case_type: {type: '案件別', name:'case_type'},
        basic_info: {type: '當事人等基本資料', name:'basic_info'},
        opinion: {type: '見解', name:'opinion'},
        fee: {type: '心證', name:'fee'},
        sub: {type: '涵攝', name:'sub'},
        jud_full: {type: '全文關鍵字', name:'jud_full'},
      },
      searchResults: [],
      resultCount: [],
      pageDetial: {
        "page": 1,
        "size": 10,
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
      maxTextLength: 100,
      dialogVisible: false,
      dialogText: ''
    };
  },
  created() {
    // Call the method to fetch data when component is created
    this.initParams()
    this.fetchData()
  },
  methods: {
    openDialog(content) {
      this.dialogVisible = true
      this.dialogText = content
    },
    handleClose() {
      this.dialogVisible = false
    },
    checkQueryEnable(name) {
      if (name == 'court_type') {
        return false
      }
      if (name == 'opinion' ||  name === 'fee' || name === 'sub' || name == 'jud_full') {
        if (this.params[name]) {
          return true
        }
      }
      else {
        return true
      }
      return false
    },
    handlePageSize(size) {
      console.log(size)
      this.pageDetial.size = size
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageDetial.page = page
      this.fetchData()
    },
    getConditionInfo(info) {
      if (this.searchFields[info[0]]) {
        return `${this.searchFields[info[0]].type || ''}:  ${info[1]}`
      }
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
      result = result.replace(/\n+/g, '<br>')
      // Remove <br> at the end of the string
      result = result.replace(/<br>$/, '')
      return result
    },
    removeEmptyStringValues(obj) {
        Object.keys(obj).forEach(key => {
            if (obj[key] === '') {
                delete obj[key];
            }
        });
        return obj;
    },
    initParams() {
      const urlParams = new URLSearchParams(window.location.search)

      this.params = {
        'search_method': "keyword",
        'page': 1,
        'size': this.pageDetial.size,
        'court_type': urlParams.get('court_type') || '', 
        'jud_date': urlParams.get('jud_date') || '', 
        'basic_info': urlParams.get('basic_info') || '', 
        'syllabus': urlParams.get('syllabus') || '', 
        'opinion': urlParams.get('opinion') || '', 
        'fee': urlParams.get('fee') || '', 
        'sub': urlParams.get('sub') || '', 
        'jud_full': urlParams.get('jud_full') || ''
      }
      this.params = this.removeEmptyStringValues(this.params)
      // console.log(this.params)
    },
    async fetchData() {
      this.loading = true
      this.params.page = this.pageDetial.page
      this.params.size = this.pageDetial.size
      try {
        const response = await axios.get('https://105f-140-114-83-23.ngrok-free.app/api/search', {
          headers: {
            "ngrok-skip-browser-warning": "69420"
          },
          params: this.params
        });
        // const apiResponse = testSearchResults
        const apiResponse = response.data
        // console.log(apiResponse)
        this.searchResults = apiResponse.data
        this.conditionInfo = apiResponse.condition_info.available
        this.pageDetial = apiResponse.meta
        this.resultCount = apiResponse.summary
        this.loading = false
      } catch (error) {
        console.error('There was an error!', error)
        this.loading = false
      }
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
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
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
.no-found-cell {
  background-color: #fff;
  text-align: center;
}
</style>