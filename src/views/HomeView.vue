<template>
  <div class="container mt-4">
    <el-row>
      <!-- Left column for form inputs -->
      <el-col :lg="{'span':6}" :md="24">
        <form @submit.prevent="onSubmit">
          <!-- Case type input -->
          <!-- Court type select -->
          <div class="form-group">
            <div style="margin: 10px 0"><strong>法院別</strong></div>
            <!-- Checkboxes for court selection -->
            <div class="check-court-container">
              <div>
                <input type="checkbox" id="selectAll" class="hidden-checkbox" v-model="selectAllCourts" @change="selectAllChanged">
                <label for="selectAll" class="checkbox-label">所有法院</label>
              </div>
              <div>
                <input type="checkbox" id="selectSupremeCourts" class="hidden-checkbox" v-model="selectSupremeCourts" @change="selectSupremeCourtsChanged">
                <label for="selectSupremeCourts" class="checkbox-label">所有高等法院</label>
              </div>
              <div>
                <input type="checkbox" id="selectDistrictCourts" class="hidden-checkbox" v-model="selectDistrictCourts" @change="selectDistrictCourtsChanged">
                <label for="selectDistrictCourts" class="checkbox-label">所有地方法院</label>
              </div>
            </div>
            
            <div class="smartphone-message">請點擊下方輸入框以選取法院</div>
            <!-- Court Selection Dropdown -->
            <div>
              <select class="form-select select-court-container" multiple v-model="selectedCourts">
                <option v-for="(item, index) in courtTypeOptions" :key="index">{{ item.name }}</option>
              </select>
            </div>
          </div>

          <!-- Referee date input -->
          <div class="form-group">
            <div class="mt-3"><strong>裁判日期</strong></div>
            <div style="margin: 10px 0;">
              <span class="p-2">起</span>
              <span>民國</span>
              <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.from.year">
                <!-- <option v-for="year in getSelectableYears()" :value="year" :key="year">{{ year }}</option> -->
                <option :value="110">110</option>
              </select>
              <span>年</span>
              <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.from.month">
                <option v-for="month in 12" :value="month" :key="month">{{month }}</option>
              </select>
              <span>月</span>
            </div>
            <div style="margin: 10px 0;">
              <span class="p-2">迄</span>
              <span>民國</span>
              <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.to.year">
                <!-- <option v-for="year in getSelectableYears()" :value="year" :key="year">{{ year }}</option> -->
                <option :value="110">110</option>
              </select>
              <span>年</span>
              <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.to.month">
                <option v-for="month in 12" :value="month" :key="month">{{month }}</option>
              </select>
              <span>月</span>
            </div>
          </div>
        </form>
      </el-col>
      <el-col :lg="{'span':17,'offset':1}" :md="24" style="margin-top: 20px;">
        <div class="p-0 border rounded-3" style="overflow: scroll;">
          <div class="flex-container">
          <div class="flex-row header">
            <div class="flex-column">搜尋類型</div>
            <div class="flex-column">請輸入搜尋條件</div>
          </div>
          <div class="flex-row" v-for="(field, index) in formData.searchFields" :key="index">
            <div class="flex-column" style="background-color: #f5f5f5;">{{ field.type }}</div>
            <div class="flex-column custom-light-purple">
              <input type="text" class="form-control" v-model="field.query" :placeholder="field.example">
            </div>
          </div>
          <div class="flex-row">
            <div class="flex-column radio-group" style="background-color: #f5f5f5;">
              <div v-for="option in poolOptions" :key="option.name" class="form-check-container">
                <input class="form-check-input" type="radio" name="flexRadio" :id="option.name" v-model="selectedSearchType" :value="option.name">
                <label class="form-check-label" :for="option.name">{{ option.type }}</label>
              </div>
              <div class="form-instruction">💡此處只能選擇見解，心證，或涵攝其中一項</div>
            </div>
            <div class="flex-column custom-light-purple">
              <textarea class="form-control" v-model="poolOptions[selectedSearchType].query" :placeholder="poolOptions[selectedSearchType].example"></textarea>
            </div>
          </div>
        </div>
      </div>
        <div class="search-btn-container">
          <button class="btn btn-secondary d-inline-flex custom-purlpe" @click="advanceSearch">開始搜尋</button>
        </div>
      </el-col>
    </el-row>

    <div v-if="showErrorAlert" class="alert alert-danger mt-2" role="alert">
      無法同時選擇一項以上的涵攝，見解，或心證，請修改後送出。
    </div>
  </div>
</template>

