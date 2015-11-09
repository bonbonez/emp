(function(window, modules, $) {
    
  modules.define(
    'ItemAddedItems',
    [
      'ItemAddedItem',
      'CartStore',
      'StateStore'
    ],
    (
      provide,
      ItemAddedItem,
      CartStore,
      StateStore
    ) => {

      function getState() {
        return {
          cart: CartStore.getCart(),
          viewingItem: StateStore.getViewingItem()
        };
      }
      
      var AddedItems = React.createClass({
        mixins: [
          CartStore.mixin
        ],
        getInitialState() {
          return getState();
        },
        storeDidChange() {
          this.setState(getState());
        },
        render() {

          let { cart } = this.state;
          let orderItems = cart && cart.order_items;

          let rootClassName = ['bm-item-form-order-added-items'];
          if (_.isArray(orderItems) && orderItems.length === 0) {
            rootClassName.push('m-empty');
          }

          let items;
          if (_.isArray(orderItems) && this.state.viewingItem) {
            items = _.filter(orderItems, (i) => {return i.item.id === this.state.viewingItem.id});
          }

          return (
            <div className={rootClassName.join(' ')}>
              {items ? items.map((item) => {
                return <ItemAddedItem key={item.id} {...item}/>
              }) : null}
            </div>
          );
        }
      });
          
      provide(AddedItems);
    }
  );
    
}(this, this.modules, this.jQuery));