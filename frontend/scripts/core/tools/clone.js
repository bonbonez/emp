/**
 * @fileOverview Клонирование объектов
 */

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
         * Clone object
         *
         * @alias    BM.tools.clone
         * 
         * @param    {Object}    obj
         * @return   {Object}
         */
        clone = function clone( obj ) {
            var copy,
                attr,
                i,
                len;
            
            // Handle the 3 simple types, and null or undefined
            if ( obj === null || typeof obj !== 'object' ) {
                return obj;
            }
            
            // Handle Date
            if ( obj instanceof Date ) {
                copy = new Date();
                copy.setTime(obj.getTime());

                return copy;
            }
            
            // Handle Array
            if ( obj instanceof Array ) {
                copy = [];
                
                for ( i = 0, len = obj.length; i < len; i++ ) {
                    copy[i] = clone(obj[i]);
                }
                
                return copy;
            }
            
            // Handle Object
            if ( obj instanceof Object ) {
                copy = {};
                
                for ( attr in obj ) {
                    if ( obj.hasOwnProperty(attr) ) {
                        copy[attr] = clone(obj[attr]);
                    }
                }
                
                return copy;
            }
        };
    // end of vars

    tools.clone = clone;
}(
    this,
    this.document,
    this.BM = this.BM || {}
));