(function(window, modules, $, radio){

  modules.define(
    'InitGlobalStylesModifiers',
    [],
    function(provide) {

      var $body = $(document.body);

      if (BM.tools.client.isTouch()) {
        $body.addClass('m-touch');
      } else {
        $body.addClass('m-desktop');
      }

      provide();
    });

}(
  this,
  this.modules,
  this.jQuery,
  this.radio
));