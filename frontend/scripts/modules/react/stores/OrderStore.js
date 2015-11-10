(function(window, modules, $){

  let OrderStore;

  modules.define(
    'OrderStore',
    [
      'Flux',
      'OrderConstants'
    ],
    (
      provide,
      Flux,
      OrderConstants
    ) => {

      if (OrderStore) {
        provide(OrderStore);
        return;
      }

      let _summaryViewMode = OrderConstants.SUMMARY_VIEW_MODE_SIMPLE;

      function _setFromForage() {
        localforage.getItem('orderStore').then((data) => {
          if (data) {
            if (data._summaryViewMode) {
              _summaryViewMode = data._summaryViewMode;
            }
          }

          if (OrderStore) {
            OrderStore.emitChange();
          }
        });
      }
      function _saveToForage() {
        localforage.setItem('orderStore', {
          _summaryViewMode: _summaryViewMode
        });
      }

      function setSummaryViewMode(item) {
        _summaryViewMode = item;

        _saveToForage();
      }

      function toggleSummaryViewMode() {
        if (_summaryViewMode === OrderConstants.SUMMARY_VIEW_MODE_TABLE) {
          _summaryViewMode = OrderConstants.SUMMARY_VIEW_MODE_SIMPLE;
        } else {
          _summaryViewMode = OrderConstants.SUMMARY_VIEW_MODE_TABLE;
        }

        OrderStore.emitChange();

        _saveToForage();
      }

      _setFromForage();

      OrderStore = Flux.createStore({
        summaryView() {
          return _summaryViewMode;
        }
      }, function(payload){

        switch (payload.actionType) {
          case OrderConstants.SETSUMMARYVIEWMODE:
            setSummaryViewMode(payload.mode);
            break;

          case OrderConstants.TOGGLESUMMARYVIEWMODE:
            toggleSummaryViewMode();
            break;
        }

      });



      provide(OrderStore);

    }
  );

}(this, this.modules, this.jQuery));