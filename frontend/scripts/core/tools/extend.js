/**
 * @fileOverview Реализация наследования
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    modules     Ссылка на модульную систему YModules
 */
(function ( window, document, modules ) {
    var
        /**
         * @param       {Function}  provide     Ассинхронный экспорт модуля
         */
        extendModule = function( provide ) {
            var
                extend = function extend( parent ) {
                    var
                        f = function() {},
                        c = function() {
                            return this.initialize.apply(this, arguments);
                        };
                    // end of vars
                    
                    f.prototype = parent.prototype;
                    c.prototype = new f();
                    c.prototype.constructor = c;
                    c.superclass = f.prototype;

                    return c;
                };
            // end of vars


            // Export
            provide(extend);
        };
    // end of vars


    /**
     * Модуль реализации наследования
     * 
     * @module      extend
     */
    modules.define(
        'extend',        // Module name
        [],              // Dependies
        extendModule     // Module realization
    );

}(
    this,
    this.document,
    this.modules
));