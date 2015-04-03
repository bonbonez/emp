(function(window, modules, $, BM){

    modules.define('initBlockRecent', ['BlockRecent'], function(provide, BlockRecent) {

        $('@b-block-recent').each(function(){
            var $this = $(this);
            new BlockRecent({
                element: $this
            });
        });

        provide();
    });

}(this, this.modules, this.jQuery, this.BM));