(function(window, modules, $){

  let StateStore;

  modules.define(
    'StateStore',
    [
      'Flux',
      'StateConstants'
    ],
    (
      provide,
      Flux,
      StateConstants
    ) => {

      if (StateStore) {
        provide(StateStore);
        return;
      }

      let _viewingItem;

      function setViewingItem(item) {
        _viewingItem = item;
      }

      StateStore = Flux.createStore({
        getViewingItem() {
          return _viewingItem;
        }
      }, function(payload){

        switch (payload.actionType) {
          case StateConstants.SETVIEWINGITEM:
            setViewingItem(payload.item);
            break;
        }

      });

      provide(StateStore);

    }
  );

}(this, this.modules, this.jQuery));