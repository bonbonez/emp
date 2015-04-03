/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
        tools = BM.tools = BM.tools || {},

        /**
         * Метод возвращает массив из имен всех собственных аттрибутов объекта.
         * 
         * @alias    BM.tools.keys
         * 
         * @param    {*}            obj
         * @return   {string[]}
         */
        keys = function keys( obj ) {
            var
                keysArray = [],
                key,
                hop = Object.prototype.hasOwnProperty;
            // end of vars

            for ( key in obj ) {
                if ( hop.call(obj, key) ) {
                    keysArray[keysArray.length] = key;
                }
            }

            return keysArray;
        };
    // end of vars

    tools.keys = Object.keys || keys;

}(
    this,
    this.document,
    this.BM = this.BM || {}
));