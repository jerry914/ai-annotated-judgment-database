<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Left column for form inputs -->
      <div class="col-md-6">
        <div class="fw-bolder my-1 py-1">進階搜尋條件</div>
        <form @submit.prevent="onSubmit">
          <!-- Case type input -->
          <div>案件類型：刑事</div>
          <!-- Court type select -->
          <div class="form-group">
            <div>法院別 
              <span class="text-decoration-underline pointer" @click="showModal = true">{{ formData.courtType }}</span>
              <span v-if="formData.courtType == ''" class="text-decoration-underline pointer" @click="showModal = true"><i class="fa-solid fa-plus"></i></span>
            </div>
            
            <div v-if="showModal" class="modal" tabindex="-1" role="dialog" style="display: block;">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Select Options</h5>
                  </div>
                  <div class="modal-body">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="isSelectedAllCourts" @change="isSelectedAllCourts?selectedCourtsAll():cancelCourtsAll()">
                      <label class="form-check-label">全選</label>
                    </div>
                    <div class="form-check" v-for="(item, index) in courtTypeOptions" :key="index">
                      <input class="form-check-input" type="checkbox" :value="item.name" v-model="selectedCourts" @change="changeSelected">
                      <label class="form-check-label">{{ item.name }}</label>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                    <button type="button" class="btn btn-primary" @click="submitSelection">Save changes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Referee date input -->
          <div class="form-group">
            <label for="referee-date">裁判日期</label>
            <VueDatePicker class="date-picker-input" v-model="selectedDateRange" range :enable-time-picker="false" :format="dateFormat"/>
          </div>
        </form>
      </div>

      <!-- Right column for search bar -->
      <div class="col-md-6">
        <div class="form-group">
          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="範例：相當於全文搜尋(任何關鍵字皆可）" aria-label="Search Query" aria-describedby="button-search" v-model="searchQuery">
            <button class="btn btn-primary custom-brightblue" type="button" id="button-search" @click="globalSearch">闢鰎字一鍵搜尋</button>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12 p-0 border rounded-3" style="overflow: hidden;">
        <table class="table table-bordered custom-adjust-table">
          <thead class="text-center">
            <tr>
              <th class="py-3">類型</th>
              <th class="py-3">搜尋與否(請勾選)</th>
              <th class="py-3">範圍</th>
              <th class="py-3">搜尋範例</th>
              <th class="py-3 custom-light-purple">請輸入搜尋條件</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(field, index) in formData.searchFields" :key="index">
              <td class="text-center py-3">{{ field.type }}</td>
              <td class="text-center py-3"><input type="checkbox" v-model="field.isSearch"></td>
              <td class="p-3">{{ field.range }}</td>
              <td class="p-3">{{ field.example }}</td>
              <td class="custom-light-purple"><input type="text" class="form-control custom-light-purple" v-model="field.query"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="showErrorAlert" class="alert alert-danger mt-2" role="alert">
      無法同時選擇一項以上的涵攝，見解，或心證，請修改後送出。
    </div>
    <div class="d-flex flex-row-reverse my-4">
      <button class="btn btn-secondary d-inline-flex custom-purlpe" @click="advanceSearch">進階搜尋條件送出</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'SearchForm',
  components: {
  },
  data() {
    return {
      formData: {
        courtType: '',
        refereeDate: '',
        searchFields: [
          {type: '裁判資訊', isSearch: false, range: '案件別', name:'case_kind', example: '詐欺', query: ''},
          {type: '', isSearch: false, range: '全文搜尋', name:'full_jud', example: '（任何關鍵字皆可）', query: ''},
          {type: '基本資料', isSearch: false, range: '法官', name:'judger', example: '王敏慧', query: ''},
          {type: '', isSearch: false, range: '辯護人(律師)', name:'defentdent', example: '李志聖', query: ''},
          {type: '', isSearch: false, range: '被告', name:'sued', example: '蔡孟男', query: ''},
          {type: '裁判內文', isSearch: false, range: '涵攝', name:'sentence', example: '', query: ''},
          {type: '', isSearch: false, range: '見解', name:'sentence', example: '', query: ''},
          {type: '', isSearch: false, range: '心證', name:'sentence', example: '', query: ''}
        ],
      },
      searchQuery: '',
      courtTypeOptions: [
        { name: '最高法院', value: 'a' },
        { name: '臺灣高等法院', value: 'b' },
        { name: '臺灣高等法院臺中分院', value: 'c' },
        { name: '臺灣高等法院臺南分院', value: 'd' },
        { name: '臺灣高等法院高雄分院', value: 'e' },
        { name: '臺灣高等法院花蓮分院', value: 'f' },
        { name: '福建高等法院金門分院', value: 'g' }
      ],
      showModal: false,
      isSelectedAllCourts: true,
      selectedCourts: [],
      selectedDateRange: [],
      showErrorAlert: false
    };
  },
  mounted() {
    this.initializeForm()
  },
  methods: {
    formatPart(value) {
      return String(value).padStart(2, '0')
    },
    dateFormat(date) {
      if (!date[0]) {
        return
      }

      const start_day = this.formatPart(date[0].getDate())
      const start_month = this.formatPart(date[0].getMonth() + 1)
      const start_year = date[0].getFullYear()

      let formattedDate = `起${start_year}-${start_month}-${start_day}`

      if (date[1]) {
        const end_day = this.formatPart(date[1].getDate())
        const end_month = this.formatPart(date[1].getMonth() + 1)
        const end_year = date[1].getFullYear()

        formattedDate += `－迄${end_year}-${end_month}-${end_day}`
        this.formData.refereeDate = `${start_year}${start_month}${start_day}-${end_year}${end_month}${end_day}`
      } else {
        this.formData.refereeDate = `${start_year}${start_month}${start_day}`
      }

      return formattedDate
  },
    submitSelection() {
      console.log('Selected Items:', this.selectedCourts)
      this.formData.courtType = this.selectedCourts.join(', ')
      this.showModal = false
    },
    changeSelected() {
      if(this.selectedCourts.length != this.courtTypeOptions.map(option => option.name).length) {
        this.isSelectedAllCourts = false
      }
      else {
        this.isSelectedAllCourts = true
      }
    },
    selectedCourtsAll() {
      this.selectedCourts = this.courtTypeOptions.map(option => option.name)
    },
    cancelCourtsAll() {
      this.selectedCourts = []
    },
    initializeForm(){
      this.formData.courtType = this.courtTypeOptions.map(option => option.name).join(', ')
      this.selectedCourtsAll()
    },
    onSubmit() {
      // TODO: Implement your submission logic here
      console.log('Submitted', this.formData)
    },
    showBootstrapWarning() {
      this.showErrorAlert = true
      // Optionally, set a timeout to hide the alert after a few seconds
      setTimeout(() => {
        this.showErrorAlert = false;
      }, 5000);
    },
    advanceSearch() {
      console.log('Submitted', this.formData)
      let queryParams = {}
      
      let sentenceKinds = ['涵攝', '見解', '心證']
      let selectedSentenceKinds = []

      // Add courtType and refereeDate to queryParams
      queryParams.courtType = this.formData.courtType
      queryParams.refereeDate = this.formData.refereeDate

      // Loop through searchFields and add to queryParams if isSearch is true
      this.formData.searchFields.forEach((field) => {
        if (field.isSearch) {
          if (sentenceKinds.includes(field.range)) {
            selectedSentenceKinds.push(field.range)
            queryParams['sentence_kind'] = field.range
          }
          queryParams[field.name] = field.query
        }
      });

      // Check if more than one sentence kind are selected
      if (selectedSentenceKinds.length > 1) {
        // Show Bootstrap warning
        this.showBootstrapWarning()
        return
      }

      // Use Vue Router to navigate with constructed query parameters
      this.$router.push({ path: '/search-result', query: queryParams })
    },
    globalSearch() {
      // TODO: Implement your global search logic here
      console.log('Search Keyword', this.searchQuery)
      let queryParams = {}
      queryParams.courtType = this.formData.courtType
      queryParams.refereeDate = this.formData.refereeDate
      queryParams.searchQuery = this.searchQuery

      this.$router.push({ path: '/search-result', query: queryParams })
    },
  },
}
</script>


<style>
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

.dp__main {
  box-sizing: none;
  position: relative;
  width: 60% !important;
  display: inline-block !important;
}
.table {
  margin: -1px 0px !important;
  padding: 0px -1px !important;
}
.dp__input {
  border: none !important;
  background-color: #fff0 !important;
}
</style>
