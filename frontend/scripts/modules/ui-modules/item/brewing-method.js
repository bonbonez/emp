(function(window, modules, $, BM){

  modules.define(
    'ItemBrewingMethodItem',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

      var ItemBrewingMethodItem = extend(BaseView),

        $class = ItemBrewingMethodItem,
        $super = $class.superclass;

      BM.tools.mixin($class.prototype, {

        initialize : function(config) {
          $super.initialize.apply(this, arguments);

          if (!this.el) {
            return;
          }

          this.$text = this.el.find('@bm-brewing-method-item-text');

          this._config = BM.tools.mixin({}, config);

          this.render();
        },

        render : function() {
          if (!this._config.data) {
            return;
          }

          this.el.attr('data-name', this._config.data.name);
          this.el.attr('data-size', this._config.data.size || "normal");
          this.$text.html(this._config.data.text);
        },

        _getTemplateName : function() {
          return 'bm-brewing-method-item-template';
        }

      });

      provide(ItemBrewingMethodItem);

    });

}(this, this.modules, this.jQuery, this.BM));