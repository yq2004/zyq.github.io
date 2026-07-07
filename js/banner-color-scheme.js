(function(window, document) {
  var banner = document.getElementById('banner');
  if (!banner) {
    return;
  }

  var root = document.documentElement;
  var rootPath = (window.CONFIG && window.CONFIG.root) || '/';
  var darkImage = rootPath + 'img/bg/home.png';
  var lightImage = rootPath + 'img/bg/home_light.png';

  function isHomeBanner() {
    return /\/img\/bg\/home(_light)?\.png/.test(banner.style.backgroundImage);
  }

  function getCurrentScheme() {
    return root.getAttribute('data-user-color-scheme') || root.getAttribute('data-default-color-scheme') || 'light';
  }

  function setHomeBannerImage() {
    if (!isHomeBanner()) {
      return;
    }

    var image = getCurrentScheme() === 'dark' ? darkImage : lightImage;
    banner.style.backgroundImage = 'url("' + image + '")';
  }

  setHomeBannerImage();

  new MutationObserver(setHomeBannerImage).observe(root, {
    attributes: true,
    attributeFilter: ['data-user-color-scheme']
  });
})(window, document);
