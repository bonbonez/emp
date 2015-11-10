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
                {this.isSummaryViewModeSimple() ?
                  <OrderSummarySimple cart={this.state.cart} />
                  :
                  <OrderSummaryTable cart={this.state.cart} />
                }

              </div>
            </div>
          );
        }

      });
          
      provide(PageOrder);
    }
  );
    
}(this, this.modules, this.jQuery));