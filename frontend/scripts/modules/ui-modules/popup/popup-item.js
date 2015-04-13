(function(window, modules, $, BM){

  modules.define(
    'PopupItem',
    [
      'extend',
      'popupBaseClass',
      'dynamicContent',
      'Item'
    ],
    function(
      provide,
      extend,
      BasePopup,
      DynamicContent,
      Item
      ) {

    var PopupItem = extend(BasePopup),

        $class = PopupItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.call(this, {
          rootClassName: ['m-version-2', 'bm-popup-item'],
          useTemplate: true
        });

        this._dynamicContent = null;
        this._itemHandler    = null;

        this.$elemDynamicContent = this.$elem.find('@bm-dynamic-content');
        this.$elemContent        = this.$elem.find('@bm-popup-item-content');

        this._initDynamicContent();
        this._initItem();
      },

      _initDynamicContent : function() {
          if (BM.tools.isNull(this._dynamicContent)) {
            this._dynamicContent = new DynamicContent({
              element: this.$elemDynamicContent
            });
          }
      },

      _initItem : function() {
        if (BM.tools.isNull(this._itemHandler)) {
          this._itemHandler = new Item();
          this.$elemContent.append(this._itemHandler.getElement());
        }
      },

      show : function() {
        $super.show.apply(this, arguments);
        setTimeout(function() {
          this._dynamicContent.showStep('content');
        }.bind(this), 500);
      },

      _getTemplateName : function() {
          return 'bm-popup-item-template';
      }

    });

    provide(PopupItem);

  });

}(this, this.modules, this.jQuery, this.BM));