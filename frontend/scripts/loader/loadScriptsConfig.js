(function (window, document, modules, BM) {
  var config = BM.config || {},
      mainConfig = document.body.getAttribute('data-config'),
      parsedMainConfig = JSON.parse(mainConfig) || {};

  config.loadScriptsConfig = {

    'default' : function() {
        modules.require('ui-modules');
    },

    'catalogue-index' : function() {
        modules.require('ui-modules');
        modules.require('CatalogueInit');
    }
  };

}(
  this,
  this.document,
  this.modules,
  this.BM = this.BM || {}
));
