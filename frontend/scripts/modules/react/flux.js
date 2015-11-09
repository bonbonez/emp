(function(window, modules, $) {
    
  let Flux;
    
  modules.define(
    'Flux',
    [
      
    ],
    (
      provide
    ) => {
      if (Flux) {
        provide(Flux);
        return;
      }
      
      Flux = new McFly();
      
      provide(Flux);
    }
   );
    
}(this, this.modules, this.jQuery));