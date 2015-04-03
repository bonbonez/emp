(function(window, modules, $, BM){

    modules.define('initButtonsAddToCart', ['buttonAddToCart'], function(provide, ButtonAddToCart) {

        $('@b-button-add').each(function(){
            var $this = $(this);
            new ButtonAddToCart({
                element: $this
            });
        });

        provide();

    });

}(this, this.modules, this.jQuery, this.BM));