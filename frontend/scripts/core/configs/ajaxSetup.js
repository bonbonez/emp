/**
 * @fileOverview Первоначальные настройки AJAX jQuery
 */

/**
 *
 * @param       {Object}     window     Ссылка на window
 * @param       {Object}     document   Ссылка на document
 * @param       {function}   $          Ссылка на jQuery
 */
(function ( window, document, $ ) {
    /**
     * Общие настройки AJAX
     *
     * @requires    jQuery
     */
    $.ajaxSetup({
        
        timeout: 30000,

        statusCode: {
            404: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '404 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            },

            401: function() {
                /** auth log error */
            },

            500: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '500 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            },

            503: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '503 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            },

            504: function() {
                var
                    ajaxUrl = this.url,
                    data = {
                        event: 'ajax_error',
                        type: '504 ошибка',
                        ajaxUrl: ajaxUrl
                    };
                // end of vars

                /** log error */
            }
        },

        error: function ( jqXHR, textStatus, errorThrown ) {
            var
                ajaxUrl = this.url,
                data = {
                    event: 'ajax_error',
                    type: 'неизвестная ajax ошибка',
                    ajaxUrl: ajaxUrl
                };
            // end of vars
            
            if ( jqXHR.statusText === 'error' ) {
                /** log error */
            } else if ( textStatus === 'timeout' ) {
                return;
            }
        }
    });
}(this, this.document, this.jQuery));