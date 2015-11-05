(function(window, modules, $, BM){

  modules.define(
    'ItemFormOrderSelectedItem',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

      var ItemFormOrderSelectedItem = extend(BaseView),

        $class = ItemFormOrderSelectedItem,
        $super = $class.superclass;

      BM.tools.mixin($class.prototype, {

        initialize : function() {
          $super.initialize.call(this, {
            useTemplate: true
          });

          if (!this.el) {
            return;
          }


          this._bindEvents();
        },

        _bindEvents : function() {
          var self      = this;
          var clickName = BM.helper.event.clickName();

        },

        _getTemplateName : function() {
          return 'bm-item-form-order-selected-item';
        }

      });

      provide(ItemFormOrderSelectedItem);

    });

}(this, this.modules, this.jQuery, this.BM));