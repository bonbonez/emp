(function(window, modules, $, BM){

  modules.define(
    'Item',
    [
      'extend',
      'baseView',
      'FormItemOrder'
    ],
    function(
      provide,
      extend,
      BaseView,
      FormOrder
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

        this._formOrder     = null;

        this.$elemFormOrder = this.$elem.find('@bm-form-order');

        this._initFormOrder();
      },

      _initFormOrder : function() {
          if (BM.tools.isNull(this._formOrder)) {
            this._formOrder = new FormOrder({
              element: this.$elemFormOrder
            });
          }
      },

      _getTemplateName : function() {
          return 'bm-item-template';
      }

    });

    provide(Item);

  });

}(this, this.modules, this.jQuery, this.BM));