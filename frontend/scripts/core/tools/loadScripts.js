/**
 * @file Загрузчик скриптов
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        tools = BM.tools = BM.tools || {},
        config = BM.config = BM.config || {},

        /**
         * Script loader
         *
         * @memberOf    BM.tools
         * @alias       BM.tools.loadScripts
         *
         * @param       {string}    templateType    Имя шаблона который необходимо загрузить
         */
        loadScripts = function loadScripts( templateType ) {
            var
                loadConfig = config.loadScriptsConfig;
            // end of vars

            if ( loadConfig.hasOwnProperty(templateType) ) {
                loadConfig[templateType]();
            } else {
                loadConfig['default']();
            }
        };
    // end of vars

    tools.loadScripts = loadScripts;
}(
    this,
    this.document,
    this.BM = this.BM || {}
));
