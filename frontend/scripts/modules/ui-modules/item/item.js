(function(window, modules, $, BM){

  modules.define(
    'Item',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

    var Item = extend(BaseView),

        $class = Item,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }
      },

      _getTemplateName : function() {
          return 'bm-item-template';
      }

    });

    provide(Item);

  });

}(this, this.modules, this.jQuery, this.BM));