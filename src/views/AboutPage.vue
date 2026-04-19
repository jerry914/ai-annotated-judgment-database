<template>
  <div class="page-container">
    <h2 class="page-title">使用說明與技術簡介</h2>

    <section class="content-section">
      <h3 class="section-title">一、使用方式</h3>
      <ol class="content-list">
        <li>先於首頁左側欄位點選所需要查詢的判決書範圍，包括法院與日期。</li>
        <li>於右側欄位中選擇要查詢的資料類別(如案件別、當事人基本資料、主文、全文、還是法官的見解、心證或涵攝文字(三選一))，並輸入關鍵字。</li>
        <li>輸入完按右下方「開始搜尋」鍵。</li>
        <li>結果呈現的欄位會依搜尋的內容呈現相關的判決書或資料，依照日期由新往舊排列。見解、心證或涵攝文字超過150字的部分會以「…」截斷。游標移至該文字上方即可出現該段全文。</li>
        <li>若要進一步查詢判決書原文，可由案號的超連結點入司法院的裁判書系統直接閱讀該篇判決。</li>
      </ol>
    </section>

    <section class="content-section">
      <h3 class="section-title">二、案件別與當事人基本資料的定義</h3>
      <p>本系統中的「案件別」是來自緊鄰判決書主文之前的那段文字，是關於此案件的分類方式。由於目前所知此分類方式尚無完全統一的格式，所以此處僅依所擷取到的判決書文字來做搜尋的對象，不能排除可能有所遺漏或標示不足之處。以圖一為例，即為紅色框中的「傷害案件」。</p>
      <p>本系統所稱的基本資訊是指自判決書第一個字開始到理由項內文以上，通常包含案號、被告、辯護人、自訴人等等資料，如圖一紫色框的範圍。</p>
      <div :style="backgroundStyle" class="insert-img"></div>
    </section>

    <section class="content-section">
      <h3 class="section-title">三、見解、心證與涵攝的定義</h3>

      <h4 class="subsection-title">1. 見解資料的定義與價值</h4>
      <p>本系統中的見解資料定義為：「<strong>闡述與案件有關的法律抽象概念，或釐清二個以上抽象概念之間的關聯性之文字說明。</strong>」。見解資料的價值在於了解實務上法院對於特定法律概念的內涵或性質做進一步剖析，藉此可更了解法院對於特定概念文義背後的看法，一般而言亦可作為相關法學三段推論的大前提(見表一)。因此，若僅是闡述事實發生的順序、法條文字、特定形式的文字敘述，或其它無上述性質的文本均非本研究所指的見解資料。</p>
      <p>以下為一個典型的範例：</p>
      <p class="case-ref">最高法院,110,台上,1352號</p>
      <div class="quote-block">
        <p>「…前者學理上謂為意欲主義，後者謂為容認主義，但不論其為「明知」或「預見」，皆為故意犯主觀上之認識，只是認識程度強弱有別，行為人有此認識進而有「使其發生」或「任其發生」之意，則形成犯意，前者為確定故意（直接故意），後者為不確定故意（間接故意或未必故意），但不論其為確定故意或不確定故意，不確定故意應具備構成犯罪事實的認識，與確定故意並無不同…」</p>
      </div>

      <h4 class="subsection-title">2. 心證資料的定義與價值</h4>
      <p>本系統中的心證資料定義為：「<strong>對於具體主張或相關證據的取捨理由，並藉此形成事實認定或採信過程之文字說明</strong>」。心證資料的價值在於讓人民了解法院在遇到有雙方爭執的事項時，對於雙方對立的主張與證據法院如何論述何者證據價值較高，應採信何者的過程。一般而言，可以是惟法學三段推論的小前提(見表一)。因此，心證資料必須包含法院論述如何為證據取捨的說明。若僅是提及知悉來源，並無就雙方對立提出的證據與主張來說明如何採納，則該資料並非屬於本系統的心證資料。</p>
      <p>以下為一個典型的範例：</p>
      <p class="case-ref">士林地院,109,金訴,161號</p>
      <div class="quote-block">
        <p>「…㈢被告壬○○固辯稱：是幫甲○○替一位大陸地區人士收貨款，甲○○保證錢是乾淨的等語，然壬○○不知該大陸人士之身分，亦不知其收取金錢對象之實際身份，僅因替甲○○收取款項，即可取得每日2500至4000元之報酬云云（臺南市政府警察局歸仁分局刑案偵察卷第35至37頁、本院卷二第101、469頁），已與一般工作事務之情節有異，又被告壬○○於偵查中陳稱：曾替甲○○至臺北鶯歌、臺中、臺南、高雄等地收款等語（中檢109少連偵219卷第77至81頁），然甲○○之大陸客戶縱有不便親自收受貨款之情事，其請廠商使用網路、手機軟體為轉帳、匯款亦無困難，然竟捨此不用，反間接委託被告壬○○遠赴臺北、臺中、臺南、高雄等地取款，顯然無端浪費車資、人工費用等支出，與民間一般收取貨款之情形有違，實足啟人疑竇，況被告壬○○於本案前曾因出借帳戶予被告甲○○交予某名稱「費洋」之大陸地區人士作為收取貨款使用，因該帳戶涉嫌犯罪，而致被告壬○○帳戶遭銀行凍結乙情，業據被告壬○○自承在卷（109偵11976卷一第65頁），足認壬○○已知被告甲○○曾涉有隱匿犯罪金額流向之相關犯罪行為，被告壬○○僅憑被告甲○○片面所述，即認以為錢是乾淨的等語，顯難以採信…」</p>
      </div>

      <h4 class="subsection-title">3. 涵攝資料的定義與價值</h4>
      <p>本系統中的涵攝資料定義為：「<strong>認定或採信特定事實後，詳細說明該事實是否構成法律特定抽象概念的文字說明」。</strong>與心證資料不同的是，涵攝是事實認定或採信後(而並非如心證是討論是否應該採信該事實)，藉由預設的大前提來推導出其他抽象概念(通常可算做法學三段推論最後的結論，見表一)的過程。因此，若認定事實後僅說明構成何者要件，而無穿梭於事實與抽象概念之間的探討過程者，該資料即不屬於涵攝資料。涵攝資料的價值在於記載法院就已被認定的事實說明是否構成某個較抽象概念(如滿足某種構成要件)的過程。</p>
      <p>以下為一個典型的範例：</p>
      <p class="case-ref">士林地院,109,金訴,161</p>
      <div class="quote-block">
        <p>「…證據能力：一、關於違反組織犯罪防制條例之供述證據部分：按組織犯罪防制條例第12條第1項中段規定：「訊問證人之筆錄，以在檢察官或法官面前作成，並經踐行刑事訴訟法所定訊問證人之程序者為限，始得採為證據」，係以立法排除被告以外之人於警詢或檢察事務官調查中所為之陳述，得適用刑事訴訟法第159條之2、第159條之3及第159條之5之規定，是證人於警詢時之陳述，於違反組織犯罪條例案件，即絕對不具有證據能力，自不得採為判決基礎；而上開組織犯罪防制條例第12條第1項之規定，係排除一般證人於警詢陳述之證據能力之特別規定，然被告於警詢之陳述，對被告本身而言，則不在排除之列（最高法院97年度台上字第1727號、102年度台上字第2653號判決意旨參照）。準此，後述被告以外之人於警詢時之陳述，於被告違反組織犯罪防制條例部分，不具證據能力…」</p>
      </div>
    </section>

    <section class="content-section">
      <h3 class="section-title">表一：見解、心證與涵攝資料比較</h3>
      <div class="table-wrapper">
        <table class="editorial-table">
          <thead>
            <tr>
              <th class="col-label">資料類型</th>
              <th>見解資料</th>
              <th>心證資料</th>
              <th>涵攝資料</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-label">本系統的定義</td>
              <td>闡述與案件有關的法律抽象概念，或釐清二個以上抽象概念之間的關聯性之文字說明</td>
              <td>對於具體主張或相關證據的取捨理由，並藉此形成事實認定或採信過程之文字說明</td>
              <td>認定或採信特定事實後，詳細說明該事實是否構成法律特定抽象概念的文字說明</td>
            </tr>
            <tr>
              <td class="col-label">法學三段推論中的角色</td>
              <td>對大前提(抽象規範)的討論</td>
              <td>對小前提(具體事實)的認定過程</td>
              <td>說明認定的事實是否符合特定概念的理由。</td>
            </tr>
            <tr>
              <td class="col-label">舉例文字<br><span class="table-note">(以刑法第320條第一項竊盜罪為例)</span></td>
              <td>刑法規定竊盜為罪者其目的源自維持社會秩序，並以國家積極的作為來維護個人之財產權。然若因戰爭或其它相類似情形致國家存亡已繫於一線，無力維持社會秩序，迫使人民必須為竊盜行為來安排其生活秩序，雖不具緊急避難條文中的立即緊急性可阻卻犯罪，然其時空環境自與通常時期不同，此時已無期待不可犯罪之可能，刑事實體法未就此部分為區別待遇有違比例原則，應予排除。</td>
              <td>依桃花市光復路段23號監視影像可知，小芳於民國130年1月1日確實從小明口袋中取走魚罐頭，且觀察事件整體過程的影像均未有小芳與小明交涉的過程，雖小芳辯稱有向小明徵求同意，然陳述與前述影像相異，而物證因不具人的思想作用故而證明力較高，小芳所辯不足採納，應認小芳有在不告而取的事實。</td>
              <td>依前述說明可知小芳有不告而取魚罐頭的事實，應已構成竊盜行為。然該區域當時無執法人員，且對外交通因戰爭關係全數中斷，國家確實無力維持該時空地點的社會秩序，小芳為繼續生存而為竊取行為應已屬前述說明須予排除的情狀，小芳行為自不構成竊盜罪。</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="table-caption">表一：本系統中的見解、心證與涵攝資料間的比較，對照法學三段推論的不同階段與類似的文字舉例。</p>
    </section>

    <section class="content-section">
      <h3 class="section-title">四、資料來源與預處理</h3>
      <p>本系統的資料均來自司法院公開資訊平台提供的判決書(<a target="_blank" rel="noopener noreferrer" href="https://opendata.judicial.gov.tw/">司法院資料開放平臺</a>)。</p>
      <p>由於常見的心證與涵攝都包括相關的事實內容，文字較多集中於同一個段落，所以「<strong>涵攝資料段落」與「心證資料段落」</strong>從判決書理由部份以原始段落「。/n/r」作為分割符號。相較之下，見解文字通常不會包含事實認定或證據內容，因此本系統的「<strong>見解資料段落」</strong>是將判決書理由部份下的內文以句號為分割單位，即起始處到第一個句號為一筆資料，以此類推。</p>
      <p>本研究將上述分割完的資料隨機抽取數百筆，並由具有法學訓練背景的研究者人工方式做2分類的標註。目前人工標註的資料量共有752筆見解、500筆涵攝與500筆心證。</p>
    </section>

    <section class="content-section">
      <h3 class="section-title">五、AI模型訓練與搜尋</h3>
      <p>將上述的人工標註資料集送入大型語言模型來作微調(fine-tune)訓練。考慮計算所使用的時間與軟硬體資源，本研究目前是使用開源的生成式AI模型Chatglm2為主，但未來不排除使用其他的大型語言模型作比較與更新。目前評估判斷的準確性達80%以上。</p>
      <p>此處需要注意的是，同一模型僅就一性質的資料進行標註。因此上述三種資料集的定義會由3個不同的模型（見解模型、心證模型、涵攝模型）來對未標註的文本進行上開AI自動標註，也就是分類預測。</p>
      <p>因篇幅的緣故，本系統所使用的AI模型的訓練、微調與測試結果，將另行發表於資工領域的期刊或會議，此處暫時不多說明。未來不排除繼續於此處補充相關資訊。</p>
    </section>

    <section class="content-section">
      <h3 class="section-title">附註：判決書中標註位置說明</h3>
      <p>節錄於臺灣臺中地方法院刑事判決112年度訴字第507號判決。<span class="hl-green">綠色螢光底是「心證資料」</span>、<span class="hl-yellow">黃色底為「見解資料」</span>，<span class="hl-blue">藍色底為「涵攝資料」</span>，其餘的不預設會被AI識別成任一種類資料則無底色呈現。</p>
      <div class="quote-block">
        <p>…（一）、觀諸證人甲○○於消防局談話中證稱：被告因為躁鬱症領有重大傷病卡及殘障手冊，需定期服用藥物治療，若未服藥，病情就會發作，情緒會變得易怒、暴躁、毀壞物品。110年12月初，被告開始躲著我，我在家，她就不會在家，當時應該已經發病，我有勸她去看醫生，但她不聽，跑出去躲著我。我最後一次看到被告是000年00月00日下午，當時她的情緒已經很暴躁，我有勸她去看醫生，但她叫我不要說話，我就離開等語（見偵卷第37-39頁）…<span class="hl-green">（二）又臺中市政府消防局火災原因調查鑑定書所載：火災調查人員蒐證採樣起火處附近燒損殘餘物，經火災證物鑑定實驗室鑑析，鑑定結果檢出輕質含氧溶劑類易燃液體成分（如乙醇），且本案住宅客廳桌上東北側遺留酒精1瓶等內容（見偵卷第27、23頁），核與現場照片顯示本案住宅客廳起火點附近桌上有1瓶未經受燒之酒精（見偵卷第73頁）乙節相符。由此可見，被告應有在回收紙箱淋上酒精助燃。是辯護人辯護稱被告未使用助燃物乙情，難認屬實，尚無可採。…</span></p>
        <p>…<span class="hl-yellow">按刑法第173條第1項放火燒燬現供人使用之住宅或現有人所在之建築物罪，自係指供人居住之住宅或現有人所在之建築物之整體而言，應包括墻垣及其內所有設備、傢俱等一切物品。故一個放火行為，若同時燒燬住宅、建築物與其內之所有物品，無論該其他物品為他人或自己所有，與同時燒燬數犯罪客體之情形不同，均不另成立刑法第175條第1項或第2項放火燒燬住宅、建築物以外之他人或自己所有物罪（最高法院83年度台上字第2253號判決意旨參照）。又刑法第173條第1項之放火行為，係指已實施點燃引火之媒介物，足以導致目的物之燃燒而言，如已實施放火行為，而未使建築物達到喪失效用之燒燬程度者，即屬放火未遂。</span></p>
        <p><span class="hl-blue">經查，被告僅有一放火行為，雖同時致本案住宅有前述天花板、牆面、磁磚及其他物品燒損之情形，然未使本案住宅達到喪失效用之燒燬程度，故屬放火未遂，且僅成立刑法第173條第3項、第1項之放火燒燬現供人使用之住宅未遂之單純一罪，不另構成刑法第175條第1項或第2項之放火燒燬住宅、建築物以外之他人或自己所有物罪。是核被告所為，係犯刑法第173條第3項、第1項之放火燒燬現供人使用之住宅未遂罪。</span>公訴意旨認被告亦構成刑法第175條第1項、第2項之罪，並與上開放火燒燬現供人使用之住宅未遂罪間，具有想像競合關係等節，容有誤會，附此說明。…</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  computed: {
    backgroundStyle() {
      const imagePath = require('@/assets/info_1.jpg');
      return { backgroundImage: `url(${imagePath})` };
    }
  }
}
</script>

