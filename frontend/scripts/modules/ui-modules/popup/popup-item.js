(function(window, modules, $, BM){

  modules.define(
    'PopupItem',
    [
      'extend',
      'popupBaseClass',
      'dynamicContent',
      'Item',

      'StateActions'
    ],
    function(
      provide,
      extend,
      BasePopup,
      DynamicContent,
      Item,
      StateActions
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

        this._config             = BM.tools.mixin({}, config);

        this._dynamicContent     = null;
        this._itemHandler        = null;

        this.$elemDynamicContent = this.$elem.find('@bm-dynamic-content');
        this.$elemContent        = this.$elem.find('@bm-popup-item-content');
        this.$elemButtonClose    = this.$elem.find('@bm-popup-item-button-close');

        this._initDynamicContent();
        this._bindEvents();
        this._initItem();
      },

      _bindEvents : function() {
        this.$elemButtonClose.on(BM.helper.event.clickName(), function() {
          this._onButtonCloseClick();
        }.bind(this));
      },

      _onButtonCloseClick : function() {
          this.hide();
      },

      _initDynamicContent : function() {
          if (BM.tools.isNull(this._dynamicContent)) {
            this._dynamicContent = new DynamicContent({
              element: this.$elemDynamicContent
            });
            this._dynamicContent.setStep('content');
          }
      },

      _initItem : function() {
        if (BM.tools.isNull(this._itemHandler)) {
          this._itemHandler = new Item({
            data: this._config.data
          });
          this.$elemContent.append(this._itemHandler.getElement());
        }
      },

      show() {
        StateActions.setViewingItem(this._config.data);
        $super.show.apply(this, arguments);
      },

      hide() {
        StateActions.setViewingItem(null);
        $super.hide.apply(this, arguments);
      },

      _getTemplateName : function() {
          return 'bm-popup-item-template';
      }

    });

    provide(PopupItem);

  });

}(this, this.modules, this.jQuery, this.BM));