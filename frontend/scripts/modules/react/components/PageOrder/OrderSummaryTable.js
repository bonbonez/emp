(function(window, modules, $) {

  modules.define(
    'OrderSummaryTable',
    [
      'CartActions',
      'CartStore'

      //'OrderSummaryTableItem'
    ],
    (
      provide,
      CartActions,
      CartStore,

      OrderSummaryTableItem
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
            <div className="bm-page-order-summary-table">
              <div className="bm-page-order-summary-table-row m-header">
                <div className="bm-page-order-summary-table-cell">Название</div>
                <div className="bm-page-order-summary-table-cell">Вес</div>
                <div className="bm-page-order-summary-table-cell">Помол</div>
                <div className="bm-page-order-summary-table-cell">Количоство</div>
                <div className="bm-page-order-summary-table-cell">Сумма</div>
              </div>
              <div className="bm-page-order-summary-table-row">
                <div className="bm-page-order-summary-table-cell">Классический сорт «Никарагуа марагоджиб»</div>
                <div className="bm-page-order-summary-table-cell">250г</div>
                <div className="bm-page-order-summary-table-cell">В зерне</div>
                <div className="bm-page-order-summary-table-cell">1 уп</div>
                <div className="bm-page-order-summary-table-cell">400 руб</div>
                <div className="bm-page-order-summary-table-row-aside">
                  <span className="bm-page-order-summary-table-remove-item">удалить</span>
                </div>
              </div>
            </div>
          );
        }

      });

      provide(OrderSummary);
    }
  );

}(this, this.modules, this.jQuery));