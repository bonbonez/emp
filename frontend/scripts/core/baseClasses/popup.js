(function ( window, document, modules, $, radio, BM, undefined ) {
  'use strict';

  modules.define( 'popupBaseClass', ['basePubSub', 'extend', 'tools'], function( provide, PubSub, extend, tools ) {
    var $window = $(window),
      popupCounter = 0,
      popups = [],

      PopupBaseClass = extend(PubSub),

      $class = PopupBaseClass,
      $super = $class.superclass,

      template =
        '<div class="bookmate-popup bm-popup" hidden="hidden" visible="false">' +
          '<div class="bookmate-popup-overlay bm-popup-overlay"></div>' +
          '<div class="bookmate-popup-content-wrapper bm-popup-content-wrapper" role="overlay">' +
          '<div class="bookmate-popup-content bm-popup-content" role="content"></div>' +
          '</div>' +
          '</div>',

      closeButtonTemplate = '<div class="bookmate-popup-button-close bm-popup-button-close"></div>',

      historyBackTemplate = '<div class="bookmate-popup-button-close bm-popup-button-back"></div>',

      historyControls = false,

      _popupExist = function( popup ) {
        var l = popups.length,
          i;

        for ( i = 0; i < l; ++i ) {
          if ( popups[i] === popup ) {
            return i;
          }
        }

        return false;
      },

      registerPopup = function( popup ) {
        if ( _popupExist(popup) === false ) {
          popups.push(popup);
        }
      },

      unregisterPopup = function(popup ) {
        var index;

        if ( (index = _popupExist(popup)) !== false ) {
          popups.splice(index, 1);
        }
      },

      hideAllPopups   = function(exceptPopup, options) {
        var l = popups.length,
          i, silent = false;

        if (!BM.tools.isUndefined(options)) {
          if (BM.tools.isBoolean(options.silent)) {
            silent = options.silent;
          }
        }

        for ( i = 0; i < l; ++i ) {
          if (popups[i] !== exceptPopup) {
            if (popups[i] instanceof PopupBaseClass && popups[i].isVisible()) {
              popups[i].hide(silent);
            }
          }
        }
      },

      updateVisiblePopups = function() {
        var l = popups.length,
          i;

        for ( i = 0; i < l; ++i ) {
          if (popups[i] instanceof PopupBaseClass && popups[i].isVisible()) {
            popups[i].update();
          }
        }
      };

    $class.dispatcher = new PubSub();

    $window.on('resize', function() {
      updateVisiblePopups();
    });

    $window.on('keyup', function(event) {
      if (event && event.keyCode && event.keyCode == 27) {
        hideAllPopups();
      }
    });

    BM.tools.mixin($class, {
      hideAll : function (silent) {
        hideAllPopups(null, {
          silent: silent
        });
      },
      destroyAll : function(silent) {
        hideAllPopups(null, {
          silent: silent
        });
        popups.forEach(function(popup){
          popup.destroy();
        });
      },
      anyVisible : function () {
        var result = false;
        popups.forEach(function (popup) {
          if (popup.isVisible()) {
            result = true;
          }
        });
        return result;
      },
      enableHistoryControls : function() {
        historyControls = true;
        popups.forEach(function(popup){
          popup.enableHistoryControls();
        });
      },
      disableHistoryControls : function() {
        historyControls = false;
        popups.forEach(function(popup){
          popup.disableHistoryControls();
        });
      }
    });

    BM.tools.mixin($class.prototype, {
      initialize : function(options) {
        $super.initialize.apply(this, arguments);

        this._content             = '';
        this._backgroundClickHide = true;
        this._blockMouseMove      = true;
        this._isVisible           = false;
        this._useTemplate         = false;
        this._showButtonClose     = true;
        this._animationsEnabled   = true;
        this._historyControls     = historyControls;
        this._stopHistoryOnClose  = false;

        this._initialBodyOverflowValue = null;

        this._element            = this._createPopupElement();
        this.$elem               = this._element;
        this._elementBody        = $('body');
        this._elementRoot        = this._element;
        this._elementOverlay     = this._element.find('[role=overlay]');
        this._elementContent     = this._element.find('[role=content]');
        this._elementButtonClose = this._element.find('[role=button-close]');

        this._contentClassName   = null;

        popupCounter += 1;
        this._uniqueToken = 'bookmate-popup-' + popupCounter + new Date().getTime();

        this.setConfig(options);

        if (this._useTemplate) {
          this._content = this._getTemplateContent();
          this._appendContent();
        }

        this._setupEvents();
        registerPopup(this);
      },

      setConfig : function(options) {
        if (!tools.isUndefined(options)) {
          if (!tools.isUndefined(options.useTemplate)) {
            this._useTemplate = options.useTemplate;
          }
          if (!tools.isUndefined(options.content)) {
            this._content = options.content;
            this._appendContent();
          }
          if (tools.isBoolean(options.backgroundClickHide)) {
            this.setOnBackgroundClickHide(options.backgroundClickHide);
          }
          if (!tools.isUndefined(options.contentClassName)) {
            this._contentClassName = options.contentClassName;
          }
          if (!tools.isUndefined(options.showButtonClose)) {
            this._showButtonClose = options.showButtonClose;
          }
          if (!tools.isUndefined(options.rootClassName)) {
            if (typeof options.rootClassName === 'string') {

            }
            this._rootClassName = options.rootClassName;
            this.setRootClassName(options.rootClassName);
          }
          if (!BM.tools.isUndefined(options.stopHistoryOnClose)) {
            this._stopHistoryOnClose = options.stopHistoryOnClose;
          }
        }
      },

      setOnBackgroundClickHide : function(bool) {
        if (typeof bool !== 'undefined') {
          if (bool) {
            this._backgroundClickHide = true;
          } else {
            this._backgroundClickHide = false;
          }
        }
      },

      setRootClassName : function(rootClassName) {
        var me = this;
        if (!tools.isUndefined(rootClassName)) {
          if (tools.isString(rootClassName)) {
            rootClassName = [rootClassName];
          }
          rootClassName.forEach(function(className){
            if (!me._element.hasClass(className)) {
              me._element.addClass(className);
            }
          });
        }
      },

      setAnimationsEnabled : function(bool) {
        this._animationsEnabled = !!bool;
      },

      _appendContent : function() {
        this._elementContent.html('');

        if (this._showButtonClose) {
          this._elementButtonClose = $(closeButtonTemplate);
          this._elementContent.append(this._elementButtonClose);
        }

        this._elementContent.append(this._content);
      },

      _createPopupElement : function() {
        return $(this._getBaseTemplate());
      },

      _getBaseTemplate : function() {
        return template;
      },

      _setupEvents : function() {
        var me = this,
          clickEvent = BM.tools.client.isTouch() ? 'tap' : 'click';

        this._elementOverlay.on(clickEvent, function(event) {
          me._onOverlayClick(event);
        });
        this._elementOverlay.on('mousemove', function(event) {
          me._onRootMouseMove(event);
        });
        this._elementRoot.on('mousewheel', function(event) {
          me._onRootMouseWheel(event);
        });
        this._elementRoot.on('keyup keydown keypress', function(event) {
          me._onRootKeyAction(event);
        });
        this._elementContent.on(clickEvent, function(event) {
          me._onContentClick(event);
        });
        this._elementButtonClose.on(clickEvent, function(event) {
          me._onButtonCloseClick(event);
        });

        /*$(window).bind('resize', function() {
         me._onWindowResize();
         });*/
      },

      _onOverlayClick : function(event) {
        if (this._backgroundClickHide && $(event.target).hasClass('bm-popup-content-wrapper')) {
          this.hide();

          if (this._stopHistoryOnClose) {
            $class.dispatcher._notify('stop-history-request');
          }
        }
      },

      _onRootMouseMove : function(event) {
        if (this._blockMouseMove) {
          event.stopPropagation();
        }
      },

      _onRootMouseWheel : function(event) {
        event.stopPropagation();
      },

      _onRootKeyAction : function(event) {
        event.stopPropagation();
      },

      _onContentClick : function(event) {
        //event.stopPropagation();
      },

      _onButtonCloseClick : function(event) {
        this.hide();
      },

      /*_onWindowResize : function() {
       this._calculateContentPosition();
       },*/

      show : function() {
        if (this._isVisible) {
          return;
        }

        this._preparePopup();
        this._appendIntoBody();
        this.updateLayout();

        this._show();
        this._blockBodyScrolling();

        this._notify('show');
        if ( radio ) {
          radio('bookmate-popup-show').broadcast();
        }
      },

      _appendIntoBody : function() {
        this._elementBody.append(this._elementRoot);
      },

      _show : function() {
        hideAllPopups(this, {silent: true});
        this._elementRoot.attr('visible', 'true');
        this._isVisible = true;
        this._elementRoot.focus();
      },

      hide : function(silent, config) {
        var me = this;
        if (this._isVisible) {
          this._hide({
            callback : function() {
              if (silent !== true) {
                //me.trigger('hide');
                if ( radio ) {
                  radio('bookmate-popup-hide').broadcast();
                }
              }
            },
            options : config || {}
          });
          if (silent !== true) {
            this._notify('hide');
          }
        }
      },

      _hide : function(config) {
        var me = this,
          animation = config.options && config.options.animation !== undefined ? !!config.options.animation : true;

        this._unblockBodyScrolling();

        if (this._isAnimationEnabled() && animation) {
          this._elementOverlay.animationEnd(function(){
            me._elementOverlay.unbindAnimationEnd();

            me._elementRoot.removeAttr('visible');
            me._elementRoot.attr('hidden', 'hidden');
            if (config.callback) {
              config.callback();
            }
          });
          this._elementRoot.attr('visible', 'false');
          this._isVisible = false;
        } else {
          this._elementRoot.attr('visible', 'false');
          this._elementRoot.removeAttr('visible');
          this._elementRoot.attr('hidden', 'hidden');
          if (config.callback) {
            config.callback();
          }
          this._isVisible = false;
        }
      },

      isVisible : function() {
        return this._isVisible;
      },

      _preparePopup : function() {
        this._elementRoot.removeAttr('visible');
        this._elementRoot.removeAttr('hidden');
      },

      _blockBodyScrolling : function() {
        this._initialBodyOverflowValue = this._elementBody.css('overflow');
        this._elementBody.css('overflow', 'hidden');
      },

      _unblockBodyScrolling : function () {
        this._elementBody.css('overflow', this._initialBodyOverflowValue)
      },

      updateLayout : function() {
        this._updateContentClassName();
        //this._updateRootClassName();
        this._calculateContentPosition();
        this._updateHistoryControls();
      },

      /*_updateRootClassName : function() {
       if (this._rootClassName && !this._element.hasClass(this.rootClassName)) {

       }
       },*/

      _updateContentClassName : function() {
        if (this._contentClassName && !this._elementContent.hasClass(this._contentClassName)) {
          this._elementContent.addClass(this._contentClassName);
        }
      },

      update : function() {
        this._calculateContentPosition();
      },

      _calculateContentPosition : function() {
        var resolvedHeight = $window.height() + 'px';

        this._elementOverlay.css({
          'height'      : resolvedHeight,
          'line-height' : resolvedHeight
        });
      },

      _updateHistoryControls: function () {
        if (this._historyControls) {
          this.$elem.addClass('m-history-controls-enabled');
        } else {
          this.$elem.removeClass('m-history-controls-enabled');
        }
      },

      _isAnimationEnabled: function () {
        if (this._element.hasClass('m-version-2') && !BM.tools.client.isBreakpointMobile() && this._animationsEnabled === true) {
          return true;
        }
        return false;
      },

      _getTemplateName: function () {
        // override by children
      },

      _getTemplateContent: function () {
        return $('#' + this._getTemplateName()).html();
      },

      showButtonClose: function () {
        if (this._showButtonClose) {
          this._elementButtonClose.removeAttr('data-visible');
        }
      },

      hideButtonClose : function() {
        if (this._showButtonClose) {
          this._elementButtonClose.attr('data-visible', 'false');
        }
      },

      enableHistoryControls : function() {
        this._historyControls = true;
        this.updateLayout();
      },

      disableHistoryControls : function() {
        this._historyControls = false;
        this.updateLayout();
      },

      destroy : function() {
        this.remove();
        $super.destroy.apply(this, arguments);
      },

      remove : function() {
        unregisterPopup(this);
        this.$elem.off();
        this.$elem.remove();
        this.$elem = null;
      }
    });

    provide(PopupBaseClass);

  } );

}( this, this.document, this.modules, this.jQuery, this.radio, this.BM ));