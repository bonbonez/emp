(function(window, modules, $){

    modules.define('pageCartItem', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var CartItem = extend(PubSub),

            $class = CartItem,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem = config.element;
                this.$elemButtonRemove = this.$elem.find('@b-cart-item-button-remove');
                this.$elemButtonMinus  = this.$elem.find('@b-cart-item-button-minus');
                this.$elemButtonPlus   = this.$elem.find('@b-cart-item-button-plus');
                this.$elemAmount       = this.$elem.find('@b-cart-item-amount');
                this.$elemPrice        = this.$elem.find('@b-cart-item-price');
                this.$elemPriceTotal   = this.$elem.find('@b-cart-item-price-total');

                this._config = {
                    item: {
                        id: null
                    }
                };

                this._parseConfig();
                this._updateLayout();
                this._setupEvents();
            },

            _parseConfig : function() {
                try {
                    this._config = JSON.parse(this.$elem.attr('data-config'));
                } catch (e) {}
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButtonRemove.on('click', function() {
                    me._onButtonCloseClick();
                });
                this.$elemButtonMinus.on('click', function() {
                    me._onButtonMinusClick();
                });
                this.$elemButtonPlus.on('click', function() {
                    me._onButtonPlusClick();
                })

            },

            _onButtonCloseClick : function() {
                //this.hide();
                //this._setStateWait(true);
                var me = this;
                this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/remove',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function() {
                            me._onRequestItemRemoveSuccess(data);
                        }, 300);
                    },
                    error : function() {
                        setTimeout(function(){
                            me._onRequestAddToCartError();
                        }, 300);
                    }
                })
            },

            _onButtonMinusClick : function() {
                if (this._getCurrentAmount() > 1) {
                    this._sendRequestDecItem();
                }
            },

            _sendRequestDecItem : function() {
                var me = this;
                //this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/dec',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function(){
                            me._onRequestDecItemSuccess();
                            radio('b-cart-update').broadcast(data);
                        }, 300);
                    },
                    error : function() {
                        me._onRequestDecItemError();
                    }
                });
            },

            _onRequestDecItemSuccess : function() {
                this._setStateWait(false);
                this._decItemAmount();
                this._updatePrice();
            },

            _onRequestDecItemError : function() {
                this._setStateWait(false);
            },

            _onButtonPlusClick : function() {
                this._sendRequestIncItem();
            },

            _sendRequestIncItem : function() {
                var me = this;
                //this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/inc',
                    type: 'post',
                    dataType : 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function(){
                            me._onRequestIncItemSuccess(data);
                        }, 300);
                    },
                    error : function() {
                        me._onRequestIncItemError();
                    }
                });
            },

            _onRequestIncItemSuccess : function(data) {
                this._setStateWait(false);
                this._incItemAmount();
                this._updatePrice();
                radio('b-cart-update').broadcast(data);
            },

            _onRequestIncItemError : function() {
                this._setStateWait(false);
            },

            _onRequestItemRemoveSuccess : function(data) {
                var me = this;
                setTimeout(function(){
                    me.hide();
                    radio('b-cart-update').broadcast(data);
                }.bind(this), 300);
            },

            _onRequestItemRemoveError : function() {
                setTimeout(function(){
                    this._setStateWait(false);
                }.bind(this), 300);
            },

            _slideOut : function(callback) {

            },

            hide : function() {
                this.$elem.attr('data-visible', 'false');
            },

            _updateLayout : function() {

            },

            _setStateWait : function(bool) {
                if (bool) {
                    this.$elem.attr('data-wait', 'true');
                } else {
                    this.$elem.attr('data-wait', 'fasle');
                }
            },

            _getCurrentAmount : function() {
                var amount = this.$elemAmount.html();
                amount = parseInt(amount, 10);
                return amount;
            },

            _incItemAmount : function() {
                var amount = this._getCurrentAmount();
                this._showButtonMinus();
                return this.$elemAmount.html(amount + 1);
            },

            _decItemAmount : function() {
                var amount = this._getCurrentAmount();
                if (amount <= 2) {
                    this._hideButtonMinus();
                }
                return this.$elemAmount.html(amount - 1);
            },

            _showButtonMinus : function() {
                this.$elemButtonMinus.attr('data-visible', 'true');
            },

            _hideButtonMinus : function() {
                this.$elemButtonMinus.attr('data-visible', 'false');
            },

            _updatePrice : function() {
                var amount = this._getCurrentAmount();
                if (amount > 1) {
                    this._showPriceTotal();
                } else {
                    this._hidePriceTotal();
                }
            },

            _showPriceTotal : function() {
                this.$elemPriceTotal.html(this._getCurrentAmount() * this._config.item.price);
                this.$elemPrice.attr('data-total-visible', 'true');
            },

            _hidePriceTotal : function() {
                this.$elemPrice.attr('data-total-visible', 'false');
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(CartItem);
    });

}(this, this.modules, this.jQuery));