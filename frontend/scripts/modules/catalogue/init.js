(function(window, modules, $, BM){

  modules.define(
    'CatalogueInit',
    [
      'extend',
      'baseView',
      'Paralax',
      'CatalogueBackground',
      'CatalogueMenu',
      'EventDispatcher'
    ],
    function(
      provide,
      extend,
      BaseView,
      Paralax,
      Background,
      CatalogueMenu,
      EventDispatcher
      ) {

    var CatalogueInit = extend(BaseView),

        $class  = CatalogueInit,
        $super  = $class.superclass,

        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._backgroundHandler       = null;
        this._menuHandler             = null;

        this.$elemBackground          = this.$elem.find('@bm-catalogue-background');
        this.$elemMenu                = this.$elem.find('@bm-catalogue-menu');

        this._groupes = [
          this.$elemGroupClassic      = this.$elem.find('@bm-catalogue-item-group-classic'),
          this.$elemGroupAroma        = this.$elem.find('@bm-catalogue-item-group-aroma')
        ];

        this._groupesRanges = [];

        this._saveGroupsRanges();
        this._initBackground();
        this._initMenu();
        this._initParalax();
        this._bindEvents();
      },

      _bindEvents : function() {
        EventDispatcher.on('window-resize', function() {
            this._saveGroupsRanges();
          }.bind(this));
      },

      _initBackground : function() {
          if (BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler = new Background({
              element: this.$elemBackground
            });
            this._backgroundHandler.on('update', function(itemName) {
              this._onBackgroundUpdate(itemName);
            }.bind(this));
          }
      },

      _initMenu : function() {
          if (BM.tools.isNull(this._menuHandler)) {
            this._menuHandler = new CatalogueMenu({
              element: this.$elemMenu
            });
          }
      },

      _onBackgroundUpdate : function(itemName) {
          if (!BM.tools.isNull(this._menuHandler)) {
            this._menuHandler.focusItem(itemName);
          }
      },

      _initParalax : function() {
        EventDispatcher.on('window-scroll', function() {
          this._updateBackground();
        }.bind(this));
      },

      _saveGroupsRanges : function() {
        var previousTopRange = 0;

        this._groupesRanges.length = 0;
        this._groupesRanges = [];

        this._groupes.forEach(function($group) {
          var bottomRange = $group.offset().top + $group.height();

          this._groupesRanges.push({
            elem:   $group,
            height: $group.height(),
            top:    previousTopRange,
            bottom: bottomRange
          });
          previousTopRange = bottomRange + 1;
        }.bind(this));
      },

      _updateBackground : function() {
        var range = this._getCurrentRange();

        if (BM.tools.isNull(range)) {
          return;
        }
        this._updateParallax(range);
        this._updateImage(range.elem);
      },

      _updateParallax : function(range) {
        var scrollTop = $window.scrollTop(),
          scrollProgress = parseInt(((scrollTop - range.top) / (range.bottom - range.top) * 100).toFixed(0), 10);

        if (!BM.tools.isNull(this._backgroundHandler)) {
          this._backgroundHandler.setProgress(scrollProgress);
        }
      },

      _updateImage : function($group) {
        if (!BM.tools.isNull(this._backgroundHandler)) {
          this._backgroundHandler.setCurrentItem($group.data('name'));
        }
      },

      _getCurrentGroupByRange : function() {
        var range = this._getCurrentRange();
        if (!BM.tools.isNull(range)) {
          return range.elem;
        }
      },

      _getCurrentRange : function() {
        var barrier = $window.scrollTop() + window.innerHeight / 2,
          range, i,
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

    new CatalogueInit({
      element: $(document.body).find('@bm-catalogue-index')
    });

    provide(CatalogueInit);

  });

}(this, this.modules, this.jQuery, this.BM));