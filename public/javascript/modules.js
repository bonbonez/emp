var $__cart_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "cart/init.js";
  (function(window, modules, $, radio) {
    modules.define('pageCartInit', ['pageCartItem', 'CartProcessor'], function(provide, CartItem, cart) {
      var $elemPageCart = $('@b-page-cart');
      $('@b-cart-item').each(function() {
        var $this = $(this);
        new CartItem({element: $this});
      });
      cart.on('update', function() {
        if (cart.getTotalItems() < 1) {
          $elemPageCart.attr('data-cart-empty', 'true');
        }
      });
      provide();
    });
  }(this, this.modules, this.jQuery, this.radio));
  return {};
}).call(Reflect.global);

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
            return ;
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
            return ;
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
            return ;
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
            return ;
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
            return ;
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
            return ;
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
              return ;
            }
            var $item = $(this);
            console.log();
            $item.css({'transform': 'translateY(' + self._selectItemHeight * i + 'px)'});
          });
        },
        _updateMenuOffset: function() {
          if (!BM.tools.isNull(this._offset)) {
            this._updateMenuOffset = function() {};
            return ;
          }
          this._offset = this.el.offset();
        },
        _updateSelectItemHeight: function() {
          if (!BM.tools.isNull(this._selectItemHeight)) {
            this._updateSelectItemHeight = function() {};
            return ;
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
          }
          var $menuItem = $item.find('@bm-page-catalogue-menu-item');
          this._notify('category-selected', $menuItem.data('name'), $menuItem.data('special'));
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
            return ;
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
            return ;
          }
          var item = this._getItem(itemName);
          if (item.elem.length < 1) {
            return ;
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
            return ;
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
            return ;
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
            return ;
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
            return ;
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
            return ;
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

var $__ui_45_modules_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init.js";
  (function(window, modules, $) {
    modules.define('beforeUIModulesInit', ['InitGlobalStylesModifiers', 'InitEventDispatcher'], function(provide) {
      provide();
    });
    modules.define('ui-modules', ['beforeUIModulesInit', 'initTransformOriginDependentElements', 'SideMenuInit'], function(provide) {
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
            return ;
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
            return ;
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
            return ;
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
          return ;
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
            return ;
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
            return ;
          }
          this.$text = this.el.find('@bm-brewing-method-item-text');
          this._config = BM.tools.mixin({}, config);
          this.render();
        },
        render: function() {
          if (!this._config.data) {
            return ;
          }
          this.el.attr('data-name', this._config.data.name);
          this.el.attr('data-size', this._config.data.size || "normal");
          this.$text.html(this._config.data.text);
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
    modules.define('FormItemOrder', ['extend', 'baseView', 'FormItemSelectGrind', 'ButtonNumber'], function(provide, extend, BaseView, FormItemSelectGrind, ButtonNumber) {
      var FormItemOrder = extend(BaseView),
          $class = FormItemOrder,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return ;
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
    modules.define('Item', ['extend', 'baseView', 'FormItemOrder', 'ItemSpecsItem', 'ItemBrewingMethodItem'], function(provide, extend, BaseView, FormOrder, ItemSpecsItem, ItemBrewingMethodItem) {
      var Item = extend(BaseView),
          $class = Item,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return ;
          }
          this._config = BM.tools.mixin({}, config);
          this._formOrder = null;
          this.$elemFormOrder = this.$elem.find('@bm-form-order');
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
            return ;
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
            return ;
          }
          this.$name.html(this._config.data.name);
          this.$descriptionShort.html(this._config.data.descriptionShort);
          this.$rating.attr('data-value', this._config.data.rating);
          this.$price.html(this._config.data.price);
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
          if (BM.tools.isNull(this._formOrder)) {
            this._formOrder = new FormOrder({element: this.$elemFormOrder});
          }
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
            return ;
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
            return ;
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
            return ;
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
            return ;
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

var $__ui_45_modules_47_popup_47_popup_45_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/popup/popup-item.js";
  (function(window, modules, $, BM) {
    modules.define('PopupItem', ['extend', 'popupBaseClass', 'dynamicContent', 'Item'], function(provide, extend, BasePopup, DynamicContent, Item) {
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
          $super.show.apply(this, arguments);
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
      var Module = function Module() {
        $traceurRuntime.superConstructor($Module).apply(this, arguments);
        ;
      };
      var $Module = Module;
      ($traceurRuntime.createClass)(Module, {initialize: function() {
          $traceurRuntime.superGet(this, $Module.prototype, "initialize").apply(this, arguments);
          this.$elements = $('.j-transform-origin-dependent');
          $.each(this.$elements, (function(index, element) {
            var $e = $(element);
            var savedOffset = $e.offset();
            var savedWidth = $e.width();
            $e.on('mouseover mousemove', (function(e) {
              var relativeMouseX;
              var calculatedOrigin;
              if (e.pageX) {
                relativeMouseX = e.pageX - savedOffset.left;
                calculatedOrigin = (relativeMouseX / savedWidth).toFixed(1) * 100;
                calculatedOrigin = calculatedOrigin < 0 ? 0 : calculatedOrigin;
                $e.attr('data-transform-origin', calculatedOrigin);
              }
            }));
            $e.on('mouseout', (function(e) {
              $e.removeAttr('style');
            }));
          }));
        }}, {}, BaseClass);
      new Module();
      provide(Module);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_item_47_form_47_grind_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/form/grind.js";
  (function(window, modules, $, BM) {
    modules.define('FormItemSelectGrind', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var FormItemSelectGrind = extend(BaseView),
          $class = FormItemSelectGrind,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return ;
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
