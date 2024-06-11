// 初始化系统配色
// 提前初始化，避免vue中计算导致的刷新闪烁
let darkMode = true
let mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
// 从本地存储中获取配色
const storedTheme = localStorage.getItem('darkMode')
if (storedTheme !== null) {
  darkMode = storedTheme === 'true'
} else {
  this.darkMode = mediaQuery.matches
}
if (darkMode) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}
