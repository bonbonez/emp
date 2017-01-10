(function(
    window,
    modules,
    $,
    React
){
    
    modules.define(
        'OrderDeliveryMethod',
        [
            'CartActions',
            'CartStore',
            'OrderDeliveryRegionSelect',
            'OrderDeliveryOptionSelect'
        ],
        function(
            provide,
            CartActions,
            CartStore,
            OrderDeliveryRegionSelect,
            OrderDeliveryOptionSelect
        ) {

            let OrderDeliveryMethod = React.createClass({
                displayName: 'OrderDeliveryMethod',

                propTypes: {
                    orderData: React.PropTypes.object,
                    selectedDeliveryRegion: React.PropTypes.string,
                    selectedDeliveryOption: React.PropTypes.string
                },

                render() {
                    return (
                        <div className="bm-page-order-delivery-method">
                            <div className="bm-header-25 bm-page-order-delivery-method-header">Способ доставки</div>
                            <OrderDeliveryRegionSelect
                                orderData={this.props.orderData}
                                selectedDeliveryRegion={this.props.selectedDeliveryRegion}
                            />
                            <OrderDeliveryOptionSelect
                                orderData={this.props.orderData}
                                selectedDeliveryRegion={this.props.selectedDeliveryRegion}
                                selectedDeliveryOption={this.props.selectedDeliveryOption}
                            />
                        </div>
                    );
                }
            });

            provide(OrderDeliveryMethod);
        }
    );
    
}(
    this,
    this.modules,
    this.jQuery,
    this.React
));