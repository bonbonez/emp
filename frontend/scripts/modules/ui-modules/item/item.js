(function(window, modules, $, BM){

  modules.define(
    'Item',
    [
      'extend',
      'baseView',
      'ItemModel',
      'ItemFormOrder',
      'ItemSpecsItem',
      'ItemBrewingMethodItem',
      'CartActions',
      'StateActions'
    ],
    function(
      provide,
      extend,
      BaseView,
      ItemModel,
      FormOrder,
      ItemSpecsItem,
      ItemBrewingMethodItem,
      CartActions
    ) {

    var Item = extend(BaseView),

        $class = Item,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._config            = BM.tools.mixin({}, config);
        this._item              = new ItemModel({ data: this._config.data });

        this._formOrder         = null;
        this.$elemFormOrder     = this.$elem.find('@bm-item-form-order');

        this.$name              = this.el.find('@bm-item-name');
        this.$descriptionShort  = this.el.find('@bm-item-description-short');
        this.$rating            = this.el.find('@bm-item-rating');
        this.$price             = this.el.find('@bm-item-price');
        this.$specsWrapper      = this.el.find('@bm-item-specs');
        this.$description       = this.el.find('@bm-item-description');
        this.$imageWrapper      = this.el.find('@bm-item-image-wrapper');
        this.$image             = this.el.find('@bm-item-image');
        this.$imagePlantation   = this.el.find('@bm-item-image-plantation');
        this.$methodsWrapper    = this.el.find('@bm-item-methods-wrapper');


        this._timeoutZoom      = null;
        this._specs            = [];
        this._methods          = [];

        this._initFormOrder();
        this._updateFormOrder();
        this._bindEvents();
        this.render();
      },

      _bindEvents : function() {
        if (BM.tools.client.isTouch()) {
          this.$imageWrapper.on('tap', function(event){
            this._onImageWrapperTap();
          }.bind(this));
        } else {
          this.$imageWrapper.on('mouseover', function(event){
            this._onImageWrapperMouseOver();
          }.bind(this));
          this.$imageWrapper.on('mouseout', function(event){
            this._onImageWrapperMouseOut();
          }.bind(this));
        }
      },

      _onImageWrapperTap : function() {
        this._toggleZoom();
      },

      _onImageWrapperMouseOver : function() {
        if (this._isZoomVisible()) {
          return;
        }

        this._clearTimeoutZoom();
        this._timeoutZoom = setTimeout(function(){
          this._showZoom();
        }.bind(this), 300);
      },

      _onImageWrapperMouseOut : function() {
        this._clearTimeoutZoom();
        this._hideZoom();
      },

      _clearTimeoutZoom : function() {
        if (!BM.tools.isNull(this._timeoutZoom)) {
          clearTimeout(this._timeoutZoom);
          this._timeoutZoom = null;
        }
      },

      _toggleZoom : function() {
        if (this._isZoomVisible()) {
          this._hideZoom();
        } else {
          this._showZoom();
        }
      },

      _showZoom : function() {
        this.el.addClass('m-scale-visible');
      },

      _hideZoom : function() {
        this.el.removeClass('m-scale-visible');
      },

      _isZoomVisible : function() {
        return this.el.hasClass('m-scale-visible');
      },

      render : function() {
        if (!this._config.data) {
          return;
        }

        this.$name.html(this._config.data.name);
        this.$descriptionShort.html(this._config.data.descriptionShort);
        this.$rating.attr('data-value', this._config.data.rating);
        this.$price.html(this._item.getPrice250());
        this.$description.html(this._config.data.description);
        this.$image.attr('src', this._config.data.image.large);
        this.$imagePlantation.attr('src', this._config.data.imagePlantation.default);

        this._renderSpecs();
        this._renderBrewingMethods();
      },

      _renderSpecs : function() {
        this._specs.forEach(function(spec){spec.destroy()});
        this._specs.length = 0;
        this._specs = [];
        this.$specsWrapper.html('');

        this._config.data.specsWithLabels.forEach(function(specData){
          var spec = new ItemSpecsItem({
            data: specData,
            options: {
              hint: true
            }
          });
          this.$specsWrapper.append(
            spec.getElement()
          );
        }.bind(this));
      },

      _renderBrewingMethods : function() {
        this._methods.forEach(function(method){method.destroy()});
        this._methods.length = 0;
        this._methods = [];
        this.$methodsWrapper.html('');

        this._config.data.methodsWithLabels.forEach(function(methodData){
          var method = new ItemBrewingMethodItem({
            data: methodData
          });
          this.$methodsWrapper.append(
            method.getElement()
          );
        }.bind(this));
      },

      _initFormOrder : function() {
          if (BM.tools.isNull(this._formOrder)) {
            this._formOrder = new FormOrder({
              element: this.$elemFormOrder
            });
            this._formOrder.on('add', (obj) => {
              this._addItemToCart(obj);
            });
          }
      },

      _addItemToCart(data) {
        CartActions.addItem(
          this._config.data.id,
          data.amount,
          data.grind
        );
      },

      _updateFormOrder : function() {
        this._formOrder.setPrices(
          this._item.getData().price
        );
      },

      _getTemplateName : function() {
          return 'bm-item-template';
      }

    });

    provide(Item);

  });

}(this, this.modules, this.jQuery, this.BM));