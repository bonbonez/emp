/**
 * @fileOverview Определение дебаг режима приложения
 */

/**
 * @param       {Object}     window     Ссылка на window
 * @param       {Object}     document   Ссылка на document
 * @param       {Object}     BM         Ссылка на Bookmate namespace
 * @param       {Object}     JSON       Ссылка JSON библиотеку
 */
(function ( window, document, BM, JSON ) {
    var
        /**
         * @alias   BM.config
         */
        config = BM.config = BM.config || {},
        mainConfig = document.body.getAttribute('data-config'),

        /**
         * Конфигурация с сервера
         * 
         * @requires    JSON
         * @type        {Object}
         */
        parsedMainConfig = JSON.parse(mainConfig) || {},
        configDebug = parsedMainConfig.debug || false,

        debug = false;
    // end of vars
    
    if ( configDebug || document.location.search.match(/jsdbg/) ) {
        debug = true;
    }

    /**
     * Находится ли приложение в debug режиме
     *
     * @alias    BM.config.debug
     * @type     {boolean}
     */
    config.debug = debug;

}(
    this,
    this.document,
    this.BM || {},
    this.JSON
));