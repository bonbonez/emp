(function(window, modules, $, radio){

    modules.define('CartProcessorClass', ['basePubSub', 'extend'], function(provide, PubSub, extend){

        var CartProcessor = extend(PubSub),

            $class = CartProcessor,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(){
                $super.initialize.apply(this, arguments);

                this._data = {
                    items: []
                };
            },

            setData : function(data) {
                if (data) {
                    if (typeof data === 'string') {
                        try {
                            data = JSON.parse(data);
                        } catch (e) {}
                    }
                    this._data = data;
                    this._notify('update');
                }
            },

            getData : function() {
                return this._data;
            },

            getTotalItems : function() {
                var total = 0;
                this._data.items.forEach(function(elem){
                    total += elem.amount;
                });
                return total
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(CartProcessor);

    });

    modules.define('CartProcessor', ['CartProcessorClass'], function(provide, CartProcessor){
        var $body = $(document.body),
            cart  = new CartProcessor();

        try {
            cart.setData(JSON.parse($body.attr('data-cart-config')));
        } catch (e) {}

        provide(cart)
    });

    modules.define('initCartProcessor', ['CartProcessor'], function(provide, cart){

        radio('b-cart-update').subscribe(function(data){
            cart.setData(data);
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.radio));