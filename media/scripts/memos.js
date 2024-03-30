let bbMemo = {
  memos: 'https://memos.qxxiao.eu.org/',
  limit: 20, //填入需要展示的memos数量
  creatorId: '1', //自己部署的话默认为1
  domId: 'bber', //可以不修改
  username: 'Nuo',
  useravatar: 'https://pic.qxxiao.cn/avatar.png', //修改为自己的头像链接
  commentsUrl: 'https://memos.qxxiao.eu.org/m/', //修改为你的Memos域名，但保留包含m的尾巴部分
  envId: 'https://twikoo.qxxiao.cn/'
}

let limit = bbMemo.limit
let memos = bbMemo.memos
let commentsUrl = bbMemo.commentsUrl
let offset = 0
let meNums = 0
let cacheData = []
let cacheComments = []

let bbDom = document.getElementById(bbMemo.domId) // 获取插入的dom,这里脚本使用了 defer 来延迟加载，所以这里可以获取到
let load = '<div class="bb-load"><button class="load-btn button-load">加载中…</button></div>'
;(async function init() {
  if (bbDom) {
    bbDom.insertAdjacentHTML('afterbegin', '<section class="bb-timeline"><ul class="bb-list-ul"></ul></section>')
    bbDom.insertAdjacentHTML('beforeend', load)
    await getMemoNums()
    await getFirstList()
  }
})()

// memos 首个列表
async function getFirstList() {
  let bbUrl = memos + 'api/v1/memo?creatorId=' + bbMemo.creatorId + '&rowStatus=NORMAL&limit=' + limit
  let res = await fetch(bbUrl)
  let resdata = await res.json()
  let commentsNums = await getCommentsCount(memosToUrls(resdata))
  updateHTML(resdata, commentsNums) // 将 笔记数据转换合适的 html元素并插入到页面中
  if (resdata.length < limit || resdata.length == meNums) {
    // 结束所有的加载了
    document.querySelector('button.button-load').remove()
    return
  }
  offset = limit
  let btn = document.querySelector('button.button-load')
  btn.textContent = '加载更多'
  btn.addEventListener('click', async function () {
    btn.textContent = '加载中…'
    btn.disabled = true
    await getNextList()
    updateHTML(cacheData, cacheComments)
    // 这里可以判断点击后是否还有下一页，如果没有就移除按钮
    if (offset >= meNums) {
      btn.remove()
      return
    }
    btn.textContent = '加载更多'
    btn.disabled = false
  })
}

// 加载 memos 下一页缓存
async function getNextList() {
  let bbUrl =
    memos + 'api/v1/memo?creatorId=' + bbMemo.creatorId + '&rowStatus=NORMAL&limit=' + limit + '&offset=' + offset
  let res = await fetch(bbUrl)
  let resdata = await res.json()
  let commentsNums = await getCommentsCount(memosToUrls(resdata))
  cacheData = resdata
  cacheComments = commentsNums
  offset += cacheData.length
}

// 获取 memos 总条数
// 显示在后面的页脚
async function getMemoNums() {
  let bbUrl = memos + 'api/v1/memo/stats?creatorId=' + bbMemo.creatorId
  try {
    let res = await fetch(bbUrl)
    let resdata = await res.json()

    meNums = resdata.length
    let footer =
      '<div class="bb-footer text-center" style="text-align:center;"><span class="bb-footer-text">共有 ' +
      meNums +
      ' 条说说</span></div>'
    bbDom.insertAdjacentHTML('afterend', footer)
    // console.log('总条数为' + meNums)
  } catch (err) {
    console.error(err)
  }
}

