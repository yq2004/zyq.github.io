(function(window, document) {
  var STORAGE_KEY = 'fluid-font-mode';
  var PRINT_CLASS = 'print-font';

  var root = document.documentElement;

  function safeGetStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // 隐私模式等场景下 localStorage 不可用,忽略即可
    }
  }

  function getMode() {
    return safeGetStorage(STORAGE_KEY) === 'print' ? 'print' : 'default';
  }

  function applyMode(mode) {
    root.classList.toggle(PRINT_CLASS, mode === 'print');
  }

  // 在深色模式切换按钮旁注入字体切换按钮
  function createButton() {
    var ul = document.querySelector('#navbarSupportedContent .navbar-nav');
    if (!ul) {
      return;
    }

    var li = document.createElement('li');
    li.id = 'font-toggle-btn';
    li.className = 'nav-item';
    li.innerHTML =
      '<a class="nav-link" target="_self" href="javascript:;" aria-label="Font Toggle" title="切换字体(默认/Print)">' +
      '<i id="font-toggle-icon">A</i></a>';

    var anchor = document.getElementById('color-toggle-btn') ||
      document.getElementById('search-btn');
    if (anchor) {
      anchor.insertAdjacentElement('afterend', li);
    } else {
      ul.appendChild(li);
    }

    li.querySelector('a').addEventListener('click', function() {
      var mode = getMode() === 'print' ? 'default' : 'print';
      safeSetStorage(STORAGE_KEY, mode);
      applyMode(mode);
    });
  }

  applyMode(getMode());
  createButton();
})(window, document);
