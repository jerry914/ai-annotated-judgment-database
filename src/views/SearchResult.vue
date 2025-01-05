<template>
  <div class="container result-page-container" v-loading="loading[prediction_type]">
    <!-- First Row: Search Query and Statistical Results -->
    <div class="row">
      <div class="col-md-8">
        <div class="fw-bolder my-1 py-1">{{jud_name}}案件搜尋條件</div>
        <div>
          <div class="d-flex flex-wrap">
            <div class="condition-block" v-for="info in conditionInfo" :key="info">{{ getConditionInfo(info) }}</div>
          </div>
        </div>
        <div>
        <div style="width:40%;">
          <el-input
            v-model="advancedKeyword"
            placeholder="輸入進階關鍵字"
            class="my-2"
            size="large"
            clearable
            @clear="performAdvancedSearch"
            @keyup.enter="performAdvancedSearch">
          </el-input>
          <button @click="performAdvancedSearch" class="btn btn-primary">
            搜尋
          </button>
        </div>
      </div>
      </div>
      <div class="col-md-4 my-2">
        <div class="fw-bolder my-1 py-1">{{jud_name}}案件查詢結果(最多顯示近期的50筆資料)</div>
        <div v-if="jud_type != 'civil'">
          <el-radio-group v-model="prediction_name" size="large">
            <el-radio
              v-for="(pred) in pred_options"
              :key="pred.value"
              :label="pred.name"
              border
              style="margin: 5px 5px;"
              :disabled="loading[pred.value]"
            >
              <div style="display: flex; align-items: center;">
                <span v-if="pred.value != 'other_opinion'"> {{ pred.name }} {{ resultCount[pred.value] }}</span>
                <span v-else>( {{ pred.name }} )</span>
                <el-icon v-if="loading[pred.value]" style="margin-left: 8px;" class="is-loading">
                  <Loading />
                </el-icon>
              </div>
            </el-radio>
          </el-radio-group>
        </div>
        <div v-else class="non-selectable-radio">
          {{ pred_options[2].name }} {{ resultCount['opinion'] }}
        </div>
      </div>
    </div>
    
    <div class="custom-table-container">
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
          <template v-if="prediction_type == 'other_opinion' && jud_type == 'criminal'">
            <tr v-for="(item, index) in sortedSearchResults" :key="index">
              <!-- Index Column -->
              <td style="text-align: center; background-color: #BDE3FF; border: #97B6CC 1px solid;" 
                  :data-label="'序號'">{{ parseInt(index) + 1 }}</td>
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
            <tr v-for="(item, index) in sortedSearchResults" :key="index">
            <td style="text-align: center;background-color: #BDE3FF;border: #97B6CC 1px solid;" :data-label="'序號'">{{ parseInt(index) + 1 }}</td>
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
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Loading } from '@element-plus/icons-vue';

