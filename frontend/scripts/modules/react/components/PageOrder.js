(function(window, modules, $) {
    
  modules.define(
    'PageOrder',
    [
      'CartActions',
      'CartStore',

      'OrderActions',
      'OrderStore',
      'OrderConstants',

      'OrderSummarySimple',
      'OrderSummaryTable'
    ],
    (
      provide,
      CartActions,
      CartStore,

      OrderActions,
      OrderStore,
      OrderConstants,

      OrderSummarySimple,
      OrderSummaryTable
    ) => {

      function getPageOrderInitialState() {
        return {
          cart: CartStore.getCart(),
          summaryView: OrderStore.summaryView()
        };
      }
      
      let PageOrder = React.createClass({

        mixins: [
          CartStore.mixin,
          OrderStore.mixin
        ],

        getInitialState() {
          return getPageOrderInitialState();
        },

        storeDidChange() {
          this.setState(getPageOrderInitialState());
        },

        onSummaryViewToggleClick() {
          OrderActions.toggleSummaryViewMode();
        },

        isSummaryViewModeSimple() {
          return this.state.summaryView === OrderConstants.SUMMARY_VIEW_MODE_SIMPLE;
        },

        render() {
          if (!this.state.cart) {
            return null;
          }

          let { cart } = this.state;

          let summaryTotalInfo = [{
            label: 'Итого за кофе:',
            value: `${cart.amount} руб.`
          }];

          if (_.isNumber(cart.discount) && cart.discount > 0) {
            summaryTotalInfo.push({
              label: 'Скидка:',
              value: `${cart.discount}%`
            });
            summaryTotalInfo.push({
              label: 'Итого со скидкой:',
              value: `${cart.total_amount} руб.`
            });
          }

          return (
            <div className="bm-page-order">
              <div className="bm-page-order-content">
                <div className="bm-page-order-header m-offset-30">
                  Ваш заказ
                  <span className="bm-page-order-header-aside">
                    <span className="bm-page-order-summary-view-toggle" onClick={this.onSummaryViewToggleClick}>
                      {this.isSummaryViewModeSimple() ? 'в виде таблицы' : 'списком'}
                    </span>
                  </span>
                </div>
                { this.isSummaryViewModeSimple() ?
                  <OrderSummarySimple cart={cart} />
                  :
                  <OrderSummaryTable cart={cart} />
                }
                <div className="bm-page-order-summary-total">
                  {summaryTotalInfo.map((item) => {
                    return (
                      <div className="bm-page-order-summary-total-row">
                        <div className="bm-page-order-summary-total-label">{item.label}</div>
                        <div className="bm-page-order-summary-total-value">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

      });
          
      provide(PageOrder);
    }
  );
    
}(this, this.modules, this.jQuery));