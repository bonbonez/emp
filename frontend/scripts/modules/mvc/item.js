(function(window, modules, $, BM){

  modules.define(
    'ItemModel',
    [
      'extend',
      'Model'
    ],
    function(
      provide,
      extend,
      Model
    ) {

      var ItemModel = extend(Model),

          $class = ItemModel,
          $super = $class.superclass;

      BM.tools.mixin($class.prototype, {

        initialize : function() {
          $super.initialize.apply(this, arguments);
        },

        getPrice : function() {
          return this._getPrice(250);
        },

        getPrice250 : function() {
          return this.getPrice();
        },

        getPrice500 : function() {
          return this._getPrice(500);
        },

        getPrice1000 : function() {
          return this._getPrice(1000);
        },

        _getPrice : function(amount) {
          var result = null;
          this._data.price.forEach(function(item){
            if (item.amount === amount) {
              result = item;
            }
          });
          return result.value;
        }

      });

      BM.tools.mixin($class.prototype, {

      });

      provide(ItemModel);

  });

}(this, this.modules, this.jQuery, this.BM));