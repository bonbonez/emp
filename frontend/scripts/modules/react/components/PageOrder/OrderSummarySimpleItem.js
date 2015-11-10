(function(window, modules, $) {

  modules.define(
    'OrderSummarySimpleItem',
    [
      'CartActions',
      'CartStore'
    ],
    (
      provide,
      CartActions,
      CartStore
    ) => {

      let OrderSummary = React.createClass({

        propTypes: {
          item: React.PropTypes.object,
          weight: React.PropTypes.number,
          quantity: React.PropTypes.number,
          grind: React.PropTypes.string,
          counter: React.PropTypes.number
        },

        handleAddItemClick() {
          CartActions.addItem(
            this.props.item.id,
            this.props.weight,
            this.props.grind
          );
        },

        handleRemoveItemClick() {
          CartActions.removeItem(
            this.props.item.id,
            this.props.weight,
            this.props.grind
          );
        },

        handleDeleteItemClick() {
          CartActions.deleteItem(
            this.props.item.id,
            this.props.weight,
            this.props.grind
          );
        },

        getTotalPriceForItem() {
          let { item, weight, quantity } = this.props;
          let price = weight === 250 ? item.price : item[`price_${weight}`];

          return quantity * price;
        },

        render() {

          let name     = this.props.item.name;
          let weight   = this.props.weight;
          let quantity = this.props.quantity;
          let grind    = this.props.grind;
          let wordPack = BM.helper.pluralize.getWordPack(quantity);

          return (
            <div className="bm-page-order-summary-item-simple">
              <div className="bm-page-order-summary-item-simple-counter">{this.props.counter}</div>
              <div className="bm-page-order-summary-item-simple-content">
                <div className="bm-page-order-summary-item-simple-content-text">
                  «{name}», {weight} грамм, {BM.helper.grind.getGrindTextFull(grind).toLowerCase()}, {quantity} {wordPack}
                </div>
                <div className="bm-page-order-summary-item-simple-content-aside">
                  <div className="bm-page-order-summary-item-simple-content-aside-content">
                    <div className="bm-page-order-summary-item-simple-content-aside-content-text">{this.getTotalPriceForItem()} руб.</div>
                  </div>
                </div>
                <div className="bm-page-order-summary-item-simple-side-controls">
                  <div className="buttons-wrapper">
                    <div className="button m-minus" onClick={this.handleRemoveItemClick}></div>
                    <div className="button m-plus" onClick={this.handleAddItemClick}></div>
                    <div className="button m-delete" onClick={this.handleDeleteItemClick}></div>
                  </div>
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