<template>
  <div class="chat-container">
    <div class="split-container" ref="splitContainer">
      <!-- Left: Chat Section -->
      <div class="chat-panel" :style="{ width: chatWidth + '%' }">
        <div class="chat-header">
          <h4>AI裁判書助手</h4>
          <div class="chat-toolbar">
            <el-tooltip content="重新開始對話" placement="bottom">
              <button class="icon-btn" @click="restartChat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 13.5C19 17.6421 15.6421 21 11.5 21C7.35786 21 4 17.6421 4 13.5C4 9.35786 7.35786 6 11.5 6H20M20 6L17 3M20 6L17 9" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </button>
            </el-tooltip>
            <el-tooltip content="顯示/隱藏說明" placement="bottom">
              <button class="icon-btn" @click="toggleIntro">
                <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#fff" stroke-width="2" fill="none"/><text x="12" y="17" text-anchor="middle" font-size="14" fill="#fff">i</text></svg>
              </button>
            </el-tooltip>
            <el-tooltip content="下載對話紀錄 PDF" placement="bottom">
              <button class="icon-btn" @click="downloadChatHistory">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="17" width="16" height="4" rx="2" fill="#fff"/></svg>
              </button>
            </el-tooltip>
          </div>
        </div>
        <div class="chat-interface">
          <div class="conversation-container" ref="conversationContainer">
            <div 
              v-for="(message, index) in conversation" 
              :key="index" 
              :class="['message', message.type]"
            >
              <div class="message-content">
                <div class="message-text markdown-content" v-html="formatMessage(message.content)"></div>
                
                <!-- Keywords Options (Checkboxes) -->
                <div v-if="message.options && message.options.option_type === 'keywords_options'" class="message-options">
                  <div class="keywords-container">
                    <div class="keywords-list">
                      <label 
                        v-for="button in message.options.buttons" 
                        :key="button.value"
                        class="keyword-checkbox"
                        :class="{ selected: selectedKeywords.includes(button.value) }"
                      >
                        <input 
                          type="checkbox" 
                          :value="button.value"
                          v-model="selectedKeywords"
                        >
                        <div class="custom-checkbox"></div>
                        <span class="checkbox-label">{{ button.label }}</span>
                      </label>
                    </div>
                    
                    <!-- Custom Keyword Input -->
                    <input 
                          v-model="customKeyword"
                          placeholder="(若需要請補充其他關鍵字，以逗號分隔)"
                          class="keyword-input"
                          ref="customKeywordInput"
                    />
                    <div style="height: 16px;"></div>
                    <!-- Action Buttons -->
                    <div class="keywords-actions">
                      <button @click="confirmKeywords" class="confirm-button" :disabled="selectedKeywords.length === 0">
                        已確認
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Regular Options (Buttons) -->
                <div v-else-if="message.options && message.options.buttons" class="message-options">
                  <!-- Session download button: only show for last bot message in a session -->
                  <div style="width: 100%;" v-if="isLastBotMessageInSession(index)">
                      <button
                        class="option-button"
                        style="margin-bottom: 8px; border: 1px solid #ea7a66; background: #ea7a66; color: white;"
                        @click="downloadSession(getSessionIndexByMessage(index))"
                      >
                      下載此次紀錄
                    </button>
                  </div>
                  <button 
                    v-for="button in message.options.buttons" 
                    :key="button.value"
                    @click="handleOptionClick(button.value)"
                    class="option-button"
                    :disabled="loading"
                  >
                    {{ button.label }}
                  </button>
                </div>
              </div>
            </div>
            
            <div v-if="loading" class="message bot">
              <div class="message-content">
                <div class="loading-indicator">
                  <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>AI 正在思考中...</p>
                </div>
              </div>
            </div>
          </div>

          <div class="input-area">
            <div class="input-container">
              <textarea 
                v-model="userInput" 
                @keydown.enter.prevent="sendMessage"
                placeholder="請輸入您的問題..."
                class="message-input"
                :disabled="loading"
                rows="1"
              ></textarea>
              <button 
                @click="sendMessage" 
                class="send-button"
                :disabled="loading || !userInput.trim()"
              >
                <span v-if="!loading">發送</span>
                <span v-else>發送中...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Splitter -->
      <div class="splitter" @mousedown="startDrag"></div>
      <!-- Right: Introduction + Table -->
      <div class="info-table-panel" :style="{ width: (100 - chatWidth) + '%' }">
        <div v-show="showIntro" class="introduction-panel">
          <p>
            本系統是國立清華大學人文社會AI應用與發展研究中心為執行AI公共化相關計畫之成果展示，以司法院所公開的民刑事案件判決書為訓練資料，讓生成式AI模型自動標註出與該案件有關的文字。可以用對話方式或關鍵字搜尋進行檢索或見解討論。免費對外開放，提供法學研究者、司法實務工作者或一般民眾使用。<br><br>
            目前AI裁判書助手1.0版，主要功能有兩個: <br>
            (1) 事實搜尋：根據使用者輸入的案件事實描述，透過AI語意理解與關鍵字的搭配，精確的搜尋出裁判書資料庫中的類似案件；<br>
            (2) 見解討論：根據使用者輸入的法學見解，從裁判書資料庫中找尋類似或不同角度的見解，並可針對其內容作進一步討論。<br><br>
            目前的裁判書資料庫先以106-110年度的刑事案件為主，未來將更新案件年度並擴展到民事案件。
          </p>
        </div>
        <div v-if="currentDataTable && currentDataTable.length > 0" class="data-table-container">
          <div class="table-header">
            <h3>相關判決書搜尋結果</h3>
            <div class="index-buttons" style="margin: 8px 0; display: flex; flex-wrap: wrap; gap: 6px;">
              <template v-for="(btn, btnIdx) in getVisibleIndexButtons(currentIndexBtn, currentDataTable.length)" :key="'index-btn-' + btn + '-' + btnIdx">
                <button
                  v-if="btn !== 'ellipsis1' && btn !== 'ellipsis2'"
                  @click="scrollToRow(btn)"
                  class="index-btn"
                  :style="{ minWidth: '32px', height: '32px', borderRadius: '50%', border: '1px solid #667eea', background: '#fff', color: '#667eea', fontWeight: 'bold', cursor: 'pointer', outline: 'none', boxShadow: '0 1px 2px rgba(102,126,234,0.08)' }"
                  :class="{ active: currentIndexBtn === btn }"
                >
                  {{ btn + 1 }}
                </button>
                <span v-else class="index-ellipsis">…</span>
              </template>
            </div>
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <tbody>
                <tr v-for="(item, index) in currentDataTable" :key="index" :ref="'tableRow' + index">
                  <td class="case-cell">
                      <span class="case-cell-index">編號{{ index + 1 }} 案號：</span>
                      <span class="case-cell-content" v-html="item['案號']"></span>
                      <div class="case-cell-content-wrapper">
                          <div>【{{ selectedCategory }}內容】</div>
                          <div v-if="item[selectedCategory]">
                            <div
                              :ref="'truncatedContent' + index"
                              class="truncate-3-lines"
                              v-html="formatTableContent(item[selectedCategory])"
                            ></div>
                            <a
                              v-if="truncatedStates[index]"
                              href="#"
                              @click.prevent="openContentModal(item[selectedCategory])"
                              style="color: #667eea; cursor: pointer;"
                            >顯示全部</a>
                          </div>
                          <div v-else class="no-data">無{{ selectedCategory }}</div>
                      </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal for full content -->
  <div v-if="showContentModal" class="modal-overlay" @click.self="closeContentModal">
    <div class="modal-content">
      <button class="modal-close" @click="closeContentModal">關閉</button>
      <div v-html="formatTableContent(modalContent)"></div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { createAndOpenChatHistoryPdf } from '@/utils/pdfMake';
