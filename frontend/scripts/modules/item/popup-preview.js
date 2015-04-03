(function(window, modules, $){

    modules.define('moduleItemPopupPreview', ['extend', 'popupBaseClass'], function(provide, extend, PopupBaseClass) {

        var PopupPreview = extend(PopupBaseClass),

            $class = PopupPreview,
            $super = $class.superclass,

            templateName = 'b-item-popup-preview-template',

            loadedImages = [],

            isImageLoaded = function(url){
                var i = 0, l = loadedImages.length;
                for (i; i < l; ++i) {
                    if (loadedImages[i].url === url) {
                        return true;
                    }
                }
                return false;
            },

            getLoadedImage = function(url) {
                var i = 0, l = loadedImages.length;
                for (i; i < l; ++i) {
                    if (loadedImages[i].url === url) {
                        return loadedImages[i];
                    }
                }
                return false;
            };

        BM.tools.mixin($class.prototype, {

            initialize : function() {
                $super.initialize.call(this, {
                    className   : 'b-item-popup-preview',
                    useTemplate : true
                });

                this.$elemLoader     = this._element.find('@bm-item-popup-preview-loader');
                this.$elemImage      = this._element.find('@bm-item-popup-preview-image');
                this.$elemArrowLeft  = this._element.find('@bm-item-popup-preview-arrow-left');
                this.$elemArrowRight = this._element.find('@bm-item-popup-preview-arrow-right');

                this._timeoutShowImage = null;

                this._bindEvents();
            },

            _bindEvents : function() {
                var me = this;
                this.$elemArrowLeft.on('click', function() {
                    me._onArrowLeftClick();
                });
                this.$elemArrowRight.on('click', function() {
                    me._onArrowRightClick();
                });
            },

            _onArrowLeftClick : function() {
                this._notify('arrow-left-click', this.$elemImage.attr('src'));
            },

            _onArrowRightClick : function() {
                this._notify('arrow-right-click', this.$elemImage.attr('src'));
            },

            show : function(url) {
                this.setImage(url);
                $super.show.apply(this, arguments);
                this._notify('show');
            },

            hide : function() {
                this.$elemImage.removeAttr('src');
                this.$elemImage.attr('data-visible', 'false');
                $super.hide.apply(this, arguments);
                this._notify('hide');
            },

            setImage : function(url) {
                if (!isImageLoaded(url)) {
                    this._loadImage(url);
                } else {
                    this._showImage(url);
                }
            },

            _loadImage : function(url) {
                var me    = this,
                    image = new Image();
                
                me._hideImage();
                me._showLoader();
                image.onload = function() {
                    loadedImages.push({
                        url: url
                    });


                    if (me._timeoutShowImage) {
                        clearTimeout(me._timeoutShowImage);
                        me._timeoutShowImage = null;
                    }
                    me._timeoutShowImage = setTimeout(function() {
                        me._hideLoader();
                        me._showImage(url);
                    }, 500);
                };
                image.src = url;
            },
            
            _hideImage : function() {
                this.$elemImage.attr('data-visible', 'false');
            },

            _showImage : function(url) {
                this.$elemImage.attr('src', url);
                this.$elemImage.attr('data-visible', 'true');
                //this._elementContent.append();
            },

            _showLoader : function() {
                this.$elemLoader.attr('data-visible', 'true');
            },

            _hideLoader : function() {
                this.$elemLoader.attr('data-visible', 'false');
            },

            _getTemplateName : function() {
                return templateName;
            },

            destroy : function() {

            }

        });

        provide(PopupPreview);

    });

}(this, this.modules, this.jQuery));