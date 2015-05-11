(function(window, modules, $, BM){

  modules.define(
    'initTransformOriginDependentElements',
    [
      'extend',
      'baseClass'
    ],
    function(
      provide,
      extend,
      BaseClass
    ) {

      class Module extends BaseClass {
        initialize() {
          super.initialize.apply(this, arguments);

          this.$elements = $('.j-transform-origin-dependent');

          $.each(this.$elements, (index, element) => {
            let $e          = $(element);
            let savedOffset = $e.offset();
            let savedWidth  = $e.width();

            $e.on('mouseover mousemove', (e) => {
              let relativeMouseX;
              let calculatedOrigin;

              if (e.pageX) {
                relativeMouseX   = e.pageX - savedOffset.left;
                calculatedOrigin = (relativeMouseX / savedWidth).toFixed(1) * 100;
                calculatedOrigin = calculatedOrigin < 0 ? 0 : calculatedOrigin;

                //console.log(calculatedOrigin + '% 50%');
                //$e.attr('style', 'transform-origin: ' + calculatedOrigin + '% 50%;')

                $e.attr('data-transform-origin', calculatedOrigin)
              }
            });
            $e.on('mouseout', (e) => {
              //$e.css('transform-origin', '')
              $e.removeAttr('style');
            })
          });
        }
      }

      new Module();

      provide(Module);

  });

}(this, this.modules, this.jQuery, this.BM));