(function(window, modules, $) {

  modules.define(
    'OrderSummarySimple',
    [
      'CartActions',
      'CartStore',

      'OrderSummarySimpleItem'
    ],
    (
      provide,
      CartActions,
      CartStore,

      OrderSummarySimpleItem
    ) => {

      let OrderSummary = React.createClass({

        propTypes: {
          cart: React.PropTypes.object
        },

        getGroups() {
          let groups = {
            'mono': [],
            'aroma': [],
            'espresso': [],
            'exotic': []
          };
          let res = [];

          this.props.cart.order_items.forEach((item) => {
            groups[item.item.kind].push(item);
          });

          Object.keys(groups).forEach((key) => {
            if (groups[key].length > 0) {
              res.push({
                kind: key,
                objects: groups[key]
              });
            }
          });

          return res;
        },

        render() {
          if (!this.props.cart) {
            return null;
          }

          let itemsByGroups = this.getGroups();

          return (
            <div className="bm-page-order-summary">
              {itemsByGroups.map((group) => {
                return (
                  <div className="bm-page-order-summary-group">
                    <div className={`bm-page-order-summary-subheader m-${group.kind}`}>
                      <div className="bm-page-order-summary-subheader-icon"></div>
                      <div className="bm-page-order-summary-subheader-text">{BM.helper.coffeeKinds.getWordByKind(group.kind)}</div>
                    </div>
                    <div className="bm-page-order-summary-items-wrapper">
                      {group.objects.map((orderItem, i) => {
                        return (
                          <OrderSummarySimpleItem {...orderItem} counter={i + 1}/>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

      });

      provide(OrderSummary);
    }
  );

}(this, this.modules, this.jQuery));