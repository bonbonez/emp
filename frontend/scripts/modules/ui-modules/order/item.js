(function(window, modules, $, BM){

  modules.define(
    'OrderItem',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

    var OrderItem = extend(BaseView),

        $class = OrderItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function() {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }
      },

      _getTemplateName: function() {
        return 'bm-order-item-template'
      }

    });

    provide(OrderItem);

  });

}(this, this.modules, this.jQuery, this.BM));