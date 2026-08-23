/* global hexo */

'use strict';

// 防闪烁:在 <head> 开头根据 localStorage 提前恢复 Print 字体模式,
// 避免页面先按默认字体渲染再切换(逻辑与 source/js/font-toggle.js 保持一致)
hexo.extend.injector.register('head_begin', '<script>(function(){try{if(localStorage.getItem("fluid-font-mode")==="print"){document.documentElement.classList.add("print-font")}}catch(e){}})();</script>');
