/**
 * Модуль для опредления бразуера
 *
 * @module      browser
 *
 * @param    {Object}    window     Ссылка на window
 * @param    {Object}    document   Ссылка на document
 * @param    {Object}    BM         Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        features  = BM.features  = BM.features  || {},
        browserDetection = (function () {
            var
                ua = navigator.userAgent,
                gecko = /Gecko\//.test(ua) ? ua.match(/; rv:1\.(\d+?)\.(\d)/) : 0,
                webkit = /AppleWebKit/.test(ua), safari = webkit && /Safari\//.test(ua),
                ie = 0 /*@cc_on + @_jscript_version * 10 % 10 @*/;
            // end of vars

            return {
                ie: ie >= 5 ? ie : 0,
                gecko: gecko ? '1.' + gecko.slice(1).join('.') : 0,
                firefox: gecko ? (gecko[1] == 9 ? 3 : gecko[1] == 8 && gecko[2] > 0 ? 2 : 0) : 0,
                opera: window.opera && opera.version ? opera.version()[0] : 0,
                webkit: webkit ? 0:0,//ua.match(/AppleWebKit\/(\d+?\.\d+?\s)/)[1] : 0,
                safari: safari && /Version\//.test(ua) ? ua.match(/Version\/(\d{1})/)[1] : 0,
                chrome: safari && /Chrome\//.test(ua) ? ua.match(/Chrome\/(\d+?\.\d)/)[1] : 0
            };
        }());
    // end of vars


    /**
     * Модуль для опредления бразуера
     *
     * @memberOf    BM.features
     * @see         {@link module:browser}  Описание модуля browser
     */
    features.browser = {

        /**
         * Является ли клиент Internet Explorer'ом. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isIE : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.ie === ver : browserDetection.ie !== 0;
        },

        /**
         * Клиент работает на движке Gecko, или нет. Можно указать точную версию движка.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isGecko : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.gecko === ver : browserDetection.gecko !== 0;
        },

        /**
         * Является ли клиент Firefix'ом. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isFirefox : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.firefox === ver : browserDetection.firefox !== 0;
        },

        /**
         * Является ли клиент Opera. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isOpera : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.opera === ver : browserDetection.opera !== 0;
        },

        /**
         * Клиент работает на движке WebKit, или нет. Можно указать точную версию движка.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isWebKit : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.webkit === ver : browserDetection.webkit !== 0;
        },

        /**
         * Является ли клиент Safari. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isSafari : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.safari === ver : browserDetection.safari !== 0;
        },

        /**
         * Является ли клиент Chrome'ом. Можно указать точную версию браузера.
         *
         * @memberof    module:browser#
         *
         * @param       {Number}    [ver]
         * @return      {Boolean}
         */
        isChrome : function( ver ) {
            return !BM.tools.isUndefined(ver) ? browserDetection.chrome === ver : browserDetection.chrome !== 0;
        },

        /**
         * Клиент работает на движке Blink, или нет.
         *
         * @memberof    module:browser#
         *
         * @return      {Boolean}
         */
        isBlink : function() {
            return features.browser.isChrome && browserDetection.chrome >= 28;
        }
    };

}(
    this,
    this.document,
    this.BM = this.BM || {}
));