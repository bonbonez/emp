(function(window, modules, $) {
    
  modules.define(
    'ItemAddedItem',
    [
      'CartActions'
    ],
    (
      provide,
      CartActions
    ) => {
      
      let ItemAddedItem = React.createClass({

        propTypes: {
          orderItem: React.PropTypes.object
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

        getTotalPrice() {
          let price;
          if (this.props.weight === 250) {
            price = this.props.item.price;
          } else if (this.props.weight === 500) {
            price = this.props.item.price_500;
          } else if (this.props.weight === 1000) {
            price = this.props.item.price_1000;
          }
          return price * this.props.quantity;
        },

        getGrindText() {
          var grindMeta = BM.helper.grind.getTypeMeta(this.props.grind);
          return grindMeta.label_full.toLowerCase();
        },

        getPackInPlural() {
          return BM.helper.pluralize.getWordPack(this.props.quantity);
        },

        render() {
          return (
            <div className="bm-item-form-order-added-item">
              <div className="bm-item-form-order-added-item-content">
                <div className="bm-item-form-order-added-item-text">
                  {this.props.quantity} {this.getPackInPlural()} «Никарагуа» {this.props.weight}&nbsp;грамм, {this.getGrindText()}<span className="bm-item-form-order-added-item-text-price">, 150 рублей</span>
                </div>
                <div className="buttons-wrapper">
                  <div className="button m-minus" onClick={this.handleRemoveItemClick}></div>
                  <div className="button m-plus" onClick={this.handleAddItemClick}></div>
                  <div className="button m-remove" onClick={this.handleDeleteItemClick}></div>
                </div>
              </div>
              <div className="bm-item-form-order-added-item-aside">
                <div className="bm-item-form-order-added-item-aside-label">
                  {this.getTotalPrice()} рублей
                </div>
              </div>
            </div>
          );
        }
      });
          
      provide(ItemAddedItem);
    }
  );
    
}(this, this.modules, this.jQuery));