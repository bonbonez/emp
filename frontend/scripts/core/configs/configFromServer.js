/**
 * @fileOverview Конфигурация пришедшая с сервера
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 * @param       {Object}    JSON        Ссылка JSON библиотеку
 */
(function ( window, document, BM, JSON ) {
    var
        /**
         * @alias BM.config
         */
        config = BM.config = BM.config || {},
        mainConfig = document.body.getAttribute('data-config'),

        /**
         * Конфигурация с сервера
         *
         * @alias       BM.config.mainConfig
         * @requires    JSON
         * @type        {Object}
         */
        parsedMainConfig = JSON.parse(mainConfig) || {},

        /**
         * Конфигурация с сервера
         *
         * @alias       BM.config.updateMainConfig
         *
         * @param       {callback} [callback] Колбек, в который сработает после получения ответа от сервера
         * @type        {Object}
         */
        updateMainConfig = function(callback) {
            var
                updateCallback = BM.tools.isFunction(callback) ? callback : function() {};
            // end of vars

            $.ajax({
                url : '/frontend_config',
                dataType : 'json',
                success : function(response) {
                    try {
                        document.body.setAttribute('data-config', JSON.strigify(response));
                    } catch (e) { }

                    config.mainConfig = response;

                    updateCallback(response);
                },
                error: function() {
                    updateCallback(false);
                }
            });
        };
    // end of vars

    config.updateMainConfig = updateMainConfig;
    config.mainConfig = parsedMainConfig;

    config.isDevelopment = function() {
        return config.mainConfig.environment === 'development';
    };

    config.isProduction = function() {
        return config.mainConfig.environment === 'production';
    };

    config.isStaging = function() {
        return config.mainConfig.environment === 'staging';
    };

}(
    this,
    this.document,
    this.BM || {},
    this.JSON
));