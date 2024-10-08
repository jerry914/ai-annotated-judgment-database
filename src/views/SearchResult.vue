<template>
  <div class="container result-page-container" v-loading="loading">
    <!-- First Row: Search Query and Statistical Results -->
    <div class="row">
      <div class="col-md-8">
        <div class="fw-bolder my-1 py-1">{{jud_name}}案件搜尋條件</div>
        <div>
          <div class="d-flex flex-wrap">
            <div class="condition-block" v-for="info in conditionInfo" :key="info">{{ getConditionInfo(info) }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="fw-bolder my-1 py-1">{{jud_name}}案件查詢結果(最多顯示近期的50筆資料)</div>
        <div v-if="jud_type != 'civil'">
          <el-radio-group v-model="prediction_name" size="large">
            <el-radio
              v-for="(pred, i) in pred_options"
              :key="pred.value"
              :label="pred.name" border
              style="margin: 5px 0;"
            >
            <div>{{ pred.name }} {{ resultCount[i] }}</div>
          </el-radio>
          </el-radio-group>
        </div>
        <div v-else class="non-selectable-radio">
          {{ pred_options[0].name }} {{ resultCount[0] }}
        </div>
      </div>
    </div>
    
    <div class="custom-table-container">
      <div class="pagination-container">
        <el-pagination
          class="custom-pagination"
          :disabled='true'
          :current-page="pageDetial.page"
          :page-size="pageDetial.size"
          :pager-count="4"  
          :page-sizes="[10, 50, 100]"
          :total="pageDetial.total"
          background
          layout="total"
          @size-change="handlePageSize"
          @current-change="handlePageChange"
        />
        </div>
      <!-- 裁判資訊 Table -->
      <table class="table table-bordered custom-adjust-table">
        <thead>
          <tr class="text-center">
            <th class="custom-blue">序號</th>
            <template v-for="field in searchFields" :key="field.name">
              <th class="custom-blue" v-if="checkQueryEnable(field.name)">{{ field.type }}</th>
            </template>
          </tr>
        </thead>
        <tbody v-if="searchResults[prediction_type]">
          <!-- 見解 -->
          <template v-if="prediction_type == 'opinion' && jud_type == 'criminal'">
            <tr v-for="(item, index) in searchResults['opinion'].data" :key="index">
              <!-- Index Column -->
              <td style="text-align: center; background-color: #BDE3FF; border: #97B6CC 1px solid;" 
                  :data-label="'序號'">{{ index + (pageDetial.page-1)*pageDetial.size + 1 }}</td>
              <!-- Case Details Columns: Using the first jud data in each group -->
              <template v-for="field in searchFields" :key="field.name">
                <td v-if="checkQueryEnable(field.name)" :data-label="field.type" :style="getColumnWidth(field.name)">
                  <template v-if="field.name == 'case_num'">
                    <a :href="item.group[0].jud_url" target="_blank">{{ item.group[0].case_num }}</a>
                  </template>
                  <template v-else-if="field.name == 'jud_date'">
                    {{ formatDate(item.group[0].jud_date) }}
                  </template>
                  <template v-else-if="field.name == 'other_opinion'">
                    <!-- Group Length Column: Added with hyperlink -->
                    <div class="other_opinion_selector">
                      <a @click="openGroupDialog(item.group)">{{ item.group_length }}</a>
                    </div>
                  </template>
                  <template v-else>
                    <p style="color: rgb(138, 138, 138);" v-if="item.group[0][field.name] == null">無</p>
                    <p v-else-if="(item.group[0][field.name].length > maxTextLength || (item.group[0][field.name].match(/\n/g) || []).length > 5)" 
                        class="mytooltip custom-overflow-column" 
                        @click="openDialog(addHighlighter(field.name, item.group[0][field.name]))">
                      <span v-html="addHighlighter(field.name, item.group[0][field.name].substr(0,250))"></span>...more
                      <span class="tooltiptext">點擊閱讀全文</span>
                    </p>
                    <p v-else v-html="addHighlighter(field.name, item.group[0][field.name])"></p>
                  </template>
                </td>
              </template>
            </tr>
          </template>

          <!-- 非見解 -->
          <template v-else>
            <tr v-for="(item, index) in searchResults[prediction_type].data" :key="index">
            <td style="text-align: center;background-color: #BDE3FF;border: #97B6CC 1px solid;" :data-label="'序號'">{{ index + (pageDetial.page-1)*pageDetial.size + 1 }}</td>
            <template v-for="field in searchFields" :key="field.name" >
              <td v-if="checkQueryEnable(field.name)" :data-label="field.type" :style="getColumnWidth(field.name)">
                <template v-if="field.name == 'case_num'">
                  <a :href="item['jud_url']" target="_blank">{{ item['case_num'] }}</a>
                </template>
                <template v-else-if="field.name == 'jud_date'">
                  {{ formatDate(item['jud_date']) }}
                </template>
                <template v-else>
                  <p style="color:rgb(138, 138, 138);" v-if="item[field.name] == null">無</p>
                  <p v-else-if="(item[field.name].length > maxTextLength || (item[field.name].match(/\n/g) || []).length > 5)" class="mytooltip custom-overflow-column" @click="openDialog(addHighlighter(field.name, item[field.name]))">
                    <span  v-html="addHighlighter(field.name, item[field.name].substr(0,250))"></span>...more
                    <span class="tooltiptext">點擊閱讀全文</span>
                  </p>
                  <p v-else v-html="addHighlighter(field.name, item[field.name])"></p>
                </template>
              </td>
            </template>
          </tr>
          </template>
          
          <tr v-if="searchResults.length == 0">
            <td class="no-found-cell" colspan="8">查無資料
            </td>
          </tr>
        </tbody>
      </table>

      <!-- el-dialog for displaying other jud info in the group -->
      <el-dialog v-model="isGroupDialogVisible" width="80%" title="類似見解">
        <table class="table table-bordered custom-adjust-table">
          <thead>
            <tr class="text-center">
              <!-- <th v-for="field in otherSearchFields" :key="field.name" class="custom-blue">{{ field.type }}</th> -->
              <th class="custom-blue">序號</th>
              <template v-for="field in otherSearchFields" :key="field.name">
                <th class="custom-blue">{{ field.type }}</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(groupItem, groupIndex) in selectedGroup" :key="groupIndex">

              <!-- Index Column -->
              <td style="text-align: center; background-color: #BDE3FF; border: #97B6CC 1px solid;" 
                  :data-label="'序號'">{{ groupIndex + 1 }}</td>

              <td v-for="field in otherSearchFields" :key="field.name" :data-label="field.type">
                <template v-if="field.name == 'case_num'">
                  <a :href="groupItem.jud_url" target="_blank">{{ groupItem.case_num }}</a>
                </template>
                <template v-else-if="field.name == 'jud_date'">
                  {{ formatDate(groupItem.jud_date) }}
                </template>
                <template v-else>
                  <p style="color: rgb(138, 138, 138);" v-if="groupItem[field.name] == null">無</p>
                  <p v-else v-html="addHighlighter(field.name, groupItem[field.name])"></p>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </el-dialog>

      <el-dialog
        v-model="dialogVisible"
        width="60%"
        style="max-height: 80vh; min-width: 200px;overflow: auto;"
        :before-close="handleClose"
      >
        <span v-html="dialogText"></span>
      </el-dialog>

      <div class="pagination-container">
        <el-pagination
          class="custom-pagination"
          :disabled='true'
          :current-page="pageDetial.page"
          :page-size="pageDetial.size"
          :pager-count="4"
          :page-sizes="[10, 50, 100]"
          :total="pageDetial.total"
          background
          layout="total"
          @size-change="handlePageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
// import criminalTestResult from '../../data/criminal.json'
// import civilTestResult from '../../data/civil.json'

export default {
  data() {
    return {
      loading: true,
      mode: 'default', // default, sentence_kind
      params: {},
      jud_type: '',
      jud_name: '',
      prop_query: 'mid',
      prob_type: 1,
      marks: {
        0: '低',
        1: '中',
        2: '高',
      },
      searchFields: {
        court_type: {type: '法院', name: 'court_type'},
        case_num: {type: '案號', name: 'case_num'},
        jud_date: {type: '日期', name: 'jud_date'},
        case_type: {type: '案件別', name:'case_type'},
        basic_info: {type: '當事人等基本資料', name:'basic_info'},
        syllabus: {type: '主文', name: 'syllabus'},
        opinion: {type: '見解', name:'opinion'},
        fee: {type: '心證', name:'fee'},
        sub: {type: '涵攝', name:'sub'},
        other_opinion: {type: '類似見解筆數', name: 'other_opinion'}
      },
      otherSearchFields: {
        case_num: {type: '案號', name: 'case_num'},
        jud_date: {type: '日期', name: 'jud_date'},
        opinion: {type: '見解', name:'opinion'}
      },
      courtTypeOptions: [
        { name: '最高法院', value: 'zgf' },
        { name: '臺灣高等法院', value: 'twgdfy' },
        { name: '智慧財產及商業法院', value: 'zhccjsyfy' },
        { name: '臺灣高等法院臺中分院', value: 'twgdfytcfy' },
        { name: '臺灣高等法院臺南分院', value: 'twgdfytnfy' },
        { name: '臺灣高等法院高雄分院', value: 'twgdfykxfy' },
        { name: '臺灣高等法院花蓮分院', value: 'twgdfyhlfy' },
        { name: '福建高等法院金門分院', value: 'fjgdfyjmfy' },
        { name: '臺灣臺北地方法院', value: 'twtbdfy' },
        { name: '臺灣新北地方法院', value: 'twxbdfy' },
        { name: '臺灣士林地方法院', value: 'twslgdfy' },
        { name: '臺灣桃園地方法院', value: 'twtydfy' },
        { name: '臺灣新竹地方法院', value: 'twxzdfy' },
        { name: '臺灣苗栗地方法院', value: 'twmldfy' },
        { name: '臺灣臺中地方法院', value: 'twtcdfy' },
        { name: '臺灣南投地方法院', value: 'twntdfy' },
        { name: '臺灣彰化地方法院', value: 'twzhdfy' },
        { name: '臺灣雲林地方法院', value: 'twyldfy' },
        { name: '臺灣嘉義地方法院', value: 'twjydfy' },
        { name: '臺灣臺南地方法院', value: 'twtndfy' },
        { name: '臺灣高雄地方法院', value: 'twkxdfy' },
        { name: '臺灣橋頭地方法院', value: 'twqtdfy' },
        { name: '臺灣屏東地方法院', value: 'twptdfy' },
        { name: '臺灣臺東地方法院', value: 'twtdgdfy' },
        { name: '臺灣花蓮地方法院', value: 'twhldfy' },
        { name: '臺灣宜蘭地方法院', value: 'twyldfy' },
        { name: '臺灣基隆地方法院', value: 'twjldfy' },
        { name: '臺灣澎湖地方法院', value: 'twphdfy' },
        { name: '福建金門地方法院', value: 'fjjmdfy' },
        { name: '福建連江地方法院', value: 'fjljdfy' }
      ],
      supremeCourtValues: [],
      districtCourtValues: [],
      searchResults: [],
      resultCount: [],
      pageDetial: {
        "page": 1,
        "size": 50,
        "next_page_url": null,
        "previous_page_url": null,
        "total_pages": null,
        "total": null
      },
      conditionInfo: [
      ],
      maxTextLength: 250,
      isGroupDialogVisible: false,
      selectedGroup: [],
      dialogVisible: false,
      dialogText: '',
      prediction_type: '',
      prediction_name: '',
      pred_options: [
        {
          value: 'opinion',
          name: '見解'
        },
        {
          value: 'fee',
          name: '心證'
        },
        {
          value: 'sub',
          name: '涵攝'
        }
      ]
    };
  },
  created() {
    // Call the method to fetch data when component is created
    this.initParams()
    this.initializeCourt()
    this.fetchData()
  },
  watch: {
    prediction_name(newName) {
      const selectedOption = this.pred_options.find(pred => pred.name === newName);
      this.prediction_type = selectedOption ? selectedOption.value : '';
    },
    prediction_type(newValue) {
      this.conditionInfo = this.searchResults[newValue].condition_info.available;
      this.pageDetial = this.searchResults[newValue].meta;
    },
    prob_type(newValue) {
      const prop_name = {
        0: 'low',
        1: 'mid',
        2: 'high'
      }
      this.prop_query = prop_name[newValue]
      this.fetchData()
    }
  },
  methods: {
    getColumnWidth(name) {
      if (name == 'basic_info') {
        return 'min-width: 260px;'
      }
      else if (name == 'jud_date') {
        return 'min-width: 90px;'
      }
      else if (name == 'case_type') {
        return 'min-width: 125px;'
      }
      else if (name == 'case_num') {
        return 'min-width: 90px;'
      }
      else if (name == 'syllabus') {
        return 'min-width: 125px;'
      }
      else if (name == 'other_opinion') {
        return 'min-width: 80px;'
      }
      return 'min-width: 200px;'
    },
    openGroupDialog(group) {
      this.selectedGroup = group;
      this.isGroupDialogVisible = true;
    },
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
      if (name == 'basic_info' && !this.params.basic_info) {
        return false
      }
      if (name == 'case_type' || name == 'syllabus') {
        if (this.jud_type=='civil') {
          return false
        }
      }
      if (name == 'opinion' || name == 'fee' || name == 'sub') {
        if (this.prediction_type == name) {
          return true
        }
        else {
          return false
        }
      }
      if (name == 'other_opinion') {
        if (this.prediction_type == 'opinion' && this.jud_type == 'criminal') {
          return true
        }
      }
      else {
        return true
      }
      return false
    },
    handlePageSize(size) {
      this.pageDetial.size = size
      this.pageDetial.page = 1
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageDetial.page = page
      this.fetchData()
    },
    formatDate(dateStr) {
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10);
      const day = parseInt(dateStr.substring(6, 8), 10);

      // Convert to Minguo calendar by subtracting 1911 from the Gregorian year
      const minguoYear = year - 1911;

      return `民國${minguoYear}年${month}月${day}日`;
    },
    convertDateString(input) {
      // Split the input string into start and end dates
      const [startDate, endDate] = input.split('-');

      // Format both start and end dates
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);

      // Combine the formatted dates into the final string
      return `起${formattedStartDate} - 迄${formattedEndDate}`;
    },
    getConditionInfo(info) {
      if (this.searchFields[info[0]]) {
        if (this.searchFields[info[0]].name == "jud_date") {
          return `${this.searchFields[info[0]].type || ''}:  ${this.convertDateString(info[1])}`
        }
        else if (this.searchFields[info[0]].name == "court_type") {
          
          let searchCourts = info[1].split(' ')
          this.selectAllCourts = searchCourts.length == this.courtTypeOptions.length
          this.selectDistrictCourts = this.includesAll(searchCourts, this.districtCourtValues)
          this.selectSupremeCourts = this.includesAll(searchCourts, this.supremeCourtValues)
          if(this.selectAllCourts) {
            return `${this.searchFields[info[0]].type || ''}: 所有法院`
          }
          let simplifyCourts = searchCourts
          if(this.selectDistrictCourts) {
            simplifyCourts = simplifyCourts.filter( ( el ) => !this.districtCourtValues.includes( el ) )
            simplifyCourts.unshift('所有地方法院')
          }
          if(this.selectSupremeCourts) {
            simplifyCourts = simplifyCourts.filter( ( el ) => !this.supremeCourtValues.includes( el ) )
            simplifyCourts.unshift('所有高等法院')
          }
          return `${this.searchFields[info[0]].type || ''}: ${simplifyCourts.join(', ')}`
        }
        else {
          return `${this.searchFields[info[0]].type || ''}:  ${info[1]}`
        }
        
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
        result = result.replace(keyword,`<span class="highlighter-my">${keyword}</span>`)
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
    includesAll(arr, values) {
      return values.every(v => arr.includes(v))
    },
    initializeCourt() {
      this.supremeCourtValues = this.courtTypeOptions
        .filter(option => option.name.includes('高等法院'))
        .map(option => option.name)

      this.districtCourtValues = this.courtTypeOptions
        .filter(option => option.name.includes('地方法院'))
        .map(option => option.name)
    },
    initParams() {
      const urlParams = new URLSearchParams(window.location.search)

      this.params = {
        'search_method': "keyword",
        'page': 1,
        'size': this.pageDetial.size,
        'court_type': urlParams.get('court_type') || '', 
        'case_type': urlParams.get('case_type') || '',
        'jud_date': urlParams.get('jud_date') || '', 
        'basic_info': urlParams.get('basic_info') || '', 
        'syllabus': urlParams.get('syllabus') || '', 
        'prediction': urlParams.get('prediction') || ''
      }
      this.jud_type = urlParams.get('jud_type')
      this.jud_name = this.jud_type == 'civil' ? '民事' : '刑事'
      this.params = this.removeEmptyStringValues(this.params)
      // console.log(this.params)
    },
    async fetchData() {
      this.loading = true
      this.params.page = this.pageDetial.page
      this.params.size = this.pageDetial.size
      this.params.prop = this.prop_query
      try {
        const response = await axios.get('https://hssai-verdictdb.phys.nthu.edu.tw/api/'+this.jud_type, {
          headers: {
            "ngrok-skip-browser-warning": "69420"
          },
          params: this.params
        });

        // const apiResponse = this.jud_type == 'civil' ? civilTestResult : criminalTestResult
        const apiResponse = response.data
        // console.log(apiResponse)
        this.searchResults = apiResponse

        if (!this.prediction_type) {
          this.prediction_type = this.searchResults.opinion ? 'opinion' :
                        this.searchResults.fee ? 'fee' : 
                        'sub';
          this.prediction_name = this.searchResults.opinion ? '見解' :
                        this.searchResults.fee ? '心證' : 
                        '涵攝';
        }
        
        this.resultCount.push(this.getCountByName('opinion', '見解'))
        this.resultCount.push(this.getCountByName('fee', '心證'))
        this.resultCount.push(this.getCountByName('sub', '涵攝'))

        this.loading = false
      } catch (error) {
        console.error('There was an error!', error)
        this.loading = false
      }
    },
    getCountByName(type, name) {
        if (this.searchResults[type] == null ) {
          return 0
        }
        const item = this.searchResults[type].summary.find(entry => entry.name === name);
        let jud_count = this.searchResults[type].summary[0].count;
        if (item && jud_count) {
            return `共計 ${item.count} 筆 從 ${jud_count} 篇裁判書`;
        } else {
            return null;
        }
    }
  }
};
</script>

