/**
 * @fileOverview Вспомогательные функции для проверок переменных
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function (window, document, navigator, BM, undefined) {
  var
    /**
     * @alias       BM.tools.client
     */
    Breakpoint = {
      MOBILE: 639
    },

    tools = BM.tools = BM.tools || {},

    reload = function () {
      window.location.reload();
    },

    client = BM.tools.client = BM.tools.client || {},

    isWindows = function () {
      return navigator.appVersion.indexOf("Win") !== -1;
    },

    isMacOS = function () {
      return navigator.appVersion.indexOf("Mac") !== -1;
    },

    isUnix = function () {
      return navigator.appVersion.indexOf("X11") !== -1;
    },

    isLinux = function () {
      return navigator.appVersion.indexOf("Linux") !== -1;
    },

    isTouch = function () {
      return 'ontouchstart' in window || navigator.msMaxTouchPoints !== undefined;
    },

    isDesktop = function() {
      return !isTouch();
    },

    isiOS = function () {
      return ( /(iPad|iPhone|iPod)/g.test(window.navigator.userAgent) );
    },

    isAndroid = function () {
      return ( window.navigator.userAgent.toLowerCase().indexOf('android') !== -1 );
    },

    isWindowsPhone = function () {
      return ( window.navigator.userAgent.match(/Windows Phone/i) );
    },

    isBreakpointMobile = function () {
      return $(window).width() <= Breakpoint.MOBILE;
    };
  // end of vars

  tools.reload = reload;

  client.isWindows = isWindows;
  client.isMacOS = isMacOS;
  client.isUnix = isUnix;
  client.isLinux = isLinux;
  client.isTouch = isTouch;
  client.isiOS = isiOS;
  client.isAndroid = isAndroid;
  client.isWindowsPhone = isWindowsPhone;
  client.isBreakpointMobile = isBreakpointMobile;

}(
  this,
  this.document,
  this.navigator,
  this.BM = this.BM || {}
));