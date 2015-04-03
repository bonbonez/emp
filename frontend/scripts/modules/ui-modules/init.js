(function(window, modules, $){

    modules.define('beforeUIModulesInit', [
        'initCartProcessor'
    ], function( provide, initCartProcessor ){
        provide();
    });

    modules.define('ui-modules', [
        //'initFixedHeader'
        'beforeUIModulesInit',
        'initCartHeader',
        'initBlockRecent',
        'initButtonsAddToCart'

    ], function(provide){

        provide();
    });

}(this, this.modules, this.jQuery));