<style scoped>
.page-container { max-width: 900px; margin: 0 auto; padding: 2.5rem 2rem 4rem; }

.content-section { margin-bottom: var(--spacing-section); }
.section-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  color: var(--color-primary);
}
.subsection-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.75rem 0 0.75rem;
  color: var(--color-primary);
}

p {
  font-size: 1rem;
  line-height: 1.9;
  margin: 0 0 1rem;
  color: #333;
}

.content-list { padding-left: 1.5rem; margin: 0 0 1rem; }
.content-list li {
  font-size: 1rem;
  line-height: 1.9;
  margin-bottom: 0.5rem;
}

.case-ref {
  font-size: 0.9rem;
  color: var(--color-muted);
  font-weight: 500;
}

.quote-block {
  background: var(--color-surface);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 var(--radius-default) var(--radius-default) 0;
  padding: 1.25rem 1.5rem;
  margin: 1rem 0 1.5rem;
  box-shadow: var(--shadow-soft);
  font-size: 0.95rem;
  line-height: 1.85;
}
.quote-block p { margin: 0 0 0.75rem; }
.quote-block p:last-child { margin: 0; }

.insert-img {
  width: 100%;
  max-width: 600px;
  height: 356px;
  background-size: contain;
  background-repeat: no-repeat;
  margin: 1.5rem auto;
}

/* Table */
.table-wrapper { overflow-x: auto; margin: 1rem 0; }
.editorial-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  line-height: 1.7;
}
.editorial-table th, .editorial-table td {
  padding: 1rem;
  text-align: left;
  vertical-align: top;
  border: 1px solid rgba(0,0,0,0.08);
}
.editorial-table th {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  text-align: center;
}
.col-label {
  background: rgba(0,0,0,0.03);
  font-weight: 600;
  min-width: 120px;
}
.table-note { font-size: 0.8rem; color: var(--color-muted); font-weight: 400; }
.table-caption { font-size: 0.85rem; color: var(--color-muted); margin-top: 0.5rem; }

/* Highlights */
.hl-green { background-color: #c8f7c5; padding: 2px 4px; border-radius: 3px; }
.hl-yellow { background-color: #fff3b0; padding: 2px 4px; border-radius: 3px; }
.hl-blue { background-color: #b8dff7; padding: 2px 4px; border-radius: 3px; }

@media (max-width: 768px) {
  .page-container { padding: 1.5rem 1rem; }
  .insert-img { height: calc(95vw / 1.4); }
}
</style>
