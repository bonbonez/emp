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

var $__catalogue_47_background_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/background.js";
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

var $__catalogue_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/init.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueInit', ['extend', 'baseView', 'CatalogueBackground', 'CatalogueMenu', 'CatalogueItem', 'EventDispatcher'], function(provide, extend, BaseView, Background, Menu, Item, EventDispatcher) {
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
          this._saveGroupsRanges();
          this._initBackground();
          this._initMenu();
          this._initItems();
          this._bindEvents();
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
          lastItem.showPopup();
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

var $__catalogue_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/item.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueItem', ['extend', 'baseView', 'PopupItem'], function(provide, extend, BaseView, PopupItem) {
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

var $__catalogue_47_menu_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/menu.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueMenu', ['extend', 'baseView', 'EventDispatcher'], function(provide, extend, BaseView, EventDispatcher) {
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
    modules.define('beforeUIModulesInit', ['InitEventDispatcher'], function(provide) {
      provide();
    });
    modules.define('ui-modules', ['beforeUIModulesInit'], function(provide) {
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

var $__ui_45_modules_47_item_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/item/item.js";
  (function(window, modules, $, BM) {
    modules.define('Item', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var Item = extend(BaseView),
          $class = Item,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return ;
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
          this._dynamicContent = null;
          this._itemHandler = null;
          this.$elemDynamicContent = this.$elem.find('@bm-dynamic-content');
          this.$elemContent = this.$elem.find('@bm-popup-item-content');
          this._initDynamicContent();
          this._initItem();
        },
        _initDynamicContent: function() {
          if (BM.tools.isNull(this._dynamicContent)) {
            this._dynamicContent = new DynamicContent({element: this.$elemDynamicContent});
          }
        },
        _initItem: function() {
          if (BM.tools.isNull(this._itemHandler)) {
            this._itemHandler = new Item();
            this.$elemContent.append(this._itemHandler.getElement());
          }
        },
        show: function() {
          $super.show.apply(this, arguments);
          setTimeout(function() {
            this._dynamicContent.showStep('content');
          }.bind(this), 500);
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
