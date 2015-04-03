/**
 * @fileOverview Определение текущего AB тестирования
 */

/**
 *
 * @param       {Object}     window         Ссылка на window
 * @param       {Object}     document       Ссылка на document
 * @param       {function}   $              Ссылка на jQuery
 * @param       {Function}   modules        Ссылка на modules
 * @param       {Object}     docCookies     Ссылка на docCookies
 */
(function ( window, document, $, modules, docCookies ) {
    'use strict';

    var
        /**
         * Реализация модуля abTestDetect
         * 
         * @param       {Function}  provide     Ассинхронный экспорт модуля
         * @param       {Object}    modules     Ссылка на нэймспейс BM.modules
         * @param       {Object}    config      Ссылка на нэймспейс BM.config
         */
        abTestDetectModule = function( provide, modules, config ) {
            var
                /**
                 * 
                 * @memberOf    BM.modules
                 *
                 * @see         {@link module:abTestDetect}  Описание модуля abTestDetect
                 */
                abTestDetect = (function() {
                    var
                        /**
                         * =======================
                         * === Private Methods ===
                         * =======================
                         */
                        
                        /**
                         * Получение списка текущих AB тестов
                         *
                         * @memberOf    module:abTestDetect#
                         * @private
                         * 
                         * @return      {array}
                         */
                        nowABtests = function nowABtests() {
                            var
                                mainConfig = config.mainConfig || {},
                                tests = mainConfig.abTests || [];
                            // end of vars

                            return tests;
                        },

                        /**
                         * Проверка существования теста по имени
                         *
                         * @memberOf    module:abTestDetect#
                         * @private
                         *
                         * @param       {string}    abTestName  Имя AB теста
                         * 
                         * @return      {boolean}
                         */
                        isTest = function isTest( abTestName ) {
                            var
                                tests = nowABtests();
                            // end of vars

                            return docCookies.hasItem(abTestName);
                        },

                        /**
                         * ======================
                         * === Public Methods ===
                         * ======================
                         */


                        /**
                         * Получение значения AB теста по имени
                         *
                         * @memberOf    module:abTestDetect#
                         * @public
                         *
                         * @param       {string}    abTestName  Имя AB теста
                         * 
                         * @return      {*}                     Значение AB теста
                         */
                        getTestValue = function getTestValue( abTestName ) {
                            if ( !isTest(abTestName) ) {
                                return false;
                            }

                            return docCookies.getItem(abTestName);
                        };
                    // end of vars

                    return {
                        getTestValue: getTestValue
                    };
                }());
            // end of vars


            // Export
            modules.abTestDetect = abTestDetect;
            provide(abTestDetect);
        };
    // end of vars


    /**
     * Модуль определения текущих AB тестов
     *
     * @requires    jQuery
     * @requires    modules
     * 
     * @module      abTestDetect
     */
    modules.define(
        'abTestDetect',             // Module name
        ['modules', 'config'],      // Dependies
        abTestDetectModule          // Module realization
    );
}(
    this,
    this.document,
    this.jQuery,
    this.modules,
    this.docCookies
));