<style>
.tooltiptext .highlighter-my {
  background-color: rgb(170, 116, 8);
}
.highlighter-my {
  background-color: yellow;
}
.custom-pagination .el-pagination {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .custom-pagination .el-pagination {
    font-size: 12px;
  }

  .custom-pagination .el-pagination .el-pager li {
    padding: 0 4px;
    min-width: 22px;
  }

  .custom-pagination .el-pagination__sizes,
  .custom-pagination .el-pagination__total {
    display: none;
  }

  .custom-pagination .el-pagination__prev,
  .custom-pagination .el-pagination__next {
    padding: 0 6px;
  }
}

</style>

<style scoped>
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
.table {
    margin: 0px !important;
}

@media (max-width: 768px) {
  .custom-adjust-table, .custom-adjust-table thead, .custom-adjust-table tbody, .custom-adjust-table th, .custom-adjust-table td, .custom-adjust-table tr {
    display: block;
  }

  .custom-adjust-table thead tr {
    position: absolute;
    top: -9999px;
    left: -9999px;
  }

  .custom-adjust-table tr { border: 1px solid #ccc; }

  .custom-adjust-table td {
    border: none;
    border-bottom: 1px solid #eee;
    position: relative;
    padding-left: 25%;
    text-align: left;
  }

  .custom-adjust-table td:before {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 45%;
    padding-right: 10px;
    white-space: nowrap;
    content: attr(data-label);
    font-weight: bold;
    text-align: left;
  }
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

.no-found-cell {
  background-color: #fff;
  text-align: center;
}
.custom-overflow-column > span {
  display: -webkit-box;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pagination-container {
  padding: 10px 0;
  max-width: 100vw;
}
.condition-block {
  margin: 3px 5px;
  padding: 3px 5px;
  background-color: #e7e7e7;
  border: 1px solid #ccc;
}
.non-selectable-radio {
  margin: 10px 0;
  padding: 10px 20px;
  border-radius: 8px;
  width: fit-content;
  border: 1px solid #c4c4c4;
  font-size: 0.9rem;
  color: #4e4e4e;
}
.other_opinion_selector{
  text-align: center;
  text-decoration: underline;
  width: 100%;
  cursor: pointer;
  font-weight: bolder;
  color: #0a60ac;
}
</style>