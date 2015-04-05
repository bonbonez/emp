(function(window, modules, $, radio){

    modules.define('pageCartInit', ['pageCartItem', 'CartProcessor'], function(provide, CartItem, cart) {

        var $elemPageCart = $('@b-page-cart');

        $('@b-cart-item').each(function(){
            var $this = $(this);
            new CartItem({ element: $this });
        });

        cart.on('update', function() {
            if (cart.getTotalItems() < 1) {
                $elemPageCart.attr('data-cart-empty', 'true');
            }
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.radio));
(function(window, modules, $){

    modules.define('pageCartItem', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var CartItem = extend(PubSub),

            $class = CartItem,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem = config.element;
                this.$elemButtonRemove = this.$elem.find('@b-cart-item-button-remove');
                this.$elemButtonMinus  = this.$elem.find('@b-cart-item-button-minus');
                this.$elemButtonPlus   = this.$elem.find('@b-cart-item-button-plus');
                this.$elemAmount       = this.$elem.find('@b-cart-item-amount');
                this.$elemPrice        = this.$elem.find('@b-cart-item-price');
                this.$elemPriceTotal   = this.$elem.find('@b-cart-item-price-total');

                this._config = {
                    item: {
                        id: null
                    }
                };

                this._parseConfig();
                this._updateLayout();
                this._setupEvents();
            },

            _parseConfig : function() {
                try {
                    this._config = JSON.parse(this.$elem.attr('data-config'));
                } catch (e) {}
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButtonRemove.on('click', function() {
                    me._onButtonCloseClick();
                });
                this.$elemButtonMinus.on('click', function() {
                    me._onButtonMinusClick();
                });
                this.$elemButtonPlus.on('click', function() {
                    me._onButtonPlusClick();
                })

            },

            _onButtonCloseClick : function() {
                //this.hide();
                //this._setStateWait(true);
                var me = this;
                this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/remove',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function() {
                            me._onRequestItemRemoveSuccess(data);
                        }, 300);
                    },
                    error : function() {
                        setTimeout(function(){
                            me._onRequestAddToCartError();
                        }, 300);
                    }
                })
            },

            _onButtonMinusClick : function() {
                if (this._getCurrentAmount() > 1) {
                    this._sendRequestDecItem();
                }
            },

            _sendRequestDecItem : function() {
                var me = this;
                //this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/dec',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function(){
                            me._onRequestDecItemSuccess();
                            radio('b-cart-update').broadcast(data);
                        }, 300);
                    },
                    error : function() {
                        me._onRequestDecItemError();
                    }
                });
            },

            _onRequestDecItemSuccess : function() {
                this._setStateWait(false);
                this._decItemAmount();
                this._updatePrice();
            },

            _onRequestDecItemError : function() {
                this._setStateWait(false);
            },

            _onButtonPlusClick : function() {
                this._sendRequestIncItem();
            },

            _sendRequestIncItem : function() {
                var me = this;
                //this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/inc',
                    type: 'post',
                    dataType : 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function(){
                            me._onRequestIncItemSuccess(data);
                        }, 300);
                    },
                    error : function() {
                        me._onRequestIncItemError();
                    }
                });
            },

            _onRequestIncItemSuccess : function(data) {
                this._setStateWait(false);
                this._incItemAmount();
                this._updatePrice();
                radio('b-cart-update').broadcast(data);
            },

            _onRequestIncItemError : function() {
                this._setStateWait(false);
            },

            _onRequestItemRemoveSuccess : function(data) {
                var me = this;
                setTimeout(function(){
                    me.hide();
                    radio('b-cart-update').broadcast(data);
                }.bind(this), 300);
            },

            _onRequestItemRemoveError : function() {
                setTimeout(function(){
                    this._setStateWait(false);
                }.bind(this), 300);
            },

            _slideOut : function(callback) {

            },

            hide : function() {
                this.$elem.attr('data-visible', 'false');
            },

            _updateLayout : function() {

            },

            _setStateWait : function(bool) {
                if (bool) {
                    this.$elem.attr('data-wait', 'true');
                } else {
                    this.$elem.attr('data-wait', 'fasle');
                }
            },

            _getCurrentAmount : function() {
                var amount = this.$elemAmount.html();
                amount = parseInt(amount, 10);
                return amount;
            },

            _incItemAmount : function() {
                var amount = this._getCurrentAmount();
                this._showButtonMinus();
                return this.$elemAmount.html(amount + 1);
            },

            _decItemAmount : function() {
                var amount = this._getCurrentAmount();
                if (amount <= 2) {
                    this._hideButtonMinus();
                }
                return this.$elemAmount.html(amount - 1);
            },

            _showButtonMinus : function() {
                this.$elemButtonMinus.attr('data-visible', 'true');
            },

            _hideButtonMinus : function() {
                this.$elemButtonMinus.attr('data-visible', 'false');
            },

            _updatePrice : function() {
                var amount = this._getCurrentAmount();
                if (amount > 1) {
                    this._showPriceTotal();
                } else {
                    this._hidePriceTotal();
                }
            },

            _showPriceTotal : function() {
                this.$elemPriceTotal.html(this._getCurrentAmount() * this._config.item.price);
                this.$elemPrice.attr('data-total-visible', 'true');
            },

            _hidePriceTotal : function() {
                this.$elemPrice.attr('data-total-visible', 'false');
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(CartItem);
    });

}(this, this.modules, this.jQuery));
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
(function(window, modules, $){

    modules.define('moduleItemInit', ['moduleItemGallery'], function(provide, ItemGallery){

        var $window = $(window),
            $elemLayoutItem = $('.b-layout-item'),

            itemGallery = new ItemGallery({
                element: $('@bm-item-gallery')
            }),

            gallerySize = itemGallery.size(),
            layoutItemOffset = $elemLayoutItem.offset(),
            layoutItemHeight = $elemLayoutItem.height(),
            breakpointFixed  = layoutItemOffset.top,
            breakpointDocked = layoutItemOffset.top + layoutItemHeight - gallerySize.height,

            updatePositionGallery = function() {
                var scrollTop = $window.scrollTop();

                if (scrollTop >= breakpointDocked) {
                    itemGallery.setPositionDockedToBottom(true);
                } else if (scrollTop >= breakpointFixed) {
                    itemGallery.setPositionFixed(true);
                } else {
                    itemGallery.setPositionFixed(false);
                    itemGallery.setPositionDockedToBottom(false);
                }
            };

        $window.on('scroll', updatePositionGallery);
        updatePositionGallery();

        provide();
    });

}(this, this.modules, this.jQuery));
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
(function(window, modules, $){

    modules.define('moduleSurveyContent', ['basePubSub', 'extend', 'moduleItemGallery'], function(provide, PubSub, extend, ItemGallery) {

        var SurveyContent = extend(PubSub),

            $class = SurveyContent,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem               = config.element;
                this.$elemItemGaller     = null;
                this._itemGalleryHandler = null;

                this._setupEvents();
                this.update();
            },

            _setupEvents : function() {
                var me = this;
            },

            update : function() {
                this.$elemItemGallery = this.$elem.find('@bm-item-gallery');
                this._itemGalleryHandler = new ItemGallery({
                    element: this.$elemItemGallery
                })

            },

            updateItem : function(html) {
                if (this._itemGalleryHandler !== null) {
                    this._itemGalleryHandler.destroy();
                    this._itemGalleryHandler = null;
                }
                this.$elem.off();
                this.$elem.html('');
                this.$elem.append(html);
                this.update();
            },

        });

        provide(SurveyContent);

    });

}(this, this.modules, this.jQuery));
(function(window, modules, $){

    modules.define('moduleSurveyControls', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var SurveyControls = extend(PubSub),

            $class = SurveyControls,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem              = config.element;
                this.$elemButtonComment = this.$elem.find('@b-survey-controls-button-comment');
                this.$elemButtonLike    = this.$elem.find('@b-survey-controls-button-like');
                this.$elemButtonBest    = this.$elem.find('@b-survey-controls-button-best');
                this.$elemButtonNext    = this.$elem.find('@b-survey-controls-button-next');

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButtonComment.on('click', function() {
                    me._notify('click-comment');
                });
                this.$elemButtonLike.on('click', function() {
                    me._notify('click-like');
                });
                this.$elemButtonBest.on('click', function() {
                    me._notify('click-best');
                });
                this.$elemButtonNext.on('click', function() {
                    me._notify('click-next');
                });
            }

        });

        provide(SurveyControls);

    });

}(this, this.modules, this.jQuery));
(function(window, modules, $){

    modules.define('moduleSurveyFormLogin', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var FormLogin = extend(PubSub),

            $class = FormLogin,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem          = config.element;
                this.$elemInputCode = this.$elem.find('@b-survey-login-form-input');
                this.$elemSubmit    = this.$elem.find('@b-survey-login-form-submit');

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemInputCode.on('keyup', function(event) {
                    me._onInputCodeKeyUp(event); 
                });
                this.$elemSubmit.on('click', function() {
                    me._onFormSubmit();
                });
            },

            _onInputCodeKeyUp : function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    this._onFormSubmit();
                    return;
                }
            },

            _onFormSubmit : function() {
                if (this._isFormValid()) {
                    this._sendRequestLogin();
                }
            },

            _sendRequestLogin : function() {
                var me = this;
                this._disableForm();
                $.ajax({
                    url: '/api/survey/login',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        code: this._getInputCodeValue()
                    },
                    success : function(data) {
                        setTimeout(function(){
                            me._onLoginRequestSuccess(data);
                        }, 500);
                    },
                    error : function() {
                        setTimeout(function(){
                            me._onLoginRequestError();
                        }, 500);
                    }
                });
            },

            _onLoginRequestSuccess : function(data) {
                //this._enableForm();
                this._notify('login-success');
            },

            _onLoginRequestError : function() {
                this._enableForm();
                this._notify('login-error');
            },

            _enableForm : function() {
                this.$elemSubmit.removeAttr('disabled');
                this.$elemSubmit.removeAttr('data-wait');
                this.$elemInputCode.removeAttr('disabled');
            },

            _disableForm : function() {
                this.$elemSubmit.attr('disabled', 'disabled');
                this.$elemSubmit.attr('data-wait', 'true');
                this.$elemInputCode.attr('disabled', 'disabled');
            },

            _isFormValid : function() {
                var value = this._getInputCodeValue();
                return value && value.length > 0;
            },

            _getInputCodeValue : function() {
                return this.$elemInputCode.val();
            }

        });

        provide(FormLogin);

    });

}(this, this.modules, this.jQuery));
(function(window, modules, $){

    modules.define('moduleSurveyInit', [
        //'moduleSurveryItemGalleryInit',
        'moduleSurveyFormLogin',
        'moduleSurveyControls',
        'moduleSurveyContent',
        'moduleSurveyRequestHandler',
        'modulePopupComment'
    ], function(provide, FormLogin, SurveyControls, SurveyContent, RequestHandler, PopupComment){

        var formLogin = new FormLogin({
                element: $('@b-survey-login-form')
            }),
            surveyControls = new SurveyControls({
                element: $('@b-survey-controls')
            }),
            surveyContent = new SurveyContent({
                element: $('@b-survey-content')
            }),
            popupComment = new PopupComment();

        var callbackRequestNextSuccess = function(data) {
                /*var contentType = xhr.getResponseHeader("content-type") || '';
                if (contentType.indexOf('json') !== -1 && data['finished'] === true) {

                } else if (contentType.indexOf('html') !== -1) {
                    surveyContent.updateItem(data);
                }*/
                if (data) {
                    if (data['next_item_html'] !== null) {
                        surveyContent.updateItem(data['next_item_html']);
                    }
                    if (data['finished'] === true) {
                        window.location.reload();
                    }
                    if (data['left']) {
                        console.log('ok');

                        $('@b-survey-counter-items-left').html(data['left']);
                    }
                }
            },
            callbackRequestNextError = function() {

            };

        formLogin.on('login-success', function() {
            window.location.reload();
        });

        surveyControls.on('click-comment', function(){
            //RequestHandler.like(callbackRequestNextSuccess, callbackRequestNextError);
            popupComment.clear();
            popupComment.show();
        });
        surveyControls.on('click-like', function(){
            RequestHandler.like(callbackRequestNextSuccess, callbackRequestNextError);
        });
        surveyControls.on('click-best', function() {
            RequestHandler.best(callbackRequestNextSuccess, callbackRequestNextError);
        });
        surveyControls.on('click-next', function() {
            RequestHandler.next(callbackRequestNextSuccess, callbackRequestNextError);
        });

    });

}(this, this.modules, this.jQuery));
(function(window, modules, $){

    modules.define('modulePopupComment', ['popupBaseClass', 'extend'], function(provide, PopupBase, extend){

        var PopupComment = extend(PopupBase),

            $class = PopupComment,
            $super = $class.superclass,

            templateName = 'b-popup-comment-template';

        BM.tools.mixin($class.prototype, {

            initialize : function() {
                $super.initialize.call(this, {
                    className   : 'b-popup-comment',
                    useTemplate : true
                });

                this.$elemTextarea = this._element.find('@b-popup-comment-textarea');
                this.$elemSubmit   = this._element.find('@b-popup-comment-submit');
                //console.log(this.$elemSubmit);

                this.bindEvents();
            },

            bindEvents : function() {
                var me = this;
                this.$elemSubmit.on('click', function() {
                    me._onFormSubmit();
                });
            },

            _onFormSubmit : function() {
                if (this.$elemTextarea.length > 0) {
                    this._disableForm();
                    this._sendRequest();
                }
            },

            _sendRequest : function() {
                var me = this;
                $.ajax({
                    url: '/api/survey/comment',
                    dataType : 'json',
                    type: 'post',
                    data: {
                        comment: this.$elemTextarea.val()
                    },
                    success: function(data) {
                        me._showStateSuccess();
                    },
                    error: function() {
                        me._enableForm();
                    }
                });
            },

            _disableForm : function() {
                this.$elemTextarea.attr('disabled', 'disabled');
                this.$elemSubmit.attr('disabled', 'disabled');
                this.$elemSubmit.attr('data-wait', 'true');
            },

            _enableForm : function() {
                this.$elemTextarea.removeAttr('disabled');
                this.$elemSubmit.removeAttr('disabled');
                this.$elemSubmit.removeAttr('data-wait');
            },

            _showStateInitial : function() {
                this._element.removeAttr('data-state');
            },

            _showStateSuccess : function() {
                console.log('showing');
                this._element.attr('data-state', 'success');
            },

            clear : function() {
                this._enableForm();
                this._showStateInitial();
                this.$elemTextarea.val('');
            },

            _getTemplateName : function() {
                return templateName;
            }

        });

        provide(PopupComment);

    });

}(this, this.modules, this.jQuery));
(function(window, modules, $){

    modules.define('moduleSurveyRequestHandler', ['basePubSub', 'extend'], function(provide, PubSub, extend){

        var RequestHandler = extend(PubSub),

            $class = RequestHandler,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);
                this._config = this._parseConfig();
            },

            _parseConfig : function() {
                try {
                    this._config = JSON.parse($(document.body).attr('data-config'));
                } catch (e) { }
            },

            //sendLike

            like : function(success, error) {
                return this._sendRequestNext('like', success, error);
            },

            best : function(success, error) {
                return this._sendRequestNext('best', success, error);
            },

            next : function(success, error) {
                return this._sendRequestNext('next', success, error);
            },

            _sendRequestNext : function(action, success, error) {
                $.ajax({
                    url: '/api/survey/next',
                    dataType: 'json',
                    type: 'post',
                    data: {
                        'item_action' : action
                    },
                    success : success,
                    error : error
                });
            }

        });



        provide(new RequestHandler());

    });

}(this, this.modules, this.jQuery));
(function(window, modules, $){

  modules.define('beforeUIModulesInit', [
    'initCartProcessor'
  ], function( provide ){
    provide();
  });

  modules.define('ui-modules', [
    'beforeUIModulesInit'
    /*'initFixedHeader'
    'beforeUIModulesInit',
    'initCartHeader',
    'initBlockRecent',
    'initButtonsAddToCart'*/

  ], function(provide){

    if (BM.tools.client.isTouch()) {
      $('body').addClass('m-touch');
    } else {
      $('body').addClass('m-desktop');
    }


    provide();
  });

}(this, this.modules, this.jQuery));
(function(window, modules, $, BM, radio){

    modules.define('buttonAddToCart', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var ButtonAddToCart = extend(PubSub),

            $class = ButtonAddToCart,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                if (!config.element) {
                    return;
                }

                this.$elem                = config.element;
                this.$elemButton          = this.$elem.find('@b-button-add-button');
                this.$elemButtonTextAdd   = this.$elem.find('@b-button-add-button-text-add');
                this.$elemButtonTextOrder = this.$elem.find('@b-button-add-button-text-order');
                this.$elemInCart          = this.$elem.find('@b-button-add-in-cart');

                this._config = {};

                this._parseConfig();
                this._setupEvents();
            },

            _parseConfig : function() {
                try {
                    this._config = JSON.parse(this.$elem.attr('data-config'));
                } catch (e) {}
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButton.on('click', function() {
                    me._onButtonClick();
                });
            },

            _onButtonClick : function() {
                if (this._isButtonStateAdd()) {
                    this._sendRequestAddToCart();
                } else {
                    console.log('order');
                }
            },

            _sendRequestAddToCart : function() {
                var me = this;
                this._setButtonStateWait(true);
                $.ajax({
                    url: '/api/cart/item/add',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success : function(data) {
                        setTimeout(function() {
                            me._onRequestAddToCartSuccess(data);
                        }, 300);
                    },
                    error : function() {
                        setTimeout(function(){
                            me._onRequestAddToCartError();
                        }, 300);
                    }
                })
            },

            _onRequestAddToCartSuccess : function(data) {
                this._setButtonStateWait(false);
                this._showButtonStateOrder(function() {console.log('hmm');
                    this._showAlreadyInCart();
                }.bind(this));
                radio('b-cart-update').broadcast(data);
            },

            _onRequestAddToCartError : function() {
                this._setButtonStateWait(false);
            },

            _setButtonStateWait : function(bool) {
                if (bool) {
                    this.$elemButton.attr('data-wait', 'true');
                } else {
                    this.$elemButton.removeAttr('data-wait');
                }
            },

            _showAlreadyInCart : function() {
                this.$elemInCart.attr('data-visible', 'true');
            },

            _hideAlreadyInCart : function() {
                this.$elemInCart.attr('data-visible', 'false');
            },

            _toggleButtonState : function(callback) {
                if (this._isButtonStateAdd()) {
                    this._showButtonStateOrder(callback);
                } else {
                    this._showButtonStateAdd(callback);
                }
            },

            _showButtonStateOrder : function(callback) {
                var me = this;
                this.$elemButton.width(this.$elemButton.width());
                this.$elemButton.attr('data-state', 'order');
                setTimeout(function(){
                    me.$elemButton.width(me.$elemButtonTextOrder.width());
                    me.$elemButtonTextOrder.attr('data-visible', 'true');

                    if (typeof callback === 'function') {
                        callback();
                    }
                }, 300);
                this.$elemButtonTextAdd.attr('data-visible', 'false');
                this.$elemButtonTextOrder.attr('data-visible', 'false');
            },

            _showButtonStateAdd : function(callback) {

            },

            _isButtonStateAdd : function() {
                return this.$elemButton.attr('data-state') === 'add';
            },

            _isButtonStateOrder : function() {

            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(ButtonAddToCart);

    });

}(this, this.modules, this.jQuery, this.BM, this.radio));
(function(window, modules, $, BM){

    modules.define('initButtonsAddToCart', ['buttonAddToCart'], function(provide, ButtonAddToCart) {

        $('@b-button-add').each(function(){
            var $this = $(this);
            new ButtonAddToCart({
                element: $this
            });
        });

        provide();

    });

}(this, this.modules, this.jQuery, this.BM));
(function(window, modules, $, BM){

    modules.define('HeaderCart', ['basePubSub', 'extend', 'CartProcessor'], function(provide, PubSub, extend, cart) {

        var HeaderCart = extend(PubSub),

            $class = HeaderCart,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                if (!config || !config.element) {
                    return;
                }

                this.$elem            = config.element;
                this.$elemCounter     = this.$elem.find('@b-header-cart-counter');
                this.$elemCounterText = this.$elem.find('@b-header-cart-counter-text');
                this.$elemButtonOrder = this.$elem.find('@b-header-cart-button-order');

                this._setupEvents();
                this._updateData();
            },

            _setupEvents : function() {
                var me = this;
                cart.on('update', function() {
                    me._updateData();
                });
            },

            _showCounter : function() {
                this.$elemCounter.attr('data-visible', 'true');
            },

            _hideCounter : function() {
                this.$elemCounter.attr('data-visible', 'false');
            },

            _updateData : function() {
                this._updateDataCounter();
            },

            _updateDataCounter : function() {
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

            _showButtonOrder : function() {
                this.$elemButtonOrder.attr('data-visible', 'true');
            },

            _hideButtonOrder : function() {
                this.$elemButtonOrder.attr('data-visible', 'false');
            },

            _updateCounterText : function() {
                var amount = cart.getTotalItems();
                this.$elemCounterText.html(amount);
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(HeaderCart);
    });

    modules.define('initCartHeader', ['HeaderCart'], function(provide, HeaderCart) {

        var headerCart = new HeaderCart({
            element: $('@b-header-cart')
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.BM));
(function(window, modules, $, radio){

    modules.define('CartProcessorClass', ['basePubSub', 'extend'], function(provide, PubSub, extend){

        var CartProcessor = extend(PubSub),

            $class = CartProcessor,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(){
                $super.initialize.apply(this, arguments);

                this._data = {
                    items: []
                };
            },

            setData : function(data) {
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

            getData : function() {
                return this._data;
            },

            getTotalItems : function() {
                var total = 0;
                this._data.items.forEach(function(elem){
                    total += elem.amount;
                });
                return total
            },

            destroy : function() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(CartProcessor);

    });

    modules.define('CartProcessor', ['CartProcessorClass'], function(provide, CartProcessor){
        var $body = $(document.body),
            cart  = new CartProcessor();

        try {
            cart.setData(JSON.parse($body.attr('data-cart-config')));
        } catch (e) {}

        provide(cart)
    });

    modules.define('initCartProcessor', ['CartProcessor'], function(provide, cart){

        radio('b-cart-update').subscribe(function(data){
            cart.setData(data);
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.radio));
(function(window, modules, $){

    modules.define('initFixedHeader', [], function(provide) {

        var $window                   = $(window),
            $elemCategoriesNavigation = $('.b-layout-top-categories-navigation'),
            $elemHeaderFixed          = $('@header-fixed'),
            offset                    = $elemCategoriesNavigation.offset(),
            height                    = $elemCategoriesNavigation.height(),
            scrollBreakpoint          = offset.top + height;

        var updateHeaderFixedVisibility = function() {
            if ($window.scrollTop() >= scrollBreakpoint) {
                $elemHeaderFixed.attr('data-visible', 'true');
            } else {
                $elemHeaderFixed.attr('data-visible', 'false');
            }
        };

        $window.on('scroll', function(event) {
            updateHeaderFixedVisibility();
        });

        updateHeaderFixedVisibility();

        provide();
    });

}(this, this.modules, this.jQuery));
(function(window, modules, $, BM){

    modules.define('initBlockRecent', ['BlockRecent'], function(provide, BlockRecent) {

        $('@b-block-recent').each(function(){
            var $this = $(this);
            new BlockRecent({
                element: $this
            });
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.BM));
(function(window, modules, $, BM){

    modules.define('BlockRecent', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var BlockRecent = extend(PubSub),

            $class = BlockRecent,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem = config.element;
                this.$elemButtonClose = this.$elem.find('@b-block-recent-button-close');

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButtonClose.on('click', function() {
                    me._onButtonCloseClick();
                });
            },

            _onButtonCloseClick : function() {
                this.hide();
                this.sendRequestClearRecent();
            },

            sendRequestClearRecent : function() {
                //var me = this;
                $.ajax({
                    url: '/api/items/recent/clear',
                    type: 'post'
                });
            },

            _setFixedHeight : function() {

            },

            hide : function() {
                this.$elem.height(this.$elem.height());
                this.$elem.attr('data-visible', 'false');
                setTimeout(function(){
                    this.$elem.height(0);
                }.bind(this), 400);
            },

            destroy : function() {

            }

        });

        provide(BlockRecent);

    });

}(this, this.modules, this.jQuery, this.BM));
(function (window, document, modules, BM) {
  var config = BM.config || {},
      mainConfig = document.body.getAttribute('data-config'),
      parsedMainConfig = JSON.parse(mainConfig) || {},
      assetHost = parsedMainConfig.assetHost || '';

  var getWithVersion = function getWithVersion( filename ) {
    var debug = config.debug || parsedMainConfig.debug || false,
        version = parsedMainConfig.version || new Date();

    //if (!debug) {
      //filename = filename.replace('js', 'min.js');
    //}

    return filename += '?t=' + version;
  };

  config.loadScriptsConfig = {

    'default' : function() {
        modules.require('ui-modules');
      console.log('hhh');
    },

    'item-show' : function() {
        modules.require('ui-modules');
        modules.require('moduleItemInit');
    },

    'cart-index' : function() {
        modules.require('ui-modules');
        modules.require('pageCartInit');
    },

    'survey-index' : function() {
        modules.require('ui-modules');
        modules.require('moduleSurveyInit');
    }
  };

}(
  this,
  this.document,
  this.modules,
  this.BM = this.BM || {}
));

/**
 * Загрузчик скриптов
 */

(function(window, document, BM) {
  var tools = BM.tools = BM.tools || {},
      config = BM.config = BM.config || {};

  var loadScripts = function loadScripts( templateType ) {
    var loadConfig = config.loadScriptsConfig;
    if ( loadConfig.hasOwnProperty(templateType) ) {
      loadConfig[templateType]();
    } else {
      loadConfig['default']();
    }
  };

  tools.loadScripts = loadScripts;
}(
  this,
  this.document,
  this.BM = this.BM || {}
));

(function(window, document, BM, $) {
  'use strict';

  var tools        = BM.tools  = BM.tools  || {},
      config       = BM.config = BM.config || {},
      dataScripts  = document.body.getAttribute('data-scripts'),
      templateType = dataScripts || config.mainConfig.action + '-' + config.mainConfig.scriptTemplate;

  if (true || config.debug) {
    console.enable();
  }

  $(function(){
      tools.loadScripts(templateType);
  });
}(
  this,
  this.document,
  this.BM || {},
  this.jQuery
));