// 每次加载刷新 html
function updateHTML(data, commentsNums) {
  let list = document.querySelector('ul.bb-list-ul')
  if (!list) {
    console.log('can not find .bb-list-ul')
  }
  let showdownOptions = {
    emoji: true,
    tasklists: true,
    tables: true,
    simpleLineBreaks: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    ghCodeBlocks: true,
    openLinksInNewWindow: true
  }
  let converter = new showdown.Converter(showdownOptions)
  // const regex = /(^|\s)(#[^\s#]+)\s/g
  // 只是匹配第一行的内容， 如果 #xxx 出现在代码块内比较复杂
  const regex = /(^|\s)(#[^\s#]+)\s/

  for (let i = 0; i < data.length; i++) {
    // 头像，用户名，时间日期，#编号，公开状态
    let mdtext = data[i].content
    mdtext = mdtext.replace(regex, '$1<a target="_blank" href="' + bbMemo.memos + '" class="bb-tag">$2</a>')
    let html = converter.makeHtml(mdtext)

    let imagediv = ''
    if (data[i].resourceList.length > 0) {
      imagediv = `<div class="image-container">
        ${data[i].resourceList
          .map((item, index) => {
            if (item.type.includes('image'))
              return `<div class="div-img w-full overflow-hidden hide-scrollbar hover:shadow-md"><img src="${
                item.externalLink
              }" alt="${'img-' + index}" class="bb-img rounded cursor-pointer" loading="lazy" decoding="async"></div>`
            else if (item.type.includes('video'))
              return `<div class="div-img w-full overflow-hidden hide-scrollbar hover:shadow-md"><video src="${item.externalLink}" controls="controls" crossorigin="anonymous" preload="metadata" class="bb-video rounded cursor-pointer"></video></div>`
            else return ''
          })
          .join('\n')}
      </div>`
    }

    let result = `<li class="bb-list-li">
  <div class="bb-div">
    <div class="datatime">
      <div class="hy-avatar-block"><a href="${bbMemo.memos}" class="hy-astyle"><img
            src="${bbMemo.useravatar}" class="hy-avatar"></a></div>
      <div class="hy-intro">
        <div class="hy-name">Nuo</div>
        <div><span class="hy-time hy-text-muted">${timestampToTime(data[i].createdTs)}</span></div>
      </div>
      <div class="bb-id-div">
        <a href="${commentsUrl + data[i].id}" target="_blank" class="bb-id-tag">#${data[i].id}</a>
      </div>
    </div>
    <div class="datacont">
      <div class="markdown">
        ${html}
      </div>
      ${imagediv}
    </div>
    <div class="item-footer flex mt-4 justify-end"><a onclick="loadTwikoo(${
      data[i].id
    })" rel="noopener noreferrer"><i class="ri-message-2-line"></i></a><span class="ml-1">${
      commentsNums[i].count
    }</span></div>
    <div class='twikoo-body twikoo-memosId twikoo-${data[i].id} d-none'></div>
  </div>