export default {
  components: {
    Loading,
  },
  data() {
    return {
      loading: {
        fee: false,
        sub: false,
        opinion: false,
      },
      mode: 'default', // default, sentence_kind
      params: {},
      jud_type: '',
      jud_name: '',
      searchFields: {
        court_type: { type: '法院', name: 'court_type' },
        case_num: { type: '案號', name: 'case_num' },
        jud_date: { type: '日期', name: 'jud_date' },
        case_type: { type: '案件別', name: 'case_type' },
        basic_info: { type: '當事人等基本資料', name: 'basic_info' },
        syllabus: { type: '主文', name: 'syllabus' },
        fee: { type: '心證', name: 'fee' },
        sub: { type: '涵攝', name: 'sub' },
        opinion: { type: '見解', name: 'opinion' },
        other_opinion: { type: '類似見解筆數', name: 'other_opinion' },
      },
      otherSearchFields: {
        case_num: { type: '案號', name: 'case_num' },
        jud_date: { type: '日期', name: 'jud_date' },
        opinion: { type: '見解', name: 'opinion' },
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
        { name: '福建連江地方法院', value: 'fjljdfy' },
      ],
      supremeCourtValues: [],
      districtCourtValues: [],
      searchResults: {},
      resultCount: {},
      pageDetail: {
        page: 1,
        size: 50,
        next_page_url: null,
        previous_page_url: null,
        total_pages: null,
        total: null,
      },
      conditionInfo: [],
      maxTextLength: 250,
      isGroupDialogVisible: false,
      selectedGroup: [],
      dialogVisible: false,
      dialogText: '',
      prediction_type: 'opinion',
      prediction_name: '見解',
      pred_options: [
        { value: 'fee', name: '心證' },
        { value: 'sub', name: '涵攝' },
        { value: 'opinion', name: '見解' },
        { value: 'other_opinion', name: '類似見解整理'}
      ],
      sortedSearchResults: {},
      advancedKeyword: '',
      highAdvancedKeyword: ''
    };
  },
  created() {
    this.initParams();
    this.initializeCourt();
    this.fetchAllData();
  },
  mounted() {
    if (this.searchResults[this.prediction_type]) {
      this.sortedSearchResults = {...this.searchResults[this.prediction_type].data};
    }
  },
  watch: {
    prediction_name(newName) {
      const selectedOption = this.pred_options.find((pred) => pred.name === newName);
      this.prediction_type = selectedOption ? selectedOption.value : '';
    },
    prediction_type(newValue) {
      if (this.searchResults[newValue]) {
        this.updateConditionInfo();
        this.sortedSearchResults = {...this.searchResults[this.prediction_type].data};
        this.pageDetail = this.searchResults[newValue].meta;
      }
    }
  },
  methods: {
    performAdvancedSearch() {
      if (!this.advancedKeyword) {
        this.highAdvancedKeyword = this.advancedKeyword;
        this.sortedSearchResults = {...this.searchResults[this.prediction_type].data}; // Reset if no keyword
        return;
      }
      this.highAdvancedKeyword = this.advancedKeyword;
      const flattenObject = (obj) => {
        const result = [];
        const recurse = (cur, prop) => {
          if (typeof cur === 'object' && cur !== null) {
            for (const key in cur) {
              recurse(cur[key], prop ? `${prop}.${key}` : key);
            }
          } else {
            result.push(String(cur)); // Add values as strings
          }
        };
        recurse(obj, '');
        return result;
      };

      const containsKeyword = (obj) => {
        const values = flattenObject(obj);
        return values.some((value) =>
          value.includes(this.advancedKeyword)
        );
      };

      const matchedResults = this.searchResults[this.prediction_type].data.filter((result) =>
        containsKeyword(result)
      );

      this.sortedSearchResults = [...matchedResults];
    },
    getColumnWidth(name) {
      const widths = {
        basic_info: 'min-width: 260px;',
        jud_date: 'min-width: 90px;',
        case_type: 'min-width: 125px;',
        case_num: 'min-width: 90px;',
        syllabus: 'min-width: 125px;',
        other_opinion: 'min-width: 80px;',
      };
      return widths[name] || 'min-width: 200px;';
    },
    openGroupDialog(group) {
      this.selectedGroup = group;
      this.isGroupDialogVisible = true;
    },
    openDialog(content) {
      this.dialogVisible = true;
      this.dialogText = content;
    },
    handleClose() {
      this.dialogVisible = false;
    },
    checkQueryEnable(name) {
      if (name === 'court_type') return false;
      if (name === 'basic_info' && !this.params.basic_info) return false;
      if (['case_type', 'syllabus'].includes(name) && this.jud_type === 'civil') return false;
      if (['fee', 'sub'].includes(name)) return this.prediction_type === name;
      if (['opinion'].includes(name)) return this.prediction_type === name || this.prediction_type === 'other_opinion';
      if (name === 'other_opinion') return this.prediction_type === 'other_opinion' && this.jud_type === 'criminal';
      return true;
    },
    handlePageSize(size) {
      this.pageDetail.size = size;
      this.pageDetail.page = 1;
      this.fetchAllData();
    },
    handlePageChange(page) {
      this.pageDetail.page = page;
      this.fetchAllData();
    },
    formatDate(dateStr) {
      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10);
      const day = parseInt(dateStr.substring(6, 8), 10);
      const minguoYear = year - 1911;
      return `民國${minguoYear}年${month}月${day}日`;
    },
    convertDateString(input) {
      const [startDate, endDate] = input.split('-');
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
      return `起${formattedStartDate} - 迄${formattedEndDate}`;
    },
    getConditionInfo(info) {
      const field = this.searchFields[info[0]];
      if (!field) return '';
      if (field.name === 'jud_date') {
        return `${field.type || ''}:  ${this.convertDateString(info[1])}`;
      } else if (field.name === 'court_type') {
        let searchCourts = info[1].split(' ');
        this.selectAllCourts = searchCourts.length === this.courtTypeOptions.length;
        this.selectDistrictCourts = this.includesAll(searchCourts, this.districtCourtValues);
        this.selectSupremeCourts = this.includesAll(searchCourts, this.supremeCourtValues);

        if (this.selectAllCourts) {
          return `${field.type || ''}: 所有法院`;
        }

        let simplifyCourts = [...searchCourts];
        if (this.selectDistrictCourts) {
          simplifyCourts = simplifyCourts.filter((el) => !this.districtCourtValues.includes(el));
          simplifyCourts.unshift('所有地方法院');
        }
        if (this.selectSupremeCourts) {
          simplifyCourts = simplifyCourts.filter((el) => !this.supremeCourtValues.includes(el));
          simplifyCourts.unshift('所有高等法院');
        }
        return `${field.type || ''}: ${simplifyCourts.join(', ')}`;
      } else {
        return `${field.type || ''}:  ${info[1]}`;
      }
    },
    addHighlighter(fieldName, rawData) {
      let keywords = null;
      let advanced_keyword = this.highAdvancedKeyword;
      if (Array.isArray(this.conditionInfo)) {
        this.conditionInfo.forEach((condition) => {
          if (condition[0] === fieldName) {
            keywords = condition[1];
          }
        });
      } else {
        // Log or handle the situation when conditionInfo is not an array
        console.warn('conditionInfo is not an array:', this.conditionInfo);
      }

      let result = rawData;
      if (keywords) {
        keywords.split(' ').forEach((keyword) => {
          result = result.replace(keyword, `<span class="highlighter-my">${keyword}</span>`);
        });
      }
      if (advanced_keyword) {
        result = result.replace(advanced_keyword, `<span class="highlighter-advance">${advanced_keyword}</span>`);
      }
      result = result.replace(/\n+/g, '<br>').replace(/<br>$/, '');
      return result;
    },
    removeEmptyStringValues(obj) {
      Object.keys(obj).forEach((key) => {
        if (obj[key] === '') {
          delete obj[key];
        }
      });
      return obj;
    },
    includesAll(arr, values) {
      return values.every((v) => arr.includes(v));
    },
    initializeCourt() {
      this.supremeCourtValues = this.courtTypeOptions
        .filter((option) => option.name.includes('高等法院'))
        .map((option) => option.name);

      this.districtCourtValues = this.courtTypeOptions
        .filter((option) => option.name.includes('地方法院'))
        .map((option) => option.name);
    },
    initParams() {
      const urlParams = new URLSearchParams(window.location.search);

      this.params = {
        search_method: 'keyword',
        page: 1,
        size: this.pageDetail.size,
        court_type: urlParams.get('court_type') || '',
        case_type: urlParams.get('case_type') || '',
        jud_date: urlParams.get('jud_date') || '',
        basic_info: urlParams.get('basic_info') || '',
        syllabus: urlParams.get('syllabus') || '',
        prediction: urlParams.get('prediction') || '',
      };
      this.jud_type = urlParams.get('jud_type');
      this.jud_name = this.jud_type === 'civil' ? '民事' : '刑事';
      this.params = this.removeEmptyStringValues(this.params);
    },
    async fetchDataForType(type) {
      this.loading[type] = true;

      const params = { ...this.params };
      let query_type = type;

      params.page = this.pageDetail.page;
      params.size = this.pageDetail.size;

      if (type === 'opinion') {
        params.prop = 'none';
      }
      else if (type === 'other_opinion') {
        params.prop = 'high';
        query_type = 'opinion';
      }

      const api_url = `https://hssai-verdictdb.phys.nthu.edu.tw/api/${this.jud_type}/${query_type}`;

      // Create a unique cache key based on the URL and parameters
      const cacheKey = `${api_url}?${new URLSearchParams(params).toString()}`;

      // Check localStorage for cached data
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);

        // Check if the cache is still valid
        if (Date.now() < expiry) {
          console.log('Returning cached data for:', cacheKey);
          this.searchResults[type] = data;
          this.resultCount[type] = this.getCountByName(query_type);
          this.updateConditionInfo();
          this.loading[type] = false;
          return;
        } else {
          // Remove expired cache
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        const response = await axios.get(api_url, {
          headers: {
            'ngrok-skip-browser-warning': '69420',
          },
          params,
        });

        const apiResponse = response.data;

        // Save the response to localStorage with an expiry time of 1 hour
        const oneDayInMs = 60 * 60 * 1000;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: apiResponse[query_type],
            expiry: Date.now() + oneDayInMs,
          })
        );

        // Update the component's state
        this.searchResults[type] = apiResponse[query_type];
        this.resultCount[type] = this.getCountByName(query_type);
        this.sortedSearchResults = {...this.searchResults[this.prediction_type].data};
        this.updateConditionInfo();
      } catch (error) {
        console.error(`Error fetching data for ${type}:`, error);
      } finally {
        this.loading[type] = false;
      }
    },
    async fetchAllData() {
      let predictionTypes = [];

      if (this.jud_type === 'civil') {
        predictionTypes = ['opinion'];
        this.prediction_type = 'opinion';
        this.prediction_name = '見解';
      } else {
        predictionTypes = ['fee', 'sub', 'opinion', 'other_opinion'];
        if (!this.prediction_type) {
          this.prediction_type = 'opinion';
          this.prediction_name = '見解';
        }
      }

      try {
        await Promise.all(
          predictionTypes.map((type) => this.fetchDataForType(type))
        );
      } catch (error) {
        console.error('There was an error!', error);
      }
    },
    getCountByName(type) {
      let name = this.pred_options.find((option) => option.value === type).name

      if (!this.searchResults[type]) {
        return null;
      }
      const item = this.searchResults[type].summary.find((entry) => entry.name === name);
      const jud_count = this.searchResults[type].summary[0]?.count;

      if (item && jud_count) {
        return `共計 ${item.count} 筆 從 ${jud_count} 篇裁判書`;
      }
      return null;
    },
    updateConditionInfo() {
      if (this.searchResults[this.prediction_type]) {
        const conditionInfo = this.searchResults[this.prediction_type].condition_info.available;
        this.conditionInfo = Array.isArray(conditionInfo) ? conditionInfo : [];
        this.pageDetail = this.searchResults[this.prediction_type].meta;
      } else {
        this.conditionInfo = [];
      }
    },
  },
};
</script>


<style>
.tooltiptext .highlighter-my {
  background-color: rgb(170, 116, 8);
}
.highlighter-my {
  background-color: yellow;
}
.highlighter-advance {
  background-color: rgb(255, 116, 141);
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
.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>