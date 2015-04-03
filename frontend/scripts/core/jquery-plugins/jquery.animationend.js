(function(root, $){
    'use strict';

    var animationEndEvents = 'animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd';

    $.fn.animationEnd = function(callback) {
        return this.each(function(){
            var $this = $(this);
            $this.off(animationEndEvents);
            $this.on(animationEndEvents, function() {
                if (typeof callback == 'function') {
                    callback.call(this);
                }
            });
        });
    };

    $.fn.unbindAnimationEnd = function() {
        this.off(animationEndEvents);
    };

}(this, jQuery));