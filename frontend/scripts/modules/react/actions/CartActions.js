(function(window, modules){

  let CartActions;

  modules.define(
    'CartActions',
    [
      'Flux',
      'CartConstants'
    ],
    (
      provide,
      Flux,
      CartConstants
    ) => {

    if (CartActions) {
      provide(CartActions);
      return;
    }

    CartActions = Flux.createActions({

      loadCart() {
        return {
          actionType: CartConstants.LOADCART
        };
      },

      addItem(itemId, weight, grind) {
        return {
          actionType: CartConstants.ADDITEM,
          itemId: itemId,
          weight: weight,
          grind: grind
        }
      },

      removeItem(itemId, weight, grind) {
        return {
          actionType: CartConstants.REMOVEITEM,
          itemId: itemId,
          weight: weight,
          grind: grind
        }
      },

      deleteItem(itemId, weight, grind) {
        return {
          actionType: CartConstants.DELETEITEM,
          itemId: itemId,
          weight: weight,
          grind: grind
        }
      }

    });

    provide(CartActions);

  });

}(this, this.modules));