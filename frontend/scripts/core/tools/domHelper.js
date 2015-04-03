
(function ( window, document, BM, $ ) {
    BM.tools = BM.tools || {};

    BM.tools.domHelper = {

        tojQueryObject : function(element) {
            if (typeof element === 'string') {
                return $(element);
            } else if (element instanceof window.HTMLElement) {
                return $(element);
            } else if (element instanceof $) {
                return element;
            } else {
                return null;
            }
        }

    };

}(
        this,
        this.document,
        this.BM = this.BM || {},
        this.jQuery
    ));