import { ElTooltip } from 'element-plus';

// const API_BASE_URL = 'https://uniformly-neutral-skunk.ngrok-free.app';
const API_BASE_URL = 'https://hssai-verdictdb.phys.nthu.edu.tw';

export default {
  name: 'ChatView',
  components: { ElTooltip },
  data() {
    return {
      conversation: [],
      userInput: '',
      loading: false,
      sessionId: null,
      currentDataTable: null,
      selectedKeywords: [],
      customKeyword: '',
      showCustomInput: false,
      currentKeywordsOptions: null,
      selectedCategory: null,
      showIntro: true,
      chatWidth: 50, // percent
      dragging: false,
      dragStartX: 0,
      dragStartWidth: 50,
      chatSessions: [{ messages: [], dataTable: null, category: null }], // Track all chat sessions, each is an object with messages and dataTable
      showContentModal: false, // Modal state for full content
      modalContent: '', // Content to show in modal
      truncatedStates: {}, // Track which rows are visually truncated
      currentIndexBtn: 0, // Track the current selected index for index-buttons
    }
  },
  mounted() {
    this.initializeSession();
    this.addWelcomeMessage();
    window.addEventListener('mousemove', this.onDrag);
    window.addEventListener('mouseup', this.stopDrag);
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
  },
  updated() {
    this.scrollToBottom();
  },
  watch: {
    conversation() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    currentDataTable(newVal) {
      if (Array.isArray(newVal)) {
        this.$nextTick(() => {
          newVal.forEach((item, idx) => {
            this.checkTruncation(idx);
          });
        });
      }
    }
  },
  methods: {
    async initializeSession() {
      try {
        const response = await fetch(`${API_BASE_URL}/init_session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          this.sessionId = data.session_id;
        } else {
          console.error('Failed to initialize session');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    },

    addWelcomeMessage() {
      let welcomeMsg = {
        type: 'bot',
        content: `您好，我是您的AI裁判書助手，可以透過自然語言的連續互動，協助您快速的解決關於法院裁判書內容的問題。<br>目前我有「類案事實搜尋」與「法院見解分析」兩大功能，請點擊以下的選項來開啟我們的討論吧！`,
        options: {
          option_type: 'category_options',
          buttons: [
            { value: '事實搜尋', label: '類案事實搜尋' },
            { value: '見解討論', label: '法院見解分析' }
          ]
        }
      };
      this.conversation.push(welcomeMsg);
      welcomeMsg.content = welcomeMsg.content.replace('<br>','');
      this.chatSessions[this.chatSessions.length - 1].messages.push(welcomeMsg);
      // Do not set category here, only after user selects
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.loading) return;
      const userMessage = this.userInput.trim();
      const userMsgObj = {
        type: 'user',
        content: userMessage
      };
      this.conversation.push(userMsgObj);
      this.chatSessions[this.chatSessions.length - 1].messages.push(userMsgObj);
      this.userInput = '';
      this.loading = true;
      try {
        await this.callChatAPI(userMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMsg = {
          type: 'bot',
          content: '抱歉，發生錯誤，請稍後再試。'
        };
        this.conversation.push(errorMsg);
        this.chatSessions[this.chatSessions.length - 1].messages.push(errorMsg);
      } finally {
        this.loading = false;
      }
    },

    async callChatAPI(message) {
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (this.sessionId) {
        headers['X-Session-ID'] = this.sessionId;
      }
      
      const response = await fetch(`${API_BASE_URL}/chat_state`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ text: message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '請求失敗');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let currentMessage = null;
      let accumulatedContent = '';

      let reading = true;
      let isChatEnd = false;
      while (reading) {
        const { done, value } = await reader.read();
        if (done) {
          reading = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            
            if (data.content) {
              // If it's a new response (check if it contains options or is a new conversation)
              if (!currentMessage || (data.options && data.options.buttons && data.options.buttons.length > 0)) {
                // Save previous message if exists
                if (currentMessage && accumulatedContent) {
                  currentMessage.content = accumulatedContent;
                }
                
                // Create new message
                currentMessage = {
                  type: 'bot',
                  content: data.content,
                  options: data.options,
                  is_chat_end: data.is_chat_end // Store is_chat_end on the message
                };
                this.conversation.push(currentMessage);
                this.chatSessions[this.chatSessions.length - 1].messages.push(currentMessage);
                accumulatedContent = data.content;
              } else {
                // Accumulate content
                accumulatedContent += data.content;
                currentMessage.content = accumulatedContent;
              }
            }

            if (data.options && data.options.buttons && data.options.buttons.length > 0) {
              currentMessage.options = data.options;
              // Handle keywords options
              if (data.options.option_type === 'keywords_options') {
                this.selectedKeywords = data.options.buttons.map(b => b.value); // select all by default
                this.currentKeywordsOptions = data.options;
              }
            }

            if (data.data_table?.length > 0) {
              this.currentDataTable = data.data_table;
              this.showIntro = false;
            }
            // Handle is_chat_end
            if (typeof data.is_chat_end !== 'undefined') {
              isChatEnd = data.is_chat_end;
              if (isChatEnd) {
                // Push current conversation as a session and start a new one
                if (this.conversation.length > 0) {
                  // Only push if not already pushed
                  if (this.chatSessions[this.chatSessions.length - 1].messages.length > 0) {
                    // Save currentDataTable and category to session
                    this.chatSessions[this.chatSessions.length - 1].dataTable = this.currentDataTable;
                    this.chatSessions[this.chatSessions.length - 1].category = this.selectedCategory;
                    // Start a new session object
                    this.chatSessions.push({ messages: [], dataTable: null, category: null });
                  }
                }
              }
            }
          } catch (e) {
            console.error('Error parsing JSON line:', line, e);
          }
        }
      }

      // Handle remaining buffer
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.content && currentMessage) {
            accumulatedContent += data.content;
            currentMessage.content = accumulatedContent;
          }
          // Handle is_chat_end in last buffer
          if (typeof data.is_chat_end !== 'undefined') {
            isChatEnd = data.is_chat_end;
            if (isChatEnd) {
              if (this.conversation.length > 0) {
                if (this.chatSessions[this.chatSessions.length - 1].messages.length > 0) {
                  this.chatSessions[this.chatSessions.length - 1].dataTable = this.currentDataTable;
                  this.chatSessions[this.chatSessions.length - 1].category = this.selectedCategory;
                  this.chatSessions.push({ messages: [], dataTable: null, category: null });
                }
              }
              // this.currentDataTable = null;
              this.selectedCategory = null;
            }
          }
        } catch (e) {
          console.error('Error parsing final buffer:', e);
        }
      }
    },

    handleOptionClick(value) {
      // Set selectedCategory based on the button value
      let selectedInput = '';
      if (value === '事實搜尋' || value === '我要作類案事實搜尋') {
        this.selectedCategory = '事實';
        selectedInput = '我要作類案事實搜尋'
        // clear currentDataTable
        // this.currentDataTable = null;
        // Set category for current session
        this.chatSessions[this.chatSessions.length - 1].category = '事實';
      } else if (value === '見解討論' || value === '我要作法院見解分析') {
        this.selectedCategory = '見解';
        selectedInput = '我要作法院見解分析'
        // clear currentDataTable
        // this.currentDataTable = null;
        // Set category for current session
        this.chatSessions[this.chatSessions.length - 1].category = '見解';
      }
      else {
        selectedInput = value;
      }
      
      this.userInput = selectedInput;
      this.sendMessage();
    },

    addCustomKeyword() {
      if (this.customKeyword.trim()) {
        const newKeyword = this.customKeyword.trim();
        
        // Add to options if not already present
        if (this.currentKeywordsOptions && !this.currentKeywordsOptions.buttons.find(b => b.value === newKeyword)) {
          this.currentKeywordsOptions.buttons.push({
            value: newKeyword,
            label: newKeyword
          });
        }
        
        // Add to selected keywords if not already selected
        if (!this.selectedKeywords.includes(newKeyword)) {
          this.selectedKeywords.push(newKeyword);
        }
        
        this.customKeyword = '';
        this.showCustomInput = false;
      }
    },

    selectAllKeywords() {
      if (this.currentKeywordsOptions) {
        this.selectedKeywords = this.currentKeywordsOptions.buttons.map(b => b.value);
      }
    },

    confirmKeywords() {
      if (this.selectedKeywords.length > 0) {
        let keywordString = this.selectedKeywords.join(',');
        if (this.customKeyword.trim()) {
          keywordString += `,${this.customKeyword.trim()}`;
        }
        this.handleOptionClick(keywordString);
      }
    },

    formatMessage(content) {
      if (!content) return '';
      return marked.parse(content);
    },

    formatTableContent(content) {
      if (!content) return '';
    //   return marked.parse(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
      return content;
},

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.conversationContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    toggleIntro() {
      this.showIntro = !this.showIntro;
    },
    startDrag(e) {
      this.dragging = true;
      this.dragStartX = e.clientX;
      this.dragStartWidth = this.chatWidth;
      document.body.style.cursor = 'col-resize';
    },
    onDrag(e) {
      if (!this.dragging) return;
      const container = this.$refs.splitContainer;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let percent = ((e.clientX - rect.left) / rect.width) * 100;
      percent = Math.max(20, Math.min(80, percent));
      this.chatWidth = percent;
    },
    stopDrag() {
      if (this.dragging) {
        this.dragging = false;
        document.body.style.cursor = '';
      }
    },
    downloadChatHistory() {
      // Download all sessions, each with its dataTable and category
      // Merge all sessions into one PDF content
      const allSessions = this.chatSessions.filter(s => s.messages && s.messages.length > 0);
      // Compose a single messageHistory array with session breaks
      let mergedMessages = [];
      allSessions.forEach((session, idx) => {
        if (idx > 0) {
          mergedMessages.push({ role: 'system', content: `--- 分隔線：第${idx+1}次對話 ---` });
        }
        session.messages.forEach(msg => {
          mergedMessages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        });
        // Add a marker for the dataTable and category for this session
        if (session.dataTable && session.dataTable.length > 0) {
          mergedMessages.push({
            role: 'system',
            content: '__SESSION_DATA_TABLE__',
            dataTable: session.dataTable,
            category: session.category
          });
        }
      });
      // Use a helper to generate the PDF with all tables
      createAndOpenChatHistoryPdf(mergedMessages, undefined);
    },
    // Add a new method for per-session download
    downloadSession(sessionIdx) {
      const session = this.chatSessions[sessionIdx];
      if (!session || !session.messages || session.messages.length === 0) return;
      const messageHistory = session.messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      createAndOpenChatHistoryPdf(messageHistory, undefined, session.dataTable, session.category);
    },
    // Add helper methods to determine last bot message in a session and session index
    isLastBotMessageInSession(messageIdx) {
      // Only show download button for bot messages with is_chat_end === true
      const msg = this.conversation[messageIdx];
      return msg && msg.type === 'bot' && msg.is_chat_end === true;
    },
    getSessionIndexByMessage(messageIdx) {
      let count = 0;
      for (let i = 0; i < this.chatSessions.length; i++) {
        count += this.chatSessions[i].messages.length;
        if (messageIdx < count) {
          return i;
        }
      }
      return 0;
    },
    checkTruncation(index) {
      this.$nextTick(() => {
        const el = this.$refs[`truncatedContent${index}`];
        if (el && (Array.isArray(el) ? el[0] : el)) {
          const dom = Array.isArray(el) ? el[0] : el;
          this.truncatedStates[index] = dom.scrollHeight > dom.clientHeight + 1; // +1 for rounding
        }
      });
    },
    openContentModal(content) {
      this.modalContent = content;
      this.showContentModal = true;
    },
    closeContentModal() {
      this.showContentModal = false;
      this.modalContent = '';
    },
    scrollToRow(index) {
      this.currentIndexBtn = index;
      this.$nextTick(() => {
        const row = this.$refs['tableRow' + index];
        if (row) {
          // $refs for v-for is an array in Vue 2, but a single element in Vue 3
          const el = Array.isArray(row) ? row[0] : row;
          if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    },
    getVisibleIndexButtons(idx, total) {
      // For mobile: show first, last, and 1 before/after current, with ellipsis
      if (window.innerWidth > 1219) {
        return Array.from({ length: total }, (_, i) => i);
      }
      const result = [];
      if (total <= 7) {
        for (let i = 0; i < total; i++) result.push(i);
        return result;
      }
      result.push(0);
      if (idx > 2) result.push('ellipsis1');
      for (let i = Math.max(1, idx - 1); i <= Math.min(total - 2, idx + 1); i++) {
        if (i !== 0 && i !== total - 1) result.push(i);
      }
      if (idx < total - 3) result.push('ellipsis2');
      result.push(total - 1);
      return result;
    },
    restartChat() {
      // If current conversation is not empty, save it as a session
      if (this.conversation.length > 0) {
        this.chatSessions[this.chatSessions.length - 1].messages = [...this.conversation];
        this.chatSessions[this.chatSessions.length - 1].dataTable = this.currentDataTable;
        this.chatSessions[this.chatSessions.length - 1].category = this.selectedCategory;
      }
      // Start a new session
      this.userInput = '';
      this.loading = false;
      this.currentDataTable = null;
      this.selectedKeywords = [];
      this.customKeyword = '';
      this.showCustomInput = false;
      this.currentKeywordsOptions = null;
      this.selectedCategory = null;
      this.showIntro = true;
      this.chatSessions.push({ messages: [], dataTable: null, category: null }); // Add a new empty session
      this.showContentModal = false;
      this.modalContent = '';
      this.truncatedStates = {};
      this.currentIndexBtn = 0;
      // Re-initialize session and show welcome message
      this.initializeSession();
      this.addWelcomeMessage();
    },
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 280px);
  min-height: 640px;
  display: flex;
  flex-direction: column;
}

.split-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 0;
  height: 100%;
  position: relative;
}
.chat-panel {
  min-width: 260px;
  max-width: 80%;
  transition: width 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 10px 0 0 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex-shrink: 0;
  flex-basis: auto;
}
.chat-interface {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  height: 100%;
  min-height: 0;
}
.info-table-panel {
  min-width: 320px;
  max-width: 80%;
  transition: width 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 0 10px 10px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  flex-shrink: 0;
  flex-basis: auto;
}
.introduction-panel {
  padding: 24px 24px 8px 24px;
  background: #f0f6ff;
  border-bottom: 1px solid #e1e5e9;
}
.introduction-panel h3 {
  margin-top: 0;
  margin-bottom: 8px;
}
.introduction-panel p {
  margin: 0;
  font-size: 18px;
  color: #333;
  line-height: 1.7;
}
.chat-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
}

.chat-header {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}
.chat-header h4 {
  margin: 0;
  font-size: 1.2rem;
}

.chat-main {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.conversation-container {
  flex: 1 1 0%;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 0;
}

.message {
  margin-bottom: 20px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 15px 20px;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.message.bot .message-content {
  background: white;
  color: #333;
  border: 1px solid #e1e5e9;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-text {
  line-height: 1.5;
  margin-bottom: 0px !important;
}

.message-text.markdown-content >>> p {
  margin-bottom: 0px !important;
}
.message-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.option-button {
  padding: 8px 16px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.option-button:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.option-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Keywords Options Styles */
.keywords-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.keyword-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    background: white;
    border: 2px solid #8b5cf6;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 15px;
    font-weight: 500;
    position: relative;
    user-select: none;
}

.keyword-checkbox:hover {
    border-color: #7c3aed;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
    transform: translateY(-1px);
}

.keyword-checkbox.selected {
    background: #8b5cf6;
    color: white;
    border-color: #8b5cf6;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.keyword-checkbox.selected:hover {
    background: #7c3aed;
    border-color: #7c3aed;
}

/* Hide default checkbox */
.keyword-checkbox input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

/* Custom checkbox */
.custom-checkbox {
    position: relative;
    width: 20px;
    height: 20px;
    border: 2px solid #8b5cf6;
    border-radius: 4px;
    background: white;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.keyword-checkbox:hover .custom-checkbox {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.keyword-checkbox.selected .custom-checkbox {
    background: white;
    border-color: white;
}

/* Checkmark */
.custom-checkbox::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 10px;
    border: solid #8b5cf6;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: 0;
    transition: opacity 0.2s ease;
}

.keyword-checkbox.selected .custom-checkbox::after {
    opacity: 1;
}

.checkbox-label {
    font-size: 15px;
    cursor: pointer;
    font-weight: 500;
    line-height: 1.2;
    border: 0 !important;
    padding: 0 !important;
    background: transparent !important;
}

/* if the parant keyword-checkbox is selected, then the checkbox-label should be bold
 */
.keyword-checkbox.selected .checkbox-label {
    background: transparent !important;
    color: #f0f0f0 !important;
}

.custom-keyword-section {
    margin-bottom: 20px;
}

/* Animation for selection */
@keyframes selectPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.keyword-checkbox.selected {
    animation: selectPulse 0.3s ease;
}

.custom-keyword-section {
  margin-bottom: 15px;
}

.add-keyword-button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #D84040;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.add-keyword-button:hover {
  background: #45a049;
  transform: scale(1.1);
}

.keyword-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.keyword-input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 20px;
  font-size: 14px;
  width: 100%;
}

.keyword-input:focus {
  outline: none;
  border-color: #667eea;
}

.keyword-input-button {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.keyword-input-button:hover {
  background: #5a6fd8;
}

.keywords-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: end;
  padding: 0 20px;
}

.select-all-button {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.select-all-button:hover {
  background: #5a6fd8;
}

.confirm-button {
  background-color: #ea7a66;
  width: 70px;
  height: 40px;
  display: inline-block;
  position: relative;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  color: white;
}
.confirm-button:after {
  color: #ea7a66;
  border-left: 28px solid;
  border-top: 30px solid transparent;
  border-bottom: 30px solid transparent;
  display: inline-block;
  content: '';
  position: absolute;
  right: -20px;
  top: -9px;
}

.confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e1e5e9;
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.input-container {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 25px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.message-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.data-table-container {
  height: inherit;
  position: relative;
}

.table-header {
  padding: 20px;
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 2;
  color: white;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.table-header h3 {
  font-size: 1.2rem;
  width: fit-content;
  margin-bottom: 0;
}

.table-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
  width: fit-content;
}

.table-wrapper {
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
  position: relative;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  height: 100%;
  overflow: auto;
}

.data-table th {
  background-color: #BDE3FF !important;
  border: #97B6CC 1px solid !important;
  padding: 8px;
  text-align: center;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table td {
  border: 1px solid #e1e5e9;
  padding: 8px;
  vertical-align: top;
}

.case-cell {
  width: 120px;
}

.case-cell a {
  color: #0a60ac;
  text-decoration: none;
}

.case-cell a:hover {
  text-decoration: underline;
}

.no-data {
  color: #999;
  font-style: italic;
}

/* Markdown Content Styles */
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1, .markdown-content h2, .markdown-content h3, 
.markdown-content h4, .markdown-content h5, .markdown-content h6 {
  margin: 1em 0 0.5em;
  font-weight: 600;
}

.markdown-content p, .markdown-content ul, .markdown-content ol {
  margin: 0.5em 0;
}

.markdown-content ul, .markdown-content ol {
  padding-left: 1.5em;
}

.markdown-content code {
  background-color: #f0f0f0;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-content pre {
  background-color: #f8f8f8;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content blockquote {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 4px solid #ddd;
  color: #666;
}

@media (max-width: 1200px) {
  .chat-main {
    flex-direction: column;
  }
  
  .data-table-container {
    width: 100%;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .split-container {
    flex-direction: column;
    height: auto;
    min-height: 0;
  }
  .chat-panel {
    width: 100% !important;
    min-width: 0;
    max-width: 100%;
    border-radius: 10px 10px 0 0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  }
  .info-table-panel {
    width: 100% !important;
    min-width: 0;
    max-width: 100%;
    border-radius: 0 0 10px 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  }
  .splitter {
    display: none;
  }
  .index-buttons {
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 2px;
    padding-bottom: 4px;
  }
  .index-btn {
    min-width: 28px !important;
    height: 28px !important;
    font-size: 13px;
    border-radius: 50%;
    padding: 0;
  }
  .index-ellipsis {
    display: inline-block;
    min-width: 20px;
    text-align: center;
    color: #667eea;
    font-weight: bold;
    font-size: 18px;
    background: transparent;
    border: none;
    pointer-events: none;
  }
}

.conversation-container::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 6px;
}

.conversation-container::-webkit-scrollbar-track,
.table-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.conversation-container::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.conversation-container::-webkit-scrollbar-thumb:hover,
.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.splitter {
  width: 8px;
  background: #e1e5e9;
  cursor: col-resize;
  z-index: 2;
  transition: background 0.2s;
  flex-shrink: 0;
}

.splitter:hover, .splitter:active {
  background: #b3b3b3;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 55px 32px 32px 32px;
  border-radius: 12px;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ea7a66;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  cursor: pointer;
}
.truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
  min-height: 1.5em;
  max-height: 4.5em; /* 3 lines x 1.5em line-height */
  line-height: 1.5em;
}
.index-btn {
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.index-btn:hover, .index-btn:focus {
  background: #667eea;
  color: #fff;
  border: 1px solid #667eea;
}
</style> 