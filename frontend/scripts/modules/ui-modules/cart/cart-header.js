(function(window, modules, $, BM){

    modules.define('HeaderCart', ['basePubSub', 'extend', 'CartProcessor'], function(provide, PubSub, extend, cart) {

        var HeaderCart = extend(PubSub),

            $class = HeaderCart,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                if (!config || !config.element) {
                    return;
                }

                this.$elem            = config.element;
                this.$elemCounter     = this.$elem.find('@b-header-cart-counter');
                this.$elemCounterText = this.$elem.find('@b-header-cart-counter-text');
                this.$elemButtonOrder = this.$elem.find('@b-header-cart-button-order');

                this._setupEvents();
                this._updateData();
            },

            _setupEvents : function() {
                var me = this;
                cart.on('update', function() {
                    me._updateData();
                });
            },

            _showCounter : function() {
                this.$elemCounter.attr('data-visible', 'true');
            },

            _hideCounter : function() {
                this.$elemCounter.attr('data-visible', 'false');
            },

            _updateData : function() {
                this._updateDataCounter();
            },

            _updateDataCounter : function() {
                var amount = cart.getTotalItems();
                if (amount < 1) {
                    this._hideCounter();
                    this._hideButtonOrder();
                } else {
                    this._updateCounterText();
                    this._showCounter();
                    this._showButtonOrder();
                }
            },

            _showButtonOrder : function() {
                this.$elemButtonOrder.attr('data-visible', 'true');
            },

            _hideButtonOrder : function() {
                this.$elemButtonOrder.attr('data-visible', 'false');
            },

            _updateCounterText : function() {
                var amount = cart.getTotalItems();
                this.$elemCounterText.html(amount);
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(HeaderCart);
    });

    modules.define('initCartHeader', ['HeaderCart'], function(provide, HeaderCart) {

        var headerCart = new HeaderCart({
            element: $('@b-header-cart')
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.BM));