/**
 * @fileOverview Логирование на сервер
 */

/**
 * @param    {Object}    window     Ссылка на window
 * @param    {Object}    document   Ссылка на document
 * @param    {Object}    BM         Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
        tools = BM.tools = BM.tools || {},

        /**
         * Логирование данных с клиента на сервер
         * 
         * @alias    BM.tools.logToServer
         * 
         * @param    {Object}    data    Данные отсылаемые на сервер
         */
        logToServer = function logToServer( data ) {
            var
                s = document.createElement('script'),
                l = document.getElementsByTagName('script')[0],
                key;
            // end of vars

            s.type = 'text/javascript';
            s.async = true;
            s.src = '/log-json';

            for ( key in data ) {
                if ( data.hasOwnProperty(key) ) {
                    s.src += ( s.src.indexOf('?') !== -1 ) ? '&' : '?';
                    s.src += key+'='+data[key];
                }
            }

            l.parentNode.insertBefore(s, l);
        };
    // end of vars

    tools.logToServer = logToServer;

}(
    this,
    this.document,
    this.BM = this.BM || {}
));