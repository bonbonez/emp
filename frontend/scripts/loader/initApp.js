(function(window, document, BM, $) {
  'use strict';

  var tools        = BM.tools  = BM.tools  || {},
      config       = BM.config = BM.config || {},
      dataScripts  = document.body.getAttribute('data-scripts'),
      templateType = dataScripts || config.mainConfig.action + '-' + config.mainConfig.scriptTemplate;

  if (true || config.debug) {
    console.enable();
  }

  $(function(){
      tools.loadScripts(templateType);
  });
}(
  this,
  this.document,
  this.BM || {},
  this.jQuery
));
