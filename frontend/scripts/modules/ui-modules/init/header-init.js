(function(window, modules, $) {
    
  modules.define(
    'HeaderInit',
    [
      'extend',
      'baseView',
      'CartStore'
    ],
    (
      provide,
      extend,
      BaseView,
      CartStore
    ) => {
      
      let HeaderInit = extend(BaseView),

          $class = HeaderInit,
          $super = $class.superclass;

      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);

          if (!this.el) {
            return;
          }

          this.$orderHeaderText = this.el.find('@bm-header-header-order-text');

          this._bindEvents();
        },

        _bindEvents() {
          CartStore.addChangeListener(() => {
            this._onCartStoreChange();
          });
        },

        _onCartStoreChange() {
          let cart = CartStore.getCart();
          this._setOrderHeaderVisible(cart && _.isArray(cart.order_items) && cart.order_items.length > 0);
        },

        _setOrderHeaderVisible(bool) {
          if (bool) {
            this.el.addClass('m-header-order-visible');
            this._updateHeaderOrder();
          } else {
            this.el.removeClass('m-header-order-visible')
          }

        },

        _updateHeaderOrder() {
          let cart        = CartStore.getCart();
          let text        = this.$orderHeaderText.data('order-header-text');
          let count       = cart.order_items.length;
          let wordPack    = BM.helper.pluralize.getWordPack(count, 2);
          let totalAmount = cart.total_amount;

          text = text.replace('%{count}', count);
          text = text.replace('%{wordPack}', wordPack);
          text = text.replace('%{totalAmount}', totalAmount);

          this.$orderHeaderText.html(text);
        }
      });

      new HeaderInit({
        element: $('@bm-header')
      });
          
      provide(HeaderInit);
    }
  );
    
}(this, this.modules, this.jQuery));