<script>
// import { offset } from '@popperjs/core';
import { ElMessage } from 'element-plus'
export default {
  name: 'SearchForm',
  components: {
  },
  data() {
    return {
      formData: {
        court_type: '',
        refereeDate: '',
        searchFields: [
          {type: '案件別', name:'case_kind', example: '例如詐欺', query: ''},
          {type: '當事人等基本資料', name:'basic_info', example: '', query: ''},
          {type: '主文中的關鍵字', name:'syllabus', example: '', query: ''},
          // {type: '法院見解的關鍵字', name:'opinion', example: '', query: ''},
          // {type: '法官心證的關鍵字(限地院)', name:'fee', example: '', query: ''},
          // {type: '法官涵攝的關鍵字(限地院)', name:'sub', example: '', query: ''},
          {type: '判決全文的關鍵字', name:'jud_full', example: '', query: ''},
        ],
      },
      selectedSearchType: 'opinion',
      poolOptions: {
        opinion: {type: '法院見解的關鍵字', name: 'opinion', query: '', example: '請輸入法院見解的關鍵字'},
        fee:  {type: '法官心證的關鍵字(限地院)', name: 'fee', query: '', example: '請輸入法官心證的關鍵字(限地院)'},
        sub: {type: '法官涵攝的關鍵字(限地院)', name: 'sub', query: '', example: '請輸入法官涵攝的關鍵字(限地院)'}
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
      selectedCourts: [],
      selectAllCourts: false,
      selectSupremeCourts: false,
      selectDistrictCourts: false,
      showModal: false,
      isSelectedAllCourts: true,
      selectedDateRange: {
        from: {
          year: '110',
          month: '1'
        },
        to: {
          year: '110',
          month: '12'
        },
      },
      showErrorAlert: false
    };
  },
  mounted() {
    this.initializeCourt()
    this.initializeForm()
  },
  watch: {
    'selectedDateRange.from': {
      handler(newValue) {
        // Convert year and month to integers for comparison
        const fromYear = parseInt(newValue.year);
        const fromMonth = parseInt(newValue.month);
        const toYear = parseInt(this.selectedDateRange.to.year);
        const toMonth = parseInt(this.selectedDateRange.to.month);

        // Compare year and month directly
        if (fromYear > toYear || (fromYear === toYear && fromMonth > toMonth)) {
          // If from date is later than to date, set to date equal to from date
          this.selectedDateRange.to.year = newValue.year;
          this.selectedDateRange.to.month = newValue.month;
        }
        ElMessage({
          message: '起始日不可晚於結束日',
          type: 'warning',
        })
      },
      deep: true,
    },
    'selectedDateRange.to': {
      handler(newValue) {
        // Convert year and month to integers for comparison
        const toYear = parseInt(newValue.year);
        const toMonth = parseInt(newValue.month);
        const fromYear = parseInt(this.selectedDateRange.from.year);
        const fromMonth = parseInt(this.selectedDateRange.from.month);

        // Compare year and month directly
        if (toYear < fromYear || (toYear === fromYear && toMonth < fromMonth)) {
          // If to date is earlier than from date, set from date equal to to date
          this.selectedDateRange.from.year = newValue.year;
          this.selectedDateRange.from.month = newValue.month;
        }
      },
      deep: true,
    },
    selectedCourts(newVal) {
      this.selectAllCourts = newVal.length === this.courtTypeOptions.length
      this.selectDistrictCourts = this.includesAll(newVal, this.districtCourtValues)
      this.selectSupremeCourts = this.includesAll(newVal, this.supremeCourtValues)
    }
  },
  methods: {
    getSelectableYears() {
      return new Date().getFullYear() - 1911
    },
    formatPart(value) {
      return String(value).padStart(2, '0')
    },
    getLastDayOfMonth(year, month) {
      let lastDayCurrentMonth = new Date(year, month + 1, 0)
      return lastDayCurrentMonth.getDate()
    },
    dateFormat() {
      const fromYear = 1911 + parseInt(this.selectedDateRange.from.year);
      const fromMonth = String(this.selectedDateRange.from.month);
      const toYear = 1911 + parseInt(this.selectedDateRange.to.year);
      const toMonth = String(this.selectedDateRange.to.month);
      let lastDate = this.getLastDayOfMonth(
        toYear,
        toMonth-1
      )

      return `${fromYear}${fromMonth.padStart(2, "0")}01-${toYear}${toMonth.padStart(2, "0")}${lastDate}`;
    },
    includesAll(arr, values) {
      return values.every(v => arr.includes(v))
    },
    selectAllChanged() {
      if (this.selectAllCourts) {
        this.selectedCourts = this.courtTypeOptions.map(option => option.name);
      } else {
        this.selectedCourts = [];
      }
    },
    selectSupremeCourtsChanged() {
      this.updateSelection(this.selectSupremeCourts, this.supremeCourtValues)
    },
    selectDistrictCourtsChanged() {
      this.updateSelection(this.selectDistrictCourts, this.districtCourtValues)
    },
    updateSelection(isSelected, courtValues) {
      if (isSelected) {
        this.selectedCourts = [...new Set([...this.selectedCourts, ...courtValues])]
      } else {
        this.selectedCourts = this.selectedCourts.filter(name => !courtValues.includes(name))
      }
    },
    initializeCourt() {
      this.supremeCourtValues = this.courtTypeOptions
        .filter(option => option.name.includes('高等法院'))
        .map(option => option.name)

      this.districtCourtValues = this.courtTypeOptions
        .filter(option => option.name.includes('地方法院'))
        .map(option => option.name)
    },
    initializeForm(){
      this.formData.court_type = this.courtTypeOptions.map(option => option.name).join(' ')
    },
    onSubmit() {
      // TODO: Implement your submission logic here
      console.log('Submitted', this.formData)
    },
    showBootstrapWarning() {
      this.showErrorAlert = true
      setTimeout(() => {
        this.showErrorAlert = false;
      }, 5000);
    },
    advanceSearch() {
      let queryParams = {}

      // Add courtType and refereeDate to queryParams
      this.formData.court_type = this.selectedCourts.join(' ')
      this.formData.refereeDate = this.dateFormat()
      queryParams.court_type = this.formData.court_type
      queryParams.jud_date = this.formData.refereeDate

      // Loop through searchFields and add to queryParams
      this.formData.searchFields.forEach((field) => {
        queryParams[field.name] = field.query
      });

      if(this.selectedSearchType != '') {
        queryParams[this.selectedSearchType] = this.poolOptions[this.selectedSearchType].query
      }
      
      // Use Vue Router to navigate with constructed query parameters
      this.$router.push({ path: '/search-result', query: queryParams })
    },
  },
}
</script>


<style>
.smartphone-message {
  display: none;
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  text-align: center;
}
.select-court-container {
  height: 50vh;
  overflow:scroll;
}
.form-check-input {
  width: 20px !important;
  height: 20px !important;
  border-radius: 24px !important;
  line-height: 40px;
}
.form-check-container {
  margin: 5px 0;
}
.form-check-label {
  width: 250px;
  text-align: center;
  cursor: pointer;
}
.form-instruction {
  text-align: left;
  color: #707070;
  font-size: 0.9em;
  margin: 5px 0;
  line-height: 1.5em;
}

.custom-brightblue{
  padding: 20px !important;
  background-color: #0d99ff !important;
  border-color: #0a7acc !important;
}

.custom-brightblue:hover {
  background-color: #24a2fb !important;
}

.custom-purlpe {
  padding: 10px 20px !important;
  background-color: #9747FF !important;
  border-color: #9747FF !important;
}
.custom-purlpe:hover {
  background-color: #a05df7 !important;
}
.custom-light-purple {
  background-color: #F9F5F9 !important;
}

.pointer {
  cursor: pointer;
}

.flex-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.flex-row {
  display: flex;
  flex-wrap: wrap;
}

.flex-column {
  flex: 1;
  line-height: 30px;
  padding: 10px 30px;
}
.header .flex-column {
  font-weight: bold;
  background-color: #000;
  color: #fff;
}

.form-control {
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
}

.radio-group {
  display: flex;
  flex-direction: column;
}

.form-check-label {
  margin-left: 10px;
  text-align: left;
}
.search-btn-container {
  float: right;
  padding: 30px 20px;
}
@media (max-width: 768px) {
  .smartphone-message {
    display: block;
  }
  .select-court-container {
    height: 4rem;
  }
  .flex-column {
    padding: 10px 20px;
    flex-wrap: wrap;
    min-width: 200px;
  }

}

@media (max-width: 768px) {
  .flex-row {
    flex-direction: column;
  }
}

.dp__input {
  border: none !important;
  background-color: #fff0 !important;
}

.check-court-container {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  margin-bottom: 10px;
}

.hidden-checkbox {
  position: absolute;
  left: -9999px; /* Move it off-screen */
}

.checkbox-label {
  display: inline-block;
  padding: 5px 10px;
  background-color: white;
  border: 1px solid #454545; /* Optional: to visually denote clickable area */
  cursor: pointer;
  border-radius: 2px;
}

.hidden-checkbox:checked + .checkbox-label {
  background-color: black;
  color: white;
}
</style>
