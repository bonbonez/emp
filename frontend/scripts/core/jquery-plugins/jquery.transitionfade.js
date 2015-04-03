(function(root, $){
    'use strict';

    $.fn.transitionFadeOut = function(options, callback) {

        var animationOptions = {
                transitionProps : 'opacity',
                delay           : '0.3s',
                animationType   : 'ease'
            },
            hasOwnProp = Object.prototype.hasOwnProperty,
            objProp, cssProp = '';

        if (typeof options === 'function') {
            callback = options;
        } else if (typeof options === 'object') {
            $.extend(animationOptions, options);
        }

        for (objProp in animationOptions) {
            if (hasOwnProp.call(animationOptions, objProp)) {
                cssProp += animationOptions[objProp] + ' ';
            }
        }

        return this.each(function(){
            var $this = $(this);

            $this.css('opacity', '1');
            $this.transitionEnd(function() {
                $this.unbindTransitionEnd();
                $this.css('display', 'none');

                if (typeof callback === 'function') {
                    callback();
                }

            });
            $this.css({
                'transition' : cssProp,
                'opacity' : '0'
            });

        });
    };

    $.fn.transitionFadeIn = function() {
        return this.each(function(){
            var $this = $(this);

            $this.css('display', 'block');
            $this.css('opacity', '0');
            $this.offsetHeight;

            $this.transitionEnd(function() {
                $this.unbindTransitionEnd();
                $this.css('display', 'block');

            });
            $this.css({
                'opacity' : '1'
            });

        });
    };

}(this, jQuery));