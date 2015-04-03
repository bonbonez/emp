/**
 * Загрузчик скриптов
 */

(function(window, document, BM) {
  var tools = BM.tools = BM.tools || {},
      config = BM.config = BM.config || {};

  var loadScripts = function loadScripts( templateType ) {
    var loadConfig = config.loadScriptsConfig;
    if ( loadConfig.hasOwnProperty(templateType) ) {
      loadConfig[templateType]();
    } else {
      loadConfig['default']();
    }
  };

  tools.loadScripts = loadScripts;
}(
  this,
  this.document,
  this.BM = this.BM || {}
));
