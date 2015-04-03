/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 */
(function ( window, document ) {
    if ( Array.prototype.forEach ) {
        return;
    }
    
    Array.prototype.forEach = function( fn, scope ) {
        var
            i;
        // end of vars

        for ( i = 0, len = this.length; i < len; ++i ) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };

}(
    this,
    this.document
));