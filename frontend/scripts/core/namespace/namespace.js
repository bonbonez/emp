/**
 * @fileOverview Создание и расширение неймспейса. Создание модулей tools, features, modules
 */

/**
 * @param       {Object}     window     Ссылка на window
 * @param       {Object}     document   Ссылка на document
 * @param       {Object}     modules    Ссылка на модульную систему YModules
 */
(function ( window, document, modules, undefined ) {

    var
        /**
         * Функция расширения нэймспейса проекта
         *
         * @alias   BM.tools.extendApp
         * 
         * @param   {string}    ns_string    Строка отображающая глубину вложенности модуля
         * @return  {Object}                 Созданный модуль в нэймспейсе
         */
        extendApp = function extendApp( ns_string ) {
            window.BM = window.BM || {};

            var
                parts = ns_string.split('.'),
                parent = window.BM,
                pl, i;
            // end of vars

            if ( parts[0] === 'BM' ) {
                parts = parts.slice(1);
            }

            pl = parts.length;

            for ( i = 0; i < pl; i++ ) {
                //create a property if it doesnt exist  
                if ( typeof parent[parts[i]] === 'undefined' ) {
                    parent[parts[i]] = {};
                }

                parent = parent[parts[i]];
            }

            return parent;
        },


        moduleBM = function( provide ) {
            var
                /**
                 * Bookmate root namespace
                 * 
                 * @namespace BM
                 */
                BM = extendApp('BM');
            // end of vars

            provide(BM);
        },


        /**
         * Bookmate config namespace
         *
         * @alias       BM.config
         * @memberOf    BM
         * @namespace   BM.config
         */
        config = extendApp('BM.config'),

        moduleConfig = function( provide ) {
            provide(config);
        },

        /**
         * Bookmate features namespace
         *
         * @alias       BM.features
         * @memberOf    BM
         * @namespace   BM.features
         */
        features = extendApp('BM.features'),

        moduleFeatures = function( provide ) {    
            provide(features);
        },

        /**
         * Bookmate modules namespace
         *
         * @alias       BM.modules
         * @memberOf    BM
         * @namespace   BM.modules
         */
        modulesNs = extendApp('BM.modules'),

        moduleModules = function( provide ) {
            provide(modulesNs);
        },

        /**
         * Bookmate tools namespace
         *
         * @alias       BM.tools
         * @memberOf    BM
         * @namespace   BM.tools
         */
        tools = extendApp('BM.tools'),

        moduleTools = function( provide ) {    
            provide(tools);
        };
    // end of vars

    tools.extendApp = extendApp;

    /**
     * Bookmate root namespace
     */
    modules.define(
        'BM',           // Module name
        [],             // Dependies
        moduleBM        // Module realization
    );

    /**
     * Bookmate tools namespace
     */
    modules.define(
        'tools',        // Module name
        [],             // Dependies
        moduleTools     // Module realization
    );

    /**
     * Bookmate features namespace
     */
    modules.define(
        'features',     // Module name
        [],             // Dependies
        moduleFeatures  // Module realization
    );

    /**
     * Bookmate modules namespace
     */
    modules.define(
        'modules',      // Module name
        [],             // Dependies
        moduleModules   // Module realization
    );

    /**
     * Bookmate configuratiuon namespace
     */
    modules.define(
        'config',       // Module name
        [],             // Dependies
        moduleConfig    // Module realization
    );
}(
    this,
    this.document,
    this.modules
));