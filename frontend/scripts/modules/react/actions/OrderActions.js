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
        },

        setOrderData(data) {
          return {
            actionType: OrderConstants.SETORDERDATA,
            data: data
          }
        },
        
        setSelectedDeliveryRegion(value) {
          return {
            actionType: OrderConstants.SETSELECTEDDELIVERYREGION,
            value: value
          }
        },

        setSelectedDeliveryOption(value) {
          return {
            actionType: OrderConstants.SETSELECTEDDELIVERYOPTION,
            value: value
          }
        }

      });

      provide(OrderActions);

    });

}(this, this.modules));