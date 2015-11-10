(function(window, modules){

  let OrderActions;

  modules.define(
    'OrderActions',
    [
      'Flux',
      'OrderConstants'
    ],
    (
      provide,
      Flux,
      OrderConstants
    ) => {

      if (OrderActions) {
        provide(OrderActions);
        return;
      }

      OrderActions = Flux.createActions({

        setSummaryViewMode(mode) {
          return {
            actionType: OrderConstants.SETSUMMARYVIEWMODE,
            mode: mode
          }
        },

        toggleSummaryViewMode() {
          return {
            actionType: OrderConstants.TOGGLESUMMARYVIEWMODE
          }
        }

      });

      provide(OrderActions);

    });

}(this, this.modules));