</li>`
    // 分割线
    list.insertAdjacentHTML('beforeend', result)
    const newListItem = list.querySelector('ul.bb-list-ul li.bb-list-li:last-child')
    let imageContainer = newListItem.querySelector('.image-container')
    if (!imageContainer) {
      continue
    }
    let divImgs = imageContainer.querySelectorAll('div')
    if (divImgs.length <= 0) {
      continue
    }
    if (divImgs.length === 1) {
      imageContainer.style.display = 'block'
    } else {
      const containerWidth = imageContainer.offsetWidth
      let imgWidth = (containerWidth - 10) / 3
      // document.documentElement.clientWidth <= 768
      if (divImgs.length === 4 || divImgs.length === 2 || window.innerWidth <= 768) {
        imageContainer.style.gridTemplateColumns = 'repeat(2, 1fr)'
        imgWidth = (containerWidth - 5) / 2
      }
      // 设置grid 高度
      imageContainer.style.gridAutoRows = imgWidth + 'px'
      // default css is 3
      // 注册窗口大小变化事件并防抖
      window.addEventListener(
        'resize',
        debounce(() => {
          const containerWidth = imageContainer.offsetWidth
          let imgWidth = (containerWidth - 10) / 3
          if (divImgs.length === 4 || divImgs.length === 2 || window.innerWidth <= 768) {
            imageContainer.style.gridTemplateColumns = 'repeat(2, 1fr)'
            imgWidth = (containerWidth - 5) / 2
          } else {
            imageContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'
          }
          imageContainer.style.gridAutoRows = imgWidth + 'px'
        }, 300)
      )
    }
    // 设置 PhotoSwipe
    photoSwipe(imageContainer.querySelectorAll('img'))
  }
  hlcode()
}

// twikoo 评论数
async function getCommentsCount(urls) {
  let res = await twikoo.getCommentsCount({
    envId: 'https://twikoo.qxxiao.cn/', // 环境 ID
    urls: urls, // 文章链接列表
    includeReply: false // 评论数是否包括回复，默认：false
  })
  return res
  // 返回示例: [
  //   { url: '/2020/10/post-1.html', count: 10 },
  //   { url: '/2020/11/post-2.html', count: 0 },
  //   { url: '/2020/12/post-3.html', count: 20 }
  // ]
}

// transform memos to urls array
function memosToUrls(memos) {
  let urls = []
  for (let i = 0; i < memos.length; i++) {
    // urls.push('/m/' + memos[i].id)
    urls.push(commentsUrl + memos[i].id)
  }
  return urls
}

// transform timestamp to YYYY/MM/DD HH:mm:ss
function timestampToTime(timestamp) {
  const date = new Date(timestamp * 1000) // 将秒转换为毫秒

  const year = date.getFullYear() // 年份
  const month = (date.getMonth() + 1).toString().padStart(2, '0') // 月份（从 0 开始，需加 1）
  const day = date.getDate().toString().padStart(2, '0') // 日期
  const hours = date.getHours().toString().padStart(2, '0') // 小时
  const minutes = date.getMinutes().toString().padStart(2, '0') // 分钟
  const seconds = date.getSeconds().toString().padStart(2, '0') // 秒钟

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
}

// 防抖
function debounce(fn, delay) {
  let timer = null
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(fn, delay)
  }
}

// PhotoSwipe
function photoSwipe(imgs) {
  if (imgs.length <= 0) {
    return
  }
  let pswpElement = document.querySelectorAll('.pswp')[0]
  let items = []
  for (let i = 0; i < imgs.length; i++) {
    let img = imgs[i]
    img.onload = function () {
      items[i] = {
        src: img.src,
        w: img.naturalWidth,
        h: img.naturalHeight
      }

      img.onclick = function () {
        let options = {
          index: i,
          bgOpacity: 0.7,
          showHideOpacity: true
        }
        let gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options)
        gallery.init()
      }
    }
  }
}

function hlcode() {
  let pres = document.getElementsByTagName('pre')
  for (let i = 0; i < pres.length; i++) {
    var pre = pres[i]
    if (pre.childNodes[0].nodeName == 'CODE') {
      pre.setAttribute('class', 'line-numbers')
      // 获取 language-cpp 类似的class
      let lang = pre.childNodes[0].getAttribute('class')
      lang = lang.split(' ').filter(item => item.startsWith('language-'))[0]
      pre.classList.add(lang)
    }
  }
  // 在 pre.setAttribute('class', 'line-numbers')后面，不然没有行号
  Prism.highlightAll()
}

// 只是显示当前 memosId 的 twikoo 评论
function loadTwikoo(memosId) {
  let twikooMemosId = '.twikoo-' + memosId
  var twikooDom = document.querySelector(twikooMemosId)
  var twikooCon = "<div id='twikoo'></div>"
  if (twikooDom.classList.contains('d-none')) {
    document.querySelectorAll('.twikoo-body').forEach(item => {
      item.classList.add('d-none')
    })
    if (document.getElementById('twikoo')) {
      document.getElementById('twikoo').remove() //如果页面中已经有其他Twikoo初始化，则移除
    }
    twikooDom.insertAdjacentHTML('beforeend', twikooCon)
    twikooDom.classList.remove('d-none')
    twikoo.init({
      envId: 'https://twikoo.qxxiao.cn/',
      el: '#twikoo',
      path: commentsUrl + memosId
    })
  } else {
    twikooDom.classList.add('d-none')
    document.getElementById('twikoo').remove()
  }
}
