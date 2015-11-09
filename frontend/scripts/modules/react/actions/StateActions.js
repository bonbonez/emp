(function(window, modules){

  let StateActions;

  modules.define(
    'StateActions',
    [
      'Flux',
      'StateConstants'
    ],
    (
      provide,
      Flux,
      StateConstants
    ) => {

      if (StateActions) {
        provide(StateActions);
        return;
      }

      StateActions = Flux.createActions({

        setViewingItem(item) {
          return {
            actionType: StateConstants.SETVIEWINGITEM,
            item: item
          }
        }

      });

      provide(StateActions);

    });

}(this, this.modules));