(function(window, modules, $){

    modules.define('moduleItemGallery', ['extend', 'basePubSub', 'moduleItemPopupPreview'], function(provide, extend, PubSub, PopupPreview){

        var ItemGallery = extend(PubSub),

            $class = ItemGallery,
            $super = $class.superclass,

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

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem = config.element;
                this.$elemZoomWrapper       = this.$elem.find('@bm-item-gallery-zoom-wrapper');
                this.$elemImageLarge        = this.$elem.find('@bm-item-gallery-image-large');
                this.$elemImageLargePicture = this.$elem.find('@bm-item-gallery-image-large-picture');
                this.$elemImageLargeOverlay = this.$elem.find('@bm-item-gallery-image-large-overlay');
                this.$elemImageZoomLoader   = this.$elem.find('@bm-item-gallery-zoom-loader');
                this.$elemsImagesThumbs     = this.$elem.find('@bm-item-gallery-image-thumb');

                this.$elemImageZoomed     = null;
                this._zoomWrapperSize     = null;
                this._popupPreviewHandler = null;

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemImageLargeOverlay.on('mouseover', function(event) {
                    me._onImageLargeOverlayMouseOver(event);
                });
                this.$elemImageLargeOverlay.on('mousemove', function(event) {
                    me._onImageLargeOverlayMouseMove(event);
                });
                this.$elemImageLargeOverlay.on('mouseout', function(event) {
                    me._onImageLargeOverlayMouseOut(event);
                });
                this.$elemImageLargeOverlay.on('click', function() {
                    me._onImageLargeOverlayClick();
                });
                this.$elemsImagesThumbs.on('click', function(event){
                    me._onThumbClick($(this), event);
                });
            },

            _onImageLargeOverlayMouseOver : function(event) {
                var url = this.$elemImageLarge.attr('data-original-image');

                if (this._isZoomVisible()) {
                    return;
                }

                this._removeZoomedImage();

                if (isImageLoaded(url)) {
                    this._showImage(getLoadedImage(url), event);
                } else {
                    this._preloadImage(url, event)
                }

                this._showZoom();
            },

            _onImageLargeOverlayMouseMove : function(event) {
                if (this._isZoomVisible() && this.$elemImageZoomed !== null) {
                    this._updateZoomedImagePosition(event);
                }
            },

            _showImage : function(image, event) {
                this._createZoomedImage(image);
                this._updateZoomedImagePosition(event);
            },

            _removeZoomedImage : function() {
                if (this.$elemImageZoomed !== null) {
                    this.$elemImageZoomed.remove();
                    this.$elemImageZoomed = null;

                    this.$elemZoomWrapper.find('.zoomed-image').remove();
                }
            },

            _createZoomedImage : function(image) {
                var $elem = $('<div>'),
                    containerSize = this._getZoomWrapperSize(),
                    resolvedSize = {},
                    aspectContainer = containerSize.width / containerSize.height,
                    aspectContainerInvert = containerSize.height / containerSize.width,
                    aspectImage     = image.width / image.height;

                $elem.addClass('zoomed-image');

                if (image.width < containerSize.width && image.height < containerSize.height) {
                    resolvedSize = containerSize;
                } else {
                    if (image.width > image.height || image.width === image.height) {
                        resolvedSize.width = image.width;
                        resolvedSize.height = image.width * aspectContainerInvert;
                    } else if (image.width < image.height) {
                        resolvedSize.height = image.height;
                        resolvedSize.width = image.height * aspectContainer;
                    }
                }

                $elem.css({
                    'background-image': 'url("' + image.url + '")',
                    'background-size': 'contain',
                    'background-position' : '50% 50%',
                    'background-repeat' : 'no-repeat',
                    'left' : '0',
                    'height' : resolvedSize.height,
                    'position' : 'absolute',
                    'top' : '0',
                    'width' : resolvedSize.width
                });

                this.$elemImageZoomed = $elem;
                this.$elemZoomWrapper.append(this.$elemImageZoomed);
            },

            _updateZoomedImagePosition : function(event) {

                var pageX               = event.pageX,
                    pageY               = event.pageY,
                    offsetImageWrapper  = this.$elemImageLargeOverlay.offset(),
                    posX                = pageX - offsetImageWrapper.left,
                    posY                = pageY - offsetImageWrapper.top,

                    currentImage = this._getZoomedImage(),

                    sizeZoomContainer   = this._getZoomWrapperSize(),
                    sizeImageWrapper    = this._getSizeImageWrapper(),

                    widthZoomContainer  = this.$elemImageZoomed.width(),
                    heightZoomContainer = this.$elemImageZoomed.height(),

                    resX                = (widthZoomContainer * (posX / sizeImageWrapper.width) - sizeZoomContainer.width / 2),
                    resY                = (heightZoomContainer * (posY / sizeImageWrapper.height) - sizeZoomContainer.height / 2);

                //resX = Math.max(resX, widthZoomContainer / 2 - currentImage.width / 2);

                this.$elemImageZoomed.css({
                    'top' : resY * -1,
                    'left' : resX * -1
                });
            },

            _getZoomedImage : function() {
                if (this._isZoomVisible() && this.$elemImageZoomed !== null) {
                    return getLoadedImage(
                        this.$elemImageLarge.attr('data-original-image')
                    );
                }
            },

            _preloadImage : function(url, event) {
                var me    = this,
                    image = new Image();

                this._showZoomLoader();
                image.onload = function() {
                    var height = this.height,
                        width  = this.width;

                    loadedImages.push({
                        url: url,
                        width: width,
                        height: height
                    });

                    setTimeout(function(){
                        me._hideZoomLoader();
                        me._showImage(getLoadedImage(url), event);
                    }, 1000);

                };
                image.src = url;
            },

            _getZoomWrapperSize : function() {
                if (this._zoomWrapperSize !== null) {
                    return this._zoomWrapperSize;
                }

                this._zoomWrapperSize = {
                    height : this.$elemZoomWrapper.height(),
                    width  : this.$elemZoomWrapper.width()
                };
                return this._zoomWrapperSize;
            },

            _onImageLargeOverlayMouseOut : function(event) {
                this._hideZoom();
            },

            _onImageLargeOverlayClick : function() {
                this._destroyPopupPreview();
                this._popupPreviewHandler = new PopupPreview();
                this._bindPopupPreviewEvents();
                this._popupPreviewHandler.show(this.$elemImageLarge.attr('data-original-image'));
            },

            _bindPopupPreviewEvents : function() {
                var me = this;
                this._popupPreviewHandler.on('show', function(){
                    me._hideZoom();
                });
                this._popupPreviewHandler.on('arrow-left-click', function(currentUrl) {
                    me._popupPreviewHandler.setImage(
                        me._getPreviousImageOriginalUrl(currentUrl)
                    );
                });
                this._popupPreviewHandler.on('arrow-right-click', function(currentUrl) {
                    me._popupPreviewHandler.setImage(
                        me._getNextImageOriginalUrl(currentUrl)
                    );
                });
            },

            _getPreviousImageOriginalUrl : function(currentUrl) {
                return this._getImageOriginalUrlByDelta(-1, currentUrl);
            },

            _getNextImageOriginalUrl : function(currentUrl) {
                return this._getImageOriginalUrlByDelta(1, currentUrl);
            },

            _getImageOriginalUrlByDelta : function(delta, currentUrl) {
                var currentImageIndex, newImageIndex,
                    result, images = [];

                this.$elemsImagesThumbs.each(function() {
                    images.push($(this).attr('data-original-image'));
                });

                currentImageIndex = images.indexOf(currentUrl);
                newImageIndex = currentImageIndex + delta;
                if (newImageIndex < 0) {
                    result = images[images.length - 1];
                } else if (newImageIndex >= images.length) {
                    result = images[0]
                } else {
                    result = images[newImageIndex];
                }

                return result;
            },

            _destroyPopupPreview : function() {
                if (this._popupPreviewHandler !== null) {
                    this._popupPreviewHandler.off();
                    this._popupPreviewHandler.destroy();
                    this._popupPreviewHandler = null;
                }
            },

            _onThumbClick : function($elemThumb, event) {
                this.$elemImageLargePicture.attr('src', $elemThumb.attr('data-large-image'));
                this.$elemImageLarge.attr('data-original-image', $elemThumb.attr('data-original-image'));
            },

            _showZoom : function() {
                this._showZoomContainer();
            },

            _hideZoom : function() {
                this._hideZoomContainer();
            },

            _getSizeImageWrapper : function() {
                return {
                    height: this.$elemImageLarge.height(),
                    width: this.$elemImageLarge.width()
                }
            },

            _isZoomVisible : function() {
                return this.$elemZoomWrapper.attr('data-visible') === 'true';
            },

            _showZoomContainer : function() {
                var size = this._getSizeImageWrapper();
                this.$elemZoomWrapper.height(
                    this.$elemZoomWrapper.width() * (size.height / size.width)
                );
                this.$elemZoomWrapper.attr('data-visible', 'true');
            },

            _hideZoomContainer : function() {
                this.$elemZoomWrapper.attr('data-visible', 'false');
            },

            _showZoomLoader : function() {
                this.$elemImageZoomLoader.attr('data-visible', 'true');
            },

            _hideZoomLoader : function() {
                this.$elemImageZoomLoader.attr('data-visible', 'false');
            },

            offset : function() {
                return this.$elem.offset();
            },

            size : function() {
                return {
                    height: this.$elem.height(),
                    width: this.$elem.width()
                };
            },

            setPositionFixed : function(bool) {
                if (bool) {
                    this.$elem.attr('data-position', 'fixed');
                } else {
                    this.clearPosition();
                }
            },

            setPositionDockedToBottom : function(bool) {
                if (bool) {
                    this.$elem.attr('data-position', 'docked-to-bottom');
                } else {
                    this.clearPosition();
                }
            },

            clearPosition : function() {
                this.$elem.removeAttr('data-position');
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(ItemGallery);
    });

}(this, this.modules, this.jQuery));