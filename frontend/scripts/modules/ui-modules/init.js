(function(window, modules, $){

  modules.define('beforeUIModulesInit', [
    'InitEventDispatcher'
  ], function( provide ){

    provide();
  });

  modules.define('ui-modules', [
    'beforeUIModulesInit',
    'initTransformOriginDependentElements'
    /*'initFixedHeader'
    'beforeUIModulesInit',
    'initCartHeader',
    'initBlockRecent',
    'initButtonsAddToCart'*/

  ], function(provide){
    if (BM.tools.client.isTouch()) {
      $('body').addClass('m-touch');
    } else {
      $('body').addClass('m-desktop');
    }
    provide();
  });

}(this, this.modules, this.jQuery));