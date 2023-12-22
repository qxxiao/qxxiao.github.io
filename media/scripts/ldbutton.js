var html = document.querySelector('html');
var checkbox = document.getElementById('night-light-checkbox');
var ball = document.getElementById('night-light-ball');

// 检查是否启动暗色模式, 按需要添加或删除样式
// 注意初始化 button
function checkDarkMode() {
  // 查询顺序
  // 1. localStorage
  // 2. 系统设置
  let Mode = localStorage.getItem('darkMode');
  if (Mode === '1') {
    html.classList.add('dark');
    if (ball) {
      ball.classList.remove('horizTranslate2'); // 向左移动
      ball.classList.add('horizTranslate'); // 向右移动
    }
  } else if (Mode == null || Mode == '' || Mode == undefined) {
    // 媒体查询
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
      if (ball) {
        ball.classList.remove('horizTranslate2'); // 向左移动
        ball.classList.add('horizTranslate'); // 向右移动
      }
      //亮色移除 dark
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      html.classList.remove('dark');
      if (ball) {
        ball.classList.remove('horizTranslate');
        ball.classList.add('horizTranslate2');
      }
    }
  }
  // Mode==0
}
// another
function checkDarkMode2() {
  let Mode = localStorage.getItem('darkMode');
  if (Mode === '1') {
    html.classList.add('dark');
  } else if (Mode == null || Mode == '' || Mode == undefined) {
    // 媒体查询
    if (matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark');
      //亮色移除 dark
    } else if (matchMedia('(prefers-color-scheme: light)').matches) {
      html.classList.remove('dark');
    }
  }
}

// 点击后主动切换, 会设置 localStorage
function switchMode() {
  let Mode = localStorage.getItem('darkMode');
  if (Mode == null || Mode == '') {
    // 如果正处于暗色模式
    if (html.classList.contains('dark')) {
      // 切换为亮色和标识
      html.classList.remove('dark');
      localStorage.setItem('darkMode', '0');
      if (ball) {
        ball.classList.remove('horizTranslate', 'initDark', 'initLight');
        ball.classList.add('horizTranslate2');
      }
      //...亮色设置
    } else {
      // 切换到暗色
      html.classList.add('dark');
      localStorage.setItem('darkMode', '1');
      if (ball) {
        ball.classList.remove('horizTranslate2', 'initDark', 'initLight'); // 向左移动
        ball.classList.add('horizTranslate'); // 向右移动
      }
      // ...暗色设置
    }
  } else if (Mode == '0') {
    // 之前是亮色，现在切换到暗色
    html.classList.add('dark');
    localStorage.setItem('darkMode', '1');
    if (ball) {
      ball.classList.remove('horizTranslate2', 'initDark', 'initLight'); // 向左移动
      ball.classList.add('horizTranslate'); // 向右移动
    }
  } else {
    // 暗色，现在切换到亮色
    html.classList.remove('dark');
    localStorage.setItem('darkMode', '0');
    if (ball) {
      ball.classList.remove('horizTranslate', 'initDark', 'initLight');
      ball.classList.add('horizTranslate2');
    }
  }
}

// 1. 系统配色监听
var mediaCallback = e => {
  // 如果是暗色需要切换
  if (e.matches) {
    localStorage.clear();
    checkDarkMode();
  }
};
var lightMedia = window.matchMedia('(prefers-color-scheme: light)');
var darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
if (typeof darkMedia.addEventListener === 'function' || typeof lightMedia.addEventListener === 'function') {
  // 只有一个是 true(需要清楚localsotrage)
  lightMedia.addEventListener('change', mediaCallback);
  darkMedia.addEventListener('change', mediaCallback);
}

// 2. 点击切换
if (checkbox) {
  checkbox.addEventListener('change', () => {
    switchMode();
  });
}
// 手动触发一次检测系统配色=>交给vue检测和初始化第一次状态
checkDarkMode2();
