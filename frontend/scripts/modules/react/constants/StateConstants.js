(function(window, modules, $) {
    
  let StateConstants;
    
  modules.define('StateConstants', [], (provide) => {
    if (StateConstants) {
      provide(StateConstants);
      return;
    }
    
    StateConstants = {
      SETVIEWINGITEM: 'SET VIEWING ITEM'
    };
    
    provide(StateConstants);
  });
    
} (this, this.modules, this.jQuery));