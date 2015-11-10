(function(window, modules, $, BM){

  modules.define(
    'OrderInit',
    [
      'extend',
      'baseView',
      'PageOrder',
      'CartStore'
    ],
    function(
      provide,
      extend,
      BaseView,
      PageOrder,
      CartStore
    ) {

      var OrderInit = extend(BaseView),

        $class  = OrderInit,
        $super  = $class.superclass,

        $window = $(window);

      BM.tools.mixin($class.prototype, {

        initialize : function() {
          $super.initialize.apply(this, arguments);

          if (!this.el) {
            return;
          }

          this._renderReact();
          this._bindEvents();
        },

        _bindEvents() {
          CartStore.addChangeListener(() => {
            this._onCartStoreChange();
          });
        },

        _onCartStoreChange() {
          let cart = CartStore.getCart();
          if (cart && _.isArray(cart.order_items) && cart.order_items.length === 0) {
            window.location.href = BM.helper.link.root();
          }
        },

        _renderReact: function() {
          React.render(
            <PageOrder />,
            this.el.get(0)
          );
        }

      });

      new OrderInit({
        element: $(document.body).find('@bm-page-order-wrapper')
      });

      provide(OrderInit);

    });

}(this, this.modules, this.jQuery, this.BM));