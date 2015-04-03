(function(window, modules, $, radio){

    modules.define('pageCartInit', ['pageCartItem', 'CartProcessor'], function(provide, CartItem, cart) {

        var $elemPageCart = $('@b-page-cart');

        $('@b-cart-item').each(function(){
            var $this = $(this);
            new CartItem({ element: $this });
        });

        cart.on('update', function() {
            if (cart.getTotalItems() < 1) {
                $elemPageCart.attr('data-cart-empty', 'true');
            }
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.radio));