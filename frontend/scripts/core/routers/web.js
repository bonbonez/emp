(function(window, modules, $, BM){

  modules.define('RouterWeb',
  [
    'extend',
    'basePubSub',
    'popupBaseClass',
    'ampersandRouter',
    'ampersandState'
  ],
  function(
    provide,
    extend,
    PubSub,
    PopupBase,
    ARouter,
    AState
  ){

    var RouterWeb = extend(PubSub),

        $class = RouterWeb,
        $super = $class.superclass,

        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.apply(this, arguments);

        this._router                      = null;
        this._state                       = null;
        this._lastData                    = null;
        this._initialLocation             = window.location.pathname;
        this._initialTitle                = window.document.title;

        this._popupQuoteClass             = null;
        this._popupQuoteHandler           = null;
        this._popupDocumentClass          = null;
        this._popupDocumentHandler        = null;

        this._initRouter();
        this._initState();
        this._setupEvents();

        this._init();
      },

      _initRouter : function() {
        var self = this;
        this._router = new (ARouter.extend({
          routes: {
            ':login/quotes/:uuid': 'quote',
            'books/:uuid': "books",
            ':login/:uuid': 'libraryCard',
            '*other': 'other'
          },

          quote : function(login, uuid) {
            self._onQuoteRoute.apply(self, arguments);
          },

          books: function(uuid) {
            self._onBooksRoute.apply(self, arguments);
          },

          libraryCard : function(login, uuid) {
            self._onLibraryCardRoute.apply(self, arguments);
          },

          other: function() {
            self._onOtherRoute.apply(self, arguments);
          }
        }))();
      },

      _beforeRoute : function() {
        if (PopupBase.anyVisible()) {
          PopupBase.enableHistoryControls();
          PopupBase.hideAll(true);
        }
      },

      _onQuoteRoute : function(login, uuid) {
        this._beforeRoute();
        if (!this._isInitialUrl()) {
          this._showPopupQuote({
            uuid: uuid
          });
        }
      },

      _onBooksRoute : function(uuid) {
        this._beforeRoute();
        if (!this._isInitialUrl()) {
          this._showPopupDocument({
            book: {
              uuid: uuid
            }
          });
        }
      },

      _onLibraryCardRoute : function(login, uuid) {
        if (this._isLCLoginRegistered(login) && BM.helper.data.isValidUUID(uuid)) {
          this._showPopupDocument({
            libraryCard: {
              uuid: uuid
            }
          });
        } else {
          this._onOtherRoute();
        }
      },

      _onOtherRoute : function() {
        this._clear();
      },

      _registerLibraryCardLogin : function(login) {
        var logins = this._getRegisteredLCLogins();
        if (logins.indexOf(login) === -1) {
          logins.push(login);
        }
        this._setRegisteredLCLogins(logins);
      },

      _isLCLoginRegistered : function(login) {
        var logins = this._getRegisteredLCLogins();
        return logins.indexOf(login) !== -1;
      },

      _getRegisteredLCLogins : function() {
        if (!window.localStorage.getItem('registredLCLogins')) {
          this._setRegisteredLCLogins([]);
        }
        return JSON.parse(window.localStorage.getItem('registredLCLogins'));
      },

      _setRegisteredLCLogins : function(logins) {
        window.localStorage.setItem('registredLCLogins', JSON.stringify(logins));
      },

      _isInitialUrl : function() {
        return window.location.pathname === this._initialLocation;
      },

      getInitialLocation : function() {
        return this._initialLocation;
      },

      _showPopupDocument : function(config) {
        var self = this;

        if (BM.tools.isNull(this._popupDocumentClass)) {
          modules.require('DocumentPopup', function(PopupDocument) {
            self._popupDocumentClass = PopupDocument;
            self._initPopupDocument(config);
            self._popupDocumentHandler.openModal(config);
          });
        } else {
          this._initPopupDocument(config);
          this._popupDocumentHandler.openModal(config);
        }
      },

      _initPopupDocument : function(config) {
        this._destroyPopupDocument();
        this._popupDocumentHandler = new this._popupDocumentClass(config);
        this._popupDocumentHandler.on('fetch-success', function(data) {
          this._onPopupDocumentFetched(data);
        }.bind(this));
        this._popupDocumentHandler.on('hide', function() {
          this._onPopupHide();
        }.bind(this));
        this._popupDocumentHandler.on('history-back-click', function() {
          this._onPopupHistoryBackClick();
        }.bind(this));
      },

      _onPopupDocumentFetched : function(data) {
        try {
          BM.helper.pageTitle.pushBookPageTitle(data.title);
        } catch (e) {}

      },

      _destroyPopupDocument : function() {
        if (!BM.tools.isNull(this._popupDocumentHandler) && (BM.tools.isInstanceOf(this._popupDocumentHandler, this._popupDocumentClass))) {
          this._popupDocumentHandler.destroy();
          this._popupDocumentHandler = null;
        }
      },

      _showPopupQuote : function(config) {
        var self = this;

        if (BM.tools.isNull(this._popupQuoteClass)) {
          modules.require('modulePopupQuote', function(PopupQuote) {
            self._popupQuoteClass = PopupQuote;
            self._initPopupQuote(config);
            self._popupQuoteHandler.show();
          });
        } else {
          this._initPopupQuote(config);
          this._popupQuoteHandler.show();
        }
      },

      _initPopupQuote : function(config) {
        this._destroyPopupQuote();
        this._popupQuoteHandler = new this._popupQuoteClass(config);
        this._popupQuoteHandler.on('fetched', function(data) {
          this._onPopupQuoteFetched(data);
        }.bind(this));
        this._popupQuoteHandler.on('hide', function() {
          this._onPopupHide();
        }.bind(this));
        this._popupQuoteHandler.on('button-back-click', function() {
          this._onPopupHistoryBackClick();
        }.bind(this));
      },

      _destroyPopupQuote : function() {
        if (!BM.tools.isNull(this._popupQuoteHandler) && (BM.tools.isInstanceOf(this._popupQuoteHandler, this._popupQuoteClass))) {
          this._popupQuoteHandler.destroy();
          this._popupQuoteHandler = null;
        }
      },

      _onPopupQuoteFetched : function(data) {
        try {
          BM.helper.pageTitle.pushQuotePageTitle(data.document.title);
        } catch (e) {}
      },

      _onPopupHide : function() {
        this._clearStateObject();

        BM.helper.pageTitle.reset();
        this.navigate(this._initialLocation, {trigger: true, state: null});
        PopupBase.hideAll(true);

      },

      _onPopupHistoryBackClick : function() {

        this.back();
      },

      /*back: function() {
          window.history.back();
          this._state.configHistory.pop();
      },*/

      _unbindAll : function() {
        if (!BM.tools.isNull(this._popupQuoteHandler)) {
          this._popupQuoteHandler.off('hide');
        }
        if (!BM.tools.isNull(this._popupDocumentHandler)) {
          this._popupDocumentHandler.off('hide');
        }
      },

      _initState : function() {
        var me = this,
          State = AState.extend({
          props: {
            config: 'object',
            configHistory: 'array'
          }
        });
        this._state = new State({
          config: {},
          configHistory: []
        });

        this._state.on('change', function() {
          me._onStateChange();
        });
      },

      _setupEvents : function() {
        var self = this;
        PopupBase.dispatcher.on('stop-history-request', function() {
            self._onStopHistoryRequest();
        });
      },

      _onStopHistoryRequest : function() {
        this.back();
        this.stop();
      },

      _onStateChange : function() {
        this._state.configHistory.push(this._state.config);

        switch (this._state.config.type) {
          case 'popup-quote':
            this._onPopupQuoteStateChange();
            break;

          case 'popup-document':
            this._onPopupDocumentStateChange();
            break;
        }
      },

      _clear : function() {
        this._unbindAll();
        this._clearStateObject();

        PopupBase.hideAll(true);
        PopupBase.disableHistoryControls();

        if (this._isInitialUrl()) {
          BM.helper.pageTitle.reset();
        }
      },

      _clearStateObject : function() {
        if (BM.tools.isPresent(this._state)) {
          this._state.set('config', {}, {silent: true});
        }
      },

      _onPopupQuoteStateChange : function() {
        if (this._state.config.data.uuid && this._state.config.data.login) {
          this.navigateToQuotePage(
            this._state.config.data.uuid,
            this._state.config.data.login
          );
        }
      },

      _onPopupDocumentStateChange : function() {
        if (!BM.tools.isUndefined(this._state.config.data.bookUuid) && !BM.tools.isUndefined(this._state.config.data.documentUuid)) {
          this.navigateToBookPage(
            this._state.config.data.bookUuid
          );
        }
      },

      _init : function() {
        try {
          this._router.history.start({
            pushState: true,
            silent: true
          });
        } catch (e) {

        }
      },

      stop : function() {
        if (!BM.tools.isNull(this._router)) {
          try {
            this._router.history.stop();
          } catch (e) {}
        }
      },

      back : function() {
        /*var config;
        if (this._state.configHistory.length > 0) {
          config = this._state.configHistory.pop();
          this._state.set('config', config, { silent: true });
          window.history.back();
        } else {
          this.navigate(this._initialLocation);
        }*/
        if (this._isInitialUrl()) {
          BM.helper.pageTitle.reset();
        } else {
          BM.helper.pageTitle.pop();
        }
        window.history.back();
      },

      navigateToQuotePage : function(uuid, login) {
        return this.navigate(
          BM.helper.link.quote(uuid, login)
        );
      },

      navigateToBookPage : function(bookUuid) {
        return this.navigate(
          BM.helper.link.book(bookUuid)
        );
      },

      navigateToLibraryCardPage : function(login, uuid) {
        if (BM.helper.data.isValidUUID(uuid)) {
          this._registerLibraryCardLogin(login);
          return this.navigate(
            BM.helper.link.libraryCard(login, uuid)
          );
        }
      },

      navigate : function(url, options) {
        var trigger = true,
            state   = undefined,
            data    = {};

        if (!BM.tools.isUndefined(options)) {
          if (!BM.tools.isUndefined(options.trigger)) {
            trigger = options.trigger;
          }
          if (!BM.tools.isUndefined(options.data)) {
            data = options.data;
            if (!BM.tools.isNull(this._lastData) && BM.tools.isObject(this._lastData.modal)) {
              this._lastData.modal.off('hide');
              this._lastData = null;
            }
            this._lastData = data;
          }
          if (!BM.tools.isUndefined(options.state)) {
            state = options.state;
          }
        }

        if (!BM.tools.isNull(this._router)) {
          this._router.navigate(url, {
            trigger: trigger,
            state: state
          });
        }
      },

      getState : function() {
        return this._state;
      },

      setState : function(data) {
        if (!BM.tools.isNull(this._state)) {
          this._state.set('config', data);
        }
      },

      getRouter : function() {
        return this._router;
      },

      pushStatePopupQuote : function(config, options) {
        /*if (!BM.tools.isUndefined(options))  {
          if (!BM.tools.isUndefined(options.context)) {
            this._lastMixpanelContext = options.context;
          }
        }*/
        if (!BM.tools.isUndefined(config)) {
          this._state.set('config', {
            type: 'popup-quote',
            data: config
          });
        }
      },

      pushStatePopupDocument : function(config, options) {
        if (!BM.tools.isUndefined(options))  {
          if (!BM.tools.isUndefined(options.context)) {
            this._lastMixpanelContext = options.context;
          }
        }
        if (!BM.tools.isUndefined(config)) {
          this._state.set('config', {
            type: 'popup-document',
            data: config
          });
        }
      },

      _pushConfigHistory : function() {

      },

      getInitialLocation : function() {
        return this._initialLocation;
      }

    });

    var routerWebInstance = new RouterWeb();

    $window.on('popstate', function(event) {
      if (BM.tools.isNull(event.originalEvent.state)) {
        if (window.location.pathname !== routerWebInstance.getInitialLocation()) {
          window.location.reload();
        }
      } else {
        /*routerWebInstance.navigate(event);*/
        //routerWebInstance.navigate(window.location.pathname);

        BM.helper.pageTitle.pop();
      }
    });

    provide(routerWebInstance);
  });

}(this, this.modules, this.jQuery, this.BM));
