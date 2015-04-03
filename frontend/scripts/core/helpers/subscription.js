(function(window, BM, $, radio, modules){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.subscription = {};

    modules.require(['basePubSub', 'extend'], function(PubSub, extend){

        BM.helper.subscription = new PubSub();

        var productLevels = null,

            _getPrice = function(options) {
                var result = null;
                productLevels.forEach(function(method) {
                    method['levels'].forEach(function(level){
                        level['products'].forEach(function(product){
                            //if (level === options)
                            if (method['payment_system'] === options.paymentMethod &&
                                level['kind'] === options.kind &&
                                product['duration'] === options.duration) {

                                if (options.withCurrency) {
                                    result = _formatPriceWithCurrency(product['price']);
                                } else {
                                    result = _parsePrice(product['price']);
                                }
                            }
                        });
                    });
                });
                return result;
            },

            _formatToEUR = function(price) {
                return '€' + price;
            },

            _formatToUSD = function(price) {
                return '$' + price;
            },

            _formatToRUB = function(price) {
                if (BM.user.isLocaleRu()) {
                    return price + ' р.';
                } else {
                    return price + ' rub.';
                }
            },

            _formatToSGD = function(price) {
                return price + ' SGD';
            },

            _formatToGBP = function(price) {
                return '£' + price;
            },

            _formatPriceWithCurrency = function(price, discount) {
                if (BM.tools.isNull(price)) {
                    return;
                }
                if (_isPriceInRub(price)) {
                    return _formatToRUB(_parsePrice(price, false, discount));
                }
                if (_isPriceInUsd(price)) {
                    return _formatToUSD(_parsePrice(price, true, discount));
                }
                if (_isPriceInSgd(price)) {
                    return  _formatToSGD(_parsePrice(price, true, discount));
                }
                if (_isPriceInEur(price)) {
                    return _formatToEUR(_parsePrice(price, true, discount));
                }
                if (_isPriceInGBP(price)) {
                    return _formatToGBP(_parsePrice(price, true, discount));
                }

            },

            _getCurrency = function(price) {
                if (BM.tools.isUndefined(price) || BM.tools.isNull(price)) {
                    return;
                }
                if (_isPriceInRub(price)) {
                    return 'RUB';
                }
                if (_isPriceInUsd(price)) {
                    return 'USD';
                }
                if (_isPriceInSgd(price)) {
                    return 'SGD';
                }
                if (_isPriceInEur(price)) {
                    return 'EUR';
                }
                if (_isPriceInGBP(price)) {
                    return 'GBP';
                }
            },

            _toCurrency = function(price, currency) {
                if (BM.tools.isNull(price)) {
                    return;
                }
                if (currency === 'RUB') {
                    return _formatToRUB(price);
                }
                if (currency === 'USD') {
                    return _formatToUSD(price);
                }
                if (currency === 'SGD') {
                    return  _formatToSGD(price);
                }
                if (currency === 'EUR') {
                    return _formatToEUR(price);
                }
                if (currency === 'GBP') {
                    return _formatToGBP(price);
                }
            },

            _isPriceInRub = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('RUB') !== -1 || price.indexOf('р.') !== -1 || price.indexOf('rub.') !== -1;
                }
            },

            _isPriceInUsd = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('$') !== -1 || price.indexOf('USD') !== -1;
                }
            },

            _isPriceInSgd = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('SGD') !== -1;
                }
            },

            _parsePrice = function(price, float, discount) {
                if (!BM.tools.isNull(price)) {
                    price = parseFloat(price.replace(/[a-z $]/ig, ''));

                    if (discount) {
                      price = price - price / 100 * discount;
                    }

                    return float ? Math.ceil(price * 100) / 100 : Math.ceil(price);

                    /*if (float) {
                        return parseFloat(price.replace(/[a-z $]/ig, ''));
                    } else {
                        return parseInt(price.replace(/[a-z $]/ig, ''), 10);
                    }*/
                }
            },

            _isPriceInEur = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('€') !== -1 || price.indexOf('EUR') !== -1;
                }
            },

            _isPriceInGBP = function(price) {
                if (!BM.tools.isNull(price)) {
                    return price.indexOf('£') !== -1 || price.indexOf('GBP') !== -1;
                }
            };


        BM.tools.mixin(BM.helper.subscription, {

            fetchPrices : function() {
                var callbackSuccess, callbackError, forced;

                if (!BM.tools.isFunction(arguments[0])) {
                    return;
                } else {
                    callbackSuccess = arguments[0];

                    if (BM.tools.isFunction(arguments[1])) {
                        callbackError = arguments[1];
                    } else {
                        forced = arguments[1];
                    }
                }


                if (!BM.tools.isNull(productLevels) && forced !== true) {
                    callbackSuccess(productLevels);
                    return;
                }

                var me   = this,
                    requestUrl = '/a/4/billing/web/product_levels.json';

                if (BM.user.getSubscriptionCoutryCode()) {
                    requestUrl += '?subscription_country=' + BM.user.getSubscriptionCoutryCode();
                }


                $.ajax({
                    url: requestUrl,
                    type: 'get',
                    dataType: 'json',
                    success : function(data) {
                        productLevels = data;
                        BM.helper.subscription._notify('prices-fetched');
                        if (BM.tools.isFunction(callbackSuccess)) {
                            callbackSuccess(data);
                        }
                    },
                    error : function() {
                        if (callbackError) {
                            callbackError();
                        }
                    }
                });
            },

            getPrice : function(kind, duration, options) {
                var paymentMethod = 'visa',
                    withCurrency = true,
                    result = null,
                    keepFloats = false,
                    discount = 0;

                if (!kind || !duration) {
                    return null;
                }

                if (!BM.tools.isUndefined(options)) {
                    if (!BM.tools.isUndefined(options.paymentMethod)) {
                        paymentMethod = options.paymentMethod;
                    }
                    if (!BM.tools.isUndefined(options.withCurrency)) {
                        withCurrency = options.withCurrency;
                    }
                    if (!BM.tools.isUndefined(options.keepFloats)) {
                        keepFloats = options.keepFloats;
                    }
                    if (!BM.tools.isUndefined(options.discount) && BM.tools.isNumber(options.discount)) {
                        discount = options.discount;
                    }
                }

                productLevels.forEach(function(method) {
                    method['levels'].forEach(function(level){
                        level['products'].forEach(function(product){
                            //if (level === options)
                            if (method['payment_system'] === paymentMethod && level['kind'] === kind && product['duration'] === duration) {
                                if (withCurrency) {
                                    result = _formatPriceWithCurrency(product['price'], discount);
                                } else {
                                    result = _parsePrice(product['price'], keepFloats, discount);
                                }
                            }
                        });
                    });
                });

                return result;

            },

            toCurrency : function(price, currency) {
                return _toCurrency(price, currency);
            },

            getCurrency : function(price) {
                return _getCurrency(price);
            },

            getPriceAsInt : function(kind, duration, options) {
                options = options || {};
                options.withCurrency = false;
                return BM.helper.subscription.getPrice(kind, duration, options);
            }

        });


        radio('bm-product-levels-update').subscribe(function(data){
            productLevels = data;
            BM.helper.subscription._notify('prices-fetched');
        });

    });


}(this, this.BM, this.jQuery, this.radio, this.modules));
