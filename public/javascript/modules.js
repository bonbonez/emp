var $__cart_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "cart/init.js";
  return {};
})();

var $__cart_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "cart/item.js";
  (function(window, modules, $) {
    modules.define('pageCartItem', ['basePubSub', 'extend'], function(provide, PubSub, extend) {
      var CartItem = extend(PubSub),
          $class = CartItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          this.$elem = config.element;
          this.$elemButtonRemove = this.$elem.find('@b-cart-item-button-remove');
          this.$elemButtonMinus = this.$elem.find('@b-cart-item-button-minus');
          this.$elemButtonPlus = this.$elem.find('@b-cart-item-button-plus');
          this.$elemAmount = this.$elem.find('@b-cart-item-amount');
          this.$elemPrice = this.$elem.find('@b-cart-item-price');
          this.$elemPriceTotal = this.$elem.find('@b-cart-item-price-total');
          this._config = {item: {id: null}};
          this._parseConfig();
          this._updateLayout();
          this._setupEvents();
        },
        _parseConfig: function() {
          try {
            this._config = JSON.parse(this.$elem.attr('data-config'));
          } catch (e) {}
        },
        _setupEvents: function() {
          var me = this;
          this.$elemButtonRemove.on('click', function() {
            me._onButtonCloseClick();
          });
          this.$elemButtonMinus.on('click', function() {
            me._onButtonMinusClick();
          });
          this.$elemButtonPlus.on('click', function() {
            me._onButtonPlusClick();
          });
        },
        _onButtonCloseClick: function() {
          var me = this;
          this._setStateWait(true);
          $.ajax({
            url: '/api/cart/item/remove',
            type: 'post',
            dataType: 'json',
            data: {item: {id: this._config.item.id}},
            success: function(data) {
              setTimeout(function() {
                me._onRequestItemRemoveSuccess(data);
              }, 300);
            },
            error: function() {
              setTimeout(function() {
                me._onRequestAddToCartError();
              }, 300);
            }
          });
        },
        _onButtonMinusClick: function() {
          if (this._getCurrentAmount() > 1) {
            this._sendRequestDecItem();
          }
        },
        _sendRequestDecItem: function() {
          var me = this;
          $.ajax({
            url: '/api/cart/item/dec',
            type: 'post',
            dataType: 'json',
            data: {item: {id: this._config.item.id}},
            success: function(data) {
              setTimeout(function() {
                me._onRequestDecItemSuccess();
                radio('b-cart-update').broadcast(data);
              }, 300);
            },
            error: function() {
              me._onRequestDecItemError();
            }
          });
        },
        _onRequestDecItemSuccess: function() {
          this._setStateWait(false);
          this._decItemAmount();
          this._updatePrice();
        },
        _onRequestDecItemError: function() {
          this._setStateWait(false);
        },
        _onButtonPlusClick: function() {
          this._sendRequestIncItem();
        },
        _sendRequestIncItem: function() {
          var me = this;
          $.ajax({
            url: '/api/cart/item/inc',
            type: 'post',
            dataType: 'json',
            data: {item: {id: this._config.item.id}},
            success: function(data) {
              setTimeout(function() {
                me._onRequestIncItemSuccess(data);
              }, 300);
            },
            error: function() {
              me._onRequestIncItemError();
            }
          });
        },
        _onRequestIncItemSuccess: function(data) {
          this._setStateWait(false);
          this._incItemAmount();
          this._updatePrice();
          radio('b-cart-update').broadcast(data);
        },
        _onRequestIncItemError: function() {
          this._setStateWait(false);
        },
        _onRequestItemRemoveSuccess: function(data) {
          var me = this;
          setTimeout(function() {
            me.hide();
            radio('b-cart-update').broadcast(data);
          }.bind(this), 300);
        },
        _onRequestItemRemoveError: function() {
          setTimeout(function() {
            this._setStateWait(false);
          }.bind(this), 300);
        },
        _slideOut: function(callback) {},
        hide: function() {
          this.$elem.attr('data-visible', 'false');
        },
        _updateLayout: function() {},
        _setStateWait: function(bool) {
          if (bool) {
            this.$elem.attr('data-wait', 'true');
          } else {
            this.$elem.attr('data-wait', 'fasle');
          }
        },
        _getCurrentAmount: function() {
          var amount = this.$elemAmount.html();
          amount = parseInt(amount, 10);
          return amount;
        },
        _incItemAmount: function() {
          var amount = this._getCurrentAmount();
          this._showButtonMinus();
          return this.$elemAmount.html(amount + 1);
        },
        _decItemAmount: function() {
          var amount = this._getCurrentAmount();
          if (amount <= 2) {
            this._hideButtonMinus();
          }
          return this.$elemAmount.html(amount - 1);
        },
        _showButtonMinus: function() {
          this.$elemButtonMinus.attr('data-visible', 'true');
        },
        _hideButtonMinus: function() {
          this.$elemButtonMinus.attr('data-visible', 'false');
        },
        _updatePrice: function() {
          var amount = this._getCurrentAmount();
          if (amount > 1) {
            this._showPriceTotal();
          } else {
            this._hidePriceTotal();
          }
        },
        _showPriceTotal: function() {
          this.$elemPriceTotal.html(this._getCurrentAmount() * this._config.item.price);
          this.$elemPrice.attr('data-total-visible', 'true');
        },
        _hidePriceTotal: function() {
          this.$elemPrice.attr('data-total-visible', 'false');
        },
        destroy: function() {
          $super.destroy.apply(this, arguments);
        }
      });
      provide(CartItem);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__catalogue_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/init.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueInit', ['extend', 'baseView', 'CatalogueMenu', 'CatalogueItem'], function(provide, extend, BaseView, CatalogueMenu, CatalogueItem) {
      var CatalogueInit = extend(BaseView),
          $class = CatalogueInit,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this.$menu = this.$elem.find('@bm-page-catalogue-menu');
          this.$itemsWrapper = this.$elem.find('@bm-catalogue-items-wrapper');
          this.$itemsGridWrapper = this.$elem.find('@bm-catalogue-items-grid');
          this.$items = this.$itemsGridWrapper.find('@bm-catalogue-item');
          this.$itemsSpecialWrapper = this.$elem.find('@bm-catalogue-items-special');
          this.$itemsSpecial = this.$itemsSpecialWrapper.find('@bm-catalogue-item');
          this._menu = null;
          this._items = [];
          this._initMenu();
          this._initItems();
          this._updateItems();
          this._bindEvents();
          this._items[0]._showPopup();
        },
        _bindEvents: function() {},
        _initItems: function() {
          var self = this;
          this.$items.each(function() {
            var instance = new CatalogueItem({element: $(this)});
            self._items.push(instance);
          });
        },
        _initMenu: function() {
          if (!BM.tools.isNull(this._menu)) {
            return;
          }
          this._menu = new CatalogueMenu({element: this.$menu});
          this._menu.on('category-selected', function(categoryName, special) {
            if (!special) {
              this.el.removeAttr('data-special');
              this.$itemsGridWrapper.attr('data-selected-category', categoryName);
              BM.helper.browser.triggerRerender();
              this._updateItems();
            } else {
              this.el.attr('data-special', special);
            }
          }.bind(this));
        },
        _updateItems: function() {
          if (BM.tools.client.isTouch()) {
            return;
          }
          var self = this;
          this.$items.filter(':visible').each(function(i, el) {
            var handler = self._getItemHandler(this);
            if (!BM.tools.isNull(handler)) {
              (i + 1) % 4 === 0 ? handler.dockMoreToRight() : handler.dockMoreToLeft();
            }
          });
        },
        _getItemHandler: function(el) {
          return this._items.filter(function(item) {
            return item.el.get(0) === el;
          })[0] || null;
        }
      });
      new CatalogueInit({element: $(document.body).find('@bm-page-catalogue')});
      provide(CatalogueInit);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/item.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueItem', ['extend', 'baseView', 'PopupItem'], function(provide, extend, BaseView, PopupItem) {
      var CatalogueItem = extend(BaseView),
          $class = CatalogueItem,
          $super = $class.superclass,
          $window = $(window);
      var MORE_INFO_FADE_DISTANCE = 70,
          MORE_INFO_FADE_BOUNDS = {
            fr: 1,
            to: 0.1
          };
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this._config = {};
          this.$content = this.el.find('@bm-catalogue-item-content');
          this.$moreInfo = this.el.find('@bm-catalogue-item-more-info');
          this._offset = null;
          this._contentWidth = null;
          this._widthWithMore = null;
          this._parseConfig();
          this._bindEvents();
        },
        _bindEvents: function() {
          this.el.on(BM.helper.event.clickName(), function(event) {
            this._onClick();
          }.bind(this));
          this.el.on('mouseover', function(event) {
            this._onMouseOver(event);
          }.bind(this));
          this.el.on('mouseout', function(event) {
            this._onMouseOut(event);
          }.bind(this));
          this.el.on('mousemove', function(event) {
            this._onMouseMove(event);
          }.bind(this));
        },
        _onClick: function(event) {
          this._showPopup();
        },
        _onMouseOver: function(event) {
          if (this._isMoreVisible()) {
            return;
          }
          this._setMoreInfoVisible(true);
          BM.helper.browser.triggerRerender();
        },
        _onMouseOut: function(event) {
          this._setMoreInfoVisible(false);
        },
        _onMouseMove: function(event) {
          this._updateElementOffset();
          this._updateContentWidth();
          this._updateWidthWithMore();
          var posX = event.pageX - this._offset.left,
              bounds = MORE_INFO_FADE_BOUNDS,
              boundsDiff = bounds.fr - bounds.to;
          if (this._isMoreDockedToLeft()) {
            var fadeStart = this._contentWidth,
                fadeEnd = this._contentWidth + MORE_INFO_FADE_DISTANCE;
            if (posX > fadeEnd) {
              this._setMoreInfoVisible(false);
            } else if (posX > fadeStart && posX < fadeEnd) {
              var pos = posX - this._contentWidth,
                  posRel = pos / MORE_INFO_FADE_DISTANCE,
                  opacity = bounds.to + (boundsDiff * (1 - posRel));
              this._setMoreOpacity(opacity);
            }
          } else if (this._isMoreDockedToRight() && !BM.tools.isNull(this._widthWithMore) && posX <= 0) {
            var fadeEnd = MORE_INFO_FADE_DISTANCE,
                pos = Math.abs(posX);
            if (pos > fadeEnd) {
              this._setMoreInfoVisible(false);
            } else {
              var posRel = pos / MORE_INFO_FADE_DISTANCE,
                  opacity = bounds.to + (boundsDiff * (1 - posRel));
              this._setMoreOpacity(opacity);
            }
          }
        },
        _showPopup: function() {
          if (BM.tools.isNull(this._popup)) {
            this._popup = new PopupItem({data: this._config});
          }
          this._popup.show();
        },
        _updateElementOffset: function() {
          if (BM.tools.isNull(this._offset)) {
            this._offset = this.el.offset();
          }
        },
        _updateContentWidth: function() {
          if (BM.tools.isNull(this._contentWidth)) {
            this._contentWidth = this.$content.width();
          }
        },
        _updateWidthWithMore: function() {
          if (BM.tools.isNull(this._widthWithMore) && this.el.hasClass('m-dock-more-to-right')) {
            this._widthWithMore = this.el.width();
          }
        },
        _setMoreInfoVisible: function(bool) {
          bool ? this.el.addClass('m-more-info-visible') && this._setMoreOpacity(1) : this.el.removeClass('m-more-info-visible');
        },
        _setMoreOpacity: function(value) {
          value = Math.min(1, Math.max(0, value));
          this.$moreInfo.css({'opacity': value});
        },
        _isMoreDockedToLeft: function() {
          return !this.el.hasClass('m-dock-more-to-right');
        },
        _isMoreDockedToRight: function() {
          return this.el.hasClass('m-dock-more-to-right');
        },
        _isMoreVisible: function() {
          return this.el.hasClass('m-more-info-visible');
        },
        dockMoreToRight: function() {
          this.el.addClass('m-dock-more-to-right');
        },
        dockMoreToLeft: function() {
          this.el.removeClass('m-dock-more-to-right');
        }
      });
      provide(CatalogueItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_47_menu_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/menu.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueMenu', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var CatalogueMenu = extend(BaseView),
          $class = CatalogueMenu,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this.$list = this.$elem.find('@bm-page-catalogue-list');
          this.$select = this.$elem.find('@bm-page-catalogue-select');
          this.$listItems = this.$list.find('@bm-page-catalogue-menu-item');
          this.$selectItems = this.$select.find('@bm-page-catalogue-menu-select-item');
          this.$selectDropdownButton = this.el.find('@bm-page-catalogue-menu-select-dropdown-button');
          this.$selectCurrentItemWrapper = this.el.find('@bm-page-catalogue-menu-select-current-item-wrapper');
          this._offset = null;
          this._selectItemHeight = null;
          this._updateSelect();
          this._bindEvents();
        },
        _bindEvents: function() {
          var self = this,
              clickName = BM.helper.event.clickName();
          this.$selectItems.on(clickName, function(event) {
            self._onSelectItemClick(event, this);
          });
          this.$listItems.on(clickName, function(event) {
            this._onListItemClick(event);
          }.bind(this));
        },
        _updateSelect: function() {
          this._updateMenuOffset();
          this._updateSelectItemHeight();
          this._updateItemsPosition();
        },
        _updateItemsPosition: function() {
          var self = this;
          this.$selectItems.each(function(i, el) {
            if (i < 1) {
              return;
            }
            var $item = $(this);
            console.log();
            $item.css({'transform': 'translateY(' + self._selectItemHeight * i + 'px)'});
          });
        },
        _updateMenuOffset: function() {
          if (!BM.tools.isNull(this._offset)) {
            this._updateMenuOffset = function() {};
            return;
          }
          this._offset = this.el.offset();
        },
        _updateSelectItemHeight: function() {
          if (!BM.tools.isNull(this._selectItemHeight)) {
            this._updateSelectItemHeight = function() {};
            return;
          }
          this._selectItemHeight = this._getSelectedSelectItem().height();
        },
        _getSelectedSelectItem: function() {
          return this.$selectItems.filter(function() {
            return $(this).hasClass('m-selected');
          });
        },
        _updateSelectItemWrapper: function() {
          this.$selectItems.each(function() {
            var $this = $(this),
                $item = $this.find('@bm-page-catalogue-menu-item');
            if ($item.hasClass('m-selected')) {
              $this.addClass('m-selected');
            } else {
              $this.removeClass('m-selected');
            }
          });
        },
        _onSelectItemClick: function(event, $item) {
          $item = $($item);
          if ($item.hasClass('m-selected')) {
            this._toggleMenu();
          } else {
            this.$selectItems.removeClass('m-selected');
            $item.addClass('m-selected');
            this._toggleMenu();
            var $menuItem = $item.find('@bm-page-catalogue-menu-item');
            this._notify('category-selected', $menuItem.data('name'), $menuItem.data('special'));
          }
        },
        _toggleMenu: function() {
          if (this._isSelectExpanded()) {
            this._collapseSelect();
          } else {
            this._expandSelect();
          }
        },
        _isSelectExpanded: function() {
          return this.el.hasClass('m-select-expanded');
        },
        _expandSelect: function() {
          this.el.addClass('m-select-expanded');
        },
        _collapseSelect: function() {
          this.el.removeClass('m-select-expanded');
        },
        _onListItemClick: function(event) {
          var $item = $(event.target),
              name = $item.data('name');
          if (BM.tools.isNull($item.data('name'))) {
            $item = $item.parent('.bm-page-catalogue-menu-item');
            name = $item.name;
          }
          this.$listItems.removeClass('m-selected');
          $item.addClass('m-selected');
          this._notify('category-selected', $item.data('name'), $item.data('special'));
        }
      });
      provide(CatalogueMenu);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_95_old_47_background_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue_old/background.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueBackground', ['extend', 'baseView', 'EventDispatcher'], function(provide, extend, BaseView, EventDispatcher) {
      var CatalogueBackground = extend(BaseView),
          $class = CatalogueBackground,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this._items = {
            mono: this._getItem('mono'),
            aroma: this._getItem('aroma')
          };
          this._itemsArr = [this._items.mono, this._items.aroma];
          this._baseHeight = null;
          this._currentItem = this._items.mono;
          this._lastOffsetValue = null;
          this._updateFull();
          this._bindEvents();
          setTimeout(function() {
            this._updateFull();
          }.bind(this), 300);
        },
        _getItem: function(name) {
          var $elem = this.$elem.find('[data-item=' + name + ']');
          return {
            elem: $elem,
            size: $elem.data('size'),
            height: $elem.height(),
            aspect: parseFloat($elem.data('aspect'))
          };
        },
        _bindEvents: function() {
          EventDispatcher.on('window-resize', function() {
            this._updateFull();
          }.bind(this));
        },
        setCurrentItem: function(itemName) {
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
        _getCurrentItem: function() {},
        setProgress: function(value) {
          if (!BM.tools.isNumber(value)) {
            return;
          }
          value = Math.min(100, Math.max(0, value));
          this._setCurrentItemOffset(value);
        },
        _updateFull: function() {
          this._updateOrientation();
          this._updateBaseHeightValue();
          this._updateCurrentItemOffset();
        },
        _setCurrentItemOffset: function(value) {
          this._lastOffsetValue = value;
          var offset = (this._currentItem.height - this._baseHeight) / 100 * value * -1;
          window.requestAnimationFrame(function() {
            this._currentItem.elem.css({'transform': 'translateY(' + offset + 'px)'});
          }.bind(this));
        },
        _updateOrientation: function() {
          var windowAspect = window.innerWidth / window.innerHeight;
          this._itemsArr.forEach(function(item) {
            if (item.aspect >= windowAspect) {
              item.elem.addClass('m-orientation-inverted');
            } else {
              item.elem.removeClass('m-orientation-inverted');
            }
          });
        },
        _updateBaseHeightValue: function() {
          this._baseHeight = this.$elem.height();
        },
        _updateCurrentItemOffset: function() {
          if (!BM.tools.isNull(this._lastOffsetValue)) {
            this._setCurrentItemOffset(this._lastOffsetValue);
          }
        }
      });
      provide(CatalogueBackground);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_95_old_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue_old/init.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueInitOld', ['extend', 'baseView', 'CatalogueBackground', 'CatalogueMenu', 'CatalogueItem', 'EventDispatcher'], function(provide, extend, BaseView, Background, Menu, Item, EventDispatcher) {
      var CatalogueInit = extend(BaseView),
          $class = CatalogueInit,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this._backgroundHandler = null;
          this._menuHandler = null;
          this.$elemBackground = this.$elem.find('@bm-catalogue-background');
          this.$elemMenu = this.$elem.find('@bm-catalogue-menu');
          this.$elemItemsWrapper = this.$elem.find('@bm-catalogue-items-wrapper');
          this._groupes = [this.$elemGroupClassic = this.$elem.find('@bm-catalogue-item-group-classic'), this.$elemGroupAroma = this.$elem.find('@bm-catalogue-item-group-aroma')];
          this._groupesRanges = [];
          this._initItems();
        },
        _bindEvents: function() {
          EventDispatcher.on('window-resize', function() {
            this._saveGroupsRanges();
          }.bind(this));
        },
        _initBackground: function() {
          if (BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler = new Background({element: this.$elemBackground});
            this._backgroundHandler.on('update', function(itemName) {
              this._onBackgroundUpdate(itemName);
            }.bind(this));
            EventDispatcher.on('window-scroll', function() {
              this._updateBackground();
            }.bind(this));
          }
        },
        _initMenu: function() {
          if (BM.tools.isNull(this._menuHandler)) {
            this._menuHandler = new Menu({element: this.$elemMenu});
          }
        },
        _onBackgroundUpdate: function(itemName) {
          if (!BM.tools.isNull(this._menuHandler)) {
            this._menuHandler.focusItem(itemName);
          }
        },
        _initItems: function() {
          var lastItem;
          this.$elemItemsWrapper.each(function() {
            $(this).find('@bm-catalogue-item').each(function() {
              lastItem = new Item({element: $(this)});
            });
          });
        },
        _saveGroupsRanges: function() {
          var previousTopRange = 0;
          this._groupesRanges.length = 0;
          this._groupesRanges = [];
          this._groupes.forEach(function($group) {
            var bottomRange = $group.offset().top + $group.height();
            this._groupesRanges.push({
              elem: $group,
              height: $group.height(),
              top: previousTopRange,
              bottom: bottomRange
            });
            previousTopRange = bottomRange + 1;
          }.bind(this));
        },
        _updateBackground: function() {
          var range = this._getCurrentRange();
          if (BM.tools.isNull(range)) {
            return;
          }
          this._updateParallax(range);
          this._updateImage(range.elem);
        },
        _updateParallax: function(range) {
          var scrollTop = $window.scrollTop(),
              scrollProgress = parseInt(((scrollTop - range.top) / (range.bottom - range.top) * 100).toFixed(0), 10);
          if (!BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler.setProgress(scrollProgress);
          }
        },
        _updateImage: function($group) {
          if (!BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler.setCurrentItem($group.data('name'));
          }
        },
        _getCurrentGroupByRange: function() {
          var range = this._getCurrentRange();
          if (!BM.tools.isNull(range)) {
            return range.elem;
          }
        },
        _getCurrentRange: function() {
          var barrier = $window.scrollTop() + window.innerHeight / 2,
              range,
              i,
              l = this._groupesRanges.length;
          for (i = 0; i < l; ++i) {
            range = this._groupesRanges[i];
            if (barrier >= range.top && barrier <= range.bottom) {
              return range;
            }
          }
          return null;
        }
      });
      new CatalogueInit({element: $(document.body).find('@bm-catalogue-index')});
      provide(CatalogueInit);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_95_old_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue_old/item.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueItemOld', ['extend', 'baseView', 'PopupItem'], function(provide, extend, BaseView, PopupItem) {
      var CatalogueItem = extend(BaseView),
          $class = CatalogueItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this._popupHandler = null;
          this._bindEvents();
        },
        _bindEvents: function() {
          this.$elem.on(BM.helper.event.clickName(), function(event) {
            this._onClick(event);
          }.bind(this));
        },
        _onClick: function(event) {
          this.showPopup();
        },
        _initPopup: function() {
          if (BM.tools.isNull(this._popupHandler)) {
            this._popupHandler = new PopupItem();
          }
        },
        showPopup: function() {
          this._initPopup();
          this._popupHandler.show();
        }
      });
      provide(CatalogueItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_95_old_47_menu_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue_old/menu.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueMenuOld', ['extend', 'baseView', 'EventDispatcher'], function(provide, extend, BaseView, EventDispatcher) {
      var CatalogueMenu = extend(BaseView),
          $class = CatalogueMenu,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this.$elemsItems = this.$elem.find('@bm-catalogue-menu-item');
          this._offsetTop = this.$elem.offset().top;
          this._bindEvents();
        },
        _bindEvents: function() {
          EventDispatcher.on('window-scroll', function() {
            this._updatePosition();
          }.bind(this));
        },
        _updatePosition: function() {
          if ($window.scrollTop() >= this._offsetTop) {
            this.$elem.addClass('m-fixed');
          } else {
            this.$elem.removeClass('m-fixed');
          }
        },
        focusItem: function(itemName) {
          var item = this.$elemsItems.filter('[data-item=' + itemName + ']');
          if (item.length > 0) {
            this.$elemsItems.removeClass('m-focused');
            item.addClass('m-focused');
          }
        }
      });
      provide(CatalogueMenu);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__mvc_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "mvc/item.js";
  (function(window, modules, $, BM) {
    modules.define('ItemModel', ['extend', 'Model'], function(provide, extend, Model) {
      var ItemModel = extend(Model),
          $class = ItemModel,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
        },
        getPrice: function() {
          return this._getPrice(250);
        },
        getPrice250: function() {
          return this.getPrice();
        },
        getPrice500: function() {
          return this._getPrice(500);
        },
        getPrice1000: function() {
          return this._getPrice(1000);
        },
        _getPrice: function(amount) {
          var result = null;
          this._data.price.forEach(function(item) {
            if (item.amount === amount) {
              result = item;
            }
          });
          return result.value;
        }
      });
      BM.tools.mixin($class.prototype, {});
      provide(ItemModel);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__order_47_order_45_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "order/order-init.js";
  (function(window, modules, $, BM) {
    modules.define('OrderInit', ['extend', 'baseView', 'PageOrder', 'CartStore'], function(provide, extend, BaseView, PageOrder, CartStore) {
      var OrderInit = extend(BaseView),
          $class = OrderInit,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this._renderReact();
          this._bindEvents();
        },
        _bindEvents: function() {
          var $__1 = this;
          CartStore.addChangeListener(function() {
            $__1._onCartStoreChange();
          });
        },
        _onCartStoreChange: function() {
          var cart = CartStore.getCart();
          if (cart && _.isArray(cart.order_items) && cart.order_items.length === 0) {
            window.location.href = BM.helper.link.root();
          }
        },
        _renderReact: function() {
          React.render(React.createElement(PageOrder, null), this.el.get(0));
        }
      });
      new OrderInit({element: $(document.body).find('@bm-page-order-wrapper')});
      provide(OrderInit);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__react_47_flux_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/flux.js";
  (function(window, modules, $) {
    var Flux;
    modules.define('Flux', [], function(provide) {
      if (Flux) {
        provide(Flux);
        return;
      }
      Flux = new McFly();
      provide(Flux);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init.js";
  (function(window, modules, $) {
    modules.define('beforeUIModulesInit', ['InitGlobalStylesModifiers', 'InitEventDispatcher', 'ReactSetup', 'CartInit', 'ClientDataInit'], function(provide) {
      provide();
    });
    modules.define('ui-modules', ['beforeUIModulesInit', 'initTransformOriginDependentElements', 'SideMenuInit', 'HeaderInit'], function(provide) {
      if (BM.tools.client.isTouch()) {
        $('body').addClass('m-touch');
      } else {
        $('body').addClass('m-desktop');
      }
      provide();
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_actions_47_CartActions_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/actions/CartActions.js";
  (function(window, modules) {
    var CartActions;
    modules.define('CartActions', ['Flux', 'CartConstants'], function(provide, Flux, CartConstants) {
      if (CartActions) {
        provide(CartActions);
        return;
      }
      CartActions = Flux.createActions({
        loadCart: function() {
          return {actionType: CartConstants.LOADCART};
        },
        addItem: function(itemId, weight, grind) {
          return {
            actionType: CartConstants.ADDITEM,
            itemId: itemId,
            weight: weight,
            grind: grind
          };
        },
        removeItem: function(itemId, weight, grind) {
          return {
            actionType: CartConstants.REMOVEITEM,
            itemId: itemId,
            weight: weight,
            grind: grind
          };
        },
        deleteItem: function(itemId, weight, grind) {
          return {
            actionType: CartConstants.DELETEITEM,
            itemId: itemId,
            weight: weight,
            grind: grind
          };
        }
      });
      provide(CartActions);
    });
  }(this, this.modules));
  return {};
}).call(Reflect.global);

var $__react_47_actions_47_OrderActions_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/actions/OrderActions.js";
  (function(window, modules) {
    var OrderActions;
    modules.define('OrderActions', ['Flux', 'OrderConstants'], function(provide, Flux, OrderConstants) {
      if (OrderActions) {
        provide(OrderActions);
        return;
      }
      OrderActions = Flux.createActions({
        setSummaryViewMode: function(mode) {
          return {
            actionType: OrderConstants.SETSUMMARYVIEWMODE,
            mode: mode
          };
        },
        toggleSummaryViewMode: function() {
          return {actionType: OrderConstants.TOGGLESUMMARYVIEWMODE};
        },
        setOrderData: function(data) {
          return {
            actionType: OrderConstants.SETORDERDATA,
            data: data
          };
        },
        setSelectedDeliveryRegion: function(value) {
          return {
            actionType: OrderConstants.SETSELECTEDDELIVERYREGION,
            value: value
          };
        },
        setSelectedDeliveryOption: function(value) {
          return {
            actionType: OrderConstants.SETSELECTEDDELIVERYOPTION,
            value: value
          };
        }
      });
      provide(OrderActions);
    });
  }(this, this.modules));
  return {};
}).call(Reflect.global);

var $__react_47_actions_47_StateActions_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/actions/StateActions.js";
  (function(window, modules) {
    var StateActions;
    modules.define('StateActions', ['Flux', 'StateConstants'], function(provide, Flux, StateConstants) {
      if (StateActions) {
        provide(StateActions);
        return;
      }
      StateActions = Flux.createActions({setViewingItem: function(item) {
          return {
            actionType: StateConstants.SETVIEWINGITEM,
            item: item
          };
        }});
      provide(StateActions);
    });
  }(this, this.modules));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_AddedItem_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/AddedItem.js";
  (function(window, modules, $) {
    modules.define('ItemAddedItem', ['CartActions'], function(provide, CartActions) {
      var ItemAddedItem = React.createClass({
        displayName: "ItemAddedItem",
        propTypes: {orderItem: React.PropTypes.object},
        handleAddItemClick: function() {
          CartActions.addItem(this.props.item.id, this.props.weight, this.props.grind);
        },
        handleRemoveItemClick: function() {
          CartActions.removeItem(this.props.item.id, this.props.weight, this.props.grind);
        },
        handleDeleteItemClick: function() {
          CartActions.deleteItem(this.props.item.id, this.props.weight, this.props.grind);
        },
        getTotalPrice: function() {
          var price;
          if (this.props.weight === 250) {
            price = this.props.item.price;
          } else if (this.props.weight === 500) {
            price = this.props.item.price_500;
          } else if (this.props.weight === 1000) {
            price = this.props.item.price_1000;
          }
          return price * this.props.quantity;
        },
        getGrindText: function() {
          var grindMeta = BM.helper.grind.getTypeMeta(this.props.grind);
          return grindMeta.label_full.toLowerCase();
        },
        getPackInPlural: function() {
          return BM.helper.pluralize.getWordPack(this.props.quantity);
        },
        render: function() {
          return (React.createElement("div", {className: "bm-item-form-order-added-item"}, React.createElement("div", {className: "bm-item-form-order-added-item-content"}, React.createElement("div", {className: "bm-item-form-order-added-item-text"}, this.props.quantity, " ", this.getPackInPlural(), " «Никарагуа» ", this.props.weight, " грамм, ", this.getGrindText(), React.createElement("span", {className: "bm-item-form-order-added-item-text-price"}, ", 150 рублей")), React.createElement("div", {className: "buttons-wrapper"}, React.createElement("div", {
            className: "button m-minus",
            onClick: this.handleRemoveItemClick
          }), React.createElement("div", {
            className: "button m-plus",
            onClick: this.handleAddItemClick
          }), React.createElement("div", {
            className: "button m-remove",
            onClick: this.handleDeleteItemClick
          }))), React.createElement("div", {className: "bm-item-form-order-added-item-aside"}, React.createElement("div", {className: "bm-item-form-order-added-item-aside-label"}, this.getTotalPrice(), " рублей"))));
        }
      });
      provide(ItemAddedItem);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_AddedItems_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/AddedItems.js";
  (function(window, modules, $) {
    modules.define('ItemAddedItems', ['ItemAddedItem', 'CartStore', 'StateStore'], function(provide, ItemAddedItem, CartStore, StateStore) {
      function getState() {
        return {
          cart: CartStore.getCart(),
          viewingItem: StateStore.getViewingItem()
        };
      }
      var AddedItems = React.createClass({
        displayName: "AddedItems",
        mixins: [CartStore.mixin],
        getInitialState: function() {
          return getState();
        },
        storeDidChange: function() {
          this.setState(getState());
        },
        render: function() {
          var $__1 = this;
          var cart = this.state.cart;
          var orderItems = cart && cart.order_items;
          var rootClassName = ['bm-item-form-order-added-items'];
          if (_.isArray(orderItems) && orderItems.length === 0) {
            rootClassName.push('m-empty');
          }
          var items;
          if (_.isArray(orderItems) && this.state.viewingItem) {
            items = _.filter(orderItems, function(i) {
              return i.item.id === $__1.state.viewingItem.id;
            });
          }
          return (React.createElement("div", {className: rootClassName.join(' ')}, items ? items.map(function(item) {
            return React.createElement(ItemAddedItem, React.__spread({key: item.id}, item));
          }) : null));
        }
      });
      provide(AddedItems);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder.js";
  (function(window, modules, $) {
    modules.define('PageOrder', ['CartActions', 'CartStore', 'OrderActions', 'OrderStore', 'OrderConstants', 'OrderSummarySimple', 'OrderSummaryTable', 'OrderDeliveryMethod', 'OrderDeliveryAddress'], function(provide, CartActions, CartStore, OrderActions, OrderStore, OrderConstants, OrderSummarySimple, OrderSummaryTable, OrderDeliveryMethod, OrderDeliveryAddress) {
      function getPageOrderInitialState() {
        return {
          cart: CartStore.getCart(),
          summaryView: OrderStore.summaryView(),
          orderData: OrderStore.orderData(),
          selectedDeliveryRegion: OrderStore.selectedDeliveryRegion(),
          selectedDeliveryOption: OrderStore.selectedDeliveryOption()
        };
      }
      var PageOrder = React.createClass({
        displayName: "PageOrder",
        mixins: [CartStore.mixin, OrderStore.mixin],
        getInitialState: function() {
          return getPageOrderInitialState();
        },
        componentDidMount: function() {
          if (BM.bootstrappedData && BM.bootstrappedData.orderData) {
            OrderActions.setOrderData(BM.bootstrappedData.orderData);
          }
        },
        storeDidChange: function() {
          this.setState(getPageOrderInitialState());
        },
        onSummaryViewToggleClick: function() {
          OrderActions.toggleSummaryViewMode();
        },
        isSummaryViewModeSimple: function() {
          return this.state.summaryView === OrderConstants.SUMMARY_VIEW_MODE_SIMPLE;
        },
        render: function() {
          if (!this.state.cart) {
            return null;
          }
          var cart = this.state.cart;
          var summaryTotalInfo = [{
            label: 'Итого за кофе:',
            value: (cart.amount + " руб.")
          }];
          if (_.isNumber(cart.discount) && cart.discount > 0) {
            summaryTotalInfo.push({
              label: 'Скидка:',
              value: (cart.discount + "%")
            });
            summaryTotalInfo.push({
              label: 'Итого со скидкой:',
              value: (cart.total_amount + " руб.")
            });
          }
          return (React.createElement("div", {className: "bm-page-order"}, React.createElement("div", {className: "bm-page-order-content"}, React.createElement("div", {className: "bm-page-order-header m-offset-30"}, "Ваш заказ", React.createElement("span", {className: "bm-page-order-header-aside"}, React.createElement("span", {
            className: "bm-page-order-summary-view-toggle",
            onClick: this.onSummaryViewToggleClick
          }, this.isSummaryViewModeSimple() ? 'в виде таблицы' : 'списком'))), this.isSummaryViewModeSimple() ? React.createElement(OrderSummarySimple, {cart: cart}) : React.createElement(OrderSummaryTable, {cart: cart}), React.createElement("div", {className: "bm-page-order-summary-total"}, summaryTotalInfo.map(function(item) {
            return (React.createElement("div", {className: "bm-page-order-summary-total-row"}, React.createElement("div", {className: "bm-page-order-summary-total-label"}, item.label), React.createElement("div", {className: "bm-page-order-summary-total-value"}, item.value)));
          })), React.createElement(OrderDeliveryMethod, {
            orderData: this.state.orderData,
            selectedDeliveryRegion: this.state.selectedDeliveryRegion,
            selectedDeliveryOption: this.state.selectedDeliveryOption
          }), React.createElement(OrderDeliveryAddress, {
            selectedDeliveryRegion: this.state.selectedDeliveryRegion,
            selectedDeliveryOption: this.state.selectedDeliveryOption
          }))));
        }
      });
      provide(PageOrder);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_constants_47_CartConstants_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/constants/CartConstants.js";
  (function(window, modules, $) {
    var CartConstants;
    modules.define('CartConstants', [], function(provide) {
      if (CartConstants) {
        provide(CartConstants);
        return;
      }
      CartConstants = {
        LOADCART: 'LOAD CART',
        ADDITEM: 'ADD ITEM',
        REMOVEITEM: 'REMOVE ITEM',
        DELETEITEM: 'DELETE ITEM'
      };
      provide(CartConstants);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_constants_47_OrderConstants_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/constants/OrderConstants.js";
  (function(window, modules, $) {
    var OrderConstants;
    modules.define('OrderConstants', [], function(provide) {
      if (OrderConstants) {
        provide(OrderConstants);
        return;
      }
      OrderConstants = {
        SETSUMMARYVIEWMODE: 'SET SUMMARY VIEW MODE',
        TOGGLESUMMARYVIEWMODE: 'TOGGLE SUMMARY VIEW MODE',
        SETORDERDATA: 'SET ORDER DATA',
        SETSELECTEDDELIVERYREGION: 'SET SELECTED DELIVERY REGION',
        SETSELECTEDDELIVERYOPTION: 'SET SELECTED DELIVERY OPTION',
        SUMMARY_VIEW_MODE_SIMPLE: 'SUMMARY_VIEW_MODE_SIMPLE',
        SUMMARY_VIEW_MODE_TABLE: 'SUMMARY_VIEW_MODE_TABLE'
      };
      provide(OrderConstants);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_constants_47_StateConstants_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/constants/StateConstants.js";
  (function(window, modules, $) {
    var StateConstants;
    modules.define('StateConstants', [], function(provide) {
      if (StateConstants) {
        provide(StateConstants);
        return;
      }
      StateConstants = {SETVIEWINGITEM: 'SET VIEWING ITEM'};
      provide(StateConstants);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_stores_47_CartStore_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/stores/CartStore.js";
  (function(window, modules, $) {
    var CartStore;
    modules.define('CartStore', ['Flux', 'CartConstants'], function(provide, Flux, CartConstants) {
      if (CartStore) {
        provide(CartStore);
        return;
      }
      var _cart = null;
      function _setCart(cart) {
        _cart = cart;
        CartStore.emitChange();
      }
      function loadCart() {
        $.ajax({
          type: 'get',
          url: '/api/cart/get',
          success: function(data) {
            _setCart(data);
          },
          error: function() {}
        });
      }
      function addItem(itemId, weight, grind) {
        $.ajax({
          type: 'post',
          url: '/api/cart/add_item',
          data: {
            item_id: itemId,
            weight: weight,
            grind: grind
          },
          success: function(data) {
            _setCart(data);
          },
          error: function() {}
        });
      }
      function removeItem(itemId, weight, grind) {
        $.ajax({
          type: 'post',
          url: '/api/cart/remove_item',
          data: {
            item_id: itemId,
            weight: weight,
            grind: grind
          },
          success: function(data) {
            _setCart(data);
          },
          error: function() {}
        });
      }
      function deleteItem(itemId, weight, grind) {
        $.ajax({
          type: 'post',
          url: '/api/cart/delete_item',
          data: {
            item_id: itemId,
            weight: weight,
            grind: grind
          },
          success: function(data) {
            _setCart(data);
          },
          error: function() {}
        });
      }
      CartStore = Flux.createStore({getCart: function() {
          return _cart;
        }}, function(payload) {
        switch (payload.actionType) {
          case CartConstants.LOADCART:
            loadCart();
            break;
          case CartConstants.ADDITEM:
            addItem(payload.itemId, payload.weight, payload.grind);
            break;
          case CartConstants.REMOVEITEM:
            removeItem(payload.itemId, payload.weight, payload.grind);
            break;
          case CartConstants.DELETEITEM:
            deleteItem(payload.itemId, payload.weight, payload.grind);
            break;
        }
      });
      window.CartStore = CartStore;
      provide(CartStore);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_stores_47_OrderStore_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/stores/OrderStore.js";
  (function(window, modules, $) {
    var OrderStore;
    modules.define('OrderStore', ['Flux', 'OrderConstants'], function(provide, Flux, OrderConstants) {
      if (OrderStore) {
        provide(OrderStore);
        return;
      }
      var _summaryViewMode = OrderConstants.SUMMARY_VIEW_MODE_SIMPLE;
      var _orderData = null;
      var _selectedDeliveryRegion = null;
      var _selectedDeliveryOption = null;
      function _setFromForage() {
        localforage.getItem('orderStore').then(function(data) {
          if (data) {
            if (data._summaryViewMode !== undefined) {
              _summaryViewMode = data._summaryViewMode;
            }
            if (data._selectedDeliveryRegion !== undefined) {
              _selectedDeliveryRegion = data._selectedDeliveryRegion;
            }
            if (data._selectedDeliveryRegion !== undefined) {
              _selectedDeliveryOption = data._selectedDeliveryOption;
            }
          }
          if (OrderStore) {
            OrderStore.emitChange();
          }
        });
      }
      function _saveToForage() {
        localforage.setItem('orderStore', {
          _summaryViewMode: _summaryViewMode,
          _selectedDeliveryRegion: _selectedDeliveryRegion,
          _selectedDeliveryOption: _selectedDeliveryOption
        });
      }
      function setSummaryViewMode(item) {
        _summaryViewMode = item;
        _saveToForage();
      }
      function toggleSummaryViewMode() {
        if (_summaryViewMode === OrderConstants.SUMMARY_VIEW_MODE_TABLE) {
          _summaryViewMode = OrderConstants.SUMMARY_VIEW_MODE_SIMPLE;
        } else {
          _summaryViewMode = OrderConstants.SUMMARY_VIEW_MODE_TABLE;
        }
        OrderStore.emitChange();
        _saveToForage();
      }
      function setOrderData(data) {
        _orderData = data;
        OrderStore.emitChange();
      }
      function setSelectedDeliveryRegion(value) {
        _selectedDeliveryRegion = value;
        OrderStore.emitChange();
        _saveToForage();
      }
      function setSelectedDeliveryOption(value) {
        _selectedDeliveryOption = value;
        OrderStore.emitChange();
        _saveToForage();
      }
      _setFromForage();
      OrderStore = Flux.createStore({
        summaryView: function() {
          return _summaryViewMode;
        },
        orderData: function() {
          return _orderData;
        },
        selectedDeliveryRegion: function() {
          return _selectedDeliveryRegion;
        },
        selectedDeliveryOption: function() {
          return _selectedDeliveryOption;
        }
      }, function(payload) {
        switch (payload.actionType) {
          case OrderConstants.SETSUMMARYVIEWMODE:
            setSummaryViewMode(payload.mode);
            break;
          case OrderConstants.TOGGLESUMMARYVIEWMODE:
            toggleSummaryViewMode();
            break;
          case OrderConstants.SETORDERDATA:
            setOrderData(payload.data);
            break;
          case OrderConstants.SETSELECTEDDELIVERYREGION:
            setSelectedDeliveryRegion(payload.value);
            break;
          case OrderConstants.SETSELECTEDDELIVERYOPTION:
            setSelectedDeliveryOption(payload.value);
            break;
        }
      });
      OrderStore.emitChange();
      provide(OrderStore);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_stores_47_StateStore_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/stores/StateStore.js";
  (function(window, modules, $) {
    var StateStore;
    modules.define('StateStore', ['Flux', 'StateConstants'], function(provide, Flux, StateConstants) {
      if (StateStore) {
        provide(StateStore);
        return;
      }
      var _viewingItem;
      function setViewingItem(item) {
        _viewingItem = item;
      }
      StateStore = Flux.createStore({getViewingItem: function() {
          return _viewingItem;
        }}, function(payload) {
        switch (payload.actionType) {
          case StateConstants.SETVIEWINGITEM:
            setViewingItem(payload.item);
            break;
        }
      });
      provide(StateStore);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_cart_47_cart_45_header_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/cart/cart-header.js";
  (function(window, modules, $, BM) {
    modules.define('HeaderCart', ['basePubSub', 'extend', 'CartProcessor'], function(provide, PubSub, extend, cart) {
      var HeaderCart = extend(PubSub),
          $class = HeaderCart,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          if (!config || !config.element) {
            return;
          }
          this.$elem = config.element;
          this.$elemCounter = this.$elem.find('@b-header-cart-counter');
          this.$elemCounterText = this.$elem.find('@b-header-cart-counter-text');
          this.$elemButtonOrder = this.$elem.find('@b-header-cart-button-order');
          this._setupEvents();
          this._updateData();
        },
        _setupEvents: function() {
          var me = this;
          cart.on('update', function() {
            me._updateData();
          });
        },
        _showCounter: function() {
          this.$elemCounter.attr('data-visible', 'true');
        },
        _hideCounter: function() {
          this.$elemCounter.attr('data-visible', 'false');
        },
        _updateData: function() {
          this._updateDataCounter();
        },
        _updateDataCounter: function() {
          var amount = cart.getTotalItems();
          if (amount < 1) {
            this._hideCounter();
            this._hideButtonOrder();
          } else {
            this._updateCounterText();
            this._showCounter();
            this._showButtonOrder();
          }
        },
        _showButtonOrder: function() {
          this.$elemButtonOrder.attr('data-visible', 'true');
        },
        _hideButtonOrder: function() {
          this.$elemButtonOrder.attr('data-visible', 'false');
        },
        _updateCounterText: function() {
          var amount = cart.getTotalItems();
          this.$elemCounterText.html(amount);
        },
        destroy: function() {
          $super.destroy.apply(this, arguments);
        }
      });
      provide(HeaderCart);
    });
    modules.define('initCartHeader', ['HeaderCart'], function(provide, HeaderCart) {
      var headerCart = new HeaderCart({element: $('@b-header-cart')});
      provide();
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_cart_47_cart_45_processor_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/cart/cart-processor.js";
  (function(window, modules, $, radio) {
    modules.define('CartProcessorClass', ['basePubSub', 'extend'], function(provide, PubSub, extend) {
      var CartProcessor = extend(PubSub),
          $class = CartProcessor,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          this._data = {items: []};
        },
        setData: function(data) {
          if (data) {
            if (typeof data === 'string') {
              try {
                data = JSON.parse(data);
              } catch (e) {}
            }
            this._data = data;
            this._notify('update');
          }
        },
        getData: function() {
          return this._data;
        },
        getTotalItems: function() {
          var total = 0;
          this._data.items.forEach(function(elem) {
            total += elem.amount;
          });
          return total;
        },
        destroy: function() {
          $super.destroy.apply(this, arguments);
        }
      });
      provide(CartProcessor);
    });
    modules.define('CartProcessor', ['CartProcessorClass'], function(provide, CartProcessor) {
      var $body = $(document.body),
          cart = new CartProcessor();
      try {
        cart.setData(JSON.parse($body.attr('data-cart-config')));
      } catch (e) {}
      provide(cart);
    });
    modules.define('initCartProcessor', ['CartProcessor'], function(provide, cart) {
      radio('b-cart-update').subscribe(function(data) {
        cart.setData(data);
      });
      provide();
    });
  }(this, this.modules, this.jQuery, this.radio));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_controls_47_button_45_number_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/controls/button-number.js";
  (function(window, modules, $, BM) {
    modules.define('ButtonNumber', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var ControlButtonNumber = extend(BaseView),
          $class = ControlButtonNumber,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this._value = 0;
          this.$elemInputValue = this.$elem.find('@bm-button-number-input-value');
          this.$elemMinus = this.$elem.find('@bm-button-number-minus');
          this.$elemPlus = this.$elem.find('@bm-button-number-plus');
          this.$elemValue = this.$elem.find('@bm-button-number-value');
          this._bindEvents();
          this.update();
        },
        _bindEvents: function() {
          this.$elemMinus.on(BM.helper.event.clickName(), function(event) {
            this._onMinusClick(event);
          }.bind(this));
          this.$elemPlus.on(BM.helper.event.clickName(), function(event) {
            this._onPlusClick(event);
          }.bind(this));
        },
        _onMinusClick: function(event) {
          this._decValue();
        },
        _onPlusClick: function(event) {
          this._incValue();
        },
        _incValue: function() {
          this.setValue(this._value + 1);
        },
        _decValue: function() {
          this.setValue(Math.max(0, this._value - 1));
        },
        setValue: function(value) {
          if (BM.tools.isNumber(value) && value >= 0) {
            this._value = value;
            this.update();
            this._notify('change', this._value);
          }
        },
        update: function() {
          if (this._value < 1) {
            this.$elem.removeClass('m-value-present');
            this.$elemMinus.addClass('m-disabled');
          } else {
            this.$elem.addClass('m-value-present');
            this.$elemValue.html(this._value);
            this.$elemMinus.removeClass('m-disabled');
          }
        }
      });
      provide(ControlButtonNumber);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_dispatcher_47_dispatcher_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/dispatcher/dispatcher.js";
  (function(window, modules, $, BM) {
    var dispatcherInstance = null;
    modules.define('EventDispatcherConstructor', ['extend', 'basePubSub'], function(provide, extend, PubSub) {
      var EventDispatcher = extend(PubSub),
          $class = EventDispatcher,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          this._timeoutNotifyResize = null;
          this._bindEvents();
        },
        _bindEvents: function() {
          $window.one('resize', function onWindowResize() {
            if (!BM.tools.isNull(this._timeoutNotifyResize)) {
              clearTimeout(this._timeoutNotifyResize);
              this._timeoutNotifyResize = null;
            }
            this._timeoutNotifyResize = setTimeout(function() {
              this._notify('window-resize');
            }.bind(this), 200);
            setTimeout(function() {
              $window.one('resize', onWindowResize.bind(this));
            }.bind(this), 50);
          }.bind(this));
          $window.one('scroll', function onWindowScroll() {
            this._notify('window-scroll');
            setTimeout(function() {
              $window.one('scroll', onWindowScroll.bind(this));
            }.bind(this), 25);
          }.bind(this));
        }
      });
      provide(EventDispatcher);
    });
    modules.define('InitEventDispatcher', ['EventDispatcherConstructor'], function(provide, Dispatcher) {
      dispatcherInstance = new Dispatcher();
      provide();
    });
    modules.define('EventDispatcher', [], function(provide) {
      provide(dispatcherInstance);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_dynamic_45_content_47_dynamic_45_content_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/dynamic-content/dynamic-content.js";
  (function(window, document, BM, $, modules, radio) {
    'use strict';
    var dynamicContentModule = function(provide, extend, PubSub) {
      var DynamicContent = extend(PubSub),
          $class = DynamicContent,
          $super = $class.superclass,
          DynamicEffect = {
            FADE: 1,
            SLIDE: 2
          };
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          this._element = null;
          if (!config) {
            return;
          }
          this.setElement(config.element);
          this._effect = DynamicEffect.FADE;
          this._firstStep = this._getStepInitial();
          this.setConfig(config);
          this._currentElement = this._firstStep;
          this._stepsStack = [];
          this._updateInProgress = false;
        },
        setConfig: function(config) {
          if (!BM.tools.isUndefined(config)) {
            if (!BM.tools.isUndefined(config.element)) {
              this.setElement(config.element);
            }
            if (!BM.tools.isUndefined(config.effect)) {
              this.setDynamicEffect(config.effect);
            }
            if (!BM.tools.isUndefined(config.firstStep)) {
              this.setFirstStep(config.firstStep);
            }
          }
        },
        setElement: function(element) {
          if (!BM.tools.isUndefined(element)) {
            this._element = element;
          }
        },
        setDynamicEffect: function(effect) {
          if (!BM.tools.isUndefined(effect)) {
            this._effect = effect;
          }
        },
        setFirstStep: function(firstStep) {
          var step;
          if (!BM.tools.isUndefined(firstStep)) {
            step = this._getStep(firstStep);
            if (step.length > 0) {
              this._firstStep = step;
            }
          }
        },
        _updateSize: function(data) {
          return;
          data = data || {};
          var me = this,
              oldHeight = data.oldHeight || this._currentElement.height(),
              newHeight = data.newHeight || height,
              updateCallback = data.callback || function() {};
          if (BM.tools.isNull(newHeight)) {
            newHeight = this._currentElement.height();
          }
          this._element.css('height', this._element.height());
          this._element.get(0).offsetHeight;
          this._element.css('height', newHeight);
          setTimeout(function() {
            me._element.css('height', '');
            updateCallback();
          }, 350);
        },
        update: function() {},
        reset: function() {
          this.setStep(this._getStepFirst().attr('data-step'));
        },
        clearHeight: function() {
          this._element.css('height', '');
        },
        clearStepsStack: function() {
          this._stepsStack.length = 0;
          this._stepsStack = [];
        },
        showStep: function(stepNextName, callback, forceCallback, skipStack) {
          if (this._isCurrentStep(stepNextName) || !this._isStepExist(stepNextName) || this.isUpdateInProgress()) {
            if (forceCallback === true && BM.tools.isFunction(callback)) {
              callback();
            }
            return;
          }
          var me = this,
              stepCurrent = this._currentElement,
              stepCurrentName = stepCurrent.attr('data-step'),
              stepNext = this._getStep(stepNextName),
              heightCurrent = stepCurrent.height(),
              heightNext;
          this._updateInProgress = true;
          if (skipStack !== true) {
            this._stepsStack.push(stepCurrent.attr('data-step'));
          }
          this._notify('fade-out-start', stepCurrentName, stepNextName);
          this._fadeOut(function() {
            me._notify('fade-out-end', stepCurrentName, stepNextName);
            me._setHeightNoTransition(heightCurrent);
            me.setStep(stepNextName);
            heightNext = stepNext.height();
            me._notify('resize-start', stepCurrentName, stepNextName);
            me._element.css('height', heightNext);
            setTimeout(function() {
              me._notify('resize-end', stepCurrentName, stepNextName);
              me._notify('fade-in-start', stepCurrentName, stepNextName);
              me._fadeIn(function() {
                me._notify('fade-in-end', stepCurrentName, stepNextName);
                me._setHeightNoTransition('');
                if (BM.tools.isFunction(callback)) {
                  callback();
                }
                me._updateInProgress = false;
              });
            }, 350);
          });
        },
        showPreviousStep: function() {
          var step = this._stepsStack.pop();
          if (!BM.tools.isUndefined(step)) {
            this.showStep(step, function() {}, false, true);
          }
        },
        isStepsStackEmpty: function() {
          return this._stepsStack.length === 0;
        },
        setStep: function(n) {
          var stepToShow = this._getStep(n);
          if (stepToShow.length > 0) {
            this._element.find('> [data-step]').removeClass('visible');
            stepToShow.addClass('visible');
            this._currentElement = stepToShow;
          }
        },
        _getStep: function(n) {
          return this._element.find('> [data-step=' + n + ']');
        },
        _getStepInitial: function() {
          var result;
          result = this._element.find('.visible[data-step]');
          if (result.length > 0) {
            result = result.eq(0);
          } else {
            result = this._getStepFirst();
          }
          return result;
        },
        _getStepFirst: function() {
          return this._element.find('> [data-step]').eq(0);
        },
        _isStepExist: function(n) {
          return this._element.find('> [data-step=' + n + ']').length > 0;
        },
        isUpdateInProgress: function() {
          return this._updateInProgress;
        },
        _isCurrentStep: function(n) {
          return this._currentElement.attr('data-step') === n.toString();
        },
        showNext: function() {},
        showPrev: function() {},
        _fadeOut: function(callback) {
          this._unbindTransitionEnd();
          this._bindTransitionEnd(callback);
          this._element.attr('visible', 'false');
        },
        _fadeOut2: function(callback) {
          this._unbindTransitionEnd();
          this._bindTransitionEnd(callback);
          this._element.attr('visible', 'false');
        },
        _fadeIn: function(callback) {
          this._unbindTransitionEnd();
          this._bindTransitionEnd(callback);
          this._element.removeAttr('visible');
        },
        _unbindTransitionEnd: function() {
          this._element.unbindTransitionEnd();
        },
        _bindTransitionEnd: function(callback) {
          callback = callback || function() {};
          this._element.transitionEnd(function() {
            this._unbindTransitionEnd();
            callback();
            this._notify('fade-in-end');
          }.bind(this));
        },
        collapse: function() {
          return this._fadeOut(function() {
            this._updateSize(0);
          }.bind(this));
        },
        getCurrentStepName: function() {
          return this._currentElement.attr('data-step');
        },
        _setHeightNoTransition: function(height) {
          this._element.attr('data-no-transition', 'true');
          this._triggerRender();
          this._element.css('height', height);
          this._triggerRender();
          this._element.removeAttr('data-no-transition');
        },
        _triggerRender: function() {
          this._element.get(0).offsetHeight;
        }
      });
      provide(DynamicContent);
    };
    modules.define('dynamicContent', ['extend', 'basePubSub'], dynamicContentModule);
  }(this, this.document, this.BM, this.jQuery, this.modules, this.radio));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_47_cart_45_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init/cart-init.js";
  (function(window, modules, $) {
    modules.define('CartInit', ['CartActions'], function(provide, CartActions) {
      CartActions.loadCart();
      provide();
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_47_client_45_data_45_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init/client-data-init.js";
  (function(window, modules, $) {
    modules.define('ClientDataInit', [], function(provide) {
      BM.helper.brewingMethods.fetch(function() {});
      BM.helper.grind.fetchTypes(function() {});
      provide();
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_47_global_45_styles_45_modifiers_45_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init/global-styles-modifiers-init.js";
  (function(window, modules, $, radio) {
    modules.define('InitGlobalStylesModifiers', [], function(provide) {
      var $body = $(document.body);
      if (BM.tools.client.isTouch()) {
        $body.addClass('m-touch');
      } else {
        $body.addClass('m-desktop');
      }
      provide();
    });
  }(this, this.modules, this.jQuery, this.radio));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_47_header_45_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init/header-init.js";
  (function(window, modules, $) {
    modules.define('HeaderInit', ['extend', 'baseView', 'CartStore'], function(provide, extend, BaseView, CartStore) {
      var HeaderInit = extend(BaseView),
          $class = HeaderInit,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this.$orderHeaderText = this.el.find('@bm-header-header-order-text');
          this._bindEvents();
        },
        _bindEvents: function() {
          var $__1 = this;
          CartStore.addChangeListener(function() {
            $__1._onCartStoreChange();
          });
        },
        _onCartStoreChange: function() {
          if (BM.config.mainConfig.show_header_order) {
            var cart = CartStore.getCart();
            this._setOrderHeaderVisible(cart && _.isArray(cart.order_items) && cart.order_items.length > 0);
          }
        },
        _setOrderHeaderVisible: function(bool) {
          if (bool) {
            this.el.addClass('m-header-order-visible');
            this._updateHeaderOrder();
          } else {
            this.el.removeClass('m-header-order-visible');
          }
        },
        _updateHeaderOrder: function() {
          var cart = CartStore.getCart();
          var text = this.$orderHeaderText.data('order-header-text');
          var count = cart.order_items.length;
          var wordPack = BM.helper.pluralize.getWordPack(count, 2);
          var totalAmount = cart.total_amount;
          text = text.replace('%{count}', count);
          text = text.replace('%{wordPack}', wordPack);
          text = text.replace('%{totalAmount}', totalAmount);
          this.$orderHeaderText.html(text);
        }
      });
      new HeaderInit({element: $('@bm-header')});
      provide(HeaderInit);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_47_react_45_setup_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init/react-setup.js";
  (function(window, modules, $) {
    modules.define('ReactSetup', ['CartConstants', 'CartActions', 'CartStore', 'StateConstants', 'StateActions', 'StateStore', 'OrderConstants', 'OrderActions', 'OrderStore'], function(provide) {
      provide();
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_47_side_45_menu_45_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init/side-menu-init.js";
  (function(window, modules, $, radio) {
    modules.define('SideMenuInit', [], function(provide) {
      var $body = $(document.body),
          buttonToggleSideMenu = $('@bm-side-menu-toggle-button');
      buttonToggleSideMenu.on(BM.helper.event.clickName(), function(event) {
        if ($body.hasClass('m-side-menu-opened')) {
          $body.removeClass('m-side-menu-opened');
        } else {
          $body.addClass('m-side-menu-opened');
        }
      });
    });
  }(this, this.modules, this.jQuery, this.radio));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_brewing_45_method_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/brewing-method.js";
  (function(window, modules, $, BM) {
    modules.define('ItemBrewingMethodItem', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var ItemBrewingMethodItem = extend(BaseView),
          $class = ItemBrewingMethodItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this.$text = this.el.find('@bm-brewing-method-item-text');
          this._config = BM.tools.mixin({}, config);
          this.render();
        },
        render: function() {
          if (!this._config.data) {
            return;
          }
          this.el.attr('data-name', this._config.data.name);
          this.el.attr('data-size', this._config.data.size || "normal");
          this.$text.html(this._config.data.label);
        },
        _getTemplateName: function() {
          return 'bm-brewing-method-item-template';
        }
      });
      provide(ItemBrewingMethodItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_form_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/form.js";
  (function(window, modules, $, BM) {
    modules.define('ItemFormOrder', ['extend', 'baseView', 'ItemAddedItems', 'CartStore'], function(provide, extend, BaseView, ItemAddedItems, CartStore) {
      var ItemFormOrder = extend(BaseView),
          $class = ItemFormOrder,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this._amount = null;
          this._grind = null;
          this.$amountItems = this.el.find('@bm-item-form-order-amount-item');
          this.$grindItems = this.el.find('@bm-item-form-order-grind-item');
          this.$buttonAdd = this.el.find('@bm-item-form-order-button-add');
          this.$addedItemsWrapper = this.el.find('@bm-item-form-order-added-items');
          this.$orderButtonWrapper = this.el.find('@bm-item-form-order-order-button-wrapper');
          this._updateAmount();
          this._updateGrind();
          this._updateButton();
          this._renderAddedItems();
          this._bindEvents();
        },
        _bindEvents: function() {
          var self = this,
              clickName = BM.helper.event.clickName();
          this.$buttonAdd.on(clickName, function(event) {
            this._onButtonAddClick(event);
          }.bind(this));
          this.$amountItems.on(clickName, function(event) {
            this._onAmountItemClick(event);
          }.bind(this));
          this.$grindItems.on(clickName, function(event) {
            this._onGrindItemClick(event);
          }.bind(this));
          CartStore.addChangeListener(function() {
            this._onCartStoreUpdate();
          }.bind(this));
        },
        _onButtonAddClick: function() {
          this._notifyAdd();
        },
        _onAmountItemClick: function(event) {
          var $this = $(event.target);
          while ($this.filter('[role=bm-item-form-order-amount-item]').length < 1) {
            $this = $this.parent();
          }
          this.$amountItems.removeClass('m-selected');
          $this.addClass('m-selected');
          this._updateButton();
          this._updateAmount();
        },
        _onGrindItemClick: function(event) {
          var $this = $(event.target);
          while ($this.filter('[role=bm-item-form-order-grind-item]').length < 1) {
            $this = $this.parent();
          }
          this.$grindItems.removeClass('m-selected');
          this.$grindItems.removeClass('m-color-scheme-white');
          $this.addClass('m-selected');
          $this.addClass('m-color-scheme-white');
          this._updateButton();
          this._updateGrind();
        },
        _onCartStoreUpdate: function() {
          this._updateButtonOrder();
        },
        setPrices: function(pricesArr) {
          pricesArr.forEach(function(price) {
            var $amountItem = this.$amountItems.filter(function() {
              return $(this).data('amount') == price.amount;
            }),
                $itemPrice = $amountItem.find('@bm-item-form-order-amount-item-price');
            $itemPrice.html(price.value + $itemPrice.data('text'));
          }.bind(this));
        },
        _updateAmount: function() {
          this._amount = this._getSelectedItemAmount().data('amount');
        },
        _updateGrind: function() {
          this._grind = this.$grindItems.filter('.m-selected').last().data('grind');
        },
        _getSelectedItemAmount: function() {
          return this.$amountItems.filter('.m-selected').last();
        },
        _getSelectedItemGrind: function() {
          return this.$grindItems.filter('.m-selected').last();
        },
        _updateButton: function() {
          var amount = this._getSelectedItemAmount().data('amount');
          var grind = this._getSelectedItemGrind().find('.bm-brewing-method').data('config').grind;
          var textTemplate;
          textTemplate = this.$buttonAdd.data('text-template');
          textTemplate = textTemplate.replace('${amount}', amount);
          textTemplate = textTemplate.replace('${grind}', grind.label_full.toLowerCase());
          this.$buttonAdd.html(textTemplate);
        },
        _updateButtonOrder: function() {
          var cart = CartStore.getCart();
          if (cart && _.isArray(cart.order_items) && cart.order_items.length > 0) {
            this.$orderButtonWrapper.removeClass('m-hidden');
          } else {
            this.$orderButtonWrapper.addClass('m-hidden');
          }
        },
        _renderAddedItems: function() {
          React.render(React.createElement("div", null, React.createElement(ItemAddedItems, null)), this.$addedItemsWrapper.get(0));
        },
        _notifyAdd: function() {
          var obj = {
            amount: this._amount,
            grind: this._grind
          };
          this._notify('add', obj);
        }
      });
      provide(ItemFormOrder);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_form_95_old_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/form_old.js";
  (function(window, modules, $, BM) {
    modules.define('FormItemOrderOld', ['extend', 'baseView', 'FormItemSelectGrind', 'ButtonNumber'], function(provide, extend, BaseView, FormItemSelectGrind, ButtonNumber) {
      var FormItemOrder = extend(BaseView),
          $class = FormItemOrder,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this._formSelectGrind = null;
          this._buttonNumber250 = null;
          this._buttonNumber500 = null;
          this._buttonNumber1kg = null;
          this.$elemFormSelectGrind = this.$elem.find('@bm-form-select-grind');
          this.$elemButtonNumber250 = this.$elem.find('@bm-button-number-250');
          this.$elemButtonNumber500 = this.$elem.find('@bm-button-number-500');
          this.$elemButtonNumber1kg = this.$elem.find('@bm-button-number-1kg');
          this._initFormSelectGrind();
          this._initButtonsNumber();
        },
        _initFormSelectGrind: function() {
          if (BM.tools.isNull(this._formSelectGrind)) {
            this._formSelectGrind = new FormItemSelectGrind({element: this.$elemFormSelectGrind});
            this._formSelectGrind.on('change', function(value) {
              this._onFormSelectGrindChange(value);
            }.bind(this));
          }
        },
        _initButtonsNumber: function() {
          if (BM.tools.isNull(this._buttonNumber250)) {
            this._buttonNumber250 = new ButtonNumber({element: this.$elemButtonNumber250});
            this._buttonNumber250.on('change', function(value) {
              this._onButtonNumberChange('250', value);
            }.bind(this));
          }
          if (BM.tools.isNull(this._buttonNumber500)) {
            this._buttonNumber500 = new ButtonNumber({element: this.$elemButtonNumber500});
            this._buttonNumber500.on('change', function(value) {
              this._onButtonNumberChange('500', value);
            }.bind(this));
          }
          if (BM.tools.isNull(this._buttonNumber1kg)) {
            this._buttonNumber1kg = new ButtonNumber({element: this.$elemButtonNumber1kg});
            this._buttonNumber1kg.on('change', function(value) {
              this._onButtonNumberChange('1kg', value);
            }.bind(this));
          }
        },
        _onFormSelectGrindChange: function(value) {},
        _onButtonNumberChange: function(kind, value) {
          console.log(kind, value);
        }
      });
      provide(FormItemOrder);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/item.js";
  (function(window, modules, $, BM) {
    modules.define('Item', ['extend', 'baseView', 'ItemModel', 'ItemFormOrder', 'ItemSpecsItem', 'ItemBrewingMethodItem', 'CartActions', 'StateActions'], function(provide, extend, BaseView, ItemModel, FormOrder, ItemSpecsItem, ItemBrewingMethodItem, CartActions) {
      var Item = extend(BaseView),
          $class = Item,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this._config = BM.tools.mixin({}, config);
          this._item = new ItemModel({data: this._config.data});
          this._formOrder = null;
          this.$elemFormOrder = this.$elem.find('@bm-item-form-order');
          this.$name = this.el.find('@bm-item-name');
          this.$descriptionShort = this.el.find('@bm-item-description-short');
          this.$rating = this.el.find('@bm-item-rating');
          this.$price = this.el.find('@bm-item-price');
          this.$specsWrapper = this.el.find('@bm-item-specs');
          this.$description = this.el.find('@bm-item-description');
          this.$imageWrapper = this.el.find('@bm-item-image-wrapper');
          this.$image = this.el.find('@bm-item-image');
          this.$imagePlantation = this.el.find('@bm-item-image-plantation');
          this.$methodsWrapper = this.el.find('@bm-item-methods-wrapper');
          this._timeoutZoom = null;
          this._specs = [];
          this._methods = [];
          this._initFormOrder();
          this._updateFormOrder();
          this._bindEvents();
          this.render();
        },
        _bindEvents: function() {
          if (BM.tools.client.isTouch()) {
            this.$imageWrapper.on('tap', function(event) {
              this._onImageWrapperTap();
            }.bind(this));
          } else {
            this.$imageWrapper.on('mouseover', function(event) {
              this._onImageWrapperMouseOver();
            }.bind(this));
            this.$imageWrapper.on('mouseout', function(event) {
              this._onImageWrapperMouseOut();
            }.bind(this));
          }
        },
        _onImageWrapperTap: function() {
          this._toggleZoom();
        },
        _onImageWrapperMouseOver: function() {
          if (this._isZoomVisible()) {
            return;
          }
          this._clearTimeoutZoom();
          this._timeoutZoom = setTimeout(function() {
            this._showZoom();
          }.bind(this), 300);
        },
        _onImageWrapperMouseOut: function() {
          this._clearTimeoutZoom();
          this._hideZoom();
        },
        _clearTimeoutZoom: function() {
          if (!BM.tools.isNull(this._timeoutZoom)) {
            clearTimeout(this._timeoutZoom);
            this._timeoutZoom = null;
          }
        },
        _toggleZoom: function() {
          if (this._isZoomVisible()) {
            this._hideZoom();
          } else {
            this._showZoom();
          }
        },
        _showZoom: function() {
          this.el.addClass('m-scale-visible');
        },
        _hideZoom: function() {
          this.el.removeClass('m-scale-visible');
        },
        _isZoomVisible: function() {
          return this.el.hasClass('m-scale-visible');
        },
        render: function() {
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
        _renderSpecs: function() {
          this._specs.forEach(function(spec) {
            spec.destroy();
          });
          this._specs.length = 0;
          this._specs = [];
          this.$specsWrapper.html('');
          this._config.data.specsWithLabels.forEach(function(specData) {
            var spec = new ItemSpecsItem({
              data: specData,
              options: {hint: true}
            });
            this.$specsWrapper.append(spec.getElement());
          }.bind(this));
        },
        _renderBrewingMethods: function() {
          this._methods.forEach(function(method) {
            method.destroy();
          });
          this._methods.length = 0;
          this._methods = [];
          this.$methodsWrapper.html('');
          this._config.data.methodsWithLabels.forEach(function(methodData) {
            var method = new ItemBrewingMethodItem({data: methodData});
            this.$methodsWrapper.append(method.getElement());
          }.bind(this));
        },
        _initFormOrder: function() {
          var $__2 = this;
          if (BM.tools.isNull(this._formOrder)) {
            this._formOrder = new FormOrder({element: this.$elemFormOrder});
            this._formOrder.on('add', function(obj) {
              $__2._addItemToCart(obj);
            });
          }
        },
        _addItemToCart: function(data) {
          CartActions.addItem(this._config.data.id, data.amount, data.grind);
        },
        _updateFormOrder: function() {
          this._formOrder.setPrices(this._item.getData().price);
        },
        _getTemplateName: function() {
          return 'bm-item-template';
        }
      });
      provide(Item);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_specs_45_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/specs-item.js";
  (function(window, modules, $, BM) {
    modules.define('ItemSpecsItem', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var ItemSpecsItem = extend(BaseView),
          $class = ItemSpecsItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
          this.$label = this.el.find('@bm-item-specs-item-label');
          this.$value = this.el.find('@bm-item-specs-item-value');
          this.$hint = this.el.find('@bm-item-specs-item-hint');
          this._timeoutShowHint = null;
          this._config = BM.tools.mixin({}, config);
          this._bindEvents();
          this.render();
        },
        _bindEvents: function() {
          if (BM.tools.client.isTouch()) {
            this._onLabelTap();
          } else {
            this.$label.on('mouseover', function(event) {
              this._onLabelMouseOver();
            }.bind(this));
            this.$label.on('mouseout', function(event) {
              this._onLabelMouseOut();
            }.bind(this));
          }
        },
        _onLabelMouseOver: function() {
          if (!this._isHintAvailable()) {
            return;
          }
          this._timeoutShowHint = setTimeout(function() {
            this._showHint();
          }.bind(this), 300);
        },
        _onLabelMouseOut: function() {
          if (!BM.tools.isNull(this._timeoutShowHint)) {
            clearTimeout(this._timeoutShowHint);
            this._timeoutShowHint = null;
          }
          this._hideHint();
        },
        _onLabelTap: function() {
          if (!this._isHintAvailable()) {
            return;
          }
          this.$label.on('tap', function(event) {
            this._toggleHint();
          }.bind(this));
        },
        _toggleHint: function() {
          if (this._isHintVisible()) {
            this._hideHint();
          } else {
            this._showHint();
          }
        },
        _showHint: function() {
          this.el.addClass('m-hint-visible');
        },
        _hideHint: function() {
          this.el.removeClass('m-hint-visible');
        },
        _isHintVisible: function() {
          return this.el.hasClass('m-hint-visible');
        },
        _isHintAvailable: function() {
          return this._config && this._config.data.description && this._config.options && this._config.options.hint === true;
        },
        render: function() {
          if (!this._config.data) {
            return;
          }
          this.el.attr('data-name', this._config.data.name);
          this.$label.html(this._config.data.label);
          this.$value.attr('data-value', this._config.data.value);
          this.$hint.html(this._config.data.description);
          if (this._isHintAvailable()) {
            this.el.addClass('m-hint-available');
          }
        },
        _getTemplateName: function() {
          return 'bm-item-specs-all-item-template';
        }
      });
      provide(ItemSpecsItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_order_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/order/item.js";
  (function(window, modules, $, BM) {
    modules.define('OrderItem', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var OrderItem = extend(BaseView),
          $class = OrderItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.el) {
            return;
          }
        },
        _getTemplateName: function() {
          return 'bm-order-item-template';
        }
      });
      provide(OrderItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_popup_47_popup_45_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/popup/popup-item.js";
  (function(window, modules, $, BM) {
    modules.define('PopupItem', ['extend', 'popupBaseClass', 'dynamicContent', 'Item', 'StateActions'], function(provide, extend, BasePopup, DynamicContent, Item, StateActions) {
      var PopupItem = extend(BasePopup),
          $class = PopupItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.call(this, {
            rootClassName: ['m-version-2', 'bm-popup-item'],
            useTemplate: true
          });
          this._config = BM.tools.mixin({}, config);
          this._dynamicContent = null;
          this._itemHandler = null;
          this.$elemDynamicContent = this.$elem.find('@bm-dynamic-content');
          this.$elemContent = this.$elem.find('@bm-popup-item-content');
          this.$elemButtonClose = this.$elem.find('@bm-popup-item-button-close');
          this._initDynamicContent();
          this._bindEvents();
          this._initItem();
        },
        _bindEvents: function() {
          this.$elemButtonClose.on(BM.helper.event.clickName(), function() {
            this._onButtonCloseClick();
          }.bind(this));
        },
        _onButtonCloseClick: function() {
          this.hide();
        },
        _initDynamicContent: function() {
          if (BM.tools.isNull(this._dynamicContent)) {
            this._dynamicContent = new DynamicContent({element: this.$elemDynamicContent});
            this._dynamicContent.setStep('content');
          }
        },
        _initItem: function() {
          if (BM.tools.isNull(this._itemHandler)) {
            this._itemHandler = new Item({data: this._config.data});
            this.$elemContent.append(this._itemHandler.getElement());
          }
        },
        show: function() {
          StateActions.setViewingItem(this._config.data);
          $super.show.apply(this, arguments);
        },
        hide: function() {
          StateActions.setViewingItem(null);
          $super.hide.apply(this, arguments);
        },
        _getTemplateName: function() {
          return 'bm-popup-item-template';
        }
      });
      provide(PopupItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_transform_45_origin_45_dependent_47_transform_45_origin_45_dependent_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/transform-origin-dependent/transform-origin-dependent.js";
  (function(window, modules, $, BM) {
    modules.define('initTransformOriginDependentElements', ['extend', 'baseClass'], function(provide, extend, BaseClass) {
      var Module = function($__super) {
        function Module() {
          $traceurRuntime.superConstructor(Module).apply(this, arguments);
        }
        return ($traceurRuntime.createClass)(Module, {initialize: function() {
            $traceurRuntime.superGet(this, Module.prototype, "initialize").apply(this, arguments);
            this.$elements = $('.j-transform-origin-dependent');
            $.each(this.$elements, function(index, element) {
              var $e = $(element);
              var savedOffset = $e.offset();
              var savedWidth = $e.width();
              $e.on('mouseover mousemove', function(e) {
                var relativeMouseX;
                var calculatedOrigin;
                if (e.pageX) {
                  relativeMouseX = e.pageX - savedOffset.left;
                  calculatedOrigin = (relativeMouseX / savedWidth).toFixed(1) * 100;
                  calculatedOrigin = calculatedOrigin < 0 ? 0 : calculatedOrigin;
                  $e.attr('data-transform-origin', calculatedOrigin);
                }
              });
              $e.on('mouseout', function(e) {
                $e.removeAttr('style');
              });
            });
          }}, {}, $__super);
      }(BaseClass);
      new Module();
      provide(Module);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderData_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderData.js";
  (function(window, modules, $, React) {
    modules.define('OrderData', [], function(provide) {
      var OrderData = React.createClass({
        displayName: 'OrderData',
        propTypes: {deliveryMethods: React.PropTypes.array},
        getInitialState: function() {
          return {};
        },
        onTabSelect: function(value) {},
        render: function() {
          return (React.createElement("div", null));
        }
      });
      provide(OrderData);
    });
  }(this, this.modules, this.jQuery, this.React));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderDeliveryAddress_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderDeliveryAddress.js";
  (function(window, modules, $, React) {
    modules.define('OrderDeliveryAddress', ['CartActions', 'CartStore'], function(provide, CartActions, CartStore) {
      var OrderDeliveryAddress = React.createClass({
        displayName: 'OrderDeliveryAddress',
        propTypes: {
          orderData: React.PropTypes.object,
          selectedDeliveryRegion: React.PropTypes.string,
          selectedDeliveryOption: React.PropTypes.string
        },
        render: function() {
          return (React.createElement("div", {className: "bm-page-order-delivery-method"}, React.createElement("div", {className: "bm-header-25 bm-page-order-delivery-address-header"}, "Адрес и контактные данные"), React.createElement("div", {className: "bm-page-order-delivery-address-form"}, React.createElement("div", {className: "form-fluid"}, React.createElement("div", {className: "form-fluid-item"}, React.createElement("div", {className: "form-fluid-label"}, "Имя"), React.createElement("input", {
            type: "text",
            className: "form-fluid-input"
          })), React.createElement("div", {className: "form-fluid-item"}, React.createElement("div", {className: "form-fluid-label"}, "Телефон"), React.createElement("input", {
            type: "tel",
            className: "form-fluid-input"
          })), React.createElement("div", {className: "form-fluid-item"}, React.createElement("div", {className: "form-fluid-label"}, "Email"), React.createElement("input", {
            type: "email",
            className: "form-fluid-input"
          })), React.createElement("div", {className: "form-fluid-item"}, React.createElement("div", {className: "form-fluid-label"}, "Адрес доставки"), React.createElement("input", {
            type: "email",
            className: "form-fluid-input"
          }))))));
        }
      });
      provide(OrderDeliveryAddress);
    });
  }(this, this.modules, this.jQuery, this.React));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderDeliveryMethod_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderDeliveryMethod.js";
  (function(window, modules, $, React) {
    modules.define('OrderDeliveryMethod', ['CartActions', 'CartStore', 'OrderDeliveryRegionSelect', 'OrderDeliveryOptionSelect'], function(provide, CartActions, CartStore, OrderDeliveryRegionSelect, OrderDeliveryOptionSelect) {
      var OrderDeliveryMethod = React.createClass({
        displayName: 'OrderDeliveryMethod',
        propTypes: {
          orderData: React.PropTypes.object,
          selectedDeliveryRegion: React.PropTypes.string,
          selectedDeliveryOption: React.PropTypes.string
        },
        render: function() {
          return (React.createElement("div", {className: "bm-page-order-delivery-method"}, React.createElement("div", {className: "bm-header-25 bm-page-order-delivery-method-header"}, "Способ доставки"), React.createElement(OrderDeliveryRegionSelect, {
            orderData: this.props.orderData,
            selectedDeliveryRegion: this.props.selectedDeliveryRegion
          }), React.createElement(OrderDeliveryOptionSelect, {
            orderData: this.props.orderData,
            selectedDeliveryRegion: this.props.selectedDeliveryRegion,
            selectedDeliveryOption: this.props.selectedDeliveryOption
          })));
        }
      });
      provide(OrderDeliveryMethod);
    });
  }(this, this.modules, this.jQuery, this.React));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderDeliveryOptionSelect_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderDeliveryOptionSelect.js";
  (function(window, modules, $, React) {
    modules.define('OrderDeliveryOptionSelect', ['OrderStore', 'OrderActions'], function(provide, OrderStore, OrderActions) {
      var OrderDeliveryOptionSelect = React.createClass({
        displayName: 'OrderDeliveryOptionSelect',
        propTypes: {
          orderData: React.PropTypes.object,
          selectedDeliveryRegion: React.PropTypes.string,
          selectedDeliveryOption: React.PropTypes.string
        },
        getInitialState: function() {
          return {selected: null};
        },
        getDeliveryOptions: function() {
          var $__2 = this;
          if (!this.props.selectedDeliveryRegion || !this.props.orderData) {
            return null;
          }
          var region = this.props.orderData.deliveryRegions.filter(function(region) {
            return region.name === $__2.props.selectedDeliveryRegion;
          })[0];
          return region.options;
        },
        onDeliveryOptionClick: function(name) {
          OrderActions.setSelectedDeliveryOption(name);
        },
        onLinkToMoreClick: function(event) {
          event.stopPropagation();
        },
        render: function() {
          var $__2 = this;
          var deliveryOptions = this.getDeliveryOptions();
          if (!deliveryOptions) {
            return null;
          }
          return (React.createElement("div", {className: "bm-page-order-delivery-method-option-select"}, deliveryOptions.map(function(option) {
            var className = ['bm-page-order-delivery-method-option'];
            className.push(("m-option-" + option.name));
            if ($__2.props.selectedDeliveryOption === option.name) {
              className.push('m-selected');
            }
            return (React.createElement("div", {
              key: $__2.props.selectedDeliveryRegion + option.name,
              className: className.join(' '),
              onClick: $__2.onDeliveryOptionClick.bind($__2, option.name)
            }, React.createElement("div", {
              className: "delivery-option-label",
              dangerouslySetInnerHTML: {__html: option.label}
            }), option.note ? React.createElement("div", {
              className: "delivery-option-note",
              dangerouslySetInnerHTML: {__html: option.note}
            }) : null, option.linkToMore ? React.createElement("a", {
              onClick: $__2.onLinkToMoreClick,
              href: option.linkToMore,
              target: "__blank",
              className: "delivery-option-link-to-more"
            }, "подробнее") : null));
          })));
        }
      });
      provide(OrderDeliveryOptionSelect);
    });
  }(this, this.modules, this.jQuery, this.React));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderDeliveryRegionSelect_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderDeliveryRegionSelect.js";
  (function(window, modules, $, React) {
    modules.define('OrderDeliveryRegionSelect', ['OrderStore', 'OrderActions', 'UITabs'], function(provide, OrderStore, OrderActions, UITabs) {
      var OrderDeliveryRegionSelect = React.createClass({
        displayName: 'OrderDeliveryRegionSelect',
        propTypes: {
          orderData: React.PropTypes.object,
          selectedDeliveryRegion: React.PropTypes.string
        },
        componentDidMount: function() {
          if (this.props.selectedDeliveryRegion === null) {
            var defaultRegion = this.props.orderData.deliveryRegions.filter(function(region) {
              return region.default === true;
            })[0].name;
            OrderActions.setSelectedDeliveryRegion(defaultRegion);
          }
        },
        onTabSelect: function(value) {
          OrderActions.setSelectedDeliveryRegion(value);
          OrderActions.setSelectedDeliveryOption(null);
        },
        render: function() {
          return (React.createElement("div", {className: "bm-page-order-delivery-method-region-select"}, React.createElement(UITabs, {
            options: this.props.orderData.deliveryRegions,
            onSelect: this.onTabSelect,
            selected: this.props.selectedDeliveryRegion
          })));
        }
      });
      provide(OrderDeliveryRegionSelect);
    });
  }(this, this.modules, this.jQuery, this.React));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderSummarySimple_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderSummarySimple.js";
  (function(window, modules, $) {
    modules.define('OrderSummarySimple', ['CartActions', 'CartStore', 'OrderSummarySimpleItem'], function(provide, CartActions, CartStore, OrderSummarySimpleItem) {
      var OrderSummary = React.createClass({
        displayName: "OrderSummary",
        propTypes: {cart: React.PropTypes.object},
        getGroups: function() {
          var groups = {
            'mono': [],
            'aroma': [],
            'espresso': [],
            'exotic': []
          };
          var res = [];
          this.props.cart.order_items.forEach(function(item) {
            groups[item.item.kind].push(item);
          });
          Object.keys(groups).forEach(function(key) {
            if (groups[key].length > 0) {
              res.push({
                kind: key,
                objects: groups[key]
              });
            }
          });
          return res;
        },
        render: function() {
          if (!this.props.cart) {
            return null;
          }
          var itemsByGroups = this.getGroups();
          return (React.createElement("div", {className: "bm-page-order-summary"}, itemsByGroups.map(function(group) {
            return (React.createElement("div", {className: "bm-page-order-summary-group"}, React.createElement("div", {className: ("bm-page-order-summary-subheader m-" + group.kind)}, React.createElement("div", {className: "bm-page-order-summary-subheader-icon"}), React.createElement("div", {className: "bm-page-order-summary-subheader-text"}, BM.helper.coffeeKinds.getWordByKind(group.kind))), React.createElement("div", {className: "bm-page-order-summary-items-wrapper"}, group.objects.map(function(orderItem, i) {
              return (React.createElement(OrderSummarySimpleItem, React.__spread({}, orderItem, {counter: i + 1})));
            }))));
          })));
        }
      });
      provide(OrderSummary);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderSummarySimpleItem_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderSummarySimpleItem.js";
  (function(window, modules, $) {
    modules.define('OrderSummarySimpleItem', ['CartActions', 'CartStore'], function(provide, CartActions, CartStore) {
      var OrderSummary = React.createClass({
        displayName: "OrderSummary",
        propTypes: {
          item: React.PropTypes.object,
          weight: React.PropTypes.number,
          quantity: React.PropTypes.number,
          grind: React.PropTypes.string,
          counter: React.PropTypes.number
        },
        handleAddItemClick: function() {
          CartActions.addItem(this.props.item.id, this.props.weight, this.props.grind);
        },
        handleRemoveItemClick: function() {
          CartActions.removeItem(this.props.item.id, this.props.weight, this.props.grind);
        },
        handleDeleteItemClick: function() {
          CartActions.deleteItem(this.props.item.id, this.props.weight, this.props.grind);
        },
        getTotalPriceForItem: function() {
          var $__2 = this.props,
              item = $__2.item,
              weight = $__2.weight,
              quantity = $__2.quantity;
          var price = weight === 250 ? item.price : item[("price_" + weight)];
          return quantity * price;
        },
        render: function() {
          var name = this.props.item.name;
          var weight = this.props.weight;
          var quantity = this.props.quantity;
          var grind = this.props.grind;
          var wordPack = BM.helper.pluralize.getWordPack(quantity);
          return (React.createElement("div", {className: "bm-page-order-summary-item-simple"}, React.createElement("div", {className: "bm-page-order-summary-item-simple-counter"}, this.props.counter), React.createElement("div", {className: "bm-page-order-summary-item-simple-content"}, React.createElement("div", {className: "bm-page-order-summary-item-simple-content-text"}, "«", name, "», ", weight, " грамм, ", BM.helper.grind.getGrindTextFull(grind).toLowerCase(), ", ", quantity, " ", wordPack), React.createElement("div", {className: "bm-page-order-summary-item-simple-content-aside"}, React.createElement("div", {className: "bm-page-order-summary-item-simple-content-aside-content"}, React.createElement("div", {className: "bm-page-order-summary-item-simple-content-aside-content-text"}, this.getTotalPriceForItem(), " руб."))), React.createElement("div", {className: "bm-page-order-summary-item-simple-side-controls"}, React.createElement("div", {className: "buttons-wrapper"}, React.createElement("div", {
            className: "button m-minus",
            onClick: this.handleRemoveItemClick
          }), React.createElement("div", {
            className: "button m-plus",
            onClick: this.handleAddItemClick
          }), React.createElement("div", {
            className: "button m-delete",
            onClick: this.handleDeleteItemClick
          }))))));
        }
      });
      provide(OrderSummary);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_PageOrder_47_OrderSummaryTable_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/PageOrder/OrderSummaryTable.js";
  (function(window, modules, $) {
    modules.define('OrderSummaryTable', ['CartActions', 'CartStore'], function(provide, CartActions, CartStore, OrderSummaryTableItem) {
      var OrderSummary = React.createClass({
        displayName: "OrderSummary",
        propTypes: {cart: React.PropTypes.object},
        getGroups: function() {
          var groups = {
            'mono': [],
            'aroma': [],
            'espresso': [],
            'exotic': []
          };
          var res = [];
          this.props.cart.order_items.forEach(function(item) {
            groups[item.item.kind].push(item);
          });
          Object.keys(groups).forEach(function(key) {
            if (groups[key].length > 0) {
              res.push({
                kind: key,
                objects: groups[key]
              });
            }
          });
          return res;
        },
        render: function() {
          if (!this.props.cart) {
            return null;
          }
          var itemsByGroups = this.getGroups();
          return (React.createElement("div", {className: "bm-page-order-summary-table"}, React.createElement("div", {className: "bm-page-order-summary-table-row m-header"}, React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "Название"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "Вес"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "Помол"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "Количоство"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "Сумма")), React.createElement("div", {className: "bm-page-order-summary-table-row"}, React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "Классический сорт «Никарагуа марагоджиб»"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "250г"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "В зерне"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "1 уп"), React.createElement("div", {className: "bm-page-order-summary-table-cell"}, "400 руб"), React.createElement("div", {className: "bm-page-order-summary-table-row-aside"}, React.createElement("span", {className: "bm-page-order-summary-table-remove-item"}, "удалить")))));
        }
      });
      provide(OrderSummary);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__react_47_components_47_ui_47_UITabs_46_js__ = (function() {
  "use strict";
  var __moduleName = "react/components/ui/UITabs.js";
  (function(window, modules, $, React) {
    modules.define('UITabs', [], function(provide) {
      var UITabs = React.createClass({
        displayName: 'UITabs',
        propTypes: {
          options: React.PropTypes.array.isRequired,
          onSelect: React.PropTypes.func.isRequired,
          selected: React.PropTypes.string
        },
        getInitialState: function() {
          return {
            options: null,
            selected: null
          };
        },
        componentDidMount: function() {
          var $__2 = this;
          if (this.props.selected) {
            this.setState({selected: this.props.selected});
          } else {
            var options = Object.assign([], this.props.options);
            options.forEach(function(option) {
              if (option.default) {
                $__2.setState({selected: option.name});
              }
            });
            this.setState({options: options});
          }
        },
        componentWillReceiveProps: function(nextProps) {
          if (nextProps.selected !== undefined && nextProps.selected !== this.state.selected) {
            this.setState({selected: nextProps.selected});
          }
        },
        onTabSelected: function(value) {
          this.props.onSelect(value);
        },
        render: function() {
          var $__2 = this;
          if (this.props.options === null) {
            return null;
          }
          return (React.createElement("div", {className: "ui-tabs"}, this.props.options.map(function(option) {
            var className = ['ui-tabs-item'];
            if (option.name === $__2.state.selected) {
              className.push('m-selected');
            }
            return (React.createElement("div", {
              className: className.join(' '),
              onClick: $__2.onTabSelected.bind($__2, option.name)
            }, option.label));
          })));
        }
      });
      provide(UITabs);
    });
  }(this, this.modules, this.jQuery, this.React));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_form_47_grind_95_old_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/form/grind_old.js";
  (function(window, modules, $, BM) {
    modules.define('FormItemSelectGrindOld', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var FormItemSelectGrind = extend(BaseView),
          $class = FormItemSelectGrind,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return;
          }
          this.$elemsWithUniqueId = this.$elem.find('@bm-form-unique-element');
          this.$elemsOptionsViaGrind = this.$elem.find('@bm-form-grind-option-via-grind');
          this.$elemsBrewingMethods = this.$elem.find('@bm-brewing-method-item');
          this.$elemViaTypeWrapper = this.$elem.find('@bm-form-select-grind-via-type-wrapper');
          this._setUniqueIds();
          this._bindEvents();
          window.o = this;
        },
        _bindEvents: function() {
          this.$elemsOptionsViaGrind.on('change', function(event) {
            this._onOptionViaGrindChange(event);
          }.bind(this));
          this.$elemsBrewingMethods.on(BM.helper.event.clickName(), function(event) {
            this._onBrewingMethodClick(event);
          }.bind(this));
        },
        _onOptionViaGrindChange: function(event) {
          this._setSelectViaGrindStateBlur(false);
          this._unselectViaMethodItems();
          this._notify('change', this.$elemsOptionsViaGrind.filter(':checked').val());
        },
        _onBrewingMethodClick: function(event) {
          var targetElement = $(event.target);
          if (!targetElement.hasClass('bm-brewing-method')) {
            targetElement = targetElement.parent();
          }
          targetElement.addClass('m-selected');
          this.$elemsBrewingMethods.not(targetElement).removeClass('m-selected');
          this._setSelectViaGrindStateBlur(true);
          this.$elemsOptionsViaGrind.val([]);
          this._notify('change', targetElement.data('name'));
        },
        _setUniqueIds: function() {
          var postfix = this.getInstanceId();
          this.$elemsWithUniqueId.each(function() {
            var $this = $(this);
            if ($this.prop('tagName') === 'LABEL') {
              $this.attr('for', $this.attr('for') + '-' + postfix);
            } else if ($this.prop('tagName') === 'INPUT') {
              $this.attr('id', $this.attr('id') + '-' + postfix);
              $this.attr('name', $this.attr('name') + '-' + postfix);
            }
          });
        },
        _setSelectViaGrindStateBlur: function(bool) {
          if (bool) {
            this.$elemViaTypeWrapper.addClass('m-blur');
          } else {
            this.$elemViaTypeWrapper.removeClass('m-blur');
          }
        },
        _unselectViaMethodItems: function() {
          this.$elemsBrewingMethods.removeClass('m-selected');
        }
      });
      provide(FormItemSelectGrind);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_form_47_selected_45_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/form/selected-item.js";
  (function(window, modules, $, BM) {
    modules.define('ItemFormOrderSelectedItem', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var ItemFormOrderSelectedItem = extend(BaseView),
          $class = ItemFormOrderSelectedItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.call(this, {useTemplate: true});
          if (!this.el) {
            return;
          }
          this._bindEvents();
        },
        _bindEvents: function() {
          var self = this;
          var clickName = BM.helper.event.clickName();
        },
        _getTemplateName: function() {
          return 'bm-item-form-order-selected-item';
        }
      });
      provide(ItemFormOrderSelectedItem);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__loadScriptsConfig_46_js__ = (function() {
  "use strict";
  var __moduleName = "loadScriptsConfig.js";
  (function(window, document, modules, BM) {
    var config = BM.config || {},
        mainConfig = document.body.getAttribute('data-config'),
        parsedMainConfig = JSON.parse(mainConfig) || {},
        assetHost = parsedMainConfig.assetHost || '';
    var getWithVersion = function getWithVersion(filename) {
      var debug = config.debug || parsedMainConfig.debug || false,
          version = parsedMainConfig.version || new Date();
      return filename += '?t=' + version;
    };
    config.loadScriptsConfig = {
      'default': function() {
        modules.require('ui-modules');
      },
      'catalogue-index': function() {
        modules.require('ui-modules');
        modules.require('CatalogueInit');
      },
      'order-index': function() {
        modules.require('ui-modules');
        modules.require('OrderInit');
      }
    };
  }(this, this.document, this.modules, this.BM = this.BM || {}));
  return {};
}).call(Reflect.global);

var $__loadScripts_46_js__ = (function() {
  "use strict";
  var __moduleName = "loadScripts.js";
  (function(window, document, BM) {
    var tools = BM.tools = BM.tools || {},
        config = BM.config = BM.config || {};
    var loadScripts = function loadScripts(templateType) {
      var loadConfig = config.loadScriptsConfig;
      if (loadConfig.hasOwnProperty(templateType)) {
        loadConfig[templateType]();
      } else {
        loadConfig['default']();
      }
    };
    tools.loadScripts = loadScripts;
  }(this, this.document, this.BM = this.BM || {}));
  return {};
}).call(Reflect.global);

var $__initApp_46_js__ = (function() {
  "use strict";
  var __moduleName = "initApp.js";
  (function(window, document, BM, $) {
    'use strict';
    var tools = BM.tools = BM.tools || {},
        config = BM.config = BM.config || {},
        dataScripts = document.body.getAttribute('data-scripts'),
        templateType = dataScripts || config.mainConfig.action + '-' + config.mainConfig.scriptTemplate;
    if (true || config.debug) {
      console.enable();
    }
    $(function() {
      tools.loadScripts(templateType);
    });
  }(this, this.document, this.BM || {}, this.jQuery));
  return {};
}).call(Reflect.global);
