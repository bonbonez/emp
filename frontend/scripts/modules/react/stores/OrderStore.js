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
      let _orderData = null;
      let _selectedDeliveryRegion = null;
      let _selectedDeliveryOption = null;

      function _setFromForage() {
        localforage.getItem('orderStore').then((data) => {
          if (data) {
            if (data._summaryViewMode !== undefined) {
              _summaryViewMode = data._summaryViewMode;
            }
            if (data._selectedDeliveryRegion !== undefined) {
              _selectedDeliveryRegion = data._selectedDeliveryRegion;
            }
            if (data._selectedDeliveryRegion !== undefined) {
              _selectedDeliveryOption = data._selectedDeliveryOption;
            }
          }

          if (OrderStore) {
            OrderStore.emitChange();
          }
        });
      }
      function _saveToForage() {
        localforage.setItem('orderStore', {
          _summaryViewMode: _summaryViewMode,
          _selectedDeliveryRegion: _selectedDeliveryRegion,
          _selectedDeliveryOption: _selectedDeliveryOption
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

      function setOrderData(data) {
        _orderData = data;
        OrderStore.emitChange();
      }

      function setSelectedDeliveryRegion(value) {
        _selectedDeliveryRegion = value;
        OrderStore.emitChange();

        _saveToForage();
      }
      
      function setSelectedDeliveryOption(value) {
        _selectedDeliveryOption = value;
        OrderStore.emitChange();

        _saveToForage();
      }

      _setFromForage();

      OrderStore = Flux.createStore({
        summaryView() {
          return _summaryViewMode;
        },
        orderData() {
          return _orderData;
        },
        selectedDeliveryRegion() {
          return _selectedDeliveryRegion;
        },
        selectedDeliveryOption() {
          return _selectedDeliveryOption;
        }
      }, function(payload){

        switch (payload.actionType) {
          case OrderConstants.SETSUMMARYVIEWMODE:
            setSummaryViewMode(payload.mode);
            break;

          case OrderConstants.TOGGLESUMMARYVIEWMODE:
            toggleSummaryViewMode();
            break;

          case OrderConstants.SETORDERDATA:
            setOrderData(payload.data);
            break;

          case OrderConstants.SETSELECTEDDELIVERYREGION:
            setSelectedDeliveryRegion(payload.value);
            break;
          
          case OrderConstants.SETSELECTEDDELIVERYOPTION:
            setSelectedDeliveryOption(payload.value);
            break;
        }

      });

      OrderStore.emitChange();
      
      provide(OrderStore);

    }
  );

}(this, this.modules, this.jQuery));