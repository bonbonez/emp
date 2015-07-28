(function(window, modules, $, BM){

  modules.define('CatalogueBackground', ['extend', 'baseView', 'EventDispatcher'], function(provide, extend, BaseView, EventDispatcher) {

    var CatalogueBackground = extend(BaseView),

        $class  = CatalogueBackground,
        $super  = $class.superclass,

        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._items = {
          mono:  this._getItem('mono'),
          aroma: this._getItem('aroma')
        };
        this._itemsArr = [
          this._items.mono,
          this._items.aroma
        ];

        this._baseHeight                = null;
        this._currentItem               = this._items.mono;
        this._lastOffsetValue           = null;

        this._updateFull();
        this._bindEvents();

        setTimeout(function() {
          this._updateFull();
        }.bind(this), 300)
      },

      _getItem : function(name) {
        var $elem = this.$elem.find('[data-item=' + name + ']');
        return {
          elem :  $elem,
          size:   $elem.data('size'),
          height: $elem.height(),
          aspect: parseFloat($elem.data('aspect'))
        };
      },

      _bindEvents : function() {
        EventDispatcher.on('window-resize', function() {
          this._updateFull();
        }.bind(this));
      },

      setCurrentItem : function(itemName) {
        if (itemName === this._currentItem.elem.data('item')) {
          return;
        }

        var item = this._getItem(itemName);
        if (item.elem.length < 1) {
          return;
        }

        item.elem.prependTo(this.$elem);
        item.elem.addClass('m-visible');
        this._currentItem.elem.removeClass('m-visible');
        this._currentItem = item;

        this._notify('update', item.elem.data('item'));
      },

      _getCurrentItem : function() {

      },

      setProgress : function(value) {
        if (!BM.tools.isNumber(value)) {
          return;
        }

        value = Math.min(100, Math.max(0, value));
        this._setCurrentItemOffset(value);
      },

      _updateFull : function() {
        this._updateOrientation();
        this._updateBaseHeightValue();
        this._updateCurrentItemOffset();
      },

      _setCurrentItemOffset : function(value) {
        this._lastOffsetValue = value;

        var offset = (this._currentItem.height - this._baseHeight) / 100 * value * -1;

        window.requestAnimationFrame(function() {
          this._currentItem.elem.css({
            'transform' : 'translateY(' + offset + 'px)'
          });
        }.bind(this));

      },

      _updateOrientation : function() {
        var windowAspect = window.innerWidth / window.innerHeight;
        this._itemsArr.forEach(function(item) {
          if (item.aspect >= windowAspect) {
            item.elem.addClass('m-orientation-inverted');
          } else {
            item.elem.removeClass('m-orientation-inverted');
          }
        })
      },

      _updateBaseHeightValue : function() {
        this._baseHeight = this.$elem.height();
      },

      _updateCurrentItemOffset : function() {
        if (!BM.tools.isNull(this._lastOffsetValue)) {
          this._setCurrentItemOffset(this._lastOffsetValue);
        }
      }

    });

    provide(CatalogueBackground);

  });

}(this, this.modules, this.jQuery, this.BM));