(function(window, modules, $){

  let CartStore;

  modules.define(
    'CartStore',
    [
      'Flux',
      'CartConstants'
    ],
    (
      provide,
      Flux,
      CartConstants
    ) => {

      if (CartStore) {
        provide(CartStore);
        return;
      }

      var _cart = null;

      function _setCart(cart) {
        _cart = cart;
        CartStore.emitChange();
      }

      function loadCart() {
        $.ajax({
          type: 'get',
          url: '/api/cart/get',
          success(data) {
            _setCart(data);
          },
          error() {

          }
        })
      }

      function addItem(itemId, weight, grind) {
        $.ajax({
          type: 'post',
          url: '/api/cart/add_item',
          data: {
            item_id: itemId,
            weight: weight,
            grind: grind
          },
          success(data) {
            _setCart(data);
          },
          error() {

          }
        });
      }

      function removeItem(itemId, weight, grind) {
        $.ajax({
          type: 'post',
          url: '/api/cart/remove_item',
          data: {
            item_id: itemId,
            weight: weight,
            grind: grind
          },
          success(data) {
            _setCart(data);
          },
          error() {

          }
        });
      }

      function deleteItem(itemId, weight, grind) {
        $.ajax({
          type: 'post',
          url: '/api/cart/delete_item',
          data: {
            item_id: itemId,
            weight: weight,
            grind: grind
          },
          success(data) {
            _setCart(data);
          },
          error() {

          }
        });
      }

      CartStore = Flux.createStore({
        getCart() {
          return _cart;
        }
      }, function(payload){

        switch (payload.actionType) {
          case CartConstants.LOADCART:
            loadCart();
            break;

          case CartConstants.ADDITEM:
            addItem(payload.itemId, payload.weight, payload.grind);
            break;

          case CartConstants.REMOVEITEM:
            removeItem(payload.itemId, payload.weight, payload.grind);
            break;

          case CartConstants.DELETEITEM:
            deleteItem(payload.itemId, payload.weight, payload.grind);
            break;
        }

      });
      
      window.CartStore = CartStore;

      provide(CartStore);

    }
  );

}(this, this.modules, this.jQuery));