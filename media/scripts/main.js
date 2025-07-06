new Vue({
  el: '#app',
  data() {
    return {
      scrolled: false,
      atBottom: false,
      showToc: false,
      showMenu: false,
      darkMode: true,
      mediaQuery: window.matchMedia('(prefers-color-scheme: dark)')
    }
  },
  computed: {
    text() {
      return encodeURIComponent(document.title)
    },
    url() {
      return encodeURIComponent(window.location.href)
    }
  },
  mounted() {
    // 监听系统配色
    this.initializeTheme()
    this.mediaQuery.addListener(this.systemThemeChange)

    window.addEventListener('scroll', this.navOnScroll)
  },
  methods: {
    oepnUrl(url) {
      window.open(url, '_blank')
    },
    navOnScroll() {
      if (window.scrollY > 20) {
        this.scrolled = true
      } else {
        this.scrolled = false
      }
      this.atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight
    },
    // backToUp() {
    //   window.scrollTo(0, 0)
    // },
    backToUp() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    backToBottom() {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    },
    shareToTwitter() {
      window.open(`https://twitter.com/share?text=${this.text}&url=${this.url}`, '_blank', 'width=615,height=505')
    },
    shareToWeibo() {
      window.open(
        `https://service.weibo.com/share/share.php?title=${this.text}&url=${this.url}`,
        '_blank',
        'width=615,height=505'
      )
    },
    shareToTelegram() {
      window.open(`https://telegram.me/share/url?text=${this.text}&url=${this.url}`, '_blank', 'width=615,height=505')
    },

    // 初始化主题
    initializeTheme() {
      const storedTheme = localStorage.getItem('darkMode')
      if (storedTheme !== null) {
        this.darkMode = storedTheme === 'true'
      } else {
        this.darkMode = this.mediaQuery.matches
      }
      this.applyTheme()
    },
    // 手动切换主题
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      localStorage.setItem('darkMode', this.darkMode)
      this.applyTheme()
    },
    // 系统配色切换后的回调函数
    // 用户在 localStorage 设置的优先级更高大于系统切换
    systemThemeChange(e) {
      if (localStorage.getItem('darkMode') === null) {
        this.darkMode = e.matches
        this.applyTheme()
      }
    },
    // 应用主题
    applyTheme() {
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }
})
