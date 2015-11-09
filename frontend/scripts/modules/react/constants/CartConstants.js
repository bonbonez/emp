(function(window, modules, $) {
    
  let CartConstants;
    
  modules.define('CartConstants', [], (provide) => {
    if (CartConstants) {
      provide(CartConstants);
      return;
    }
    
    CartConstants = {
      LOADCART: 'LOAD CART',
      ADDITEM: 'ADD ITEM',
      REMOVEITEM: 'REMOVE ITEM',
      DELETEITEM: 'DELETE ITEM'
    };
    
    provide(CartConstants);
  });
    
} (this, this.modules, this.jQuery));