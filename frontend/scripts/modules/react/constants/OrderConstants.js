(function(window, modules, $) {
    
  let OrderConstants;
    
  modules.define('OrderConstants', [], (provide) => {
    if (OrderConstants) {
      provide(OrderConstants);
      return;
    }
    
    OrderConstants = {
      SETSUMMARYVIEWMODE: 'SET SUMMARY VIEW MODE',
      TOGGLESUMMARYVIEWMODE: 'TOGGLE SUMMARY VIEW MODE',

      SUMMARY_VIEW_MODE_SIMPLE: 'SUMMARY_VIEW_MODE_SIMPLE',
      SUMMARY_VIEW_MODE_TABLE: 'SUMMARY_VIEW_MODE_TABLE'
    };
    
    provide(OrderConstants);
  });
    
} (this, this.modules, this.jQuery));