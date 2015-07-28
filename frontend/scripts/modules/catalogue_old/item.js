(function(window, modules, $, BM){

  modules.define(
    'CatalogueItemOld',
    [
      'extend',
      'baseView',
      'PopupItem'
    ],
    function(
      provide,
      extend,
      BaseView,
      PopupItem
      ) {

    var CatalogueItem = extend(BaseView),

        $class = CatalogueItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._popupHandler = null;

        this._bindEvents();
      },

      _bindEvents : function() {
          this.$elem.on(BM.helper.event.clickName(), function(event) {
              this._onClick(event);
          }.bind(this));
      },

      _onClick : function(event) {
        this.showPopup();
      },

      _initPopup : function() {
        if (BM.tools.isNull(this._popupHandler)) {
          this._popupHandler = new PopupItem();
        }
      },

      showPopup : function() {
        this._initPopup();
        this._popupHandler.show();
      }

    });

    provide(CatalogueItem);

  });

}(this, this.modules, this.jQuery, this.BM));