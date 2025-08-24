/* favicon-fix.js: set project-scoped favicon to avoid root 404 */
(function(){
  try{
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }
    if (!link.href || link.getAttribute('href').startsWith('/')) {
      link.type = 'image/png';
      link.setAttribute('href', 'images/favicon.png');
    }
  }catch(e){/*ignore*/}
})();