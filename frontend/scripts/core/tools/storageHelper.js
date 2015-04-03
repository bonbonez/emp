/**
 * @fileOverview Реализация модуля для работы с Local Storage
 * 
 * @param       {Object}     window         Ссылка на window
 * @param       {Object}     document       Ссылка на document
 * @param       {Object}     modules        Ссылка на модульную систему YModules
 * @param       {Object}     docCookies     Ссылка на docCookies
 * @param       {Object}     localStorage   Ссылка на localStorage
 */
(function ( window, document, modules, docCookies, localStorage, undefined ) {
    'use strict';


    var
        /**
         * @param       {Function}  provide     Ассинхронный экспорт модуля
         * @param       {Object}    tools       Ссылка на нэймспейс BM.tools
         */
        moduleStorage = function( provide, tools ) {


            /**
             * Модуль вспомогательных функций для работы с Local Storage
             *
             * @memberOf    BM.tools
             *
             * @see         {@link module:storage}  Описание модуля storage
             */
            var storage = (function() {
                var
                    /**
                     * Есть ли поддержка local storage в браузере
                     * 
                     * @memberOf    module:storage#
                     * @private
                     * 
                     * @type        {Boolean}
                     */
                    availableLocalStorage = (function availableLocalStorage() {
                        try {
                            return 'localStorage' in window && window.localStorage !== null;
                        } catch ( e ) {
                            return false;
                        }
                    }()),

                    /**
                     * ======================
                     * === Public Methods ===
                     * ======================
                     */
                    
                    /**
                     * Получение значения по ключу
                     *
                     * @memberOf    module:storage#
                     * @public
                     * 
                     * @param       {String}     key    Ключ
                     *
                     * @return      {String|Object}     Значение ключа
                     */
                    getItem = function getItem( key ) {
                        var
                            res;
                        // end of vars

                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            res = localStorageMethods.getItem(key);
                        } else {
                            // Если localStorage не поддерживается
                            res = cookieMethods.getItem(key);
                        }

                        try {
                            return JSON.parse(res);
                        } catch ( e ) {
                            return res;
                        }
                    },

                    /**
                     * Установка заначения по ключу
                     *
                     * @memberOf    module:storage#
                     * @public
                     * 
                     * @param       {String}            key     Ключ
                     * @param       {String|Object}     value   Значение
                     *
                     * @return      {Boolean}                   Флаг успешности записи данных в хранилище
                     */
                    setItem = function setItem( key, value ) {
                        if ( typeof value === 'object' ) {
                            value = JSON.stringify(value);
                        }

                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            return localStorageMethods.setItem(key, value);
                        } else {
                            // Если localStorage не поддерживается
                            return cookieMethods.setItem(key, value);
                        }

                        return true;
                    },

                    /**
                     * Удаление значения по ключу
                     * 
                     * @memberOf    module:storage#
                     * @public
                     * 
                     * @param       {String}     key    Ключ
                     *
                     * @return      {Boolean}
                     */
                    removeItem = function removeItem( key ) {
                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            return localStorageMethods.removeItem(key);
                        } else {
                            // Если localStorage не поддерживается
                            return cookieMethods.removeItem(key);
                        }
                    },

                    /**
                     * Очистка хранилища
                     * 
                     * @memberOf    module:storage#
                     * @public
                     */
                    clearStorage = function clearStorage() {
                        if ( availableLocalStorage ) {
                            // Если localStorage поддерживается
                            localStorageMethods.clearStorage();
                        } else {
                            // Если localStorage не поддерживается
                            cookieMethods.clearStorage();
                        }
                    },


                    /**
                     * =======================
                     * === Private Methods ===
                     * =======================
                     */
                    
                    /**
                     * Обертка вокруг методов localeStorage
                     *
                     * @memberOf    module:storage#
                     * @private
                     * 
                     * @type        {Object}
                     */
                    localStorageMethods = {
                        /**
                         * Получение значения по ключу
                         *
                         * @param       {String}     key    Ключ
                         *
                         * @return      {String}            Значение ключа
                         */
                        getItem: function getItem( key ) {
                            return localStorage.getItem(key);
                        },

                        /**
                         * Установка заначения по ключу
                         *
                         * @param       {String}            key    Ключ
                         * @param       {String|Object}     value  Значение
                         *
                         * @return      {boolean}           Флаг успешности записи данных в хранилище
                         */
                        setItem: function setItem( key, value ) {
                            try {
                                localStorage.setItem(key, value);

                                return true;
                            } catch ( e ) {
                                return false;
                            }
                        },

                        /**
                         * Удаление значения по ключу
                         * 
                         * @param       {String}     key    Ключ
                         *
                         * @return      {Boolean}
                         */
                        removeItem: function removeItem( key ) {
                            try {
                                localStorage.removeItem(key);

                                return true;
                            } catch ( e ) {
                                return false;
                            }
                        },

                        /**
                         * Очистка хранилища
                         */
                        clearStorage: function clearStorage() {
                            localStorage.clear();
                        }
                    },

                    /**
                     * Обертка вокруг cookies для имитирования работы локального хранилища в куках
                     *
                     * @memberOf    module:storage#
                     * @private
                     *
                     * @type        {Object}
                     */
                    cookieMethods = {
                        _defaultPrefix: 'bm_storage_',
                        /**
                         * Получение значения по ключу
                         *
                         * @param       {String}     key    Ключ
                         *
                         * @return      {String}            Значение ключа
                         */
                        getItem: function( key ) {
                            var
                                newKey = cookieMethods._defaultPrefix + key;
                            // end of vars
                            
                            return docCookies.getItem(newKey);
                        },

                        /**
                         * Установка заначения по ключу
                         *
                         * @param       {String}            key    Ключ
                         * @param       {String|Object}     value  Значение
                         *
                         * @return      {boolean}           Флаг успешности записи данных в хранилище
                         */
                        setItem: function( key, value ) {
                            var
                                newKey = cookieMethods._defaultPrefix + key;
                            // end of vars
                            
                            return docCookies.setItem(newKey, value, 4*7*24*60*60, '/' );
                        },

                        /**
                         * Удаление значения по ключу
                         * 
                         * @param       {String}     key    Ключ
                         *
                         * @return      {Boolean}
                         */
                        removeItem: function( key ) {
                            var
                                newKey = cookieMethods._defaultPrefix + key;
                            // end of vars
                            
                            return docCookies.setItem(newKey, 0, 0, '/' );
                        },

                        /**
                         * Очистка хранилища
                         */
                        clearStorage: function() {
                            return;
                        }
                    };
                // end of vars


                return {
                    getItem: getItem,
                    setItem: setItem,
                    removeItem: removeItem,
                    clearStorage: clearStorage
                };
            }());

            tools.storage = storage;


            // Export
            provide(storage);
        };
    // end of vars


    /**
     * Модуль вспомогательных функций для работы с Local Storage
     * @module      storage
     */
    modules.define(
        'storage',      // Module name
        ['tools'],      // Dependies
        moduleStorage   // Module realization
    );

}(
    this,
    this.document,
    this.modules,
    this.docCookies,
    this.localStorage || null
));