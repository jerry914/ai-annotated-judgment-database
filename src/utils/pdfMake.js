import pdfMake from 'pdfmake/build/pdfmake'

const pdfFonts = {
  NotoSansTC: {
    normal: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Regular.woff2',
    bold: 'https://fonts.gstatic.com/ea/notosanstc/v1/NotoSansTC-Bold.woff2'
  }
}

const pdfStyles = {
  header: {
    fontSize: 22,
    bold: true
  },
  factorTitle: {
    fontSize: 14,
    bold: true
  },
  title: {
    fontSize: 16,
    bold: true,
    margin: [0, 12, 0, 6]
  },
  date: {
    fontSize: 8
  },
  diagramDescription: {
    fontSize: 8,
    alignment: 'center'
  },
  description: {
    fontSize: 12
  },
  normal: {
    margin: [0, 0, 0, 0],
    fontSize: 12
  },
  user: {
    margin: [0, 12, 0, 0],
    fontSize: 14,
    bold: true,
    color: '#f59e0b'
  },
  leAssistant: {
    margin: [0, 12, 0, 0],
    fontSize: 14,
    bold: true,
    color: '#764ba2'
  }
}

export function createAndOpenPredictResultPdf(
  pdfTitle
) {
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
      },
      null,
      pdfFonts
    )
    .open()
}

export function createAndOpenChatHistoryPdf(
  messageHistory,
  figuresSrc
) {
  // Find prediction index if any
  const predictIndex = messageHistory.findIndex(
    (curMessage) => curMessage.status === 'predict'
  )

  function reduceMessagesToPdf(prevArr, curMessage) {
    if (curMessage.role !== 'system') {
      if (curMessage.role === 'assistant') {
        prevArr.push({
          text: 'AI助手：',
          style: 'leAssistant'
        })
      }
      if (curMessage.role === 'user') {
        prevArr.push({
          text: '使用者：',
          style: 'user'
        })
      }
      prevArr.push({
        text: curMessage.content,
        style: 'normal'
      })
    }
    return prevArr
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

  // parse until prediction
  const parsedMessage = messageHistory
    .slice(0, predictIndex)
    .reduce(reduceMessagesToPdf, [])

  content.push(...parsedMessage)

  if (figuresSrc) {
    // push prediction images
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

  pdfMake
    .createPdf(
      {
        content: content,
        defaultStyle: {
          font: 'NotoSansTC'
        },
        styles: pdfStyles
      },
      null,
      pdfFonts
    )
    .open()
}
