(function(window, modules, $, BM){

  modules.define(
    'CatalogueItem',
    [
      'extend',
      'baseView',
      'PopupItem'
    ],
    function(
      provide,
      extend,
      BaseView,
      PopupItem
    ) {

      var CatalogueItem = extend(BaseView),

        $class  = CatalogueItem,
        $super  = $class.superclass,

        $window = $(window);

      var MORE_INFO_FADE_DISTANCE = 70,
          MORE_INFO_FADE_BOUNDS   = { fr: 1, to: 0.1 };

      BM.tools.mixin($class.prototype, {

        initialize : function() {
          $super.initialize.apply(this, arguments);

          if (!this.el) {
            return;
          }

          this._config        = {};

          this.$content       = this.el.find('@bm-catalogue-item-content');
          this.$moreInfo      = this.el.find('@bm-catalogue-item-more-info');

          this._offset        = null;
          this._contentWidth  = null;
          this._widthWithMore = null;

          this._parseConfig();
          this._bindEvents();
        },

        _bindEvents : function() {
          this.el.on(BM.helper.event.clickName(), function(event){
            this._onClick();
          }.bind(this));
          this.el.on('mouseover', function(event){
            this._onMouseOver(event);
          }.bind(this));
          this.el.on('mouseout', function(event){
            this._onMouseOut(event);
          }.bind(this));
          this.el.on('mousemove', function(event){
            this._onMouseMove(event);
          }.bind(this));
        },

        _onClick : function(event) {
          this._showPopup();
        },

        _onMouseOver : function(event) {
          if (this._isMoreVisible()) {
            return;
          }
          this._setMoreInfoVisible(true);
          BM.helper.browser.triggerRerender();
        },

        _onMouseOut : function(event) {
          this._setMoreInfoVisible(false);
        },

        _onMouseMove : function(event) {
          this._updateElementOffset();
          this._updateContentWidth();
          this._updateWidthWithMore();

          var posX       = event.pageX - this._offset.left,
              bounds     = MORE_INFO_FADE_BOUNDS,
              boundsDiff = bounds.fr - bounds.to;

          if (this._isMoreDockedToLeft()) {
            var fadeStart = this._contentWidth,
                fadeEnd   = this._contentWidth + MORE_INFO_FADE_DISTANCE;
            
            if (posX > fadeEnd) {
              this._setMoreInfoVisible(false);
            } else if (posX > fadeStart && posX < fadeEnd) {
              var pos        = posX - this._contentWidth,
                  posRel     = pos / MORE_INFO_FADE_DISTANCE,
                  opacity    = bounds.to + (boundsDiff * (1 - posRel));

              this._setMoreOpacity(opacity);
            }
          } else if (this._isMoreDockedToRight() && !BM.tools.isNull(this._widthWithMore) && posX <= 0) {

            var fadeEnd   = MORE_INFO_FADE_DISTANCE,
                pos = Math.abs(posX);

            if (pos > fadeEnd) {
              this._setMoreInfoVisible(false);
            } else {
              var posRel  = pos / MORE_INFO_FADE_DISTANCE,
                  opacity = bounds.to + (boundsDiff * (1 - posRel))

              this._setMoreOpacity(opacity);
            }

          }
        },

        _showPopup : function() {
          if (BM.tools.isNull(this._popup)) {
            this._popup = new PopupItem({
              data: this._config
            });
          }
          this._popup.show();
        },

        _updateElementOffset : function() {
          if (BM.tools.isNull(this._offset)) {
            this._offset = this.el.offset();
          }
        },

        _updateContentWidth : function() {
          if (BM.tools.isNull(this._contentWidth)) {
            this._contentWidth = this.$content.width();
          }
        },

        _updateWidthWithMore : function() {
          if (BM.tools.isNull(this._widthWithMore) && this.el.hasClass('m-dock-more-to-right')) {
            this._widthWithMore = this.el.width();
          }
        },

        _setMoreInfoVisible : function(bool) {
          bool ? this.el.addClass('m-more-info-visible') && this._setMoreOpacity(1) : this.el.removeClass('m-more-info-visible');
        },

        _setMoreOpacity : function(value) {
          value = Math.min(1, Math.max(0, value));
          this.$moreInfo.css({
            'opacity' : value
          });
        },

        _isMoreDockedToLeft : function() {
          return !this.el.hasClass('m-dock-more-to-right');
        },

        _isMoreDockedToRight : function() {
          return this.el.hasClass('m-dock-more-to-right');
        },

        _isMoreVisible : function() {
          return this.el.hasClass('m-more-info-visible');
        },

        dockMoreToRight : function() {
          this.el.addClass('m-dock-more-to-right');
        },

        dockMoreToLeft : function() {
          this.el.removeClass('m-dock-more-to-right');
        }

      });

      provide(CatalogueItem);

    });

}(this, this.modules, this.jQuery, this.BM));