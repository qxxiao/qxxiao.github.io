// 调整 pre 元素的 class 属性，以支持行高亮
const codeBlocks = document.querySelectorAll('code[class*="{"]')

codeBlocks.forEach(code => {
  // 获取 code 元素的 class 值
  const classList = code.className

  // 使用正则表达式匹配出花括号内的内容，支持多个逗号分隔的行号或范围
  const matches = classList.match(/\{((?:\d+(-\d+)?,?)+)\}/)

  if (matches && matches[1]) {
    // 提取出行号范围，类似 "2,4,7-10"
    const lineNumbers = matches[1]

    // 查找父级 pre 元素，并设置 data-line 属性
    const preElement = code.closest('pre')
    if (preElement) {
      preElement.setAttribute('data-line', lineNumbers)

      // 移除 code 元素中包含的 {2,4,7-10} 的类，以防止污染样式
      code.className = classList.replace(/\{\d+([-,]\d+)*\}/, '').trim()
    }
  }
})

// 调整 Prism.js 的行高亮样式，top 值
// fontsize

const InitTop = 13 // 初始化 top 值， pre 下的 padding 1rem = 13px
document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('pre.line-numbers')

  codeBlocks.forEach(pre => {
    const lineHeight = 19 //  parseFloat(getComputedStyle(pre).lineHeight) // 获取行高
    const highlights = pre.querySelectorAll('.line-highlight') // 获取所有高亮区域

    highlights.forEach(highlight => {
      const range = highlight.getAttribute('data-range') // 获取行范围
      if (range) {
        const lineNumbers = range.split(',') // 拆分行号
        lineNumbers.forEach(line => {
          if (line.includes('-')) {
            // 处理范围
            const [start, end] = line.split('-').map(Number)
            const top = InitTop + (start - 1) * lineHeight // 计算 top 值
            highlight.style.setProperty('top', `${top}px`, 'important') // 使用 !important 设置 top
            highlight.style.setProperty('height', `${lineHeight * (end - start + 1)}px`, 'important') // 使用 !important 设置高度
          } else {
            // 处理单行
            const lineNumber = Number(line)
            const top = InitTop + (lineNumber - 1) * lineHeight // 计算 top 值
            highlight.style.setProperty('top', `${top}px`, 'important') // 使用 !important 设置 top
            highlight.style.setProperty('height', `${lineHeight}px`, 'important') // 使用 !important 设置高度
          }
        })
      }
    })
  })
})
