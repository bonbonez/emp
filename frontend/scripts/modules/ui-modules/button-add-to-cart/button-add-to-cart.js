(function(window, modules, $, BM, radio){

    modules.define('buttonAddToCart', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var ButtonAddToCart = extend(PubSub),

            $class = ButtonAddToCart,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                if (!config.element) {
                    return;
                }

                this.$elem                = config.element;
                this.$elemButton          = this.$elem.find('@b-button-add-button');
                this.$elemButtonTextAdd   = this.$elem.find('@b-button-add-button-text-add');
                this.$elemButtonTextOrder = this.$elem.find('@b-button-add-button-text-order');
                this.$elemInCart          = this.$elem.find('@b-button-add-in-cart');

                this._config = {};

                this._parseConfig();
                this._setupEvents();
            },

            _parseConfig : function() {
                try {
                    this._config = JSON.parse(this.$elem.attr('data-config'));
                } catch (e) {}
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButton.on('click', function() {
                    me._onButtonClick();
                });
            },

            _onButtonClick : function() {
                if (this._isButtonStateAdd()) {
                    this._sendRequestAddToCart();
                } else {
                    console.log('order');
                }
            },

            _sendRequestAddToCart : function() {
                var me = this;
                this._setButtonStateWait(true);
                $.ajax({
                    url: '/api/cart/item/add',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function() {
                            me._onRequestAddToCartSuccess(data);
                        }, 300);
                    },
                    error : function() {
                        setTimeout(function(){
                            me._onRequestAddToCartError();
                        }, 300);
                    }
                })
            },

            _onRequestAddToCartSuccess : function(data) {
                this._setButtonStateWait(false);
                this._showButtonStateOrder(function() {console.log('hmm');
                    this._showAlreadyInCart();
                }.bind(this));
                radio('b-cart-update').broadcast(data);
            },

            _onRequestAddToCartError : function() {
                this._setButtonStateWait(false);
            },

            _setButtonStateWait : function(bool) {
                if (bool) {
                    this.$elemButton.attr('data-wait', 'true');
                } else {
                    this.$elemButton.removeAttr('data-wait');
                }
            },

            _showAlreadyInCart : function() {
                this.$elemInCart.attr('data-visible', 'true');
            },

            _hideAlreadyInCart : function() {
                this.$elemInCart.attr('data-visible', 'false');
            },

            _toggleButtonState : function(callback) {
                if (this._isButtonStateAdd()) {
                    this._showButtonStateOrder(callback);
                } else {
                    this._showButtonStateAdd(callback);
                }
            },

            _showButtonStateOrder : function(callback) {
                var me = this;
                this.$elemButton.width(this.$elemButton.width());
                this.$elemButton.attr('data-state', 'order');
                setTimeout(function(){
                    me.$elemButton.width(me.$elemButtonTextOrder.width());
                    me.$elemButtonTextOrder.attr('data-visible', 'true');

                    if (typeof callback === 'function') {
                        callback();
                    }
                }, 300);
                this.$elemButtonTextAdd.attr('data-visible', 'false');
                this.$elemButtonTextOrder.attr('data-visible', 'false');
            },

            _showButtonStateAdd : function(callback) {

            },

            _isButtonStateAdd : function() {
                return this.$elemButton.attr('data-state') === 'add';
            },

            _isButtonStateOrder : function() {

            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(ButtonAddToCart);

    });

}(this, this.modules, this.jQuery, this.BM, this.radio));