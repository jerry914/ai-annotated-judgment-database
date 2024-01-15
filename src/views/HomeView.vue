<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Left column for form inputs -->
      <div class="col-md-12">
        <div class="fw-bolder my-1 py-1">進階搜尋條件</div>
        <form @submit.prevent="onSubmit">
          <!-- Case type input -->
          <!-- Court type select -->
          <div class="form-group">
            <div>法院別 
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="isSelectedAllCourts" @change="isSelectedAllCourts?selectedCourtsAll():cancelCourtsAll()">
                <label class="form-check-label">全選</label>
              </div>
              <div class="form-check form-check-inline" v-for="(item, index) in courtTypeOptions" :key="index">
                <input class="form-check-input" type="checkbox" :value="item.name" v-model="selectedCourts" @change="changeSelected">
                <label class="form-check-label">{{ item.name }}</label>
              </div>
            </div>
          </div>

          <!-- Referee date input -->
          <div class="form-group">
            <label for="referee-date">裁判日期</label>
            <br>
            <span class="p-2">起</span>
            <span>民國</span>
            <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.from.year">
              <option v-for="year in getSelectableYears()" :value="year" :key="year">{{ year }}</option>
            </select>
            <span>年</span>
            <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.from.month">
              <option v-for="month in 12" :value="month" :key="month">{{month }}</option>
            </select>
            <span>月</span>
            <span class="p-2">迄</span>
            <span>民國</span>
            <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.to.year">
              <option v-for="year in getSelectableYears()" :value="year" :key="year">{{ year }}</option>
            </select>
            <span>年</span>
            <select class="form-select form-select-sm" style="width: fit-content;display: inline;" v-model="selectedDateRange.to.month">
              <option v-for="month in 12" :value="month" :key="month">{{month }}</option>
            </select>
            <span>月</span>
          </div>
        </form>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12 p-0 border rounded-3" style="overflow: hidden;">
        <table class="table table-bordered custom-adjust-table">
          <thead class="text-center">
            <tr>
              <th>搜尋類型</th>
              <th class="custom-light-purple">請輸入搜尋條件</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(field, index) in formData.searchFields" :key="index">
              <td class="text-center" style="line-height: 35px;">{{ field.type }}</td>
              <td class="custom-light-purple"><input type="text" class="form-control custom-light-purple" v-model="field.query" :placeholder="field.example"></td>
            </tr>
            <tr>
              <td>
                <div class="form-check mx-auto" style="width: fit-content;" v-for="option in poolOptions" :key="option.query">
                  <input class="form-check-input" type="radio" name="flexRadio" :id="option.query" v-model="poolKeyword.query" :value="option.query">
                  <label class="form-check-label" :for="option.query">
                    {{ option.type }}
                  </label>
                </div>
              </td>
              <td class="custom-light-purple"><textarea class="form-control custom-light-purple" style="height: 150px" v-model="poolKeyword.keyword" :placeholder="poolOptions[poolKeyword.query].example" /></td>
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
          {type: '案件別', name:'case_kind', example: '詐欺', query: ''},
          {type: '法官（全名）', name:'judger', example: '王敏慧', query: ''},
          {type: '辯護人（全名）', name:'defentdent', example: '李志聖', query: ''},
          {type: '檢察官（全名）', name:'prosecutor', example: '蔡孟男', query: ''},
        ],
      },
      poolOptions: {
        sub: {type: '涵攝', query: 'sub', example: '二、按汽車行駛至交岔路口，其行進、轉彎，應依下列規定：一、應遵守燈光號誌或交通指揮人員之指揮，遇有交通指揮人員指揮與燈光號誌並用時，以交通指揮人員之指揮為準；駕駛人駕駛汽車，除應遵守道路交通標誌、標線、號誌之指示；閃光紅燈表示『停車再開』，車輛應減速接近，先停止於交差岔路口前，讓幹到車優先通行後認為安全時，方得續行；閃光黃燈表示『警告』，車輛應減速接近，注意安全，小心通過，道路交通安全規則第102條第1項第1款、第90條第1項、道路交通標誌標線號誌設置規則第211條第1項第2款、第1款分別訂有明文。查被告2人分別為領有職業大貨車、職業小貨車駕駛執照駕駛車輛使用道路之人，對此自應知悉，且依上開道路交通事故調查報告表（一）、（二）、現場及雙方車損照片42張所示，案發當時天候為晴天，夜間有照明（原調查報告表（一）⑥光線誤勾選為1日間自然光線，應予更正），路面乾燥無缺陷無障礙物、視距良好、多岔路路口閃光號誌、號誌正常、無分向設施、未繪設車道線、未繪設快慢車道分隔線、係路口交岔撞等情，客觀上並無不能注意之情事，被告2人於案發時地駕駛車輛，疏未注意車前狀況，未能暫停再開，以採取必要之安全措施，進而發生本件碰撞事故，所為確有違反前開道路交通安全規則所定之過失甚明。且本件經送請臺中市車輛行車事故鑑定委員會鑑定結果，亦認為被告陳伯宇駕駛計程車，行至設有閃光橫紅燈號誌交岔路口，支線道車未暫停讓幹線道車先行，為肇事主因；賴俊卿駕駛計程車，行經設有閃光黃燈號誌交岔路口，疏未減速接近、注意安全、小心通過，為肇事次因，有鑑定意見書可參（見偵卷第127至132頁），對此鑑定意見，檢察官、被告2人亦均表示沒有意見（見本院卷第54頁），益徵被告2人於案發當時駕駛車輛行駛至柳川西路1段與三民西路交岔路口時，確實有過失等情，至為昭然。綜上所述，堪認被告2人過失行為與告訴人之傷害結果間具有相當因果關係，本件事證明確，被告業務過失傷害之犯行洵堪認定，應予依法論科'},
        op: {type: '見解', query: 'op', example: '因此，當事人同意或依法視為同意某項傳聞證據作為證據使用者，實質上即表示有反對詰問權之當事人已捨棄其權利，如法院認為適當者，不論該傳聞證據是否具備刑事訴訟法第159條之1至第159條之4所定情形，均容許作為證據；換言之，當事人捨棄對原陳述人行使反對詰問權者，如法院認為適當，即容許該傳聞證據作為證據，不以未具備刑事訴訟法第159條之1至第159條之4所定情形為前提（最高法院97年度臺上字第6162號判決意旨參照）'},
        ft:  {type: '心證', query: 'ft', example: '二、認定犯罪事實所憑之證據及理由：一上開犯罪事實，業據被告於本院準備程序及審理中坦承不諱，且其於前揭時、地為警查獲後經採尿送驗結果，確呈嗎啡、可待因、甲基安非他命、安非他命陽性反應，有勘察採證同意書、臺中市政府警察局第四分局偵辦毒品案件尿液檢體對照表及詮昕科技股份有限公司濫用藥物尿液檢驗報告各1紙在卷可稽（見偵卷第18、34-35頁），被告之自白與事實相符，堪予採信。至起訴書犯罪事實欄固載被告係於不同時間分別施用第一級毒品海洛因及第二級毒品甲基安非他命，惟被告於警詢僅供陳施用海洛因（見偵卷第23頁），偵查中經傳喚未到庭，在本院準備程序及審理時方陳明係同時施用第一級毒品海洛因及第二級毒品甲基安非他命，被告於本院所供，核與其他卷內證據並無扞格，因乏確切證據足認被告係於不同時間分別施用該2毒品，則依有疑唯利被告之原則，被告於本院所供尚堪採信，起訴意旨容有未洽。從而，本件事證明確，被告犯行洵堪認定，應予依法論科'}
      },
      poolKeyword: {
        name: 'pool', query: 'op', keyword: ''
      },
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
      selectedDateRange: {
        from: {
          year: '107',
          month: '1'
        },
        to: {
          year: '111',
          month: '12'
        },
      },
      showErrorAlert: false
    };
  },
  mounted() {
    this.initializeForm()
  },
  methods: {
    getSelectableYears() {
      return new Date().getFullYear() - 1911
    },
    formatPart(value) {
      return String(value).padStart(2, '0')
    },
    dateFormat() {
      const fromYear = this.selectedDateRange.from.year;
      const fromMonth = this.selectedDateRange.from.month;
      const toYear = this.selectedDateRange.to.year;
      const toMonth = this.selectedDateRange.to.month;

      return `${fromYear}/${fromMonth}-${toYear}/${toMonth}`;
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

      // Add courtType and refereeDate to queryParams
      this.formData.courtType = this.selectedCourts.join(', ')
      this.formData.refereeDate = this.dateFormat()
      queryParams.courtType = this.formData.courtType
      queryParams.refereeDate = this.formData.refereeDate

      // Loop through searchFields and add to queryParams
      this.formData.searchFields.forEach((field) => {
        queryParams[field.name] = field.query
      });

      queryParams['pool'] = this.poolKeyword.query
      queryParams['keyword'] = this.poolKeyword.keyword

      // Use Vue Router to navigate with constructed query parameters
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
.table td {
  padding: 5px 5px !important;
  height: fit-content;
}
.dp__input {
  border: none !important;
  background-color: #fff0 !important;
}
</style>
