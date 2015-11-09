(function(window, modules, $) {
    
  modules.define(
    'ClientDataInit',
    [
      
    ],
    (
      provide
    ) => {
      
      BM.helper.brewingMethods.fetch(() => {});
      BM.helper.grind.fetchTypes(() => {});

      provide();
    }
  );
    
}(this, this.modules, this.jQuery));