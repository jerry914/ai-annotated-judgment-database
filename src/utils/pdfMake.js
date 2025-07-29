import pdfMake from 'pdfmake/build/pdfmake'

// Helper function to strip HTML tags from content
function stripHtmlTags(content) {
  if (!content) return '';
  return content
    .replace(/<input[^>]*>/gi, '')
    .replace(/<label[^>]*>(.*?)<\/label>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Utility: Chunk long text into multiple parts
function splitLongText(text, maxLength = 800) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}


const pdfStyles = {
  header: {
    fontSize: 20,
    bold: true
  },
  factorTitle: {
    fontSize: 12,
    bold: true
  },
  title: {
    fontSize: 12,
    bold: true,
    margin: [0, 8, 0, 6]
  },
  date: {
    fontSize: 6
  },
  diagramDescription: {
    fontSize: 6,
    alignment: 'center'
  },
  description: {
    fontSize: 10
  },
  normal: {
    margin: [0, 0, 0, 0],
    fontSize: 10
  },
  user: {
    margin: [0, 12, 0, 0],
    fontSize: 12,
    bold: true,
    color: '#f59e0b'
  },
  leAssistant: {
    margin: [0, 8, 0, 0],
    fontSize: 12,
    bold: true,
    color: '#764ba2'
  }
}

// Helper function to load fonts dynamically
async function loadFonts() {
  // Dynamic load font file
  pdfMake.vfs = await import('@/assets/fonts/vfs_fonts.js')
  pdfMake.fonts = {
    NotoSansTC: {
      normal: 'NotoSansTC-Light.ttf',
      bold: 'NotoSansTC-Medium.ttf',
    }
  }
}

export async function createAndOpenPredictResultPdf(
  pdfTitle
) {
  // Load fonts before creating PDF
  await loadFonts()

  const content = [
    {
      text: `AI 輔助親權裁判預測系統 - ${pdfTitle}`,
      style: 'header'
    },
    {
      text: `匯出日期：${new Date().toLocaleString('zh-TW')}`,
      style: 'date'
    },
    {
      text: '使用者輸入內容',
      style: 'title'
    }
  ]

  pdfMake
    .createPdf(
      {
        content: content,
        defaultStyle: {
          font: 'NotoSansTC'
        },
        styles: pdfStyles
      }
    )
    .open()
}

export async function createAndOpenChatHistoryPdf(
  messageHistory,
  figuresSrc,
  dataTable, // optional, for backward compatibility
  category // optional, for backward compatibility
) {
  // Load fonts before creating PDF
  await loadFonts()

  // Find prediction index if any
  const predictIndex = messageHistory.findIndex(
    (curMessage) => curMessage.status === 'predict'
  )

  function reduceMessagesToPdf(prevArr, curMessage) {
    if (curMessage.role === 'system' && curMessage.content === '__SESSION_DATA_TABLE__') {
      // Render the dataTable for this session
      if (curMessage.dataTable && Array.isArray(curMessage.dataTable) && curMessage.dataTable.length > 0) {
        const contentField = curMessage.category === '見解' ? '見解' : '事實';
        const tableBody = [];
        tableBody.push([
          { text: '相關判決書搜尋結果', style: 'factorTitle', fillColor: '#BDE3FF', color: '#333', alignment: 'center' }
        ]);
        curMessage.dataTable.forEach((row, idx) => {
          // 案號
          let caseNumber = row['案號'] || '';
          // Try to extract a case number for link (remove HTML if present)
          let plainCaseNumber = caseNumber.replace(/<[^>]+>/g, '');
          // Build link to court system (the list string inside "" after href)
          let caseUrl = caseNumber.match(/<a [^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i)?.[1];
          // 內容
          let content = row[contentField] || '';
          content = content.replace(/\r|\n|<br\s*\/?>/gi, '');
          // Strip HTML tags from content
          content = stripHtmlTags(content);
          let rowText = [
            `編號${idx + 1}`,
            `案號：${plainCaseNumber} \n`,
            `連結：${caseUrl} \n`,
            `\n【${contentField}內容】\n`,
            content
          ];
          tableBody.push([
            { stack: rowText, style: 'normal', margin: [0, 6, 0, 6] }
          ]);
        });
        prevArr.push({
          table: {
            headerRows: 1,
            widths: ['*'],
            body: tableBody
          },
          layout: {
            fillColor: function (rowIndex) { return rowIndex === 0 ? '#BDE3FF' : null; },
            hLineWidth: function () { return 0.5; },
            vLineWidth: function () { return 0; },
            hLineColor: function () { return '#97B6CC'; },
            vLineColor: function () { return '#97B6CC'; }
          },
          margin: [0, 8, 0, 8]
        });
      }
      return prevArr;
    }

    if (curMessage.role === 'system' && curMessage.content?.startsWith('--- 分隔線')) {
      prevArr.push({
        text: curMessage.content,
        style: 'description',
        margin: [0, 12, 0, 12]
      });
      return prevArr;
    }

    if (curMessage.role === 'assistant') {
      prevArr.push({ text: 'AI助手：', style: 'leAssistant' });
    }

    if (curMessage.role === 'user') {
      prevArr.push({ text: '使用者：', style: 'user' });
    }

    // Handle messages with options
    if (curMessage.options?.option_type === 'keywords_options') {
      const selectedKeywords = (curMessage.options.buttons || []).map(b => b.label).join(', ');
      const keywordSummary = selectedKeywords ? `（關鍵字選擇）${selectedKeywords}` : '（未選擇關鍵字）';
      prevArr.push({
        text: keywordSummary,
        style: 'normal'
      });
    }

    // Fallback for normal content (chunk if too long)
    const cleanText = stripHtmlTags(curMessage.content || '');
    if (cleanText) {
      const chunks = splitLongText(cleanText);
      chunks.forEach(chunk => {
        prevArr.push({
          text: chunk,
          style: 'normal'
        });
      });
    }

    return prevArr;
  }

  const content = [
    {
      text: 'AI裁判書助手',
      style: 'header'
    },
    {
      text: `匯出日期：${new Date().toLocaleString('zh-TW')}`,
      style: 'description'
    }
  ]

  // If mergedMessages (download all), just reduce all
  if (Array.isArray(messageHistory) && messageHistory.some(m => m.content === '__SESSION_DATA_TABLE__')) {
    content.push(...messageHistory.reduce(reduceMessagesToPdf, []));
  } else {
    // parse until prediction
    const parsedMessage = messageHistory
      .slice(0, predictIndex)
      .reduce(reduceMessagesToPdf, [])
    content.push(...parsedMessage)
    if (figuresSrc) {
      content.push({
        text: 'AI助手：',
        style: 'leAssistant'
      })
      content.push({
        alignment: 'justify',
        columns: [
          {
            image: figuresSrc.figure1Src,
            width: 240
          },
          {
            image: figuresSrc.figure2Src,
            width: 240
          }
        ],
        columnGap: 16
      })
    }
    // push prediction results
    const predictMessages = messageHistory
      .slice(predictIndex)
      .reduce(reduceMessagesToPdf, [])
    content.push(...predictMessages)
    // push table if provided (legacy)
    if (dataTable && Array.isArray(dataTable) && dataTable.length > 0) {
      const contentField = category === '見解' ? '見解' : '事實';
      const tableBody = [];
      tableBody.push([
        { text: '相關判決書搜尋結果', style: 'factorTitle', fillColor: '#BDE3FF', color: '#333', alignment: 'center' }
      ]);
      dataTable.forEach((row, idx) => {
        // 案號
        let caseNumber = row['案號'] || '';
        // Try to extract a case number for link (remove HTML if present)
        let plainCaseNumber = caseNumber.replace(/<[^>]+>/g, '');
        // Build link to court system (the list string inside "" after href)
        let caseUrl = caseNumber.match(/<a [^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i)?.[1];
        // 內容
        let content = row[contentField] || '';
        content = content.replace(/\r|\n|<br\s*\/?>/gi, '');
        // Strip HTML tags from content
        content = stripHtmlTags(content);
        let rowText = [
          `編號${idx + 1}`,
          `案號：${plainCaseNumber} \n`,
          `連結：${caseUrl} \n`,
          `\n【${contentField}內容】\n`,
          content
        ];
        tableBody.push([
          { stack: rowText, style: 'normal', margin: [0, 6, 0, 6] }
        ]);
      });
      content.push({
        table: {
          headerRows: 1,
          widths: ['*'],
          body: tableBody
        },
        layout: {
          fillColor: function (rowIndex) { return rowIndex === 0 ? '#BDE3FF' : null; },
          hLineWidth: function () { return 0.5; },
          vLineWidth: function () { return 0; },
          hLineColor: function () { return '#97B6CC'; },
          vLineColor: function () { return '#97B6CC'; }
        },
        margin: [0, 8, 0, 8]
      });
    }
  }

  pdfMake
    .createPdf(
      {
        content: content,
        defaultStyle: {
          font: 'NotoSansTC'
        },
        styles: pdfStyles
      }
    )
    .open()
}
