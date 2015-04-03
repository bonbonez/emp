(function (window, document, modules, BM) {
  var config = BM.config || {},
      mainConfig = document.body.getAttribute('data-config'),
      parsedMainConfig = JSON.parse(mainConfig) || {},
      assetHost = parsedMainConfig.assetHost || '';

  var getWithVersion = function getWithVersion( filename ) {
    var debug = config.debug || parsedMainConfig.debug || false,
        version = parsedMainConfig.version || new Date();

    //if (!debug) {
      //filename = filename.replace('js', 'min.js');
    //}

    return filename += '?t=' + version;
  };

  config.loadScriptsConfig = {

    'default' : function() {
        modules.require('ui-modules');
    },

    'item-show' : function() {
        modules.require('ui-modules');
        modules.require('moduleItemInit');
    },

    'cart-index' : function() {
        modules.require('ui-modules');
        modules.require('pageCartInit');
    },

    'survey-index' : function() {
        modules.require('ui-modules');
        modules.require('moduleSurveyInit');
    }
  };

}(
  this,
  this.document,
  this.modules,
  this.BM = this.BM || {}
));
